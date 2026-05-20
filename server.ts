import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { initializeFirestore, collection as clientCollection, addDoc as clientAddDoc, serverTimestamp as clientServerTimestamp, query as clientQuery, where as clientWhere, getDocs as clientGetDocs, doc as clientDoc, getDoc as clientGetDoc, setDoc as clientSetDoc } from 'firebase/firestore';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = (typeof import.meta !== 'undefined' && typeof import.meta.url === 'string' && import.meta.url.length > 0) 
  ? fileURLToPath(import.meta.url) 
  : path.resolve(process.cwd(), 'server.ts');
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

  // --- Database Migration: Ensure email_templates has new columns ---
  try {
    const tableInfo = db.prepare("PRAGMA table_info(email_templates)").all() as any[];
    const hasBrandColor = tableInfo.some(col => col.name === 'brand_color');
    const hasAccentColor = tableInfo.some(col => col.name === 'accent_color');

    if (!hasBrandColor) {
      console.log('[DB-Migration] Adding brand_color column to email_templates');
      db.prepare("ALTER TABLE email_templates ADD COLUMN brand_color TEXT DEFAULT '#00ff66'").run();
    }
    if (!hasAccentColor) {
      console.log('[DB-Migration] Adding accent_color column to email_templates');
      db.prepare("ALTER TABLE email_templates ADD COLUMN accent_color TEXT DEFAULT '#000000'").run();
    }
  } catch (err) {
    console.error('[DB-Migration] Error checking columns:', err);
  }

  // --- Firebase Admin & Client Initialization ---
  let firestoreDatabaseId: string | undefined;
  let adminApp: admin.app.App | undefined;
  let clientDb: any;
  let clientConfig: any;

  const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    try {
      clientConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
      firestoreDatabaseId = clientConfig.firestoreDatabaseId;
      
      const targetProjectId = clientConfig.projectId;
      if (targetProjectId) {
        process.env.GOOGLE_CLOUD_PROJECT = targetProjectId;
        process.env.FIRESTORE_PROJECT_ID = targetProjectId;
      }

      // Initialize Client SDK with long polling to avoid connection issues in container
      try {
        const clientApp = initializeClientApp(clientConfig);
        clientDb = initializeFirestore(clientApp, {
          experimentalForceLongPolling: true,
        }, firestoreDatabaseId || '(default)');
        console.log('[Firebase Client] Initialized successfully with database:', firestoreDatabaseId || '(default)');
      } catch (clientErr) {
        console.error('[Firebase Client] Initialization failed:', clientErr);
      }

      const initializeAdmin = (name?: string) => {
        try {
          if (!targetProjectId) return admin.initializeApp(undefined, name);
          
          console.log(`[Firebase Admin] Initializing for projectId: ${targetProjectId}`);
          // Let it auto-detect credentials from environment/metadata service
          return admin.initializeApp({
            projectId: targetProjectId
          }, name);
        } catch (initErr: any) {
          console.error(`[Firebase Admin] initializeAdmin(${name || 'default'}) failed:`, initErr.message);
          try {
            return admin.initializeApp(undefined, (name || 'default') + '_fallback');
          } catch (e) {
            return admin.apps[0] || admin.initializeApp();
          }
        }
      };

      if (admin.apps.length > 0) {
        const existingApp = admin.app();
        if (existingApp.options.projectId !== targetProjectId) {
          console.log('[Firebase Admin] [DEFAULT] app mismatch (', existingApp.options.projectId, '!=', targetProjectId, '). Deleting and re-initializing...');
          await existingApp.delete();
          adminApp = initializeAdmin();
        } else {
          adminApp = existingApp;
          console.log('[Firebase Admin] Using existing [DEFAULT] app');
        }
      } else {
        adminApp = initializeAdmin();
        console.log('[Firebase Admin] Initialized [DEFAULT] app with projectId:', targetProjectId);
      }
    } catch (err) {
      console.error('[Firebase Admin] Initialization failed:', err);
    }
  }

  // --- IMAP Email Fetcher ---
  let isFetching = false;
  const fetchEmails = async (specificUserEmail?: string) => {
    if (isFetching && !specificUserEmail) {
      console.log('[IMAP] Global fetch already in progress, skipping...');
      return { count: 0, saved: 0 };
    }
    
    if (!specificUserEmail) isFetching = true;

    let totalInInbox = 0;
    let saved = 0;
    let failed = 0;
    let duplicates = 0;

    const getSettingsFor = (email: string) => {
      return db.prepare('SELECT * FROM imap_settings WHERE user_email = ?').get(email) as any;
    };

    const runSync = async (userEmail: string, settings: any) => {
      console.log(`[IMAP] Syncing for: ${userEmail}`);
      const client = new ImapFlow({
        host: settings.host,
        port: Number(settings.port),
        secure: settings.secure === 1,
        auth: { user: settings.auth_user, pass: settings.auth_pass },
        logger: false,
        tls: { rejectUnauthorized: false }
      });

      try {
        await client.connect();
        const lock = await client.getMailboxLock('INBOX');
        try {
          const messages = await client.search({ all: true });
          totalInInbox = Array.isArray(messages) ? messages.length : 0;
          
          let firestore: any;
          try {
            firestore = firestoreDatabaseId ? getFirestore(adminApp, firestoreDatabaseId) : getFirestore(adminApp);
          } catch (e) {
            firestore = getFirestore(adminApp);
          }

          if (Array.isArray(messages)) {
            const lastMessages = messages.slice(-25); // Fetch more for sync
            for (const msgRef of lastMessages) {
              try {
                const message = await client.fetchOne(msgRef.toString(), { source: true }, { uid: true });
                if (!message || !message.source) continue;

                const parsed = await simpleParser(message.source);
                const sender = parsed.from?.value[0];
                const uniqueMsgId = parsed.messageId || `msg_${message.uid || msgRef}_${Date.now()}`;
                
                const messageData = {
                  sender_email: (sender?.address || 'unknown').toLowerCase(),
                  sender_name: sender?.name || sender?.address || 'Unknown Sender',
                  recipient_email: userEmail.toLowerCase(),
                  subject: parsed.subject || '(Sans sujet)',
                  body: parsed.text || parsed.html?.replace(/<[^>]*>?/gm, '') || '(Contenu vide)',
                  status: 'unread',
                  created_at: FieldValue.serverTimestamp(),
                  message_id: uniqueMsgId
                };

                const docId = uniqueMsgId.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 500);
                
                // De-duplication check
                let isDuplicate = false;
                if (firestore) {
                  try {
                    const docSnap = await firestore.collection('messages').doc(docId).get();
                    if (docSnap.exists) isDuplicate = true;
                  } catch (e) {}
                }

                if (!isDuplicate && clientDb) {
                  try {
                    const docSnap = await clientGetDoc(clientDoc(clientDb, 'messages', docId));
                    if (docSnap.exists()) isDuplicate = true;
                  } catch (e) {}
                }

                if (isDuplicate) { duplicates++; continue; }

                // Save to Firestore
                let ok = false;
                if (firestore) {
                  try {
                    await firestore.collection('messages').doc(docId).set(messageData);
                    ok = true;
                  } catch (e) {}
                }
                if (!ok && clientDb) {
                  try {
                    await clientSetDoc(clientDoc(clientDb, 'messages', docId), {
                      ...messageData,
                      created_at: clientServerTimestamp()
                    });
                    ok = true;
                  } catch (e) {}
                }

                if (ok) saved++; else failed++;
              } catch (msgErr) { failed++; }
            }
          }
        } finally { lock.release(); }
        await client.logout();
      } catch (err) { console.error(`[IMAP] Error for ${userEmail}:`, err.message); }
    };

    if (specificUserEmail) {
      const settings = getSettingsFor(specificUserEmail);
      if (settings) await runSync(specificUserEmail, settings);
      else throw new Error('Paramètres IMAP non configurés.');
    } else {
      // Global background sync for all users with settings
      const allImap = db.prepare('SELECT * FROM imap_settings').all() as any[];
      for (const settings of allImap) {
        await runSync(settings.user_email, settings);
      }
      
      // Fallback admin
      const adminUser = process.env.EMAIL_USER;
      const adminPass = process.env.EMAIL_PASS;
      if (adminUser && adminPass && !allImap.find(s => s.user_email.toLowerCase() === adminUser.toLowerCase())) {
        await runSync(adminUser, {
          host: 'imap.hostinger.com',
          port: 993,
          secure: 1,
          auth_user: adminUser,
          auth_pass: adminPass
        });
      }
    }

    if (!specificUserEmail) isFetching = false;
    return { count: totalInInbox, saved, failed };
  };

  // Schedule fetch every 5 minutes and run once immediately
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAIL_FETCH === 'true') {
     console.log('[IMAP] Initializing fetcher...');
     fetchEmails(); // Immediate execution
     setInterval(fetchEmails, 5 * 60 * 1000);
     console.log('[IMAP] Fetcher scheduled every 5 minutes');
  }

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

  // Admin: WordPress Sites Listing (Admin view)
  app.get('/api/admin/sites', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    res.json(db.prepare('SELECT * FROM sites').all());
  });

  // Diagnostic Endpoint for Gemini
  app.get('/api/gemini-debug', (req, res) => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    res.json({
       env_key_present: !!process.env.GEMINI_API_KEY,
       active_key_prefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE',
       is_hardcoded_admin: (req.headers['x-user-email'] === 'ziedbenmiled3@gmail.com'),
       node_env: process.env.NODE_ENV
    });
  });

  // Gemini AI Proxy Endpoint
  app.post('/api/gemini', async (req, res) => {
    try {
      const { prompt, context, systemInstruction, responseMimeType, responseSchema, model: modelName, contents, generationConfig: incomingConfig, lang: activeLang } = req.body;
      const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
      
      let apiKey = ((req.headers['x-gemini-key'] as string) || (req.body.userApiKey as string) || '').trim();
      
      // Use env key first
      if (!apiKey) {
        apiKey = (process.env.GEMINI_API_KEY || '').trim();
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

      const modelToUse = modelName || "gemini-3-flash-preview";

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const fullPrompt = context ? `Contexte: ${context}\n\nQuestion/Tâche: ${prompt}` : prompt || "";
      
      // Inject language constraint if provided
      let finalSystemInstruction = systemInstruction || "";
      if (activeLang) {
        const langMap: Record<string, string> = { 'fr': 'French (Français)', 'en': 'English (Anglais)' };
        const langName = langMap[activeLang] || activeLang;
        const langInstruction = `CRITICAL: You must write your entire response exclusively in the following language: ${langName}. All content generation (product descriptions, articles) and explanations must strictly use this language.`;
        finalSystemInstruction = finalSystemInstruction ? `${langInstruction}\n\n${finalSystemInstruction}` : langInstruction;
      }

      const payload: any = {
        model: modelToUse,
        contents: contents || [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
          temperature: incomingConfig?.temperature ?? 0.7,
          topP: incomingConfig?.topP ?? 0.95,
          maxOutputTokens: incomingConfig?.maxOutputTokens ?? 4096,
          responseMimeType: responseMimeType || undefined,
          responseSchema: responseSchema || undefined,
          systemInstruction: finalSystemInstruction || undefined,
        }
      };

      const response = await ai.models.generateContent(payload);
      
      res.json({ 
        text: response.text,
        candidates: response.candidates 
      });
    } catch (error: any) {
      console.error(`[GEMINI-PROXY-ERROR]:`, error.message);
      res.status(error.status || 500).json({ error: error.message });
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
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Hello",
      });
      res.json({ success: true, detail: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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

  app.post('/api/imap/sync', async (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Identification requise' });
    
    try {
      const result = await fetchEmails(email);
      res.json({ success: true, count: result.count, saved: result.saved, failed: result.failed, message: 'Synchronisation IMAP terminée' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Communication Hub: Automation Rules
  db.exec(`
    CREATE TABLE IF NOT EXISTS communication_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      name TEXT,
      description TEXT,
      trigger_key TEXT,
      scope TEXT,
      is_active INTEGER DEFAULT 1,
      template_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  app.get('/api/comm/rules', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    res.json(db.prepare('SELECT * FROM communication_rules WHERE user_email = ? ORDER BY created_at DESC').all(email));
  });

  app.post('/api/comm/rules', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    const { name, description, trigger_key, scope, template_id } = req.body;
    
    db.prepare(`
      INSERT INTO communication_rules (user_email, name, description, trigger_key, scope, template_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(email, name, description, trigger_key, scope, template_id);
    
    res.json({ success: true });
  });

  app.patch('/api/comm/rules/:id/toggle', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    const { id } = req.params;
    const { is_active } = req.body;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    
    if (isAdmin(req)) {
      db.prepare("UPDATE communication_rules SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, id);
    } else {
      db.prepare("UPDATE communication_rules SET is_active = ? WHERE id = ? AND user_email = ?")
        .run(is_active ? 1 : 0, id, email);
    }
    
    res.json({ success: true });
  });

  app.delete('/api/comm/rules/:id', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    const { id } = req.params;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    
    if (isAdmin(req)) {
      db.prepare("DELETE FROM communication_rules WHERE id = ?").run(Number(id));
    } else {
      db.prepare("DELETE FROM communication_rules WHERE id = ? AND user_email = ?").run(Number(id), email);
    }
    res.json({ success: true });
  });

  // --- COMMUNICATION HUB HELPERS ---
  async function getTransporter(userEmail: string) {
    // Get user SMTP settings from DB
    const settings = db.prepare('SELECT * FROM smtp_settings WHERE user_email = ?').get(userEmail) as any;
    
    if (settings) {
      return nodemailer.createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.secure === 1,
        auth: {
          user: settings.auth_user,
          pass: settings.auth_pass
        }
      });
    }

    // Fallback for admin
    if (userEmail.toLowerCase() === 'ziedbenmiled3@gmail.com') {
      const user = process.env.SMTP_USER || process.env.EMAIL_USER;
      const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user,
          pass
        }
      });
    }

    throw new Error('Paramètres SMTP non trouvés. Veuillez les configurer dans l’onglet Configuration SMTP.');
  }

  // --- COMMUNICATION HUB ENDPOINTS ---

  app.get('/api/comm/settings', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    const smtp = db.prepare('SELECT * FROM smtp_settings WHERE user_email = ?').get(email);
    const imap = db.prepare('SELECT * FROM imap_settings WHERE user_email = ?').get(email);
    res.json({ smtp: smtp || {}, imap: imap || {} });
  });

  app.post('/api/comm/settings', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    const { smtp, imap } = req.body;
    
    if (smtp) {
      db.prepare(`
        INSERT OR REPLACE INTO smtp_settings (user_email, host, port, secure, auth_user, auth_pass, from_name, from_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(email, smtp.host, smtp.port, smtp.secure ? 1 : 0, smtp.auth_user, smtp.auth_pass, smtp.from_name, smtp.from_email);
    }

    if (imap) {
      db.prepare(`
        INSERT OR REPLACE INTO imap_settings (user_email, host, port, secure, auth_user, auth_pass)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(email, imap.host, imap.port, imap.secure ? 1 : 0, imap.auth_user, imap.auth_pass);
    }
    
    res.json({ success: true });
  });

  app.post('/api/comm/test-connection', async (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    
    try {
      const { type, host, port, secure, auth_user, auth_pass } = req.body;
      
      if (type === 'imap') {
        const client = new ImapFlow({
          host,
          port: Number(port),
          secure: secure === true || secure === 1,
          auth: { user: auth_user, pass: auth_pass },
          logger: false,
          tls: { rejectUnauthorized: false }
        });
        await client.connect();
        await client.logout();
        return res.json({ success: true });
      }

      let transporter;
      if (host && port && auth_user && auth_pass) {
        transporter = nodemailer.createTransport({
          host,
          port: Number(port),
          secure: secure === true || secure === 1,
          auth: {
            user: auth_user,
            pass: auth_pass
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000
        });
      } else {
        transporter = await getTransporter(email);
      }

      await transporter.verify();
      res.json({ success: true });
    } catch (err: any) {
      console.error('[COMM-TEST-ERROR]:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/comm/templates', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    const templates = db.prepare("SELECT * FROM email_templates WHERE user_email = ? OR user_email = 'admin'").all(email);
    res.json(templates);
  });

  app.post('/api/comm/templates', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    const { name, subject, body_html, category, is_ai_generated, brand_color, accent_color } = req.body;
    
    db.prepare(`
      INSERT INTO email_templates (user_email, name, subject, body_html, category, is_ai_generated, brand_color, accent_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(email, name, subject, body_html, category || 'general', is_ai_generated ? 1 : 0, brand_color || '#00ff66', accent_color || '#000000');
    
    res.json({ success: true });
  });

  app.put('/api/comm/templates/:id', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    const { id } = req.params;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    const { name, subject, body_html, category, is_ai_generated, brand_color, accent_color } = req.body;
    
    db.prepare(`
      UPDATE email_templates 
      SET name = ?, subject = ?, body_html = ?, category = ?, is_ai_generated = ?, brand_color = ?, accent_color = ?
      WHERE id = ? AND user_email = ?
    `).run(name, subject, body_html, category || 'general', is_ai_generated ? 1 : 0, brand_color || '#00ff66', accent_color || '#000000', id, email);
    
    res.json({ success: true });
  });

  app.delete('/api/comm/templates/:id', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    const { id } = req.params;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    
    if (isAdmin(req)) {
      db.prepare("DELETE FROM email_templates WHERE id = ?").run(Number(id));
    } else {
      db.prepare("DELETE FROM email_templates WHERE id = ? AND user_email = ?").run(Number(id), email);
    }
    
    res.json({ success: true });
  });

  app.get('/api/comm/analytics', (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as sent,
        SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
        date(created_at) as day
      FROM email_logs 
      WHERE user_email = ?
      GROUP BY day
      ORDER BY day ASC
      LIMIT 7
    `).all(email);
    res.json(stats);
  });

  app.post('/api/comm/send', async (req, res) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) return res.status(400).json({ error: 'Email missing' });
    const { recipient, subject, body_html, template_id } = req.body;

    try {
      const transporter = await getTransporter(email);
      
      // Get settings from DB first
      let settings = db.prepare('SELECT from_name, from_email, auth_user FROM smtp_settings WHERE user_email = ?').get(email) as any;
      
      // Fallback for admin if not in DB
      if (!settings && email.toLowerCase() === 'ziedbenmiled3@gmail.com') {
        settings = {
          from_name: 'Nexus AI',
          from_email: process.env.SMTP_USER || process.env.EMAIL_USER || 'contact@nexuswp.pro',
          auth_user: process.env.SMTP_USER || process.env.EMAIL_USER
        };
      }

      const fromName = settings?.from_name || 'Nexus AI';
      
      // Look up recipient name if possible
      let recipientName = 'Client';
      if (adminApp) {
        try {
          const fs = firestoreDatabaseId ? getFirestore(adminApp, firestoreDatabaseId) : getFirestore(adminApp);
          const userSnap = await fs.collection('users').where('email', '==', recipient.toLowerCase()).limit(1).get();
          if (!userSnap.empty) {
            const userData = userSnap.docs[0].data();
            recipientName = userData.display_name || userData.user_name || recipient.split('@')[0];
          }
        } catch (e) {
          console.warn('[SERVER-SEND] Failed to fetch recipient info:', e.message);
        }
      }

      // Basic placeholder replacement
      let processedBody = body_html;
      processedBody = processedBody.replace(/\{\{SENDER_NAME\}\}/g, fromName);
      processedBody = processedBody.replace(/\{\{sender_name\}\}/g, fromName);
      processedBody = processedBody.replace(/\{\{USER_NAME\}\}/g, recipientName);
      processedBody = processedBody.replace(/\{\{user_name\}\}/g, recipientName);
      // Dummy order_id if not provided
      processedBody = processedBody.replace(/\{\{order_id\}\}/g, 'NXS-' + Math.floor(Math.random()*90000 + 10000));
      
      const fromEmail = (settings?.from_email && settings.from_email.trim().length > 0) 
        ? settings.from_email.trim() 
        : (settings?.auth_user && settings.auth_user.trim().length > 0)
          ? settings.auth_user.trim()
          : (process.env.SMTP_USER && process.env.SMTP_USER.trim().length > 0)
            ? process.env.SMTP_USER.trim()
            : (process.env.EMAIL_USER && process.env.EMAIL_USER.trim().length > 0)
              ? process.env.EMAIL_USER.trim()
              : 'contact@nexuswp.pro';

      if (!fromEmail || fromEmail === 'undefined') {
        throw new Error("L'adresse d'expédition (From) n'a pas pu être déterminée. Veuillez configurer vos paramètres SMTP.");
      }

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipient,
        subject: subject,
        html: processedBody
      });

        // Save to Firestore sent_messages for consultation
        try {
          const sentMsgData = {
            sender_email: fromEmail,
            user_email: email, 
            recipient_email: recipient,
            subject: subject,
            body: body_html,
            created_at: FieldValue.serverTimestamp(),
            message_id: info.messageId,
            type: 'sent'
          };

          let success = false;

          // Attempt 1: Admin SDK with Named Database
          if (adminApp && firestoreDatabaseId) {
            try {
              console.log('[SEND-EMAIL] Attempting Admin SDK storage (Named DB):', firestoreDatabaseId);
              const fsNamed = getFirestore(adminApp, firestoreDatabaseId);
              await fsNamed.collection('sent_messages').add(sentMsgData);
              console.log('[SEND-EMAIL] Success (Admin SDK - Named DB)');
              success = true;
            } catch (err: any) {
              console.warn('[SEND-EMAIL] Admin SDK (Named DB) failed:', err.message);
            }
          }

          // Attempt 2: Admin SDK with Default Database
          if (!success && adminApp) {
            try {
              console.log('[SEND-EMAIL] Attempting Admin SDK storage (Default DB)...');
              const fsDefault = getFirestore(adminApp);
              await fsDefault.collection('sent_messages').add(sentMsgData);
              console.log('[SEND-EMAIL] Success (Admin SDK - Default DB)');
              success = true;
            } catch (err: any) {
              console.warn('[SEND-EMAIL] Admin SDK (Default DB) failed:', err.message);
            }
          }

          // Attempt 3: Client SDK (Fallback)
          if (!success && clientDb) {
            try {
              console.log('[SEND-EMAIL] Attempting Client SDK storage (unauthenticated fallback)...');
              await clientSetDoc(clientDoc(clientDb, 'sent_messages', info.messageId.replace(/[^a-zA-Z0-9]/g, '_')), {
                ...sentMsgData,
                created_at: clientServerTimestamp()
              });
              console.log('[SEND-EMAIL] Success (Client SDK)');
              success = true;
            } catch (err: any) {
              console.warn('[SEND-EMAIL] Client SDK failed:', err.message);
            }
          }

          if (!success) {
            console.error('[SEND-EMAIL] All Firestore storage attempts failed.');
          }
        } catch (saveErr) {
          console.error('[SEND-EMAIL] Fatal error during storage:', saveErr);
        }

      db.prepare('INSERT INTO email_logs (user_email, recipient, subject, status) VALUES (?, ?, ?, ?)').run(email, recipient, subject, 'sent');
      res.json({ success: true, messageId: info.messageId });
    } catch (err: any) {
      console.error('[SEND-EMAIL-ERROR]:', err.message);
      res.status(500).json({ error: err.message });
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
