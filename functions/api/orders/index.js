// GET  /api/orders   -> list all orders
// POST /api/orders   -> create an order

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM orders ORDER BY created_at DESC'
    ).all();
    return Response.json({ orders: results });
  } catch (err) {
    return Response.json({ error: 'Failed to load orders', detail: String(err) }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const now = Date.now(); const id = crypto.randomUUID();
    const rec = {
      id,
      type:       body.type || 'service',
      item:       (body.item || '').toString().trim(),
      client:     (body.client || '').toString().trim(),
      contact_id: body.contact_id || null,
      amount:     parseFloat(body.amount) || 0,
      status:     body.status || 'pending',
      notes:      (body.notes || '').toString().trim(),
      created_at: now, updated_at: now,
    };
    if (!rec.item) return Response.json({ error: 'Item name required' }, { status: 400 });
    await env.DB.prepare(
      `INSERT INTO orders (id,type,item,client,contact_id,amount,status,notes,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).bind(rec.id, rec.type, rec.item, rec.client, rec.contact_id, rec.amount,
           rec.status, rec.notes, rec.created_at, rec.updated_at).run();
    return Response.json({ order: rec });
  } catch (err) {
    return Response.json({ error: 'Failed to create order', detail: String(err) }, { status: 500 });
  }
}
