import Database from 'better-sqlite3';
import path from 'path';

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
`);

export default db;
