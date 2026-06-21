'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendToSignature } from '@/app/actions/contracts'
import Button from '@/components/ui/Button'

interface Props {
  contractId: string
  status: string
}

export default function SendToSignatureButton({ contractId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)

  const isResend = status === 'envoye'
  const label = isResend ? 'Relancer la signature' : 'Envoyer à la signature'
  const icon = isResend ? '🔄' : '✍️'

  async function handleClick() {
    if (!confirm && isResend) {
      setConfirm(true)
      return
    }

    setLoading(true)
    setError(null)
    setConfirm(false)

    const result = await sendToSignature(contractId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex-1 space-y-2">
      {confirm ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-3">
            Un email de signature a déjà été envoyé. Envoyer une nouvelle demande annulera la précédente.
            Confirmer ?
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleClick} loading={loading}>
              {icon} Confirmer
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setConfirm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button
          className="w-full"
          size="lg"
          variant={isResend ? 'secondary' : 'primary'}
          loading={loading}
          onClick={handleClick}
        >
          {icon} {label}
        </Button>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
