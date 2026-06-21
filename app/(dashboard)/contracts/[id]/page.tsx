import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import SendToSignatureButton from './SendToSignatureButton'
import DownloadSignedButton from './DownloadSignedButton'

// Couleur + libellé par statut
const STATUS_CONFIG = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
  envoye:    { label: 'En attente de signature', color: 'bg-yellow-100 text-yellow-800' },
  signe:     { label: 'Signé', color: 'bg-green-100 text-green-800' },
  refuse:    { label: 'Refusé', color: 'bg-red-100 text-red-800' },
  archive:   { label: 'Archivé', color: 'bg-slate-100 text-slate-600' },
} as const

type ContractStatus = keyof typeof STATUS_CONFIG

export default async function ContractPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: contract } = await supabase
    .from('contracts')
    .select(`
      id, number, status, created_at, sent_at, signed_at, declined_at,
      pdf_url, signed_pdf_url, proof_url, yousign_ref,
      contacts (
        id, first_name, last_name, email, phone
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!contract) notFound()

  const status = contract.status as ContractStatus
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.brouillon
  const contact = Array.isArray(contract.contacts)
    ? contract.contacts[0]
    : contract.contacts

  // Générer les URL signées pour les téléchargements (valables 1h)
  let signedPdfSignedUrl: string | null = null
  let proofSignedUrl: string | null = null

  if (contract.signed_pdf_url) {
    const { data } = await supabase.storage
      .from('contracts')
      .createSignedUrl(contract.signed_pdf_url, 3600)
    signedPdfSignedUrl = data?.signedUrl ?? null
  }
  if (contract.proof_url) {
    const { data } = await supabase.storage
      .from('contracts')
      .createSignedUrl(contract.proof_url, 3600)
    proofSignedUrl = data?.signedUrl ?? null
  }

  const canSendToSign = ['brouillon', 'envoye'].includes(status)

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2">
        <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
        <span>/</span>
        <Link href="/contracts" className="hover:text-blue-600">Contrats</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{contract.number}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrat {contract.number}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Créé le {new Date(contract.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Timeline signature */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Signature électronique
        </h2>

        <div className="space-y-3">
          <TimelineStep
            icon={contract.sent_at ? '✅' : '○'}
            label="Envoyé à la signature"
            date={contract.sent_at}
            active={!!contract.sent_at}
          />
          <TimelineStep
            icon={contract.signed_at ? '✅' : status === 'refuse' ? '❌' : '○'}
            label={status === 'refuse' ? 'Signature refusée par le client' : 'Signé par le client'}
            date={contract.signed_at ?? contract.declined_at}
            active={status === 'signe' || status === 'refuse'}
          />
        </div>

        {/* Alerte refus */}
        {status === 'refuse' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Le client a refusé de signer ce contrat. Vous pouvez le modifier et le renvoyer.
          </div>
        )}

        {/* Alerte en attente */}
        {status === 'envoye' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            En attente de signature depuis le{' '}
            {contract.sent_at
              ? new Date(contract.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
              : '—'}.
            YouSign a envoyé un email de signature au client.
            {contract.yousign_ref && (
              <span className="block mt-1 text-xs text-yellow-600">
                Réf. YouSign : <code className="bg-yellow-100 px-1 rounded">{contract.yousign_ref}</code>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Infos contact */}
      {contact && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Signataire
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Nom</p>
              <p className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{contact.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Téléphone</p>
              <p className={`font-medium ${contact.phone ? 'text-gray-900' : 'text-red-500'}`}>
                {contact.phone ?? '⚠️ Non renseigné (requis pour la signature avancée)'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Bouton « Envoyer à la signature » (remplace le bouton manuel Phase A) */}
        {canSendToSign && (
          <SendToSignatureButton contractId={contract.id} status={status} />
        )}

        {/* Téléchargement PDF original */}
        {contract.pdf_url && (
          <DownloadSignedButton
            contractId={contract.id}
            storagePath={contract.pdf_url}
            label="Télécharger le PDF"
            icon="📄"
            variant="secondary"
          />
        )}
      </div>

      {/* Documents signés — visibles uniquement après signature */}
      {status === 'signe' && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Documents signés
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {signedPdfSignedUrl ? (
              <a
                href={signedPdfSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                📄 Télécharger le PDF signé
              </a>
            ) : (
              <p className="text-sm text-gray-500">PDF signé en cours de récupération…</p>
            )}

            {proofSignedUrl && (
              <a
                href={proofSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                🔒 Dossier de preuve
              </a>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

function TimelineStep({
  icon,
  label,
  date,
  active,
}: {
  icon: string
  label: string
  date: string | null | undefined
  active: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>
          {label}
        </p>
        {date && (
          <p className="text-xs text-gray-500">
            {new Date(date).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}
