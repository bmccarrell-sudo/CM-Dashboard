// CyberMagnet Admin — Session-based auth middleware
// Set in Cloudflare Pages: Settings → Environment variables → Production
//   CRM_USER = bmccarrell1590
//   CRM_PASS = CMD1590BFM
//   SESSION_SECRET = (any long random string, e.g. cybermagnet2025admin)

export async function onRequest({ request, env, next }) {
  const USER   = env.CRM_USER   || 'bmccarrell1590';
  const PASS   = env.CRM_PASS   || 'CMD1590BFM';
  const SECRET = env.SESSION_SECRET || 'cm-session-2025-xk9';
  const url    = new URL(request.url);

  // ── Login POST endpoint ────────────────────────────────────────────────────
  if (request.method === 'POST' && url.pathname === '/api/login') {
    try {
      const body = await request.json();
      if (body.user === USER && body.pass === PASS) {
        // Simple signed token: base64(user:timestamp:secret)
        const token = btoa(`${USER}:${Date.now()}:${SECRET}`);
        return new Response(JSON.stringify({ ok: true, token }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `cm_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
          },
        });
      }
    } catch (e) {}
    return new Response(JSON.stringify({ ok: false, error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Logout endpoint ────────────────────────────────────────────────────────
  if (url.pathname === '/api/logout') {
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'cm_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      },
    });
  }

  // ── Allow the main page through (login UI is embedded in index.html) ──────
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return next();
  }

  // ── Validate session for all API calls ────────────────────────────────────
  const cookie = request.headers.get('Cookie') || '';
  const match  = cookie.match(/cm_session=([^;]+)/);
  if (match) {
    try {
      const decoded = atob(match[1]);
      const parts   = decoded.split(':');
      // parts: [user, timestamp, secret...]
      const tokenUser   = parts[0];
      const tokenSecret = parts.slice(2).join(':');
      const tokenAge    = Date.now() - parseInt(parts[1]);
      if (tokenUser === USER && tokenSecret === SECRET && tokenAge < 86400000) {
        return next();
      }
    } catch (e) {}
  }

  // ── Also accept Bearer token in Authorization header (for JS fetch calls) ─
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    try {
      const token   = authHeader.slice(7);
      const decoded = atob(token);
      const parts   = decoded.split(':');
      const tokenUser   = parts[0];
      const tokenSecret = parts.slice(2).join(':');
      const tokenAge    = Date.now() - parseInt(parts[1]);
      if (tokenUser === USER && tokenSecret === SECRET && tokenAge < 86400000) {
        return next();
      }
    } catch (e) {}
  }

  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
