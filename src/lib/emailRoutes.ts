import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import axios from 'axios';

const router = Router();

/**
 * Route POST /api/comm/test-connection
 * Intercepts settings on-the-fly and runs an instant delivery test to test_recipient
 * without persisting to database.
 */
router.post('/api/comm/test-connection', async (req: Request, res: Response) => {
  try {
    const {
      provider_type,
      type, // support IMAP check or SMTP check fallback
      host,
      port,
      secure,
      auth_user,
      auth_pass,
      resend_api_key,
      from_name,
      from_email,
      test_recipient
    } = req.body;

    const resolvedProvider = (provider_type || type || 'SMTP').toUpperCase();
    const resolvedRecipient = (test_recipient || '').trim();

    if (!resolvedRecipient) {
      return res.status(400).json({
        success: false,
        error: "Veuillez spécifier une adresse email de destinataire de test."
      });
    }

    const resolvedFromName = (from_name || 'Test Nexus').trim();

    // 1. RESEND API TEST
    if (resolvedProvider === 'RESEND_API' || resolvedProvider === 'RESEND') {
      if (!resend_api_key) {
        return res.status(400).json({
          success: false,
          error: "Clé API Resend manquante pour effectuer le test."
        });
      }

      const resolvedFromEmail = (from_email || 'onboarding@resend.dev').trim();

      try {
        console.log(`[Test-Connection] Testing Resend API to: ${resolvedRecipient}`);
        const response = await axios.post(
          'https://api.resend.com/emails',
          {
            from: `"${resolvedFromName}" <${resolvedFromEmail}>`,
            to: [resolvedRecipient],
            subject: 'Test de connexion - API Resend',
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #4f46e5; margin-top: 0;">Félicitations ! 🎉</h2>
                <p>Votre clé API Resend est valide et l'envoi d'e-mail fonctionne parfaitement.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">Envoyé depuis le serveur de test multi-tenant de Nexus.</p>
              </div>
            `
          },
          {
            headers: {
              'Authorization': `Bearer ${resend_api_key}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        return res.json({ success: true, id: response.data?.id });
      } catch (err: any) {
        console.error('[Test-Connection] Resend Error:', err.response?.data || err.message);
        
        let errorMsg = "Erreur de connexion avec Resend.";
        if (err.response?.status === 401) {
          errorMsg = "La clé API Resend fournie n'est pas valide (Non autorisé).";
        } else if (err.response?.status === 403) {
          errorMsg = "L'adresse d'expédition (From) n'est pas autorisée sur votre domaine Resend.";
        } else if (err.response?.data?.message) {
          errorMsg = `Erreur Resend : ${err.response.data.message}`;
        } else if (err.code === 'ECONNABORTED') {
          errorMsg = "La requête de test vers Resend a expiré (Timeout).";
        } else {
          errorMsg = err.message || errorMsg;
        }

        return res.status(400).json({
          success: false,
          error: errorMsg
        });
      }
    }

    // 2. SMTP TEST
    const resolvedHost = (host || '').trim();
    const resolvedPort = Number(port);
    const resolvedUser = (auth_user || '').trim();
    const resolvedPass = (auth_pass || '').trim();

    if (!resolvedHost || !resolvedPort || !resolvedUser || !resolvedPass) {
      return res.status(400).json({
        success: false,
        error: "Paramètres SMTP incomplets (host, port, utilisateur ou mot de passe absent)."
      });
    }

    const resolvedFromEmail = (from_email || resolvedUser).trim();

    try {
      console.log(`[Test-Connection] Testing SMTP Server at ${resolvedHost}:${resolvedPort} to: ${resolvedRecipient}`);
      const transporter = nodemailer.createTransport({
        host: resolvedHost,
        port: resolvedPort,
        secure: secure === true || secure === 1,
        auth: {
          user: resolvedUser,
          pass: resolvedPass
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection first
      await transporter.verify();

      // Send a test email to confirm
      const info = await transporter.sendMail({
        from: `"${resolvedFromName}" <${resolvedFromEmail}>`,
        to: resolvedRecipient,
        subject: 'Test de connexion - SMTP Server',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0ea5e9; margin-top: 0;">Félicitations ! ⚡</h2>
            <p>Votre serveur de messagerie SMTP est correctement configuré et l'envoi de test a réussi.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8;">Détails techniques : ${resolvedHost}:${resolvedPort}</p>
          </div>
        `
      });

      return res.json({ success: true, messageId: info.messageId });
    } catch (err: any) {
      console.error('[Test-Connection] SMTP Error:', err);

      let errorMsg = "Erreur d'authentification SMTP ou hôte injoignable.";
      if (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
        errorMsg = "Délai d'attente dépassé (Timeout). Le port ou l'adresse hôte SMTP est probablement bloqué par le pare-feu.";
      } else if (err.code === 'EAUTH') {
        errorMsg = "Nom d'utilisateur ou mot de passe SMTP rejeté par le serveur de messagerie.";
      } else {
        errorMsg = err.message || errorMsg;
      }

      return res.status(400).json({
        success: false,
        error: errorMsg
      });
    }
  } catch (err: any) {
    console.error('[Test-Connection] Unexpected Exception:', err);
    return res.status(500).json({
      success: false,
      error: `Erreur interne inattendue : ${err.message}`
    });
  }
});

export default router;
