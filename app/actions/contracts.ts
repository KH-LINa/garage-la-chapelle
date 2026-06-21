'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createSignatureRequest,
  uploadDocument,
  addSigner,
  activateSignatureRequest,
  cancelSignatureRequest,
  YouSignError,
} from '@/lib/yousign/client'
import { revalidatePath } from 'next/cache'

// ── Types locaux ──────────────────────────────────────────────────────────────

interface ActionResult {
  error?: string
}

// ── sendToSignature ───────────────────────────────────────────────────────────

/**
 * Envoie un contrat à la signature électronique via YouSign API v3.
 *
 * Workflow :
 *  1. Charger le contrat + contact depuis Supabase
 *  2. Récupérer le PDF depuis le bucket Storage
 *  3. Créer la Signature Request YouSign (draft)
 *  4. Uploader le document
 *  5. Ajouter le signataire (avancé + OTP SMS)
 *  6. Activer → YouSign envoie l'email au client
 *  7. Mettre à jour le contrat en base (status = envoye, yousign_ref)
 *
 * ⚠️  Ne PAS envoyer l'email Resend au client ici : YouSign s'en charge.
 *     Resend reste uniquement pour les notifications internes au consultant.
 */
export async function sendToSignature(contractId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  // ── 1. Chargement du contrat ───────────────────────────────────────────────
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select(`
      id, number, status, pdf_url,
      contacts (
        id, first_name, last_name, email, phone
      )
    `)
    .eq('id', contractId)
    .eq('user_id', user.id)
    .single()

  if (contractError || !contract) {
    return { error: 'Contrat introuvable.' }
  }

  if (!['brouillon', 'envoye'].includes(contract.status)) {
    return { error: `Ce contrat est au statut "${contract.status}" et ne peut pas être envoyé à la signature.` }
  }

  const contact = Array.isArray(contract.contacts)
    ? contract.contacts[0]
    : contract.contacts

  if (!contact) return { error: 'Aucun contact associé à ce contrat.' }
  if (!contact.phone) {
    return {
      error: 'Le numéro de téléphone du contact est requis pour la signature avancée (OTP SMS). Veuillez le renseigner dans la fiche contact.',
    }
  }
  if (!contract.pdf_url) {
    return { error: 'Aucun PDF généré pour ce contrat. Veuillez générer le PDF avant de l\'envoyer à la signature.' }
  }

  // ── 2. Récupération du PDF depuis Storage ──────────────────────────────────
  // pdf_url est le chemin dans le bucket (ex: "contracts/2024-001.pdf")
  const { data: pdfData, error: storageError } = await supabase
    .storage
    .from('contracts')
    .download(contract.pdf_url)

  if (storageError || !pdfData) {
    return { error: 'Impossible de récupérer le PDF du contrat depuis le stockage.' }
  }

  const pdfBuffer = await pdfData.arrayBuffer()
  const filename = `contrat-${contract.number}.pdf`

  // ── 3-6. Appels YouSign ───────────────────────────────────────────────────
  let signatureRequestId: string | null = null

  try {
    // 3. Créer la Signature Request
    const signatureRequest = await createSignatureRequest({
      name: `Contrat ${contract.number}`,
      delivery_mode: 'email',
      timezone: 'Europe/Paris',
      // Expiration dans 30 jours
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      signers_allowed_to_decline: true,
      reminder_settings: {
        interval_in_days: 3,
        max_occurrences: 3,
      },
    })
    signatureRequestId = signatureRequest.id

    // 4. Uploader le document
    const document = await uploadDocument(signatureRequestId, pdfBuffer, filename)

    // 5. Ajouter le signataire (signature avancée + OTP SMS)
    await addSigner(signatureRequestId, {
      info: {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone_number: contact.phone, // Format E.164 : +33612345678
        locale: 'fr',
      },
      signature_level: 'advanced_electronic_signature',
      signature_authentication_mode: 'otp_sms',
      fields: [
        {
          // Position du champ de signature sur la dernière zone du PDF.
          // ⚠️  Adapter x/y/width/height à la mise en page réelle du PDF.
          //     Les coordonnées sont en points PDF depuis le bas-gauche de la page.
          document_id: document.id,
          type: 'signature',
          page: 1,
          x: 77,
          y: 100,
          width: 200,
          height: 50,
        },
      ],
    })

    // 6. Activer → YouSign envoie l'email au signataire
    await activateSignatureRequest(signatureRequestId)

  } catch (err) {
    // Rollback : annuler la Signature Request si elle a été créée
    if (signatureRequestId) {
      await cancelSignatureRequest(signatureRequestId).catch(() => null)
    }

    if (err instanceof YouSignError) {
      return { error: `Erreur YouSign (${err.statusCode}) : ${err.detail}` }
    }
    return { error: 'Une erreur inattendue est survenue lors de l\'envoi à la signature.' }
  }

  // ── 7. Mise à jour en base ─────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('contracts')
    .update({
      status: 'envoye',
      yousign_ref: signatureRequestId,
      sent_at: new Date().toISOString(),
    })
    .eq('id', contractId)

  if (updateError) {
    // La Signature Request YouSign est active mais le contrat n'a pas été mis à jour.
    // Logger l'ID pour pouvoir réconcilier manuellement.
    console.error('[contracts] Failed to update contract after YouSign activation', {
      contractId,
      signatureRequestId,
    })
    return {
      error: `La demande de signature a été créée (ref: ${signatureRequestId}) mais le statut du contrat n'a pas pu être mis à jour. Contactez le support.`,
    }
  }

  revalidatePath(`/contracts/${contractId}`)
  return {}
}

// ── markAsArchived ─────────────────────────────────────────────────────────────

export async function archiveContract(contractId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'archive' })
    .eq('id', contractId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/contracts/${contractId}`)
  return {}
}
