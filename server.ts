import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from './src/lib/db.js';
import { createBatchPayout } from './src/lib/paypal.js';

async function startServer() {
  if (process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    delete process.env.GEMINI_API_KEY;
  }

  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  const isAdmin = (req: express.Request) => {
    return req.headers['x-user-email'] === 'ziedbenmiled3@gmail.com';
  };

  // --- Affiliate Endpoints ---

  // Get current user's affiliate profile/stats
  app.get('/api/affiliate/stats', (req, res) => {
    const userEmail = req.headers['x-user-email'] as string;
    if (!userEmail) return res.status(401).json({ error: 'Identification requise' });

    let affiliate = db.prepare('SELECT * FROM affiliates WHERE user_email = ?').get(userEmail) as any;
    
    if (!affiliate) {
      // Create profile if doesn't exist
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const userName = userEmail.split('@')[0];
      const info = db.prepare('INSERT INTO affiliates (user_email, user_name, referral_code) VALUES (?, ?, ?)').run(userEmail, userName, referralCode);
      affiliate = db.prepare('SELECT * FROM affiliates WHERE id = ?').get(info.lastInsertRowid) as any;
    }

    const referrals = db.prepare('SELECT * FROM referrals WHERE affiliate_id = ? ORDER BY created_at DESC').all(affiliate.id);
    const payouts = db.prepare('SELECT * FROM payout_requests WHERE affiliate_id = ? ORDER BY requested_at DESC').all(affiliate.id);

    res.json({ affiliate, referrals, payouts });
  });

  // Request payout
  app.post('/api/affiliate/request-payout', (req, res) => {
    const userEmail = req.headers['x-user-email'] as string;
    const affiliate = db.prepare('SELECT * FROM affiliates WHERE user_email = ?').get(userEmail) as any;
    
    if (!affiliate) return res.status(404).json({ error: 'Profil non trouvé' });
    
    const { amount } = req.body;
    if (amount > affiliate.current_balance || amount < 50) {
      return res.status(400).json({ error: 'Montant invalide ou solde insuffisant (min 50€)' });
    }

    db.prepare('INSERT INTO payout_requests (affiliate_id, amount) VALUES (?, ?)').run(affiliate.id, amount);
    // Deduct from balance
    db.prepare('UPDATE affiliates SET current_balance = current_balance - ? WHERE id = ?').run(amount, affiliate.id);

    res.json({ success: true });
  });

  // Admin: List all affiliates
  app.get('/api/admin/affiliates', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    
    const affiliates = db.prepare(`
      SELECT a.*, 
      (SELECT COUNT(*) FROM referrals r WHERE r.affiliate_id = a.id) as referral_count,
      (SELECT SUM(amount) FROM payout_requests p WHERE p.affiliate_id = a.id AND p.status = 'pending') as pending_payouts
      FROM affiliates a
    `).all();

    // Get 7-day sparkline data for each
    const affiliatesWithSparklines = affiliates.map((a: any) => {
      const dailyCommissions = db.prepare(`
        SELECT date(created_at) as date, SUM(commission_amount) as total
        FROM referrals
        WHERE affiliate_id = ? AND created_at >= date('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY date ASC
      `).all(a.id);
      return { ...a, sparkline: dailyCommissions };
    });

    res.json(affiliatesWithSparklines);
  });

  // Admin: Get payout requests
  app.get('/api/admin/payout-requests', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const requests = db.prepare(`
      SELECT p.*, a.user_email, a.user_name, a.paypal_email 
      FROM payout_requests p
      JOIN affiliates a ON p.affiliate_id = a.id
      WHERE p.status = 'pending'
    `).all();
    res.json(requests);
  });

  // Admin: Execute payout (PayPal Integration)
  app.post('/api/admin/execute-payout', async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const { requestId } = req.body;
    
    const request = db.prepare(`
      SELECT p.*, a.paypal_email, a.user_email 
      FROM payout_requests p
      JOIN affiliates a ON p.affiliate_id = a.id
      WHERE p.id = ?
    `).get(requestId) as any;

    if (!request) return res.status(404).json({ error: 'Demande non trouvée' });

    try {
      const email = request.paypal_email || request.user_email;
      const result = await createBatchPayout([{
        email,
        amount: request.amount,
        note: `Paiement commission Nexus pour ${request.user_email}`
      }]);

      const payoutId = result.batch_header.payout_batch_id;
      db.prepare("UPDATE payout_requests SET status = 'paid', paid_at = CURRENT_TIMESTAMP, paypal_payout_id = ? WHERE id = ?")
        .run(payoutId, requestId);

      res.json({ success: true, message: 'Paiement effectué via PayPal', payoutId });
    } catch (e: any) {
      console.error('PayPal Error:', e.response?.data || e.message);
      res.status(500).json({ error: 'Erreur PayPal: ' + (e.response?.data?.message || e.message) });
    }
  });

  // Admin: Batch Payout All Pending
  app.post('/api/admin/batch-payout', async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    
    const requests = db.prepare(`
      SELECT p.*, a.paypal_email, a.user_email 
      FROM payout_requests p
      JOIN affiliates a ON p.affiliate_id = a.id
      WHERE p.status = 'pending'
    `).all() as any[];

    if (requests.length === 0) return res.status(400).json({ error: 'Aucune demande en attente' });

    try {
      const items = requests.map(r => ({
        email: r.paypal_email || r.user_email,
        amount: r.amount,
        note: `Nexus Payout Batch - ${new Date().toLocaleDateString()}`
      }));

      const result = await createBatchPayout(items);
      const batchId = result.batch_header.payout_batch_id;

      const update = db.prepare("UPDATE payout_requests SET status = 'paid', paid_at = CURRENT_TIMESTAMP, paypal_payout_id = ? WHERE id = ?");
      const transaction = db.transaction((reqs) => {
        for (const r of reqs) update.run(batchId, r.id);
      });
      transaction(requests);

      res.json({ success: true, count: requests.length, batchId });
    } catch (e: any) {
      console.error('PayPal Batch Error:', e.response?.data || e.message);
      res.status(500).json({ error: 'Erreur Batch PayPal: ' + (e.response?.data?.message || e.message) });
    }
  });
  
  // Public: Register Sale (usually called by payment success)
  app.post('/api/sales/register', (req, res) => {
    const { customerEmail, planName, amount, referralCode } = req.body;
    
    if (!customerEmail || !planName || !amount) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    let affiliateId = null;
    let commissionPercentage = 0;

    // 1. Find affiliate if code provided
    if (referralCode) {
      const affiliate = db.prepare('SELECT id FROM affiliates WHERE referral_code = ?').get(referralCode) as any;
      if (affiliate) {
        affiliateId = affiliate.id;
      }
    }

    // 2. Get commission percentage for the pack
    const commSetting = db.prepare('SELECT percentage FROM commission_settings WHERE pack_name = ?').get(planName) as any;
    commissionPercentage = commSetting ? commSetting.percentage : 10; // Default 10%

    // 3. If affiliate exists, calculate and grant commission
    if (affiliateId) {
      const commissionAmount = (amount * commissionPercentage) / 100;
      
      db.prepare(`
        INSERT INTO referrals (affiliate_id, customer_email, product_pack, sale_amount, commission_amount, status)
        VALUES (?, ?, ?, ?, ?, 'confirmed')
      `).run(affiliateId, customerEmail, planName, amount, commissionAmount);

      db.prepare(`
        UPDATE affiliates 
        SET total_revenue = total_revenue + ?, 
            current_balance = current_balance + ? 
        WHERE id = ?
      `).run(amount, commissionAmount, affiliateId);
    }

    res.json({ success: true });
  });

  // Admin: Commission Settings
  app.get('/api/admin/commissions', (req, res) => {
    res.json(db.prepare('SELECT * FROM commission_settings').all());
  });

  app.post('/api/admin/commissions', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const { pack, percentage } = req.body;
    db.prepare('UPDATE commission_settings SET percentage = ? WHERE pack_name = ?').run(percentage, pack);
    res.json({ success: true });
  });

  // Admin: Sync Affiliates with Firebase Users
  app.post('/api/admin/sync-affiliates', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    
    const { users } = req.body;
    if (!Array.isArray(users)) return res.status(400).json({ error: 'Liste d\'utilisateurs requise' });

    const insert = db.prepare('INSERT OR IGNORE INTO affiliates (user_email, user_name, referral_code) VALUES (?, ?, ?)');
    const count = { created: 0 };
    
    const transaction = db.transaction((userList) => {
      for (const user of userList) {
        const email = user.email || user.user_email;
        if (!email) continue;
        
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const userName = email.split('@')[0];
        const result = insert.run(email.toLowerCase(), userName, referralCode);
        if (result.changes > 0) count.created++;
      }
    });

    transaction(users);
    res.json({ success: true, created: count.created });
  });

  // End Affiliate Endpoints

  // Logging Middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.USER_GEMINI_API_KEY;
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      cwd: process.cwd(),
      firebase_ready: !!process.env.FIREBASE_PROJECT_ID || fs.existsSync(path.join(process.cwd(), 'firebase-applet-config.json')),
      gemini_key_present: !!geminiKey,
      gemini_key_prefix: geminiKey ? `${geminiKey.substring(0, 6)}...` : null
    });
  });

  // Diagnostic Endpoint for Gemini
  app.get('/api/gemini-debug', (req, res) => {
    const apiKey = (process.env.GEMINI_API_KEY || process.env.USER_GEMINI_API_KEY || '').trim();
    res.json({
       env_key_present: !!process.env.GEMINI_API_KEY,
       user_key_present: !!process.env.USER_GEMINI_API_KEY,
       active_key_prefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE',
       is_hardcoded_admin: (req.headers['x-user-email'] === 'ziedbenmiled3@gmail.com'),
       node_env: process.env.NODE_ENV
    });
  });

  // PayPal Webhook
  app.post('/api/webhooks/paypal', (req, res) => {
    const event = req.body;
    console.log('PayPal Webhook Received:', event.event_type);
    res.status(200).send('OK');
  });

  // WordPress Proxy Endpoint
  app.post('/api/wp-proxy', async (req, res) => {
    let { url, method, auth, data, params, headers: customHeaders } = req.body;
    
    if (params && params._method) {
        method = params._method;
    }
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const headers: any = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': url,
        ...customHeaders
      };

      if (auth) {
        headers['Authorization'] = `Basic ${auth}`;
      }

      const response = await axios({
        url,
        method: method || 'GET',
        headers,
        data: method !== 'GET' ? data : undefined,
        params,
        timeout: 25000,
        validateStatus: () => true,
        maxRedirects: 5,
      });

      const contentType = String(response.headers['content-type'] || '');
      if (contentType.includes('text/html') && (url.includes('wp-json') || url.includes('rest_route'))) {
        return res.status(404).json({ 
          error: 'HTML_RESPONSE',
          message: "Votre site WordPress renvoie une page HTML au lieu d'une réponse API (JSON).",
          url,
          status: response.status
        });
      }

      res.json({
        data: response.data,
        headers: {
          'x-wp-total': response.headers['x-wp-total'],
          'x-wp-totalpages': response.headers['x-wp-totalpages'],
        }
      });
    } catch (error: any) {
      const status = error.response?.status || 500;
      res.status(status).json({ 
        error: `Erreur réseaus Nexus Proxy: ${error.message}`, 
        detail: error.response?.data,
        status: status
      });
    }
  });

  // Admin: Gemini Master Key Endpoints
  app.get('/api/admin/master-key', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('gemini_master_key') as any;
    res.json({ key: setting ? setting.value : '' });
  });

  app.post('/api/admin/master-key', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const { value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('gemini_master_key', value);
    res.json({ success: true });
  });

  app.post('/api/admin/test-key', async (req, res) => {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Clé manquante' });
    
    try {
      const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const models = response.data.models || [];
      res.json({ success: true, models_count: models.length, models: models.map((m: any) => m.name.replace('models/', '')) });
    } catch (err: any) {
      res.status(500).json({ error: err.response?.data?.error?.message || err.message });
    }
  });

  // Gemini AI Proxy Endpoint (Updated to use DB master key)
  app.post('/api/gemini', async (req, res) => {
    try {
      const { prompt, context, systemInstruction, responseMimeType, responseSchema, model: modelName, contents, generationConfig: incomingConfig } = req.body;
      const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
      
      let apiKey = ((req.headers['x-gemini-key'] as string) || (req.body.userApiKey as string) || '').trim();
      
      // Use env key first
      if (!apiKey) {
        apiKey = (process.env.GEMINI_API_KEY || process.env.USER_GEMINI_API_KEY || '').trim();
      }

      // Check DB for Master Key if still missing
      if (!apiKey) {
        const dbMasterKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('gemini_master_key') as any;
        if (dbMasterKey?.value) apiKey = dbMasterKey.value;
      }

      const hardcodedPaidKey = 'AIzaSyAKqtiN4WTda5zjahqzMq30yTHl6MFJHYk';

      // Only use hardcoded key as last resort for the admin
      if (!apiKey && userEmail === 'ziedbenmiled3@gmail.com') {
        apiKey = hardcodedPaidKey;
      }

      if (!apiKey) {
        return res.status(403).json({ 
          error: 'Clé API Gemini manquante.', 
          suggestion: 'Veuillez insérer votre propre Clé API Gemini dans les paramètres.' 
        });
      }

      const primaryModels = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-001",
      ];

      const finalStack: string[] = [];
      const addModelToStack = (m: string) => {
        const base = m.replace('models/', '');
        const canonical = base.includes('/') ? base : `models/${base}`;
        if (!finalStack.includes(canonical)) finalStack.push(canonical);
      };

      if (typeof modelName === 'string' && modelName) {
        addModelToStack(modelName);
      }
      primaryModels.forEach(addModelToStack);

      const { GoogleGenerativeAI } = await import("@google/generative-ai");

      let lastResult;
      let lastError;
      let success = false;
      let currentApiKey = apiKey;

      for (const modelToTry of finalStack) {
        if (success) break;
        
        const fullPrompt = context ? `Contexte: ${context}\n\nQuestion/Tâche: ${prompt}` : prompt || "Hello";
        const generationConfig: any = {
          temperature: incomingConfig?.temperature ?? 0.7,
          topP: incomingConfig?.topP ?? 0.95,
          maxOutputTokens: incomingConfig?.maxOutputTokens ?? 4096,
        };

        if (responseMimeType) generationConfig.responseMimeType = responseMimeType;
        if (responseSchema) generationConfig.responseSchema = responseSchema;

        const payload = {
          contents: contents || [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig
        };

        let retryCount = 0;
        const maxRetries = 1;

        while (retryCount <= maxRetries && !success) {
          try {
            console.log(`[GEMINI-PROXY] Trying ${modelToTry} via SDK...`);
            const genAI = new GoogleGenerativeAI(currentApiKey);
            const modelRequest = { 
              model: modelToTry,
              systemInstruction: systemInstruction || undefined
            };
            const selectedModel = genAI.getGenerativeModel(modelRequest, { timeout: 180000 });
            lastResult = await selectedModel.generateContent(payload);
            console.log(`[GEMINI-PROXY] Success with ${modelToTry}`);
            success = true;
            break;
          } catch (err: any) {
            lastError = err;
            const errMsg = (err.message || '').toLowerCase();
            console.warn(`[GEMINI-PROXY] SDK ${modelToTry} failed:`, err.message);

            const isAuth = errMsg.includes('403') || errMsg.includes('401') || errMsg.includes('key not valid') || errMsg.includes('unauthorized') || errMsg.includes('expired');
            const is404 = errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('no longer available');

            if ((isAuth || is404) && currentApiKey === hardcodedPaidKey) {
               const envKey = (process.env.GEMINI_API_KEY || process.env.USER_GEMINI_API_KEY || '').trim();
               if (envKey && envKey !== currentApiKey) {
                  console.log(`[GEMINI-PROXY] Falling back to default environment key...`);
                  currentApiKey = envKey;
                  retryCount++;
                  continue; 
               }
            }

            // Fallback to REST if SDK fails
            try {
              const modelBase = modelToTry.replace('models/', '');
              const versions = ['v1beta', 'v1'];
              const paths = [`models/${modelBase}`, modelBase];

              for (const ver of versions) {
                if (success) break;
                for (const pathUsed of paths) {
                  if (success) break;
                  
                  try {
                    console.log(`[GEMINI-PROXY] Trying REST ${ver} / ${pathUsed}`);
                    const restPayload: any = {
                      contents: payload.contents,
                      generationConfig: {
                        max_output_tokens: generationConfig.maxOutputTokens,
                        temperature: generationConfig.temperature,
                        top_p: generationConfig.topP,
                      }
                    };
                    if (systemInstruction && ver === 'v1beta') restPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
                    if (responseMimeType && ver === 'v1beta') restPayload.generationConfig.response_mime_type = responseMimeType;
                    
                    const responseDirect = await axios.post(
                      `https://generativelanguage.googleapis.com/${ver}/${pathUsed}:generateContent`,
                      restPayload,
                      { 
                        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': currentApiKey },
                        timeout: 60000,
                        validateStatus: (s) => s === 200
                      }
                    );

                    if (responseDirect.data?.candidates?.[0]) {
                      const text = responseDirect.data.candidates[0].content?.parts?.[0]?.text || "";
                      lastResult = { response: { text: () => text, candidates: responseDirect.data.candidates } };
                      console.log(`[GEMINI-PROXY] REST Success: ${pathUsed} (${ver})`);
                      success = true;
                    }
                  } catch (e: any) {
                    console.warn(`[GEMINI-PROXY] REST ${ver}/${pathUsed} failed:`, e.message);
                  }
                }
              }
            } catch (restErr) {}

            if (success) break;
            retryCount++;
          }
        }
      }

      if (!success || !lastResult) {
        throw new Error(lastError?.message || "All models failed.");
      }

      const response = await lastResult.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error(`[GEMINI-PROXY-ERROR]:`, error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath);
  const isProduction = process.env.NODE_ENV === 'production' && hasDist;

  if (isProduction) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
