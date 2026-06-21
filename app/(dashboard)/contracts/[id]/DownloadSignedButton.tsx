'use client'

interface Props {
  contractId: string
  storagePath: string
  label: string
  icon: string
  variant?: 'primary' | 'secondary'
}

/**
 * Ouvre un endpoint interne qui génère une URL signée Supabase Storage
 * et redirige vers le fichier. Ainsi la clé de service ne quitte jamais le serveur.
 */
export default function DownloadSignedButton({ contractId, storagePath, label, icon, variant = 'primary' }: Props) {
  const base = variant === 'primary'
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'

  const url = `/api/contracts/${contractId}/download?path=${encodeURIComponent(storagePath)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${base}`}
    >
      {icon} {label}
    </a>
  )
}
