# Void Web Agency — Client Site Template

This repo is a template for garage cleaning / home service company websites.
When a new client session starts, Claude should read this file and follow the setup instructions.

## Stack
- Vanilla HTML/CSS/JS (single `index.html`, single `analytics.html`)
- Vercel (hosting + serverless functions)
- Supabase (analytics storage)
- Resend (weekly email digest)
- Chart.js via CDN
- Cal.com for booking embeds

---

## New Client Setup

When the user says something like "new client setup" or gives client details, do ALL of the following in one pass — no asking for confirmation between steps:

### 1. Collect these values upfront (ask in one message if not provided)
- Business name (e.g. "Mike's Garage Cleaning")
- City / service area
- Phone number
- Email address
- Cal.com booking link (their unique cal.com URL)
- Hourly rate or pricing
- Dashboard access key (short password, e.g. "mike2024")
- Supabase project URL + anon key + service key (if provided)
- Client's email for weekly digest (DIGEST_TO)

### 2. index.html — find and replace
- Business name: appears in `<title>`, hero heading, nav logo, footer, meta tags
- Phone number: appears in contact chips and mobile action sheet (`tel:` links)
- Email: appears in contact chips (`mailto:` links)
- Cal.com link: appears in the inline embed script (`calLink:`) and any fallback hrefs
- Pricing: find the pricing card values and update
- City/area: appears in hero subheading and any location references
- Supabase anon key + URL: in the analytics tracking script near the bottom of `<body>`

### 3. analytics.html — update CONFIG block (top of `<script>` tag)
```js
const CONFIG = {
  businessName: "CLIENT NAME HERE",
  dashKey:      "DASHBOARD KEY HERE",
};
```

### 4. api/weekly-digest.js — no changes needed (uses env vars)

### 5. api/analytics.js — no changes needed (uses env vars)

### 6. Print the Vercel env vars the user needs to set
After making all code changes, output this block for the user to copy into Vercel → Settings → Environment Variables:

```
SUPABASE_URL          = [client supabase url]
SUPABASE_SERVICE_KEY  = [client service key]
ANALYTICS_KEY         = [dashboard key, same as dashKey in CONFIG]
DIGEST_TO             = [client email]
SITE_URL              = [vercel project url, set after first deploy]
RESEND_API_KEY        = [already set on agency account - reuse]
```

### 7. Print the Supabase SQL to run in the client's new project
```sql
create table visits (
  id bigserial primary key,
  created_at timestamptz default now() not null,
  source text default 'direct',
  referrer text,
  utm_source text,
  utm_medium text,
  is_mobile boolean default false,
  session_id text
);
create table events (
  id bigserial primary key,
  created_at timestamptz default now() not null,
  event_name text not null,
  session_id text,
  label text
);
alter table visits enable row level security;
alter table events enable row level security;
create policy "public insert visits" on visits for insert to anon with check (true);
create policy "public insert events" on events for insert to anon with check (true);
```

### 8. Commit and push when done
Always `git add`, `git commit`, and `git push` after all changes are made.

---

## Rules
- Always deploy after every change (git push). Client checks the live site.
- Never change the overall design, layout, or color scheme — only content and config values.
- The analytics dashboard password (`dashKey`) must match `ANALYTICS_KEY` in Vercel env vars exactly.
- The secret 5-tap logo easter egg that opens the analytics dashboard is already wired up — don't touch it.
- Cal.com inline embed only loads on desktop (window.innerWidth > 600 guard) — keep it that way.
- The `onboarding@resend.dev` sender is fine for now. If client has a custom domain, update the `from` field in `api/weekly-digest.js`.

---

## Deployment checklist (print this for the user at end of setup)
- [ ] All content updated in index.html
- [ ] CONFIG block updated in analytics.html
- [ ] Code pushed to GitHub
- [ ] New Vercel project created from this repo
- [ ] 6 env vars added in Vercel
- [ ] Vercel deployed (check for errors in Functions tab)
- [ ] New Supabase project created + SQL run
- [ ] Test analytics endpoint: `[site-url]/api/analytics?key=[dashKey]&days=7`
- [ ] Test weekly digest: curl with `Authorization: Bearer [dashKey]` header
- [ ] Visit live site, trigger a page view, confirm row appears in Supabase `visits` table
- [ ] Secret 5-tap on logo opens analytics dashboard
