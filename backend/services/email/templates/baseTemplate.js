const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const baseTemplate = ({ title, preheader = "", body, cta }) => {
  const ctaHtml = cta
    ? `<a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#c9a14a;color:#071f3f;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px;">${escapeHtml(cta.label)}</a>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f6f0e7;font-family:Arial,Helvetica,sans-serif;color:#071f3f;">
    <span style="display:none;opacity:0;visibility:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f0e7;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #eadfc9;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#071f3f;padding:28px 26px;color:#f6f0e7;">
                <div style="font-size:26px;font-family:Georgia,serif;letter-spacing:.02em;">Pure<span style="color:#c9a14a;">fumes</span></div>
                <div style="margin-top:6px;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#c9a14a;">Hyderabad</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 26px;">
                <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:30px;line-height:1.15;color:#071f3f;">${escapeHtml(title)}</h1>
                <div style="font-size:15px;line-height:1.75;color:#344967;">${body}</div>
                ${ctaHtml ? `<div style="margin-top:28px;">${ctaHtml}</div>` : ""}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #eadfc9;padding:20px 26px;font-size:12px;line-height:1.7;color:#6c7890;">
                You are receiving this email because you used Purefumes Hyderabad. If this was not you, please reset your password or contact support.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const p = (content) => `<p style="margin:0 0 14px;">${escapeHtml(content)}</p>`;
export const strong = (content) => `<strong>${escapeHtml(content)}</strong>`;
