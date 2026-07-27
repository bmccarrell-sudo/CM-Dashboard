// Gates the entire admin dashboard behind HTTP Basic Auth.
// Set CRM_USER and CRM_PASS as environment variables in your Cloudflare
// Pages project: Settings → Environment variables → Production.
//
// Credentials:
//   CRM_USER = bmccarrell#1590
//   CRM_PASS = CMD#1590BFM
//
// If either variable is unset the site is left open — set both before going live.

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
