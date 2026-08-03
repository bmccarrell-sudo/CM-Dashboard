// GET  /api/contacts        -> list all contacts with their notes
// POST /api/contacts        -> create one contact, or { bulk: [...] } for CSV import

function mapContactRow(c) {
  return {
    id: c.id,
    company: c.company,
    category: c.category,
    phone: c.phone,
    website: c.website,
    email: c.email,
    address: c.address,
    rating: c.rating,
    status: c.status,
    offering: c.offering,
    hours: c.hours,
    owner: c.owner,
    called: c.called,
    outcome: c.outcome,
    source: c.source,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export async function onRequestGet({ env }) {
  try {
    const { results: contactRows } = await env.DB.prepare(
      'SELECT * FROM contacts ORDER BY updated_at DESC'
    ).all();
    const { results: noteRows } = await env.DB.prepare(
      'SELECT * FROM notes ORDER BY ts ASC'
    ).all();

    const notesByContact = {};
    for (const n of noteRows) {
      (notesByContact[n.contact_id] ||= []).push({ id: n.id, text: n.text, ts: n.ts });
    }

    const contacts = contactRows.map((c) => ({
      ...mapContactRow(c),
      notes: notesByContact[c.id] || [],
    }));

    return Response.json({ contacts });
  } catch (err) {
    return Response.json({ error: 'Failed to load contacts', detail: String(err) }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const records = Array.isArray(body?.bulk) ? body.bulk : [body];
    const now = Date.now();
    const inserted = [];

    for (const r of records) {
      const id = crypto.randomUUID();
      const rec = {
        id,
        company: (r.company || '').toString().trim(),
        category: (r.category || '').toString().trim(),
        phone: (r.phone || '').toString().trim(),
        website: (r.website || '').toString().trim(),
        email: (r.email || '').toString().trim(),
        address: (r.address || '').toString().trim(),
        rating: parseFloat(r.rating) || 0,
        status: r.status || 'lead',
        offering: (r.offering || '').toString().trim(),
        hours: (r.hours || '').toString().trim(),
        owner: (r.owner || '').toString().trim(),
        called: r.called === 'yes' ? 'yes' : 'no',
        outcome: (r.outcome || '').toString().trim(),
        source: r.source || 'manual',
        created_at: now,
        updated_at: now,
      };
      if (!rec.company) continue;

      await env.DB.prepare(
        `INSERT INTO contacts (id, company, category, phone, website, email, address, rating, status, offering, hours, owner, called, outcome, source, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        rec.id, rec.company, rec.category, rec.phone, rec.website, rec.email,
        rec.address, rec.rating, rec.status, rec.offering, rec.hours, rec.owner,
        rec.called, rec.outcome, rec.source, rec.created_at, rec.updated_at
      ).run();

      const notes = [];
      if (Array.isArray(r.notes) && r.notes.length) {
        for (const n of r.notes) {
          const noteId = crypto.randomUUID();
          const text = (typeof n === 'string' ? n : n.text || '').toString().trim();
          if (!text) continue;
          const ts = n.ts || now;
          await env.DB.prepare(
            'INSERT INTO notes (id, contact_id, text, ts) VALUES (?,?,?,?)'
          ).bind(noteId, id, text, ts).run();
          notes.push({ id: noteId, text, ts });
        }
      }

      inserted.push({ ...mapContactRow(rec), notes });
    }

    return Response.json({ contacts: inserted });
  } catch (err) {
    return Response.json({ error: 'Failed to create contact(s)', detail: String(err) }, { status: 500 });
  }
}
