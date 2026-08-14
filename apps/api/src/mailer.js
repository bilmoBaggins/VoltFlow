import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "127.0.0.1",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: process.env.SMTP_SECURE === "true",
});

const MAIL_FROM = process.env.MAIL_FROM || "noreply@voltflow.local";
const WEB_URL = process.env.WEB_URL || "http://localhost:5173";
const COMPANY_ADDRESS =
  process.env.MAIL_COMPANY_ADDRESS ||
  "VoltFlow, Inc. · 214 Mission Street, San Francisco, CA 94105";

/**
 * Shared one-time-code layout. Email clients strip <style> blocks and ignore
 * flex/grid, so this is table-based with inline styles only.
 */
function codeEmailHtml({ heading, intro, code, buttonLabel, buttonUrl }) {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f8f7;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${heading}: ${code}. It expires in 10 minutes.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f8f7;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5ede9;border-radius:12px;">
            <tr>
              <td style="padding:44px 44px 40px 44px;">

                <h1 style="margin:0 0 18px 0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;font-weight:400;color:#12312b;">
                  ${heading}
                </h1>

                <p style="margin:0 0 30px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.5;color:#3a4a45;">
                  ${intro}
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f8f6;border:1px solid #dae8e3;border-radius:10px;">
                  <tr>
                    <td align="center" style="padding:30px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:34px;font-weight:600;letter-spacing:0.18em;color:#12312b;">
                      ${code}
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 0 0;">
                  <tr>
                    <td style="background:#1e4f46;border-radius:6px;">
                      <a href="${buttonUrl}" style="display:inline-block;padding:14px 26px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:15px;font-weight:600;letter-spacing:0.02em;color:#ffffff;text-decoration:none;">
                        ${buttonLabel}
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:30px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:14px;line-height:1.6;color:#7b8b85;">
                  Didn't request this? You can safely ignore this email &mdash; no
                  changes will be made to your account.
                </p>

                <hr style="margin:34px 0 22px 0;border:0;border-top:1px solid #e5ede9;" />

                <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:13px;line-height:1.5;color:#8b9a94;">
                  ${COMPANY_ADDRESS}
                </p>
                <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:13px;color:#8b9a94;">
                  <a href="${WEB_URL}/settings" style="color:#8b9a94;">Help</a>
                  &nbsp;&middot;&nbsp;
                  <a href="${WEB_URL}/settings" style="color:#8b9a94;">Unsubscribe</a>
                </p>

              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function codeEmailText({ heading, intro, code, buttonLabel, buttonUrl }) {
  return [
    heading,
    "",
    intro,
    "",
    `    ${code}`,
    "",
    `${buttonLabel}: ${buttonUrl}`,
    "",
    "Didn't request this? You can safely ignore this email - no changes will",
    "be made to your account.",
    "",
    COMPANY_ADDRESS,
  ].join("\n");
}

export async function sendOtpEmail(to, otp) {
  const content = {
    heading: "Verify your email",
    intro: "Enter this code to finish signing in. It expires in 10 minutes.",
    code: otp,
    buttonLabel: "Verify email",
    buttonUrl: `${WEB_URL}/verify-email?email=${encodeURIComponent(to)}`,
  };

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Verify your email",
    text: codeEmailText(content),
    html: codeEmailHtml(content),
  });
}

export async function sendPasswordResetEmail(to, otp) {
  const content = {
    heading: "Reset your password",
    intro:
      "Enter this code to choose a new password. It expires in 10 minutes.",
    code: otp,
    buttonLabel: "Reset password",
    buttonUrl: `${WEB_URL}/reset-password?email=${encodeURIComponent(to)}`,
  };

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Reset your password",
    text: codeEmailText(content),
    html: codeEmailHtml(content),
  });
}
