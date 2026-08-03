-- Run this ONCE against an existing/already-deployed CyberMagnet CRM database
-- to add the offering / hours / owner / called / outcome fields.
-- Skip this file entirely for a brand-new database — schema.sql already
-- includes these columns.
--
--   wrangler d1 execute cybermagnet-crm --remote --file=./migration.sql

ALTER TABLE contacts ADD COLUMN offering TEXT;
ALTER TABLE contacts ADD COLUMN hours TEXT;
ALTER TABLE contacts ADD COLUMN owner TEXT;
ALTER TABLE contacts ADD COLUMN called TEXT DEFAULT 'no';
ALTER TABLE contacts ADD COLUMN outcome TEXT DEFAULT '';
