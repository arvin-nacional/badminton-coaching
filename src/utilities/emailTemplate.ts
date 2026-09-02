/**
 * Branded HTML email wrapper for form-builder emails.
 *
 * The @payloadcms/plugin-form-builder serialises the Lexical message to plain
 * HTML and wraps it in a bare <div>. Email clients ignore external CSS and
 * <style> tags, so we wrap the inner HTML in a responsive, inline-styled
 * template that matches the Next Shot visual language (navy + sky blue).
 *
 * Used by the `beforeEmail` hook in src/plugins/index.ts.
 */
const NAVY = '#092c59'
const SKY = '#4cc9ff'
const LIGHT_BG = '#eaf3ff'
const TEXT = '#334b65'
const MUTED = '#718399'
const WHITE = '#ffffff'

export function wrapEmailHtml(innerHtml: string, opts?: { heading?: string }): string {
  const heading = opts?.heading
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>Next Shot Badminton</title>
  </head>
  <body style="margin:0;padding:0;background-color:${LIGHT_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${WHITE};border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(9,44,89,.08);">

            <!-- Header band -->
            <tr>
              <td style="background-color:${NAVY};padding:28px 32px;">
                <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:${SKY};">Next Shot Badminton</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:${WHITE};letter-spacing:-.02em;">Coaching that earns the next shot</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 32px 8px;font-size:16px;line-height:1.65;color:${TEXT};">
                ${heading ? `<h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${NAVY};letter-spacing:-.02em;">${heading}</h2>` : ''}
                ${innerHtml}
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:24px 32px 0;">
                <div style="height:1px;background-color:#e2e8f0;"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px 32px;font-size:13px;line-height:1.6;color:${MUTED};">
                <p style="margin:0;">This email was sent from the contact form on the Next Shot Badminton website.</p>
                <p style="margin:8px 0 0;">If you did not expect this message, you can safely ignore it.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
