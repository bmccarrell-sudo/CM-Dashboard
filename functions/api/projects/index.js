// GET  /api/projects   -> list all projects
// POST /api/projects   -> create a project

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM projects ORDER BY updated_at DESC'
    ).all();
    return Response.json({ projects: results });
  } catch (err) {
    return Response.json({ error: 'Failed to load projects', detail: String(err) }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const now = Date.now();
    const id = crypto.randomUUID();
    const rec = {
      id, now,
      name:       (body.name || '').toString().trim(),
      client:     (body.client || '').toString().trim(),
      contact_id: body.contact_id || null,
      service:    (body.service || '').toString().trim(),
      status:     body.status || 'active',
      priority:   body.priority || 'normal',
      value:      parseFloat(body.value) || 0,
      notes:      (body.notes || '').toString().trim(),
      deadline:   body.deadline ? parseInt(body.deadline) : null,
      created_at: now,
      updated_at: now,
    };
    if (!rec.name) return Response.json({ error: 'Project name required' }, { status: 400 });
    await env.DB.prepare(
      `INSERT INTO projects (id,name,client,contact_id,service,status,priority,value,notes,deadline,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(rec.id, rec.name, rec.client, rec.contact_id, rec.service, rec.status,
           rec.priority, rec.value, rec.notes, rec.deadline, rec.created_at, rec.updated_at).run();
    return Response.json({ project: rec });
  } catch (err) {
    return Response.json({ error: 'Failed to create project', detail: String(err) }, { status: 500 });
  }
}
