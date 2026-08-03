// GET /api/setup  -> creates all tables if they don't exist
// Run this once by visiting /api/setup in your browser after deploying.

export async function onRequestGet({ env }) {
  const results = [];
  const steps = [
    {
      name: 'contacts table',
      sql: `CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY, company TEXT NOT NULL, category TEXT, phone TEXT,
        website TEXT, email TEXT, address TEXT, rating REAL DEFAULT 0,
        status TEXT DEFAULT 'lead', source TEXT DEFAULT 'manual',
        created_at INTEGER, updated_at INTEGER
      )`
    },
    {
      name: 'notes table',
      sql: `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY, contact_id TEXT NOT NULL, text TEXT NOT NULL, ts INTEGER,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      )`
    },
    {
      name: 'notes index',
      sql: `CREATE INDEX IF NOT EXISTS idx_notes_contact ON notes(contact_id)`
    },
    {
      name: 'contacts updated index',
      sql: `CREATE INDEX IF NOT EXISTS idx_contacts_updated ON contacts(updated_at)`
    },
    {
      name: 'projects table',
      sql: `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, client TEXT, contact_id TEXT,
        service TEXT, status TEXT DEFAULT 'active', priority TEXT DEFAULT 'normal',
        value REAL DEFAULT 0, notes TEXT DEFAULT '', deadline INTEGER,
        created_at INTEGER, updated_at INTEGER
      )`
    },
    {
      name: 'projects index',
      sql: `CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`
    },
    {
      name: 'orders table',
      sql: `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, item TEXT NOT NULL, client TEXT,
        contact_id TEXT, amount REAL DEFAULT 0, status TEXT DEFAULT 'pending',
        notes TEXT DEFAULT '', created_at INTEGER, updated_at INTEGER
      )`
    },
    {
      name: 'orders index',
      sql: `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`
    },
  ];

  for (const step of steps) {
    try {
      await env.DB.prepare(step.sql).run();
      results.push({ step: step.name, status: 'ok' });
    } catch (err) {
      results.push({ step: step.name, status: 'error', detail: String(err) });
    }
  }

  // ── New CRM fields (owner/hours/offering/called/outcome) ──────────────────
  // Added after the initial launch, so existing databases won't have these
  // columns yet. Checks what's already there first so this step is safe to
  // run again and again without erroring on columns that already exist.
  try {
    const { results: cols } = await env.DB.prepare(`PRAGMA table_info(contacts)`).all();
    const existing = new Set(cols.map((c) => c.name));
    const newColumns = [
      { name: 'offering', sql: `ALTER TABLE contacts ADD COLUMN offering TEXT` },
      { name: 'hours', sql: `ALTER TABLE contacts ADD COLUMN hours TEXT` },
      { name: 'owner', sql: `ALTER TABLE contacts ADD COLUMN owner TEXT` },
      { name: 'called', sql: `ALTER TABLE contacts ADD COLUMN called TEXT DEFAULT 'no'` },
      { name: 'outcome', sql: `ALTER TABLE contacts ADD COLUMN outcome TEXT DEFAULT ''` },
    ];
    for (const col of newColumns) {
      if (existing.has(col.name)) {
        results.push({ step: `contacts.${col.name} column (already present)`, status: 'ok' });
        continue;
      }
      try {
        await env.DB.prepare(col.sql).run();
        results.push({ step: `contacts.${col.name} column`, status: 'ok' });
      } catch (err) {
        results.push({ step: `contacts.${col.name} column`, status: 'error', detail: String(err) });
      }
    }
  } catch (err) {
    results.push({ step: 'contacts column check', status: 'error', detail: String(err) });
  }

  const allOk = results.every(r => r.status === 'ok');
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>CyberMagnet DB Setup</title>
<style>
  body{background:#080D16;color:#E8F0FA;font-family:monospace;padding:40px;max-width:600px;margin:0 auto}
  h1{color:#FF7A2E;margin-bottom:24px}
  .step{padding:10px 14px;margin-bottom:8px;border-radius:6px;display:flex;align-items:center;gap:12px}
  .ok{background:rgba(53,212,138,0.1);border:1px solid rgba(53,212,138,0.2)}
  .error{background:rgba(255,92,122,0.1);border:1px solid rgba(255,92,122,0.2)}
  .icon{font-size:1.1rem}
  .name{flex:1}
  .detail{font-size:0.78rem;color:#FF5C7A;margin-top:4px}
  .done{margin-top:28px;padding:18px;border-radius:8px;text-align:center;font-size:1rem;font-weight:700}
  .done.ok{background:rgba(53,212,138,0.12);border:1px solid rgba(53,212,138,0.3);color:#35D48A}
  .done.err{background:rgba(255,92,122,0.1);border:1px solid rgba(255,92,122,0.3);color:#FF5C7A}
</style></head>
<body>
<h1>CyberMagnet DB Setup</h1>
${results.map(r => `
  <div class="step ${r.status}">
    <span class="icon">${r.status === 'ok' ? '✅' : '❌'}</span>
    <div>
      <div class="name">${r.step}</div>
      ${r.detail ? `<div class="detail">${r.detail}</div>` : ''}
    </div>
  </div>`).join('')}
<div class="done ${allOk ? 'ok' : 'err'}">
  ${allOk
    ? '✅ All tables created successfully — you can close this and use the dashboard.'
    : '❌ Some steps failed — check the details above.'}
</div>
</body></html>`;

  return new Response(html, {
    status: allOk ? 200 : 500,
    headers: { 'Content-Type': 'text/html' },
  });
}
