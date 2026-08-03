// PATCH  /api/contacts/:id  -> update one or more fields
// DELETE /api/contacts/:id  -> delete a contact and its notes

const ALLOWED_FIELDS = ['company', 'category', 'phone', 'website', 'email', 'address', 'rating', 'status', 'offering', 'hours', 'owner', 'called', 'outcome'];

export async function onRequestPatch({ request, env, params }) {
  try {
    const id = params.id;
    const body = await request.json();
    const sets = [];
    const values = [];

    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(key === 'rating' ? (parseFloat(body[key]) || 0) : body[key]);
      }
    }

    if (sets.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    sets.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    await env.DB.prepare(`UPDATE contacts SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Failed to update contact', detail: String(err) }, { status: 500 });
  }
}

export async function onRequestDelete({ env, params }) {
  try {
    const id = params.id;
    await env.DB.prepare('DELETE FROM notes WHERE contact_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Failed to delete contact', detail: String(err) }, { status: 500 });
  }
}
