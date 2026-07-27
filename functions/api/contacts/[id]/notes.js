// POST /api/contacts/:id/notes  -> add a note to a contact

export async function onRequestPost({ request, env, params }) {
  try {
    const contactId = params.id;
    const body = await request.json();
    const text = (body.text || '').toString().trim();
    if (!text) {
      return Response.json({ error: 'Note text required' }, { status: 400 });
    }

    const note = { id: crypto.randomUUID(), text, ts: Date.now() };
    await env.DB.prepare('INSERT INTO notes (id, contact_id, text, ts) VALUES (?,?,?,?)')
      .bind(note.id, contactId, note.text, note.ts)
      .run();
    await env.DB.prepare('UPDATE contacts SET updated_at = ? WHERE id = ?')
      .bind(note.ts, contactId)
      .run();

    return Response.json({ note });
  } catch (err) {
    return Response.json({ error: 'Failed to add note', detail: String(err) }, { status: 500 });
  }
}
