# CyberMagnet Admin Dashboard

A full admin portal running on Cloudflare Pages + D1. Includes:

- **Login screen** — client-side login that authenticates against the existing HTTP Basic middleware
- **Dashboard** — KPI cards (active projects, revenue, pipeline contacts), live widgets for projects/orders/leads/activity
- **Projects** — create, track, and update all active client projects with status, priority, value, deadline, and notes
- **Orders & Sales** — log every service and product sold, track revenue by status, preloaded with all CyberMagnet services and products
- **CRM Pipeline** — full CRM with CSV import/export, notes, call links, star ratings, and status pipeline

## Setup (extends the existing cybermagnet-crm setup)

### 1. Run the new schema migrations

```bash
npx wrangler d1 execute cybermagnet-crm --remote --file=./schema.sql
```

This adds the `projects` and `orders` tables to your existing D1 database without touching your contacts data.

### 2. Add the new API routes to Cloudflare

The `functions/api/projects/` and `functions/api/orders/` folders are new. Push this folder to your existing GitHub repo and Cloudflare Pages will auto-deploy.

### 3. Existing environment variables still apply

- `CRM_USER` and `CRM_PASS` — still gate the entire site (now gating the admin dashboard)

### 4. Replace `index.html`

This `index.html` replaces the original CRM's `index.html`. All CRM functionality is preserved inside the CRM tab.

## Directory structure

```
index.html                             main admin dashboard (replaces original)
schema.sql                             updated schema (adds projects + orders)
functions/
  _middleware.js                       HTTP Basic Auth (unchanged)
  api/
    contacts/                          original CRM API (unchanged)
      index.js
      [id].js
      [id]/notes.js
    projects/                          NEW — project management API
      index.js
      [id].js
    orders/                            NEW — orders/sales API
      index.js
      [id].js
```
