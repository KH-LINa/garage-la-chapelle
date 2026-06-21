/**
 * YouSign API v3 — Wrapper
 *
 * Doc : https://developers.yousign.com/reference
 * Sandbox : https://api-sandbox.yousign.app/v3
 * Production : https://api.yousign.app/v3
 *
 * ⚠️  Vérifier dans la doc que les noms d'endpoints n'ont pas changé.
 *     En particulier : le chemin exact pour télécharger l'audit trail.
 */

import type {
  CreateSignatureRequestPayload,
  SignatureRequestResponse,
  DocumentResponse,
  AddSignerPayload,
  SignerResponse,
} from './types'

function getBaseUrl(): string {
  const url = process.env.YOUSIGN_API_BASE_URL
  if (!url) throw new Error('YOUSIGN_API_BASE_URL is not set')
  return url.replace(/\/$/, '')
}

function getApiKey(): string {
  const key = process.env.YOUSIGN_API_KEY
  if (!key) throw new Error('YOUSIGN_API_KEY is not set')
  return key
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    let detail = ''
    try {
      detail = await res.text()
    } catch {}
    throw new YouSignError(res.status, detail, path)
  }

  // 204 No Content ou corps vide
  const text = await res.text()
  return text ? (JSON.parse(text) as T) : ({} as T)
}

async function apiFetchRaw(path: string, options: RequestInit = {}): Promise<ArrayBuffer> {
  const url = `${getBaseUrl()}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new YouSignError(res.status, detail, path)
  }

  return res.arrayBuffer()
}

export class YouSignError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly detail: string,
    public readonly path: string
  ) {
    super(`YouSign API ${statusCode} on ${path}: ${detail}`)
    this.name = 'YouSignError'
  }
}

// ── 1. Signature Request ──────────────────────────────────────────────────────

export async function createSignatureRequest(
  payload: CreateSignatureRequestPayload
): Promise<SignatureRequestResponse> {
  return apiFetch<SignatureRequestResponse>('/signature_requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function cancelSignatureRequest(signatureRequestId: string): Promise<void> {
  await apiFetch(`/signature_requests/${signatureRequestId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: 'Contract cancelled by consultant' }),
  })
}

// ── 2. Document Upload ────────────────────────────────────────────────────────

/**
 * Upload d'un PDF en tant que document signable (multipart/form-data).
 * ⚠️  Ne pas définir Content-Type manuellement — fetch le génère avec le boundary.
 */
export async function uploadDocument(
  signatureRequestId: string,
  pdfBuffer: ArrayBuffer,
  filename: string
): Promise<DocumentResponse> {
  const formData = new FormData()
  formData.append(
    'file',
    new Blob([pdfBuffer], { type: 'application/pdf' }),
    filename
  )
  formData.append('nature', 'signable_document')

  return apiFetch<DocumentResponse>(
    `/signature_requests/${signatureRequestId}/documents`,
    { method: 'POST', body: formData }
  )
}

// ── 3. Signataire ─────────────────────────────────────────────────────────────

export async function addSigner(
  signatureRequestId: string,
  payload: AddSignerPayload
): Promise<SignerResponse> {
  return apiFetch<SignerResponse>(
    `/signature_requests/${signatureRequestId}/signers`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )
}

// ── 4. Activation ─────────────────────────────────────────────────────────────

export async function activateSignatureRequest(
  signatureRequestId: string
): Promise<SignatureRequestResponse> {
  return apiFetch<SignatureRequestResponse>(
    `/signature_requests/${signatureRequestId}/activate`,
    { method: 'POST' }
  )
}

// ── 5. Téléchargement des documents signés ────────────────────────────────────

/**
 * Télécharge le PDF signé d'un document spécifique.
 * ⚠️  Vérifier dans la doc si l'endpoint est bien /documents/{id}/download
 *     ou /documents/{id}/download?version=signed
 */
export async function downloadSignedDocument(
  signatureRequestId: string,
  documentId: string
): Promise<ArrayBuffer> {
  return apiFetchRaw(
    `/signature_requests/${signatureRequestId}/documents/${documentId}/download`
  )
}

/**
 * Télécharge le dossier de preuve (audit trail) d'un document.
 * ⚠️  Si YouSign retourne l'audit trail au niveau de la signature_request
 *     et non du document, l'endpoint sera :
 *     /signature_requests/{id}/audit_trails/download
 */
export async function downloadAuditTrail(
  signatureRequestId: string,
  documentId: string
): Promise<ArrayBuffer> {
  return apiFetchRaw(
    `/signature_requests/${signatureRequestId}/documents/${documentId}/audit_trails/download`
  )
}

/**
 * Relance un signataire par email.
 * ⚠️  Vérifier l'endpoint exact pour les reminders dans la doc v3.
 */
export async function sendReminder(
  signatureRequestId: string,
  signerId: string
): Promise<void> {
  await apiFetch(
    `/signature_requests/${signatureRequestId}/signers/${signerId}/send_reminder`,
    { method: 'POST' }
  )
}
