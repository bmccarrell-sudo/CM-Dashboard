-- Run this ONCE against an existing/already-deployed CyberMagnet Admin database
-- to add the offering / hours / owner / called / outcome contact fields.
-- Skip this entirely for a brand-new database — schema.sql already includes
-- these columns, and visiting /api/setup in your browser does the same thing
-- this file does (and is safe to run more than once).
--
--   wrangler d1 execute cybermagnet-crm --remote --file=./migration.sql
--
-- If a column already exists, its ALTER TABLE line below will error out —
-- that's expected and harmless, it just means that column's already there.

ALTER TABLE contacts ADD COLUMN offering TEXT;
ALTER TABLE contacts ADD COLUMN hours TEXT;
ALTER TABLE contacts ADD COLUMN owner TEXT;
ALTER TABLE contacts ADD COLUMN called TEXT DEFAULT 'no';
ALTER TABLE contacts ADD COLUMN outcome TEXT DEFAULT '';
