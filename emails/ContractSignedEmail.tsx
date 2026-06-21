/**
 * Email interne envoyé au consultant quand un contrat est signé.
 * Rendu via Resend (html string ou React Email selon la config Resend du projet).
 *
 * Pour utiliser avec React Email (@react-email/components), adapter les imports.
 * Par défaut : retourne du HTML pur compatible avec la méthode Resend `html`.
 */

interface ContractSignedEmailProps {
  consultantName: string
  contractNumber: string
  contactName: string
  signedAt: string
  signedPdfUrl?: string
  proofUrl?: string
  contractUrl: string
}

/**
 * Génère l'HTML de l'email de notification "contrat signé".
 * À passer dans `resend.emails.send({ html: renderContractSignedEmail(...) })`.
 */
export function renderContractSignedEmail({
  consultantName,
  contractNumber,
  contactName,
  signedAt,
  signedPdfUrl,
  proofUrl,
  contractUrl,
}: ContractSignedEmailProps): string {
  const signedDate = new Date(signedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contrat ${contractNumber} signé</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#16a34a;padding:32px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:24px;margin-right:12px;">✅</td>
                  <td>
                    <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Contrat signé</p>
                    <p style="margin:4px 0 0;color:#dcfce7;font-size:14px;">${contractNumber}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#111827;font-size:16px;">
                Bonjour ${consultantName},
              </p>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                <strong>${contactName}</strong> a signé le contrat <strong>${contractNumber}</strong>
                le ${signedDate}.
              </p>

              <!-- Documents -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f3f4f6;border-radius:6px;padding:20px;">
                    <p style="margin:0 0 12px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                      Documents disponibles
                    </p>
                    ${signedPdfUrl ? `
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                      <tr>
                        <td style="padding-right:8px;font-size:16px;">📄</td>
                        <td>
                          <a href="${signedPdfUrl}" style="color:#2563eb;text-decoration:underline;font-size:14px;">
                            Télécharger le PDF signé
                          </a>
                        </td>
                      </tr>
                    </table>` : ''}
                    ${proofUrl ? `
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:8px;font-size:16px;">🔒</td>
                        <td>
                          <a href="${proofUrl}" style="color:#2563eb;text-decoration:underline;font-size:14px;">
                            Télécharger le dossier de preuve
                          </a>
                        </td>
                      </tr>
                    </table>` : ''}
                    ${!signedPdfUrl && !proofUrl ? `<p style="margin:0;color:#6b7280;font-size:14px;">Documents disponibles dans votre espace.</p>` : ''}
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2563eb;border-radius:6px;">
                    <a href="${contractUrl}"
                       style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Voir le contrat →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                Cet email a été généré automatiquement par votre tableau de bord consultant.
                Ne pas répondre à cet email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/** Sujet de l'email */
export function contractSignedSubject(contractNumber: string, contactName: string): string {
  return `✅ Contrat ${contractNumber} signé par ${contactName}`
}
