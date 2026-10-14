# Automatic numbers: Instagram → your dashboard (plan 3)

Every night at 03:20 Dubai, Supabase itself calls a small function (`meta-insights-sync`) that reads Instagram Insights through Meta's official API (the Instagram API with Facebook Login, part of the Meta Graph API) and writes the numbers into **kpis**, so they show on each client's dashboard. Nothing is published, posted or replied to. Read-only on Meta.

It works for every Instagram professional account linked to a Facebook Page in your Business Portfolio **and** whose handle is in **Table Editor → clients → instagram** (for example `@zkjsystem`). Other accounts are skipped.

Everything is already installed in the Supabase project (15 Oct 2026): the scheduler (pg_cron), the function, and a `sync_runs` log table. **One thing is missing: the Meta key.**

## You do this once (about 10 minutes, laptop)

### 1 · Permissions on the app "ZKJ SYSTEM Engine"
developers.facebook.com → your app → **Use cases** → "Instagram messaging and content" → **Customize** → make sure these are added:
`instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`.
The app can stay unpublished (development mode): it already works for accounts in your own Business Portfolio.

### 2 · A key that never expires (system user)
1. business.facebook.com → **Settings → Users → System users** → **Add**. Name `zkj-sync`, role Admin.
2. Open it → **Assign assets**: Apps → ZKJ SYSTEM Engine (full control); Pages → ZKJ SYSTEM (full control); Instagram accounts → @zkjsystem (full control).
3. **Generate new token** → app ZKJ SYSTEM Engine → expiry **Never** → tick the four permissions from step 1 → Generate → copy.
If the permissions list is empty, step 2 (Apps) was skipped.

### 3 · Put the key in Supabase
supabase.com/dashboard → your project → **Edge Functions** (left menu) → **Secrets** → **Add new secret**:
Name `META_ACCESS_TOKEN`, value = the key from step 2 → Save.
The key is stored by Supabase; it never goes through chat, the repo or GitHub.

### 4 · First run
Tell Claude "run the sync", or open this link in the browser after step 3:
`https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/meta-insights-sync?dry=1` (shows what it would write, writes nothing).
Then without `?dry=1` to write. Check **Table Editor → kpis**, and **sync_runs** for the log.
From then on it runs every night by itself. It refuses to run more than once every 10 minutes.

## What lands in kpis

| metric | meaning | when |
|---|---|---|
| `followers` | followers now | daily |
| `reach_day` · `views_day` · `accounts_engaged_day` · `interactions_day` | yesterday's account totals | daily |
| `reel_views` · `reel_reach` · `reel_avg_watch` · `reel_likes` · `reel_comments` · `reel_saves` · `reel_shares` | the latest reel | daily |

Same metric on the same day is updated, never duplicated. Numbers typed by hand with other metric names stay as they are.

## If something fails
`sync_runs.note` says why. Common causes: the key lost a permission or was deleted (make a new one, step 2), the Page or Instagram account is not assigned to the system user, or the account is not a professional account linked to the Page. Meta can delay insights by up to 48 hours.

## Also in this repo (optional, not needed)
`scripts/meta-insights-sync.mjs` + `.github/workflows/meta-insights-sync.yml` do the same job from GitHub Actions. Use only if you ever prefer GitHub; it needs two GitHub secrets.
