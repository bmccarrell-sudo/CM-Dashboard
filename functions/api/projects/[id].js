// PATCH  /api/projects/:id  -> update
// DELETE /api/projects/:id  -> delete

const ALLOWED = ['name','client','contact_id','service','status','priority','value','notes','deadline'];

export async function onRequestPatch({ request, env, params }) {
  try {
    const body = await request.json();
    const sets = []; const values = [];
    for (const key of ALLOWED) {
      if (body[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(key === 'value' ? (parseFloat(body[key]) || 0)
                  : key === 'deadline' ? (body[key] ? parseInt(body[key]) : null)
                  : body[key]);
      }
    }
    if (!sets.length) return Response.json({ error: 'No valid fields' }, { status: 400 });
    sets.push('updated_at = ?'); values.push(Date.now()); values.push(params.id);
    await env.DB.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Failed to update project', detail: String(err) }, { status: 500 });
  }
}

export async function onRequestDelete({ env, params }) {
  try {
    await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(params.id).run();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Failed to delete project', detail: String(err) }, { status: 500 });
  }
}
