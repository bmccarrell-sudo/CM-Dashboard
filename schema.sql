-- CyberMagnet CRM — D1 schema
-- For a brand-new database, run this file. If you already have a live
-- database from before the offering/hours/owner/called/outcome fields
-- existed, run migration.sql instead — running this CREATE TABLE again
-- is a no-op on an existing table (IF NOT EXISTS) and won't add the columns.

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  category TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  address TEXT,
  rating REAL DEFAULT 0,
  status TEXT DEFAULT 'lead',
  offering TEXT,
  hours TEXT,
  owner TEXT,
  called TEXT DEFAULT 'no',
  outcome TEXT DEFAULT '',
  source TEXT DEFAULT 'manual',
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  text TEXT NOT NULL,
  ts INTEGER,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_contact ON notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_updated ON contacts(updated_at);
