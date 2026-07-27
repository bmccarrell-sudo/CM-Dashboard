// PATCH  /api/orders/:id  -> update
// DELETE /api/orders/:id  -> delete

const ALLOWED = ['type','item','client','contact_id','amount','status','notes'];

export async function onRequestPatch({ request, env, params }) {
  try {
    const body = await request.json();
    const sets = []; const values = [];
    for (const key of ALLOWED) {
      if (body[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(key === 'amount' ? (parseFloat(body[key]) || 0) : body[key]);
      }
    }
    if (!sets.length) return Response.json({ error: 'No valid fields' }, { status: 400 });
    sets.push('updated_at = ?'); values.push(Date.now()); values.push(params.id);
    await env.DB.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Failed to update order', detail: String(err) }, { status: 500 });
  }
}

export async function onRequestDelete({ env, params }) {
  try {
    await env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(params.id).run();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Failed to delete order', detail: String(err) }, { status: 500 });
  }
}
