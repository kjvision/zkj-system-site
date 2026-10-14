# Automatic numbers: Instagram → your dashboard (plan 3)

Every night at 03:20 Dubai, a small script reads Instagram Insights through Meta's official API and writes the numbers into **kpis**, so they show on each client's dashboard. Nothing is published, nothing is posted, nothing is replied to. Read-only on Meta.

It works for every Instagram professional account that is linked to a Facebook Page inside your Business Portfolio **and** has its handle in **Table Editor → clients → instagram** (for example `@zkjsystem`). Accounts with no matching client are skipped.

## You do this once (about 15 minutes, on a laptop)

### 1 · Permissions on the app "ZKJ SYSTEM Engine"
In developers.facebook.com → your app → **Use cases** → "Instagram messaging and content" → **Customize** → make sure these permissions are added:
`instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`.
The app can stay in development mode (unpublished): it already works for accounts in your own Business Portfolio. App review is only needed later for other people's accounts.

### 2 · A token that does not expire (system user)
1. business.facebook.com → **Settings** → **Users → System users** → **Add**. Name: `zkj-sync`, role: Admin.
2. Open the system user → **Assign assets** → add the ZKJ SYSTEM Facebook Page (and later every client Page) with **Full control**.
3. **Generate new token** → app: ZKJ SYSTEM Engine → expiry: **Never** → tick the four permissions from step 1 → Generate.
4. Copy the token. Treat it like a password: never paste it in chat, WhatsApp or the repo.

### 3 · Two secrets in GitHub
github.com/kjvision/zkj-system-site → **Settings → Secrets and variables → Actions → New repository secret**:
- `META_ACCESS_TOKEN` = the token from step 2
- `SUPABASE_SERVICE_ROLE_KEY` = Supabase → **Project Settings → API → service_role** (copy straight from Supabase to GitHub; nowhere else)

### 4 · First run
GitHub → **Actions → Meta insights sync → Run workflow**. Tick **Dry run** the first time: the log shows the accounts it found and the numbers it would write, and writes nothing. Run it again without dry run. Then check **Table Editor → kpis**.

From then on it runs every night by itself (once this is on the `main` branch).

## What lands in kpis

| metric | meaning | when |
|---|---|---|
| `followers` | followers now | daily |
| `reach_day` · `views_day` · `accounts_engaged_day` · `interactions_day` | yesterday's account totals | daily |
| `reel_views` · `reel_reach` · `reel_avg_watch` · `reel_likes` · `reel_comments` · `reel_saves` · `reel_shares` | the latest reel | daily |

Same metric on the same day is updated, never duplicated. Numbers you typed by hand with other metric names stay as they are.

## If something fails
The Actions log says why. Common causes: the token expired or lost a permission (make a new one, step 2), the Page is not assigned to the system user, or the Instagram account is not a professional account linked to the Page. Meta can delay insights by up to 48 hours, so a fresh reel may show fewer numbers at first.
