# CyberMagnet Admin Dashboard

## DEPLOYMENT — READ THIS FIRST

This is a **Cloudflare Pages** project. The error you saw happens when
the Pages dashboard has a build command set. Fix it in 2 minutes:

### Fix the build settings in the Cloudflare dashboard

Go to: Workers & Pages → cybermagnet-crm → Settings → Builds & Deployments

Set these **exact** values:

| Setting              | Value          |
|----------------------|----------------|
| Build command        | *(leave blank)*|
| Build output dir     | `/`            |
| Root directory       | *(leave blank)*|
| Node.js version      | *(leave blank)*|

Save, then **Retry deployment** on the latest deployment.

That's it. Cloudflare Pages detects the `functions/` folder automatically —
no build command is needed or wanted.

---

## What this project contains

```
index.html                    Admin dashboard (login + 4 tabs)
schema.sql                    D1 database schema (contacts + projects + orders)
wrangler.toml                 Pages config — database_id goes here
functions/
  _middleware.js              HTTP Basic Auth gate (reads CRM_USER / CRM_PASS env vars)
  api/contacts/               Original CRM API (unchanged)
  api/projects/               NEW — project tracking API
  api/orders/                 NEW — orders & sales API
```

## First-time database setup

Run this once to create the tables (your existing contacts data is safe):

```bash
npx wrangler d1 execute cybermagnet-crm --remote --file=./schema.sql
```

## Env vars (set in Pages → Settings → Environment variables)

| Variable   | Value                  |
|------------|------------------------|
| CRM_USER   | your chosen username   |
| CRM_PASS   | your chosen password   |

## D1 binding (set in Pages → Settings → Bindings)

| Variable name | Database             |
|---------------|----------------------|
| DB            | cybermagnet-crm      |

---

## Dashboard tabs

- **Dashboard** — KPI cards + live widgets (active projects, recent orders, hot leads, activity feed)
- **Projects** — Create, filter, and edit all client projects with status, priority, value, deadline
- **Orders & Sales** — Log services and products sold; track revenue by status
- **CRM Pipeline** — Full pipeline with CSV import/export, notes, call links, star ratings
