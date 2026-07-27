// CyberMagnet Admin — HTTP Basic Auth gate
// Set these in Cloudflare Pages: Settings → Environment variables → Production
//
//   CRM_USER = bmccarrell1590
//   CRM_PASS = CMD1590BFM

export async function onRequest({ request, env, next }) {
  const user = env.CRM_USER;
  const pass = env.CRM_PASS;

  if (!user || !pass) {
    return next();
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const decoded = atob(authHeader.slice(6));
      const sep = decoded.indexOf(':');
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (u === user && p === pass) {
        return next();
      }
    } catch (e) {
      // fall through to 401
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="CyberMagnet Admin"' },
  });
}
