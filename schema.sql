-- CyberMagnet Admin — D1 schema
-- Run: npx wrangler d1 execute cybermagnet-crm --remote --file=./schema.sql

-- ── CRM ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY, company TEXT NOT NULL, category TEXT, phone TEXT,
  website TEXT, email TEXT, address TEXT, rating REAL DEFAULT 0,
  status TEXT DEFAULT 'lead', source TEXT DEFAULT 'manual',
  created_at INTEGER, updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY, contact_id TEXT NOT NULL, text TEXT NOT NULL, ts INTEGER,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notes_contact ON notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_updated ON contacts(updated_at);

-- ── PROJECTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, client TEXT, contact_id TEXT,
  service TEXT, status TEXT DEFAULT 'active', priority TEXT DEFAULT 'normal',
  value REAL DEFAULT 0, notes TEXT DEFAULT '', deadline INTEGER,
  created_at INTEGER, updated_at INTEGER,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at);

-- ── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, item TEXT NOT NULL, client TEXT,
  contact_id TEXT, amount REAL DEFAULT 0, status TEXT DEFAULT 'pending',
  notes TEXT DEFAULT '', created_at INTEGER, updated_at INTEGER,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
