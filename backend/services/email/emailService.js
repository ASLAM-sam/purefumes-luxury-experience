import env from "../../config/env.js";
import logger from "../../config/logger.js";
import EmailLog from "../../models/EmailLog.js";
import { getTransporter } from "./transports/smtpTransport.js";
import { welcomeTemplate } from "./templates/welcomeTemplate.js";
import { verificationTemplate } from "./templates/verificationTemplate.js";
import {
  passwordResetSuccessTemplate,
  resetPasswordTemplate,
} from "./templates/resetPasswordTemplate.js";
import { loginAlertTemplate } from "./templates/loginAlertTemplate.js";
import { orderStatusTemplate, orderTemplate } from "./templates/orderTemplate.js";
import { backInStockTemplate } from "./templates/backInStockTemplate.js";
import { adminOrderNotificationTemplate } from "./templates/adminOrderNotificationTemplate.js";

// Helper function to extract plain text from HTML for fallback
const extractTextFromHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode common entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
};

const resolveTemplateSubject = (subject, data = {}) =>
  typeof subject === "function" ? subject(data) : subject;

const templates = {
  welcome: {
    subject: "Welcome to Purefumes Hyderabad",
    render: welcomeTemplate,
  },
  verifyEmail: {
    subject: "Verify your Purefumes Hyderabad email",
    render: verificationTemplate,
  },
  resetPassword: {
    subject: "Reset your Purefumes Hyderabad password",
    render: resetPasswordTemplate,
  },
  passwordResetSuccess: {
    subject: "Your Purefumes Hyderabad password was updated",
    render: passwordResetSuccessTemplate,
  },
  loginAlert: {
    subject: "New login to your Purefumes Hyderabad account",
    render: loginAlertTemplate,
  },
  orderConfirmation: {
    subject: "Your Purefumes Hyderabad order is confirmed",
    render: orderTemplate,
  },
  orderStatus: {
    subject: "Your Purefumes Hyderabad order status changed",
    render: orderStatusTemplate,
  },
  backInStock: {
    subject: "Great News! Your perfume is back in stock 🎉",
    render: backInStockTemplate,
  },
  adminOrderNotification: {
    subject: ({ order = {} } = {}) => {
      const orderNumber = order.publicOrderId || order.id || order._id || "New order";
      return `🛒 New Order Received - ${orderNumber}`;
    },
    render: adminOrderNotificationTemplate,
  },
  testEmail: {
    subject: "Brevo SMTP Test",
    render: ({ message, timestamp }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #071f3f;">SMTP Test Email</h2>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Timestamp:</strong> ${timestamp}</p>
        <p><strong>Status:</strong> If you received this email, your Brevo SMTP configuration is working correctly!</p>
      </div>
    `,
  },
};

export const sendTemplatedEmail = async ({ to, template, data = {}, subject }) => {
  const config = templates[template];

  if (!config) {
    throw new Error(`Unknown email template: ${template}`);
  }

  const resolvedSubject = subject || resolveTemplateSubject(config.subject, data);

  const emailLog = await EmailLog.create({
    to,
    subject: resolvedSubject,
    template,
    status: "queued",
  });

  try {
    // Detailed debugging logs
    logger.info("Preparing to send email", {
      template,
      to,
      subject: resolvedSubject,
      smtpHost: env.SMTP_HOST,
      smtpUser: env.SMTP_USER ? env.SMTP_USER.substring(0, 10) + "..." : "not set",
      mailFrom: env.MAIL_FROM,
      transporterVerified: true, // We'll verify below
    });

    const transporter = getTransporter();

    // Verify transporter before sending
    const verificationResult = await new Promise((resolve) => {
      transporter.verify((error, success) => {
        if (error) {
          logger.error("SMTP transporter verification failed before send", {
            error: error.message,
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
          });
          resolve(false);
        } else {
          logger.info("SMTP transporter verified successfully before send");
          resolve(true);
        }
      });
    });

    if (!verificationResult) {
      throw new Error("SMTP transporter verification failed");
    }

    const htmlContent = config.render(data);
    const textContent = extractTextFromHtml(htmlContent); // Fallback plain text

    const mailOptions = {
      from: `"Purefumes Hyderabad" <${env.MAIL_FROM}>`,
      to,
      subject: resolvedSubject,
      html: htmlContent,
      text: textContent,
    };

    logger.info("Sending email with Nodemailer", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: Boolean(mailOptions.html),
      hasText: Boolean(mailOptions.text),
    });

    const info = await transporter.sendMail(mailOptions);

    // Detailed success logging
    logger.info("Email sent successfully", {
      to,
      template,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      envelope: info.envelope,
    });

    emailLog.status = "sent";
    emailLog.providerMessageId = info.messageId || "";
    emailLog.attempts += 1;
    await emailLog.save();

    return info;
  } catch (error) {
    // Detailed error logging
    logger.error("Email sending failed", {
      to,
      template,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });

    emailLog.status = "failed";
    emailLog.error = error.message;
    emailLog.attempts += 1;
    await emailLog.save();

    throw error;
  }
};
