import Database from 'better-sqlite3';
import path from 'path';
import { DEFAULT_MARKETING_KEYWORDS } from '../constants/marketingKeywords.js';

const dbPath = path.resolve(process.cwd(), 'nexus.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS affiliates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT UNIQUE NOT NULL,
    user_name TEXT,
    paypal_email TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    total_revenue REAL DEFAULT 0,
    current_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER,
    customer_email TEXT,
    product_pack TEXT,
    sale_amount REAL,
    commission_amount REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(affiliate_id) REFERENCES affiliates(id)
  );

  CREATE TABLE IF NOT EXISTS payout_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER,
    amount REAL,
    status TEXT DEFAULT 'pending',
    paypal_payout_id TEXT,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    FOREIGN KEY(affiliate_id) REFERENCES affiliates(id)
  );

  CREATE TABLE IF NOT EXISTS commission_settings (
    pack_name TEXT PRIMARY KEY,
    percentage INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS smtp_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL UNIQUE,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    secure INTEGER DEFAULT 1,
    auth_user TEXT NOT NULL,
    auth_pass TEXT NOT NULL,
    from_name TEXT,
    from_email TEXT,
    provider_type TEXT DEFAULT 'SMTP',
    resend_api_key TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS imap_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL UNIQUE,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    secure INTEGER DEFAULT 1,
    auth_user TEXT NOT NULL,
    auth_pass TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL, -- 'admin' for system templates
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'saas' or 'woo'
    brand_color TEXT DEFAULT '#00ff66',
    accent_color TEXT DEFAULT '#000000',
    is_ai_generated INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS email_automations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    event_trigger TEXT NOT NULL, -- e.g., 'order_completed', 'payment_success'
    template_id INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(template_id) REFERENCES email_templates(id)
  );

  CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL, -- site owner
    recipient TEXT NOT NULL,
    subject TEXT,
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'failed'
    opened_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- Seed default commissions
  INSERT OR IGNORE INTO commission_settings (pack_name, percentage) VALUES ('Basic', 10);
  INSERT OR IGNORE INTO commission_settings (pack_name, percentage) VALUES ('Pro', 15);
  INSERT OR IGNORE INTO commission_settings (pack_name, percentage) VALUES ('Elite', 25);

  -- Create marketing_keywords table
  CREATE TABLE IF NOT EXISTS marketing_keywords (
    id TEXT PRIMARY KEY,
    keyword TEXT NOT NULL,
    category TEXT NOT NULL,
    match_type TEXT NOT NULL,
    formatted_keyword TEXT NOT NULL
  );

  -- Create Bouclier de Sécurité tables
  CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_url TEXT NOT NULL,
    ip TEXT NOT NULL,
    country TEXT DEFAULT 'FR',
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS security_banned_ips (
    ip TEXT PRIMARY KEY,
    site_url TEXT NOT NULL,
    reason TEXT NOT NULL,
    banned_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS nexus_product_costs (
    product_id TEXT NOT NULL,
    variation_id TEXT NOT NULL DEFAULT '',
    product_name TEXT,
    cost_price REAL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    PRIMARY KEY (product_id, variation_id)
  );

  CREATE TABLE IF NOT EXISTS nexus_financial_snapshots (
    period TEXT PRIMARY KEY, -- 'YYYY-MM-DD' or 'YYYY-MM'
    gross_revenue REAL DEFAULT 0,
    net_profit REAL DEFAULT 0,
    fees REAL DEFAULT 0,
    ad_spend REAL DEFAULT 0,
    margin_percent REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Social Selling & Growth Automation expansions
  CREATE TABLE IF NOT EXISTS nexus_social_tokens (
    platform TEXT PRIMARY KEY, -- 'instagram', 'tiktok', 'facebook'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at DATETIME,
    scopes TEXT,
    username TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS nexus_generated_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    product_name TEXT,
    script_hook TEXT,
    script_body TEXT,
    video_url TEXT,
    voice_over_url TEXT,
    status TEXT DEFAULT 'rendered', -- 'processing', 'rendered', 'failed'
    rendered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS nexus_comment_automation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL, -- 'instagram', 'tiktok'
    post_id TEXT,
    comment_id TEXT UNIQUE,
    username TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    ai_reply_text TEXT NOT NULL,
    checkout_link TEXT,
    status TEXT DEFAULT 'processed', -- 'queued', 'processed', 'failed'
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Support multi-provider SMTP & Resend settings column migration
try {
  db.exec("ALTER TABLE smtp_settings ADD COLUMN provider_type TEXT DEFAULT 'SMTP'");
} catch (e) {}
try {
  db.exec("ALTER TABLE smtp_settings ADD COLUMN resend_api_key TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE smtp_settings ADD COLUMN from_name TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE smtp_settings ADD COLUMN from_email TEXT");
} catch (e) {}

// Auto-seed financial snapshot templates and product costs if empty
try {
  const countCosts = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='nexus_product_costs'").get() as any;
  const countSnapshots = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='nexus_financial_snapshots'").get() as any;
  
  if (countCosts && countCosts.count > 0) {
    const costsNum = db.prepare('SELECT COUNT(*) as count FROM nexus_product_costs').get() as any;
    if (costsNum && costsNum.count === 0) {
      console.log('[SQLite-Finance] Seeding product costs catalog...');
      const insertCost = db.prepare('INSERT INTO nexus_product_costs (product_id, variation_id, product_name, cost_price, currency) VALUES (?, ?, ?, ?, ?)');
      
      db.transaction(() => {
        insertCost.run('231', '', 'Ensemble Lingerie Dentelle Luxe 2025 | Lingerie Sexy Chic', 18.50, 'EUR');
        insertCost.run('232', '', 'Soutien-Gorge en Dentelle Transparente | Maintien Sans Armature', 12.00, 'EUR');
        insertCost.run('233', '', 'Ensemble Lingerie Sexy Dentelle 3 Pièces avec Porte-Jarretelles', 22.40, 'EUR');
        insertCost.run('234', '', 'Collants Résille Vintage à Motifs Géométriques | Rétro Chic', 4.50, 'EUR');
        insertCost.run('235', '', 'Robe Maxi Transparente en Dentelle Florale', 24.50, 'EUR');
        insertCost.run('236', '', 'Étreinte Noire – Ensemble Lingerie en Dentelle', 16.80, 'EUR');
        insertCost.run('237', '', 'Nocturne Élégante – Ensemble en Dentelle Noire', 19.50, 'EUR');
        insertCost.run('238', '', 'Lingerie Sexy Rose en Dentelle Florale | Nuisette & Tutu', 14.20, 'EUR');
        insertCost.run('239', '', 'Velours d\'Ombre : Ensemble Lingerie Sexy Dentelle Noire', 21.00, 'EUR');
        insertCost.run('240', '', 'Robe de Nuit Longue Léopard Transparente & Dentelle', 17.50, 'EUR');
        insertCost.run('241', '', 'Sèche Cheveux Pro FLORENCE HK-427 2200W', 22.00, 'EUR');
        insertCost.run('242', '', 'Plaque Cheveux FLORENCE HK397 – 900°F', 18.00, 'EUR');
        insertCost.run('243', '', 'Lisseur Céramique à vapeur 100W – Florence HK450-2', 32.50, 'EUR');
        insertCost.run('244', '', 'Sérum Visage Anti-Âge à l’Acide Hyaluronique & Collagène', 6.20, 'EUR');
        insertCost.run('245', '', 'Sérum Visage BIOAOUA : Vitamine E & Miel de Manuka', 5.80, 'EUR');
      })();
      console.log('[SQLite-Finance] Product costs catalog populated.');
    }
  }

  if (countSnapshots && countSnapshots.count > 0) {
    const snapsNum = db.prepare('SELECT COUNT(*) as count FROM nexus_financial_snapshots').get() as any;
    if (snapsNum && snapsNum.count === 0) {
      console.log('[SQLite-Finance] Seeding elegant profit analytics history (last 12 months + daily snapshots)...');
      const insertSnapshot = db.prepare(`
        INSERT INTO nexus_financial_snapshots (period, gross_revenue, net_profit, fees, ad_spend, margin_percent)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      db.transaction(() => {
        // 1. Seed past 12 Months of Monthly snapshots (Year: 2025 & current 2026 months)
        const months = [
          { period: '2025-06', gross: 24500, cogs: 7200, fees: 820, ad: 4200 },
          { period: '2025-07', gross: 28900, cogs: 8400, fees: 980, ad: 4800 },
          { period: '2025-08', gross: 31200, cogs: 9100, fees: 1040, ad: 5100 },
          { period: '2025-09', gross: 27400, cogs: 8100, fees: 910, ad: 4500 },
          { period: '2025-10', gross: 33800, cogs: 9940, fees: 1125, ad: 5600 },
          { period: '2025-11', gross: 45600, cogs: 13200, fees: 1530, ad: 7200 }, // Black Friday boost
          { period: '2025-12', gross: 58900, cogs: 17150, fees: 1980, ad: 9200 }, // Christmas boost
          { period: '2026-01', gross: 29800, cogs: 8700, fees: 1005, ad: 4900 },
          { period: '2026-02', gross: 32400, cogs: 9500, fees: 1090, ad: 5300 },
          { period: '2026-03', gross: 35100, cogs: 10200, fees: 1180, ad: 5800 },
          { period: '2026-04', gross: 39500, cogs: 11600, fees: 1320, ad: 6200 },
          { period: '2026-05', gross: 42700, cogs: 12500, fees: 1420, ad: 6800 }
        ];

        for (const m of months) {
          const net = m.gross - (m.cogs + m.fees + m.ad);
          const margin = (net / m.gross) * 100;
          insertSnapshot.run(m.period, m.gross, net, m.fees, m.ad, margin);
        }

        // 2. Seed past 30 Days of Daily snapshots to enable live dashboard graphs
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const yyyy = dayDate.getFullYear();
          const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
          const dd = String(dayDate.getDate()).padStart(2, '0');
          const dayStr = `${yyyy}-${mm}-${dd}`;

          const randSeed = Math.sin(i) * 300 + 1200;
          const gross = Math.max(350, Math.floor(randSeed + Math.random() * 200));
          const cogs = Math.floor(gross * 0.28);
          const fees = Math.floor(gross * 0.034 + 5); 
          const ad = Math.max(40, Math.floor(gross * 0.15 + (Math.random() - 0.5) * 20));

          const net = gross - (cogs + fees + ad);
          const margin = (net / gross) * 100;

          insertSnapshot.run(dayStr, gross, net, fees, ad, margin);
        }
      })();
      console.log('[SQLite-Finance] Live profit snapshots successfully initialized.');
    }
  }
} catch (financeErr: any) {
  console.error('[SQLite-Finance] Error seeding database tables:', financeErr.message);
}

// Auto-seed keywords if empty
try {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM marketing_keywords').get() as any;
  if (countRow && countRow.count === 0) {
    console.log('[SQLite-Marketing] Seeding default marketing keywords database...');
    const insert = db.prepare('INSERT INTO marketing_keywords (id, keyword, category, match_type, formatted_keyword) VALUES (?, ?, ?, ?, ?)');
    db.transaction(() => {
      for (const kw of DEFAULT_MARKETING_KEYWORDS) {
        const id = kw.category + '_' + kw.keyword.toLowerCase().replace(/[^a-z0-9]/g, '_');
        insert.run(id, kw.keyword, kw.category, kw.match_type, kw.formatted_keyword);
      }
    })();
    console.log('[SQLite-Marketing] Successfully seeded default marketing keywords.');
  }
} catch (err) {
  console.error('[SQLite-Marketing] Error seeding marketing keywords:', err);
}

// Auto-seed telemetry_visits if empty
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS telemetry_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      site_url TEXT,
      item_name TEXT NOT NULL,
      item_type TEXT NOT NULL, -- 'article', 'product', 'page'
      duration_seconds INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      hour_bucket TEXT NOT NULL,
      day_bucket TEXT NOT NULL,
      week_bucket TEXT NOT NULL,
      month_bucket TEXT NOT NULL,
      year_bucket TEXT NOT NULL
    );
  `);

  // Check and reseed if using old mock product items
  let shouldReseed = false;
  const countVisits = db.prepare('SELECT COUNT(*) as count FROM telemetry_visits').get() as any;
  if (!countVisits || countVisits.count === 0) {
    shouldReseed = true;
  } else {
    const hasOldItems = db.prepare("SELECT COUNT(*) as count FROM telemetry_visits WHERE item_name LIKE '%Escarpins%' OR item_name LIKE '%Robe Fleurie%'").get() as any;
    if (hasOldItems && hasOldItems.count > 0) {
      console.log('[SQLite-Telemetry] Detected old demo products. Re-seeding database with exact products from piecesdames.com...');
      db.exec("DELETE FROM telemetry_visits;");
      shouldReseed = true;
    }
  }

  if (shouldReseed) {
    console.log('[SQLite-Telemetry] Seeding historical telemetry visits with real piecesdames.com lingerie and skincare products to enable live reports...');
    
    const insertVisit = db.prepare(`
      INSERT INTO telemetry_visits (
        visitor_id, site_url, item_name, item_type, duration_seconds, 
        created_at, hour_bucket, day_bucket, week_bucket, month_bucket, year_bucket
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Helper to get buckets
    const getBucketsForSeed = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      
      const startOfYear = new Date(y, 0, 1);
      const diff = d.getTime() - startOfYear.getTime();
      const oneWeek = 1000 * 60 * 60 * 24 * 7;
      const weekNum = Math.ceil((diff + 1) / oneWeek) || 1;
      const w = String(weekNum).padStart(2, '0');

      return {
        hour: `${y}-${m}-${day} ${h}:00`,
        day: `${y}-${m}-${day}`,
        week: `${y}-W${w}`,
        month: `${y}-${m}`,
        year: String(y)
      };
    };

    const sites = ['https://piecesdames.com', 'https://demo-woocommerce.net'];
    const items = {
      product: [
        'Ensemble Lingerie Dentelle Luxe 2025 | Lingerie Sexy Chic',
        'Soutien-Gorge en Dentelle Transparente | Maintien Sans Armature',
        'Ensemble Lingerie Sexy Dentelle 3 Pièces avec Porte-Jarretelles',
        'Collants Résille Vintage à Motifs Géométriques | Rétro Chic',
        'Robe Maxi Transparente en Dentelle Florale',
        'Étreinte Noire – Ensemble Lingerie en Dentelle',
        'Nocturne Élégante – Ensemble en Dentelle Noire',
        'Lingerie Sexy Rose en Dentelle Florale | Nuisette & Tutu',
        'Velours d\'Ombre : Ensemble Lingerie Sexy Dentelle Noire',
        'Robe de Nuit Longue Léopard Transparente & Dentelle',
        'Sèche Cheveux Pro FLORENCE HK-427 2200W',
        'Plaque Cheveux FLORENCE HK397 – 900°F',
        'Lisseur Céramique à vapeur 100W – Florence HK450-2',
        'Sérum Visage Anti-Âge à l’Acide Hyaluronique & Collagène',
        'Sérum Visage BIOAOUA : Vitamine E & Miel de Manuka'
      ],
      article: [
        'Article: Les rituels beauté K-Beauty de soins coréens pour l\'éclat du visage',
        'Article: Comment choisir la taille idéale d\'un ensemble de lingerie fine',
        'Article: Les avantages du lisseur céramique à vapeur sur la fibre capillaire',
        'Article: Comment bien entretenir vos ensembles en dentelle délicate et soie',
        'Article: Routine éclat anti-âge : pourquoi intégrer l\'acide hyaluronique',
        'Article: Tendances lingerie chic de la saison 2026'
      ],
      page: [
        'Page d\'accueil',
        'Beauté & Bien-être',
        'Lingerie & Nuit',
        'Lunettes de Soleil',
        'Bijoux & Accessoires',
        'Panier',
        'Mon Compte',
        'Mentions Légales'
      ]
    };

    db.transaction(() => {
      const now = new Date();
      
      // Let's seed a beautiful distribute of 600 records across the past 2 years to populate hourly, daily, weekly, monthly, yearly
      // 1. Hourly/Daily (last 48 hours): ~80 records
      for (let i = 0; i < 80; i++) {
        const randMinutesAgo = Math.floor(Math.random() * 2880); // within last 48h
        const d = new Date(now.getTime() - randMinutesAgo * 60 * 1000);
        const visitorId = `vis_${Math.floor(Math.random() * 15) + 100}`;
        const itemType = ['product', 'article', 'page'][Math.floor(Math.random() * 3)] as 'product' | 'article' | 'page';
        const itemName = items[itemType][Math.floor(Math.random() * items[itemType].length)];
        const duration = Math.floor(Math.random() * 220) + 15;
        const site = sites[Math.floor(Math.random() * sites.length)];
        const bk = getBucketsForSeed(d);
        insertVisit.run(visitorId, site, itemName, itemType, duration, d.toISOString(), bk.hour, bk.day, bk.week, bk.month, bk.year);
      }

      // 2. Daily (last 30 days, non-overlapping): ~150 records
      for (let i = 0; i < 150; i++) {
        const randDaysAgo = Math.floor(Math.random() * 30) + 2; 
        const d = new Date(now.getTime() - randDaysAgo * 24 * 60 * 60 * 1000);
        const visitorId = `vis_${Math.floor(Math.random() * 40) + 200}`;
        const itemType = ['product', 'article', 'page'][Math.floor(Math.random() * 3)] as 'product' | 'article' | 'page';
        const itemName = items[itemType][Math.floor(Math.random() * items[itemType].length)];
        const duration = Math.floor(Math.random() * 300) + 20;
        const site = sites[Math.floor(Math.random() * sites.length)];
        const bk = getBucketsForSeed(d);
        insertVisit.run(visitorId, site, itemName, itemType, duration, d.toISOString(), bk.hour, bk.day, bk.week, bk.month, bk.year);
      }

      // 3. Weekly/Monthly (last 12 months, non-overlapping): ~250 records
      for (let i = 0; i < 250; i++) {
        const randWeeksAgo = Math.floor(Math.random() * 52) + 4; // 1 to 12 months
        const d = new Date(now.getTime() - randWeeksAgo * 7 * 24 * 60 * 60 * 1000);
        const visitorId = `vis_${Math.floor(Math.random() * 100) + 1000}`;
        const itemType = ['product', 'article', 'page'][Math.floor(Math.random() * 3)] as 'product' | 'article' | 'page';
        const itemName = items[itemType][Math.floor(Math.random() * items[itemType].length)];
        const duration = Math.floor(Math.random() * 400) + 10;
        const site = sites[Math.floor(Math.random() * sites.length)];
        const bk = getBucketsForSeed(d);
        insertVisit.run(visitorId, site, itemName, itemType, duration, d.toISOString(), bk.hour, bk.day, bk.week, bk.month, bk.year);
      }

      // 4. Yearly (last 4 years, non-overlapping): ~120 records
      for (let i = 0; i < 120; i++) {
        const randYearsAgo = Math.floor(Math.random() * 4) + 1; // 1 to 4 years ago
        const d = new Date(now.getFullYear() - randYearsAgo, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const visitorId = `vis_${Math.floor(Math.random() * 150) + 5000}`;
        const itemType = ['product', 'article', 'page'][Math.floor(Math.random() * 3)] as 'product' | 'article' | 'page';
        const itemName = items[itemType][Math.floor(Math.random() * items[itemType].length)];
        const duration = Math.floor(Math.random() * 250) + 5;
        const site = sites[Math.floor(Math.random() * sites.length)];
        const bk = getBucketsForSeed(d);
        insertVisit.run(visitorId, site, itemName, itemType, duration, d.toISOString(), bk.hour, bk.day, bk.week, bk.month, bk.year);
      }
    })();
    console.log('[SQLite-Telemetry] Initial telemetry visit logs successfully seeded.');
  }
} catch (err) {
  console.error('[SQLite-Telemetry] Error installing telemetry tracking DB tables/seeds:', err);
}

// Auto-seed security logs if empty
try {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM security_logs').get() as any;
  if (countRow && countRow.count === 0) {
    console.log('[SQLite-Security] Seeding mock security logs...');
    const insertLog = db.prepare(`
      INSERT INTO security_logs (site_url, ip, country, event_type, severity, description, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    db.transaction(() => {
      insertLog.run('https://piecesdames.com', '185.220.101.5', 'DE', 'brute_force', 'critical', 'Brute Force détecté sur /wp-login.php: 42 tentatives échouées en 60s (Compte ciblé : admin).', 'Mozilla/5.0 (X11; Linux x86_64) Hydra/9.1');
      insertLog.run('https://piecesdames.com', '91.240.118.23', 'RU', 'malicious_path', 'high', 'Exploration de chemin suspect: tentative d\'accès direct au fichier de sauvegarde wp-config.php.bak.', 'curl/7.68.0');
      insertLog.run('https://demo-woocommerce.net', '193.56.28.44', 'FR', 'xmlrpc_attack', 'medium', 'Multi-call XML-RPC Pingback Flood sur /xmlrpc.php bloqué par le pare-feu.', 'WordPress/6.3; php-pingback-test');
      insertLog.run('https://piecesdames.com', '45.143.203.111', 'US', 'sql_injection', 'critical', 'Requête SQL injected malveillante détectée et bloquée sur la REST API (endpoint /wp-json/wp/v2/users).', 'sqlmap/1.7.3#stable');
      insertLog.run('https://piecesdames.com', '89.248.167.33', 'NL', 'file_change', 'medium', 'Modification suspecte détectée sur index.php (Fichier système WordPress hors-ligne ou altéré).', 'Core Integrity Scan Process');
    })();
    
    // Seed one banned IP as initial state
    db.prepare(`
      INSERT OR IGNORE INTO security_banned_ips (ip, site_url, reason)
      VALUES (?, ?, ?)
    `).run('185.220.101.5', 'https://piecesdames.com', 'Brute force répété sur l\'interface d\'administration (xml-rpc & wp-login)');
    
    console.log('[SQLite-Security] Placed initial security seed logs.');
  }
} catch (err: any) {
  console.error('[SQLite-Security] Error seeding security metrics:', err.message);
}

// Auto-seed Social Selling & Growth Automation metrics
try {
  const tokenCount = db.prepare('SELECT COUNT(*) as count FROM nexus_social_tokens').get() as any;
  if (tokenCount && tokenCount.count === 0) {
    console.log('[SQLite-Social] Seeding default social automation logs and mock tokens...');
    db.transaction(() => {
      // Seed default platform accounts
      db.prepare(`
        INSERT OR IGNORE INTO nexus_social_tokens (platform, access_token, refresh_token, expires_at, scopes, username)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('instagram', 'ig_live_access_tok_99882233', 'refresh_tok_921', '2027-12-31 23:59:59', 'instagram_basic,instagram_manage_comments,instagram_manage_messages', 'nexus_active_fashions');

      db.prepare(`
        INSERT OR IGNORE INTO nexus_social_tokens (platform, access_token, refresh_token, expires_at, scopes, username)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('tiktok', 'tt_live_access_tok_44332211', 'refresh_tok_105', '2027-12-31 23:59:59', 'video.publish,comment.list,comment.reply', 'nexus_tiktok_curations');

      // Seed mock comment replies
      const insertReply = db.prepare(`
        INSERT OR IGNORE INTO nexus_comment_automation_logs (platform, post_id, comment_id, username, comment_text, ai_reply_text, checkout_link, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertReply.run(
        'instagram',
        'media_ig_9921',
        'comm_ig_201',
        'lucy_style77',
        'Is the Ensemble Lingerie Dentelle Luxe available in size M?',
        'Hey Lucy! Yes, we have 4 units left of the Ensemble Lingerie Dentelle Luxe in size M. Order yours here now with free shipping today! 🛍️✨',
        'https://piecesdames.com/cart?add-to-cart=231&size=M&ref=ig_comment',
        'processed'
      );

      insertReply.run(
        'instagram',
        'media_ig_9922',
        'comm_ig_202',
        'sophie_runway',
        'How long does shipping take to France?',
        'Bonjour Sophie! Shipping to France takes 2-4 business days via La Poste Colissimo, complete with tracking. Check out your items here! 📦💨',
        'https://piecesdames.com/cart?ref=ig_comment',
        'processed'
      );

      insertReply.run(
        'tiktok',
        'video_tt_8811',
        'comm_tt_303',
        'marcus_skincare',
        'What is the price of the anti-age Bioaoua Serum?',
        'Hey Marcus! The BIOAOUA Vitamin E & Manuka Honey Serum is currently on sale for only 19.99 € (down from 29.99 €). Grab yours here before the discount expires! 🍯✨',
        'https://piecesdames.com/cart?add-to-cart=245&ref=tt_comment',
        'processed'
      );

      // Seed mock generated video logs
      const insertVideo = db.prepare(`
        INSERT OR IGNORE INTO nexus_generated_videos (product_id, product_name, script_hook, script_body, video_url, voice_over_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      insertVideo.run(
        '231',
        'Ensemble Lingerie Dentelle Luxe 2025 | Lingerie Sexy Chic',
        'Stop scrolling, because this is the ultimate luxury lingerie you\'ve been waiting for! 🖤✨',
        '[0s-2s Hook]: Stop scrolling, because this is the ultimate luxury lingerie you\'ve been waiting for! 🌟 [2s-6s Interest]: Handmade with premium Italian lace, designed to feel like absolute clouds while giving you that perfect shape under any outfit. 🌹 [6s-11s Desire]: No poking wires, just breathable support and confidence in every thread. Over 4,000 fashionistas are already obsessed. 😍 [11s-15s Action]: Get yours today with 30% OFF and free worldwide express delivery. Link to order is in our bio! 🛍️',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'rendered'
      );

      insertVideo.run(
        '244',
        'Sérum Visage Anti-Âge à l’Acide Hyaluronique & Collagène',
        'The literal skincare cheat code for glass skin is finally active! 🤫💦',
        '[0s-2s Hook]: The literal skincare cheat code for glass skin is finally active! 🤫💦 [2s-6s Interest]: Meet our ultimate Collagen & Hyaluronic Acid nectar. Infused with micro-particles that absorb instantly to lock in 48-hour dewy hydration. 💧 [6s-11s Desire]: Erase dry lines, boost skin plumpness, and unlock a luminous glow that lasts all day without heavy makeup. Pure science. 🧪✨ [11s-15s Action]: Use code GLOW at checkout for 20% off. Tap the link in our profile now! 🛒🌸',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'rendered'
      );
    });
    console.log('[SQLite-Social] Successfully populated standard social tokens and logs.');
  }
} catch (socialSeedErr: any) {
  console.error('[SQLite-Social] Error seeding social growth metrics:', socialSeedErr.message);
}

// ----------------------------------------------------
// CREATE AND SEED SAAS CONNECTION LOGS TABLE
// ----------------------------------------------------
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS saas_connection_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      name TEXT,
      login_time TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      last_page TEXT,
      device TEXT,
      city TEXT,
      country TEXT,
      session_id TEXT UNIQUE
    );
  `);

  const countLogs = db.prepare('SELECT COUNT(*) as count FROM saas_connection_logs').get() as any;
  if (!countLogs || countLogs.count === 0) {
    console.log('[SQLite-Telemetry] Seeding default SaaS connection logs history...');
    const insertLog = db.prepare(`
      INSERT INTO saas_connection_logs (email, name, login_time, duration_seconds, last_page, device, city, country, session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      insertLog.run(
        'ziedbenmiled3@gmail.com',
        'Zied Benmiled',
        '2026-06-14 11:24:12',
        1450,
        'Hub de Communication - Config SMTP',
        'ORDINATEUR',
        'Marseille',
        'France',
        'saas_zied_hist'
      );
      insertLog.run(
        'contact@nexuswp.pro',
        'Nexus Admin (Support)',
        '2026-06-14 09:15:30',
        2400,
        'Gestion Clientèle & Télémétrie',
        'ORDINATEUR',
        'Paris',
        'France',
        'saas_admin_hist'
      );
      insertLog.run(
        'sophie.laurent@gmail.com',
        'Sophie Laurent',
        '2026-06-13 18:40:22',
        580,
        'Lancement d\'Audit Technique SEO',
        'MOBILE (IPHONE)',
        'Lyon',
        'France',
        'saas_sophie_hist'
      );
      insertLog.run(
        'jean.dupont@orange.fr',
        'Jean Dupont',
        '2026-06-13 14:10:05',
        920,
        'Abonnements SaaS & Plans',
        'TABLET (IPAD)',
        'Paris',
        'France',
        'saas_jean_hist'
      );
      insertLog.run(
        'clara.gomez@yahoo.fr',
        'Clara Gomez',
        '2026-06-12 10:30:15',
        1210,
        'Script Marketing Hub Autopilot',
        'MOBILE (ANDROID)',
        'Toulouse',
        'France',
        'saas_clara_hist'
      );
      insertLog.run(
        'amina.belka@gmail.com',
        'Amina Belka',
        '2026-06-12 08:14:45',
        1850,
        'Rapport de Synergie de Liens WP',
        'ORDINATEUR',
        'Casablanca',
        'Maroc',
        'saas_amina_hist'
      );
    })();
    console.log('[SQLite-Telemetry] Successfully seeded SaaS connection history.');
  }
} catch (telemetrySeedErr: any) {
  console.error('[SQLite-Telemetry] Error seeding SaaS connection history:', telemetrySeedErr.message);
}

export default db;
