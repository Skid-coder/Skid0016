const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'crm.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initialize() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      country TEXT DEFAULT '',
      city TEXT DEFAULT '',
      contact_person TEXT DEFAULT '',
      email TEXT DEFAULT '',
      linkedin TEXT DEFAULT '',
      source TEXT CHECK(source IN ('Google Maps', 'LinkedIn', 'Event', 'Referral', 'Email Outreach', 'Other')) DEFAULT 'Other',
      status TEXT CHECK(status IN ('New', 'Contacted', 'Replied', 'Registered', 'Activated', 'Rejected')) DEFAULT 'New',
      notes TEXT DEFAULT '',
      date_added TEXT DEFAULT (date('now')),
      last_contact_date TEXT,
      next_followup_date TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      month TEXT NOT NULL,
      target_leads INTEGER DEFAULT 0,
      target_contacted INTEGER DEFAULT 0,
      target_replied INTEGER DEFAULT 0,
      target_registered INTEGER DEFAULT 0,
      target_activated INTEGER DEFAULT 0,
      UNIQUE(user_id, month)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      details TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_date);
    CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
    CREATE INDEX IF NOT EXISTS idx_leads_date_added ON leads(date_added);
  `);

  // Create a default admin user if none exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(
      'admin@crm.local',
      hash,
      'Admin'
    );
  }
}

initialize();

module.exports = db;
