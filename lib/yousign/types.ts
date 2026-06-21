// YouSign API v3 — Types TypeScript
// Doc de référence : https://developers.yousign.com/reference

export type SignatureLevel =
  | 'electronic_signature'           // Simple (eIDAS simple)
  | 'advanced_electronic_signature'  // Avancé (eIDAS advanced) — requiert téléphone OTP
  | 'qualified_electronic_signature' // Qualifié (eIDAS qualified)

export type DeliveryMode = 'email' | 'none'

export type SignatureAuthMode = 'otp_sms' | 'otp_email' | 'no_otp'

export type SignatureRequestStatus =
  | 'draft'
  | 'ongoing'
  | 'done'
  | 'deleted'
  | 'expired'
  | 'canceled'

// ── Signature Request ─────────────────────────────────────────────────────────

export interface CreateSignatureRequestPayload {
  name: string
  delivery_mode: DeliveryMode
  /** Fuseau horaire pour les emails et rappels */
  timezone?: string
  /** Date d'expiration ISO 8601 */
  expiration_date?: string
  ordered_signers?: boolean
  reminder_settings?: {
    interval_in_days: number
    max_occurrences: number
  }
  signers_allowed_to_decline?: boolean
}

export interface SignatureRequestResponse {
  id: string
  status: SignatureRequestStatus
  name: string
  delivery_mode: DeliveryMode
  created_at: string
  expiration_date?: string
}

// ── Document ──────────────────────────────────────────────────────────────────

export interface DocumentResponse {
  id: string
  filename: string
  nature: 'signable_document' | 'attachment'
  content_type: string
  created_at: string
}

// ── Signer ────────────────────────────────────────────────────────────────────

export interface SignerField {
  document_id: string
  type: 'signature' | 'mention' | 'text' | 'checkbox' | 'radio_group'
  page: number
  x: number
  y: number
  width?: number
  height?: number
  /** Texte de la mention si type = "mention" */
  mention?: string
}

export interface AddSignerPayload {
  info: {
    first_name: string
    last_name: string
    email: string
    /** Format E.164 : +33612345678. Obligatoire pour advanced + OTP SMS */
    phone_number: string
    locale?: string
  }
  signature_level: SignatureLevel
  signature_authentication_mode: SignatureAuthMode
  fields: SignerField[]
}

export interface SignerResponse {
  id: string
  status: 'pending' | 'notified' | 'verified' | 'signed' | 'declined'
  info: {
    first_name: string
    last_name: string
    email: string
  }
}

// ── Webhook ───────────────────────────────────────────────────────────────────

export type WebhookEventName =
  | 'signature_request.done'
  | 'signature_request.declined'
  | 'signature_request.expired'
  | 'signature_request.canceled'
  | 'signer.done'
  | 'signer.notified'

export interface WebhookPayload {
  event_id: string
  event_name: WebhookEventName
  event_time: string
  subscription_id: string
  sandbox: boolean
  data: {
    signature_request: {
      id: string
      status: SignatureRequestStatus
      name: string
      documents?: Array<{ id: string; filename: string }>
      signers?: Array<{ id: string; status: string; info: { email: string } }>
    }
    signer?: SignerResponse
  }
}
