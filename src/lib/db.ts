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
