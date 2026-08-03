# CyberMagnet CRM

A lightweight CRM for tracking local businesses through your pipeline — upload a CSV, add entries manually, leave notes, and call straight from the browser. Runs on Cloudflare Pages with a D1 database, so your data is shared live across every device (phone, laptop, whatever).

This is a **standalone project** — it does not share a repo, deploy, or domain with the CyberMagnet marketing website. Deploy it as its own Cloudflare Pages project (e.g. `crm.cybermagnet.net`) separate from the main site.

## What's in this repo

```
index.html                        the whole frontend (dark UI, table/cards, CSV import, notes)
manifest.json                     web app manifest (name, icons, standalone display mode)
icons/                             app icon set (16px favicon up through 1024px master)
functions/_middleware.js          password-gates the entire site
functions/api/contacts/index.js   GET (list) and POST (create / bulk import)
functions/api/contacts/[id].js    PATCH (update) and DELETE
functions/api/contacts/[id]/notes.js   POST (add a note)
schema.sql                        the database structure (fresh installs)
migration.sql                     run this instead if you already have a live database
wrangler.toml                     local dev config / D1 binding reference
```

## Fields tracked per business

Beyond the original company/category/phone/website/email/address/rating/status, the CRM also tracks:

- **Owner** — free text
- **Company hours** — free text
- **What they offer** — free text (services/products)
- **Called?** — Not yet / Yes
- **Outcome** — No outcome yet / No / Not right now / Let's talk more / Yes

All five are editable manually (Add Business form and the detail panel) and mappable during CSV import.

**If you already have a live database deployed**, run `migration.sql` once (not `schema.sql` again) to add these columns without touching your existing rows:

```
wrangler d1 execute cybermagnet-crm --remote --file=./migration.sql
```

**CSV mapping notes:** "Called?" and "Outcome" try to interpret common free-text values, not just exact matches — e.g. a called column with `y`/`yes`/`true`/`1` all map to "Yes"; an outcome column with things like `not interested`, `maybe`, `follow up later`, or `signed` will get matched to the closest of the four canonical outcomes. Anything it can't confidently match is left blank so you can fill it in by hand rather than silently guessing wrong.

## Adding it to your iPhone home screen

Once deployed and password-protected:

1. Open the CRM's URL in **Safari** on your iPhone (must be Safari — Chrome/other browsers on iOS can't do this).
2. Tap the **Share** icon (square with an arrow) in the toolbar.
3. Tap **Add to Home Screen**.
4. Confirm the name (defaults to "CM CRM") and tap **Add**.

It'll launch full-screen with your brand icon and no browser bar — same behavior as a native app. You'll still get the browser's basic-auth password prompt the first time you open it each session.

Note: iOS reads `apple-touch-icon` and the Apple-specific meta tags directly — it does **not** use the `manifest.json` icons the way Android does. Both are included here so it looks right on iPhone specifically (your stated use case) and would still work reasonably as an installable app on Android/desktop Chrome if that ever comes up.

## Today's Queue (daily swipe list)

A second tab next to Pipeline. Every time you open it, it hands you a fixed batch of businesses to work through, Tinder/Hinge-style — one card at a time:

- **New leads** — anything still sitting at "Lead" status, oldest first, since they haven't been reached yet.
- **Follow-ups** — "Contacted" and "Proposal Sent" businesses that have gone quiet past a set number of days (so you're nudged to check on people who are on the fence).
- **Client check-ins** — current clients you haven't touched base with in a while.
- Anything marked **Inactive** is excluded entirely.

Each card shows the business name, phone number, a **grade** (derived from the 0–5 rating you've already logged for it — A+ down to D), and a **suggested service** (a keyword-based guess from the category/name, e.g. a roofer gets "AI Receptionist + Website", a salon gets "Booking Funnel + AI Receptionist").

**Swipe or tap:**
- **Swipe left / ✕** — skip for now. No status change; it'll come back around next time the pool is rebuilt.
- **Swipe right / ✓** — logs a "reached out" note and, if it was a fresh lead, bumps it to "Contacted" automatically.
- **Call button** — dials the number directly (`tel:` link), doesn't consume the card, so you can call first and then swipe based on how it went.
- **Tap the card itself** (without dragging) — opens the full detail panel, same as the Pipeline tab, for anything that needs more than a swipe (changing status manually, deleting, editing details).

**The daily batch is fixed, not a live feed** — it's built once per day and cached, so it won't reshuffle or grow underneath you while you're working through it. If you finish early and want more, there's a "Get more" button in the empty state.

**Settings (gear icon, top-right of the tab)** let you change:
- How many businesses show up per day
- How many days to wait before a "Contacted" lead counts as due for follow-up
- Same for "Proposal Sent"
- How many days between client check-ins

These settings apply going forward — they won't retroactively change a batch you've already been given today.

One implementation note: this preference is stored in your browser (localStorage), not the shared D1 database, so it's per-device. If you use the CRM from your phone and your laptop, you'd set the daily count on each separately.

## Back navigation & signing out

Since the home-screen version runs full-screen with no browser bar, a few things were added to make it behave like a real app:

- **Back button everywhere.** The detail panel and both the "Add business" and "CSV import" modals now have a persistent back arrow in the header — pinned in place so you don't have to scroll a long form to find Cancel. Pressing Escape (on a keyboard) does the same.
- **Swipe-back support.** Opening any panel/modal pushes a browser history entry, so an edge-swipe-back gesture closes it instead of doing nothing or leaving the app.
- **Safe-area spacing.** The top bar, panel header, and modal header now pad themselves out with `env(safe-area-inset-top)`, so nothing sits underneath the iPhone's status bar/notch when running from the home screen.
- **Sign out button**, top-right of the header. Important caveat: this app uses HTTP Basic Auth (the native browser login prompt), not cookies — there's no real server-side "session" to end. The Sign Out button works by deliberately sending a bad credential, which overwrites what your browser cached and forces a re-prompt on the next request. This is a well-known best-effort trick, not a guarantee — browser behavior varies. If tapping it doesn't bring the login prompt back right away, fully close the app (swipe it away from the app switcher) and reopen it, or clear Website Data for the site in iOS Settings → Safari → Advanced.

## One-time setup

You'll need a free Cloudflare account and Node.js installed. `npx` (bundled with Node) is all you need — no separate install.

### 1. Push this folder to GitHub

Create a new repo (private is fine) and push these files to it.

### 2. Create the D1 database

From this folder, run:

```
npx wrangler d1 create cybermagnet-crm
```

This prints a `database_id`. Copy it into `wrangler.toml`, replacing `REPLACE_WITH_YOUR_DATABASE_ID`.

### 3. Load the schema into the database

```
npx wrangler d1 execute cybermagnet-crm --remote --file=./schema.sql
```

### 4. Connect the repo to Cloudflare Pages

In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git** → pick this repo.

- **Build command:** leave blank
- **Build output directory:** `/` (the repo root)

Deploy. It'll fail to reach the database until the next step — that's expected.

### 5. Bind the database to your Pages project

**Workers & Pages → your project → Settings → Bindings → Add → D1 database.**
Variable name: `DB`. Database: the `cybermagnet-crm` one you created. Save, then **redeploy** (Deployments tab → Retry/redeploy) so the binding takes effect.

### 6. Set a password

Anyone with the URL can currently reach the site once it's live, so lock it down:
**Settings → Environment variables** → add `CRM_USER` and `CRM_PASS` (any username/password you want) for the **Production** environment. Redeploy again.

Your browser will prompt for that username/password the first time you visit — it's built into the browser, no login page to maintain.

## Using it day to day

- **Upload CSV** — auto-detects your columns (Company, Phone, Website, etc.), lets you fix any mismatches, then imports.
- **Add Business** — manual entry.
- **Click any row** — edit any field inline, log a note, or tap Call to dial straight out.
- **Export** — downloads everything as a CSV any time you want a backup or want to hand data to another tool.

Every change writes straight to the shared database, so what you enter on your phone shows up on your computer within a second or two of refreshing.

## Local development (optional)

```
npx wrangler pages dev . --d1 DB=<your_database_id>
```

This runs the whole app locally, including the API, against a local copy of the database.

## Costs

Cloudflare's free tier covers this comfortably: Pages is free, and D1's free tier is 5GB storage / 5 million rows read per day, which is far more than a local-business pipeline will ever use.
