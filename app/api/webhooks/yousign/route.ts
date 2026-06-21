/**
 * POST /api/webhooks/yousign
 *
 * Réception des événements YouSign. Route publique (YouSign doit pouvoir l'appeler),
 * protégée par validation HMAC-SHA256 uniquement.
 *
 * Validation de la signature YouSign v3 :
 *  Header envoyé : X-YouSign-Signature-v2 → "t=<timestamp>,s=<hmac_hex>"
 *  Chaîne signée : "<timestamp>.<rawBody>"
 *  Algorithme    : HMAC-SHA256 avec YOUSIGN_WEBHOOK_SECRET
 *
 * ⚠️  Vérifier dans la doc YouSign v3 (https://developers.yousign.com/docs/webhook)
 *     que le nom du header (X-YouSign-Signature-v2) et le format sont toujours à jour.
 *
 * Traitement idempotent : vérifier le statut courant avant toute mise à jour.
 */

import { createClient } from '@supabase/supabase-js'
import { downloadSignedDocument, downloadAuditTrail } from '@/lib/yousign/client'
import { renderContractSignedEmail, contractSignedSubject } from '@/emails/ContractSignedEmail'
import type { WebhookPayload } from '@/lib/yousign/types'

// Client Supabase service-role pour le webhook (bypass RLS)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

// ── Validation HMAC ───────────────────────────────────────────────────────────

async function validateYouSignSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  const secret = process.env.YOUSIGN_WEBHOOK_SECRET
  if (!secret) {
    console.error('[yousign-webhook] YOUSIGN_WEBHOOK_SECRET is not set')
    return false
  }
  if (!signatureHeader) return false

  // Parse "t=1714387200,s=abc123..."
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => part.split('=') as [string, string])
  )
  const { t: timestamp, s: receivedSig } = parts

  if (!timestamp || !receivedSig) return false

  // Protection anti-replay : rejeter les webhooks de plus de 5 minutes
  const age = Date.now() / 1000 - parseInt(timestamp, 10)
  if (age > 300) {
    console.warn('[yousign-webhook] Webhook too old (replay attack?)', { age })
    return false
  }

  // Signer "<timestamp>.<rawBody>"
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signedPayload = `${timestamp}.${rawBody}`
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
  const computedSig = Buffer.from(signatureBuffer).toString('hex')

  // Comparaison en temps constant (évite timing attacks)
  if (computedSig.length !== receivedSig.length) return false

  let diff = 0
  for (let i = 0; i < computedSig.length; i++) {
    diff |= computedSig.charCodeAt(i) ^ receivedSig.charCodeAt(i)
  }
  return diff === 0
}

// ── Handlers d'événements ─────────────────────────────────────────────────────

async function handleDone(payload: WebhookPayload) {
  const signatureRequest = payload.data.signature_request
  const supabase = getAdminClient()

  // Retrouver le contrat via yousign_ref
  const { data: contract, error } = await supabase
    .from('contracts')
    .select('id, number, status, user_id, contacts(first_name, last_name, email)')
    .eq('yousign_ref', signatureRequest.id)
    .single()

  if (error || !contract) {
    console.error('[yousign-webhook] Contract not found for', signatureRequest.id)
    return
  }

  // Idempotence : ne rien faire si déjà signé
  if (contract.status === 'signe') {
    console.info('[yousign-webhook] Contract already signed, skipping', contract.id)
    return
  }

  const firstDocument = signatureRequest.documents?.[0]
  let signedPdfStoragePath: string | null = null
  let proofStoragePath: string | null = null

  // Télécharger et stocker le PDF signé + dossier de preuve
  if (firstDocument) {
    try {
      // PDF signé
      const signedPdf = await downloadSignedDocument(signatureRequest.id, firstDocument.id)
      const signedPath = `signed/${contract.id}/signed.pdf`
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(signedPath, signedPdf, { contentType: 'application/pdf', upsert: true })

      if (!uploadError) signedPdfStoragePath = signedPath

      // Dossier de preuve (audit trail)
      const proof = await downloadAuditTrail(signatureRequest.id, firstDocument.id)
      const proofPath = `signed/${contract.id}/audit_trail.pdf`
      const { error: proofError } = await supabase.storage
        .from('contracts')
        .upload(proofPath, proof, { contentType: 'application/pdf', upsert: true })

      if (!proofError) proofStoragePath = proofPath
    } catch (err) {
      // Ne pas faire échouer le webhook si le téléchargement rate
      // (YouSign peut être momentanément indisponible — le document reste chez eux)
      console.error('[yousign-webhook] Failed to download signed documents', err)
    }
  }

  // Mettre à jour le contrat
  const now = new Date().toISOString()
  await supabase
    .from('contracts')
    .update({
      status: 'signe',
      signed_at: now,
      signed_pdf_url: signedPdfStoragePath,
      proof_url: proofStoragePath,
    })
    .eq('id', contract.id)

  // Notification interne au consultant via Resend
  await notifyConsultantSigned(contract, signedPdfStoragePath, proofStoragePath)
}

async function handleDeclined(payload: WebhookPayload) {
  const signatureRequest = payload.data.signature_request
  const supabase = getAdminClient()

  const { data: contract } = await supabase
    .from('contracts')
    .select('id, status, number, user_id, contacts(first_name, last_name)')
    .eq('yousign_ref', signatureRequest.id)
    .single()

  if (!contract) return
  if (contract.status === 'refuse') return // Idempotence

  await supabase
    .from('contracts')
    .update({ status: 'refuse', declined_at: new Date().toISOString() })
    .eq('id', contract.id)

  const contact = Array.isArray(contract.contacts)
    ? contract.contacts[0]
    : contract.contacts

  await notifyConsultantDeclined(contract, contact)
}

async function handleExpired(payload: WebhookPayload) {
  const signatureRequest = payload.data.signature_request
  const supabase = getAdminClient()

  const { data: contract } = await supabase
    .from('contracts')
    .select('id, number, user_id')
    .eq('yousign_ref', signatureRequest.id)
    .single()

  if (!contract) return

  await notifyConsultantExpired(contract)
}

// ── Notifications Resend ──────────────────────────────────────────────────────

async function getConsultantEmail(userId: string): Promise<string | null> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
  return data?.email ?? null
}

async function notifyConsultantSigned(
  contract: { id: string; number: string; user_id: string; contacts: unknown },
  signedPdfPath: string | null,
  proofPath: string | null
) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) return

  const consultantEmail = await getConsultantEmail(contract.user_id)
  if (!consultantEmail) return

  const supabase = getAdminClient()

  // Générer des URL signées valables 7 jours pour les pièces jointes
  let signedPdfUrl: string | undefined
  let proofUrl: string | undefined

  if (signedPdfPath) {
    const { data } = await supabase.storage
      .from('contracts')
      .createSignedUrl(signedPdfPath, 7 * 24 * 3600)
    signedPdfUrl = data?.signedUrl
  }
  if (proofPath) {
    const { data } = await supabase.storage
      .from('contracts')
      .createSignedUrl(proofPath, 7 * 24 * 3600)
    proofUrl = data?.signedUrl
  }

  const contact = Array.isArray(contract.contacts)
    ? (contract.contacts as { first_name: string; last_name: string }[])[0]
    : (contract.contacts as { first_name: string; last_name: string } | null)

  const contactName = contact ? `${contact.first_name} ${contact.last_name}` : 'Le client'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://votre-app.vercel.app'
  const contractUrl = `${appUrl}/contracts/${contract.id}`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'notifications@votre-domaine.fr',
      to: [consultantEmail],
      subject: contractSignedSubject(contract.number, contactName),
      html: renderContractSignedEmail({
        consultantName: 'Consultant',
        contractNumber: contract.number,
        contactName,
        signedAt: new Date().toISOString(),
        signedPdfUrl,
        proofUrl,
        contractUrl,
      }),
    }),
  }).catch((err) => console.error('[yousign-webhook] Failed to send Resend email', err))
}

async function notifyConsultantDeclined(
  contract: { number: string; user_id: string },
  contact: { first_name?: string; last_name?: string } | null
) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) return

  const consultantEmail = await getConsultantEmail(contract.user_id)
  if (!consultantEmail) return

  const contactName = contact ? `${contact.first_name ?? ''} ${contact.last_name ?? ''}`.trim() : 'Le client'

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'notifications@votre-domaine.fr',
      to: [consultantEmail],
      subject: `❌ Contrat ${contract.number} refusé par ${contactName}`,
      html: `<p>${contactName} a <strong>refusé</strong> de signer le contrat <strong>${contract.number}</strong>.</p>
             <p>Vous pouvez le contacter pour comprendre les raisons et relancer un nouveau contrat.</p>`,
    }),
  }).catch(console.error)
}

async function notifyConsultantExpired(contract: { number: string; user_id: string }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) return

  const consultantEmail = await getConsultantEmail(contract.user_id)
  if (!consultantEmail) return

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'notifications@votre-domaine.fr',
      to: [consultantEmail],
      subject: `⚠️ Contrat ${contract.number} expiré sans signature`,
      html: `<p>Le délai de signature du contrat <strong>${contract.number}</strong> a expiré sans que le client ait signé.</p>
             <p>Vous pouvez renvoyer le contrat depuis votre tableau de bord pour relancer le processus.</p>`,
    }),
  }).catch(console.error)
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // Lire le body brut AVANT de le parser (nécessaire pour la validation HMAC)
  const rawBody = await request.text()

  // ⚠️  Vérifier le nom exact du header dans la doc YouSign v3
  const signatureHeader = request.headers.get('x-yousign-signature-v2')

  const isValid = await validateYouSignSignature(rawBody, signatureHeader)
  if (!isValid) {
    console.warn('[yousign-webhook] Invalid HMAC signature — request rejected')
    return new Response('Unauthorized', { status: 401 })
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response('Bad Request: invalid JSON', { status: 400 })
  }

  // Ne pas logger le payload complet en production (données personnelles signataire)
  if (process.env.NODE_ENV !== 'production') {
    console.info('[yousign-webhook] Event received', {
      event: payload.event_name,
      signatureRequestId: payload.data?.signature_request?.id,
      sandbox: payload.sandbox,
    })
  }

  try {
    switch (payload.event_name) {
      case 'signature_request.done':
        await handleDone(payload)
        break
      case 'signature_request.declined':
        await handleDeclined(payload)
        break
      case 'signature_request.expired':
        await handleExpired(payload)
        break
      default:
        // Événements non gérés (signer.notified, etc.) — ignorer silencieusement
        break
    }
  } catch (err) {
    console.error('[yousign-webhook] Handler error', err)
    // Retourner 500 pour que YouSign retente l'envoi
    return new Response('Internal Server Error', { status: 500 })
  }

  // Répondre 200 rapidement — YouSign marque l'événement comme délivré
  return new Response('OK', { status: 200 })
}
