import nodemailer from 'nodemailer';
import axios from 'axios';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
}

/**
 * Sends an email using the active provider configured by the user (SMTP or RESEND_API).
 * If no configuration is saved, it falls back to the system's SMTP relay.
 */
export async function sendEmailWithActiveProvider(
  db: any,
  userEmail: string,
  mailOptions: MailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // 1. Fetch user email settings from db
    const settings = db.prepare('SELECT * FROM smtp_settings WHERE user_email = ?').get(userEmail) as any;

    // Determine provider type (support both provider_type and email_provider_type for maximum compatibility)
    const providerType = (settings?.provider_type || settings?.email_provider_type || 'SMTP').toUpperCase();
    const fromName = mailOptions.fromName || settings?.from_name || 'Nexus AI';

    // 2. RESEND API LOGIC
    if (providerType === 'RESEND_API') {
      const apiKey = settings?.resend_api_key || process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("Clé API Resend manquante. Veuillez la configurer dans l'onglet Configuration.");
      }

      const fromEmail = settings?.from_email || 'onboarding@resend.dev';

      console.log(`[EmailService] Dispatching email via Resend HTTP API to: ${mailOptions.to}`);
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: `"${fromName}" <${fromEmail}>`,
          to: [mailOptions.to],
          subject: mailOptions.subject,
          html: mailOptions.html,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      return {
        success: true,
        messageId: response.data?.id || 'resend-success-id',
      };
    }

    // 3. SMTP LOGIC
    let transporter: nodemailer.Transporter;

    if (settings) {
      console.log(`[EmailService] Dispatching email via Custom SMTP to: ${mailOptions.to}`);
      transporter = nodemailer.createTransport({
        host: settings.host,
        port: Number(settings.port),
        secure: settings.secure === 1,
        auth: {
          user: settings.auth_user,
          pass: settings.auth_pass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      // System wide admin default fallback
      console.log(`[EmailService] Dispatching email via System SMTP Fallback to: ${mailOptions.to}`);
      const user = process.env.SMTP_USER || process.env.EMAIL_USER;
      const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    const defaultFromEmail = settings?.from_email || settings?.auth_user || process.env.SMTP_USER || 'contact@nexuswp.pro';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${defaultFromEmail}>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown email sending failure';
    console.error('[EmailService] Process failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
