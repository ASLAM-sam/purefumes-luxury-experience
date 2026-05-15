import { baseTemplate, p } from "./baseTemplate.js";

export const resetPasswordTemplate = ({ name, resetUrl }) =>
  baseTemplate({
    title: "Reset Your Password - Purefumes Hyderabad",
    preheader: "Secure password reset link for your Purefumes account.",
    body: `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #071f3f; font-family: Georgia, serif; font-size: 24px; margin: 0 0 10px 0; letter-spacing: 0.02em;">
          Password Reset Request
        </h2>
        <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #c9a14a 0%, #071f3f 100%); margin: 0 auto;"></div>
      </div>

      <div style="background: linear-gradient(135deg, #071f3f 0%, #0a2a4a 100%); border-radius: 16px; padding: 30px; margin: 20px 0; box-shadow: 0 8px 32px rgba(7, 31, 63, 0.3);">
        <p style="color: #f6f0e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hello <strong style="color: #c9a14a;">${name}</strong>,
        </p>

        <p style="color: #f6f0e7; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          We received a request to reset your password for your Purefumes Hyderabad account. For your security, we've created a secure link that will allow you to create a new password.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #d4af37 100%); color: #071f3f; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 14px; box-shadow: 0 4px 16px rgba(201, 161, 74, 0.4); transition: all 0.3s ease;">
            Reset Your Password
          </a>
        </div>

        <div style="background: rgba(246, 240, 231, 0.1); border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #c9a14a;">
          <p style="color: #f6f0e7; font-size: 14px; line-height: 1.5; margin: 0 0 10px 0; font-weight: 600;">
            ⏰ <strong>Important Security Information:</strong>
          </p>
          <ul style="color: #f6f0e7; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>This reset link expires in <strong>15 minutes</strong></li>
            <li>The link can only be used once</li>
            <li>If you didn't request this password reset, please ignore this email</li>
          </ul>
        </div>

        <p style="color: #c9a14a; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0; font-style: italic;">
          For your security, we recommend choosing a strong password with a combination of uppercase and lowercase letters, numbers, and special characters.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eadfc9;">
        <p style="color: #6c7890; font-size: 12px; line-height: 1.5; margin: 0;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #c9a14a; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `,
    cta: null, // We're using custom CTA in body
  });

export const passwordResetSuccessTemplate = ({ name }) =>
  baseTemplate({
    title: "Password Updated - Purefumes Hyderabad",
    preheader: "Your password has been successfully changed.",
    body: `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #071f3f; font-family: Georgia, serif; font-size: 24px; margin: 0 0 10px 0; letter-spacing: 0.02em;">
          Password Successfully Updated
        </h2>
        <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #c9a14a 0%, #071f3f 100%); margin: 0 auto;"></div>
      </div>

      <div style="background: linear-gradient(135deg, #071f3f 0%, #0a2a4a 100%); border-radius: 16px; padding: 30px; margin: 20px 0; box-shadow: 0 8px 32px rgba(7, 31, 63, 0.3);">
        <p style="color: #f6f0e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hello <strong style="color: #c9a14a;">${name}</strong>,
        </p>

        <p style="color: #f6f0e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Your password has been successfully updated. For your security, all active sessions have been invalidated and you'll need to sign in again with your new password.
        </p>

        <div style="background: rgba(201, 161, 74, 0.1); border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #c9a14a;">
          <p style="color: #f6f0e7; font-size: 14px; line-height: 1.5; margin: 0; font-weight: 600;">
            🔒 Security Measures Taken:
          </p>
          <ul style="color: #f6f0e7; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0; padding-left: 20px;">
            <li>All refresh tokens have been invalidated</li>
            <li>You may need to sign in again on other devices</li>
            <li>Your account security has been maintained</li>
          </ul>
        </div>
      </div>
    `,
    cta: null,
  });
