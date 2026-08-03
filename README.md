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

---

## Adding it to your iPhone home screen

Open the deployed URL in **Safari** (must be Safari), tap Share → **Add to Home Screen**. It launches full-screen with the app's own "CM" icon and no browser bar.

## Back navigation

Since the home-screen version has no browser chrome:

- Every panel and "add new" modal (Add Business, CSV import, New Project, New Order) has a back arrow pinned in its header — no scrolling required to find Cancel.
- Escape (keyboard) or an edge-swipe-back gesture closes whichever panel/modal is currently open, instead of doing nothing or leaving the app.
- The top bar, panel headers, and modal headers now pad themselves with `env(safe-area-inset-top)` so nothing sits under the iPhone's notch/status bar — including the existing Sign Out button.

## New CRM fields

Contacts now also track:

- **Owner**, **Company hours**, **What they offer** — free text
- **Called?** — Not yet / Yes
- **Outcome** — No outcome yet / No / Not right now / Let's talk more / Yes

All five are editable in the Add Business form and the contact detail panel, and mappable during CSV import. CSV import tries to interpret common free-text values for Called/Outcome (e.g. `y`/`true`/`1` → Yes; "not interested" / "maybe" / "follow up later" → the closest matching outcome) rather than requiring an exact match — anything it can't confidently read is left blank.

**If your database is already live** (this one is), don't re-run `schema.sql` — it won't add columns to an existing table. Instead, either:

- Visit `/api/setup` in your browser (same endpoint used for first-time setup) — it now checks for these 5 columns and adds only the ones missing, safe to run as many times as you want, or
- Run `migration.sql` via CLI: `wrangler d1 execute cybermagnet-crm --remote --file=./migration.sql`
