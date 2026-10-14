// Nightly Instagram insights → Supabase kpis.  Node 20+, no dependencies.
//
// What it does (read-only on Meta, writes only to public.kpis):
//   1. Lists the Facebook Pages the token can see and their linked Instagram accounts.
//   2. Matches each Instagram username to clients.instagram in Supabase.
//   3. For each matched client writes, as kpis rows (one row per metric per day):
//        followers · reach_day · views_day · accounts_engaged_day · interactions_day
//        and for the latest reel: reel_views · reel_reach · reel_avg_watch · reel_likes ·
//        reel_comments · reel_saves · reel_shares
//   Rows are upserted on a fixed id (uuid v5 of client|metric|date), so re-runs never duplicate.
//
// Secrets come ONLY from environment variables (GitHub Actions secrets). Never put them in the repo.
//   META_ACCESS_TOKEN          system-user or long-lived user token with instagram_basic,
//                              instagram_manage_insights, pages_show_list, pages_read_engagement
//   SUPABASE_SERVICE_ROLE_KEY  Supabase → Project Settings → API (server-side only)
//   SUPABASE_URL               optional, defaults to the ZKJ SYSTEM project
//   GRAPH_VERSION              optional, default v26.0
//   DRY_RUN=1                  print what would be written, write nothing
import { createHash } from 'node:crypto';

const TOKEN = process.env.META_ACCESS_TOKEN;
const SB_URL = (process.env.SUPABASE_URL || 'https://usucmdjupfjuchfxnxpz.supabase.co').replace(/\/$/, '');
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GRAPH = (process.env.GRAPH_BASE || 'https://graph.facebook.com') + '/' + (process.env.GRAPH_VERSION || 'v26.0');
const DRY = process.env.DRY_RUN === '1';
const TZ = 'Asia/Dubai';

if (!TOKEN) die('META_ACCESS_TOKEN is missing');
if (!SB_KEY && !DRY) die('SUPABASE_SERVICE_ROLE_KEY is missing');

function die(msg) { console.error('✗ ' + msg); process.exit(1); }
function log(...a) { console.log(...a); }

// uuid v5 (SHA-1) in a fixed namespace → stable row ids
const NS = '7b1a0f3e-4c2d-4e8a-9b6f-2d1c3e4f5a6b';
function uuid5(name) {
  const ns = Buffer.from(NS.replace(/-/g, ''), 'hex');
  const h = createHash('sha1').update(Buffer.concat([ns, Buffer.from(name, 'utf8')])).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
}

// Dates in Dubai time
function dubaiDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); // YYYY-MM-DD
}
const today = dubaiDate();
const yesterday = dubaiDate(new Date(Date.now() - 86400000));
// Unix range for "yesterday" in Dubai (UTC+4, no DST)
const ySince = Math.floor(Date.parse(yesterday + 'T00:00:00+04:00') / 1000);
const yUntil = Math.floor(Date.parse(yesterday + 'T23:59:59+04:00') / 1000);

async function graph(path, params = {}) {
  const u = new URL(GRAPH + '/' + path.replace(/^\//, ''));
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set('access_token', TOKEN);
  const r = await fetch(u);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Graph ${path}: ${(j.error && j.error.message) || r.status}`);
  return j;
}
async function sb(path, init = {}) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', ...(init.headers || {}) }
  });
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}
const num = (v) => (v == null || isNaN(Number(v)) ? null : Number(v));
function totals(insights) { // {metric: value} from an insights response (total_value or values[])
  const out = {};
  for (const m of insights.data || []) {
    const v = m.total_value ? m.total_value.value : (m.values && m.values.length ? m.values[m.values.length - 1].value : null);
    out[m.name] = num(v);
  }
  return out;
}

async function main() {
  // 1 · Instagram accounts reachable with this token
  const pages = await graph('me/accounts', { fields: 'name,instagram_business_account{id,username,followers_count,media_count}', limit: 50 });
  const igs = (pages.data || []).filter((p) => p.instagram_business_account).map((p) => ({ page: p.name, ...p.instagram_business_account }));
  if (!igs.length) die('No Instagram professional account is linked to a Page this token can see.');
  log('Instagram accounts:', igs.map((a) => '@' + a.username).join(', '));

  // 2 · Clients in Supabase
  let clients;
  if (process.env.CLIENTS_JSON) clients = JSON.parse(process.env.CLIENTS_JSON);
  else clients = await sb('clients?select=id,name,instagram&active=eq.true');
  const handle = (s) => String(s || '').replace(/^@/, '').trim().toLowerCase();
  const rows = [];
  const kpi = (client_id, period_start, metric, value, label, label_ar) => {
    if (value == null) return;
    rows.push({ id: uuid5(`${client_id}|${metric}|${period_start}`), client_id, period_start, metric, value, label, label_ar, updated_at: new Date().toISOString() });
  };

  for (const acc of igs) {
    const client = clients.find((c) => handle(c.instagram) === handle(acc.username));
    if (!client) { log(`· @${acc.username}: no client with this handle in Supabase, skipped`); continue; }
    log(`· @${acc.username} → ${client.name}`);

    // Lifetime snapshot
    kpi(client.id, today, 'followers', num(acc.followers_count), 'Followers', 'المتابعون');

    // Account metrics for yesterday (Dubai day)
    try {
      const day = totals(await graph(`${acc.id}/insights`, { metric: 'reach,views,accounts_engaged,total_interactions', period: 'day', metric_type: 'total_value', since: ySince, until: yUntil }));
      kpi(client.id, yesterday, 'reach_day', day.reach, 'Accounts reached (day)', 'حسابات وصلها المحتوى (اليوم)');
      kpi(client.id, yesterday, 'views_day', day.views, 'Views (day)', 'المشاهدات (اليوم)');
      kpi(client.id, yesterday, 'accounts_engaged_day', day.accounts_engaged, 'Accounts engaged (day)', 'حسابات تفاعلت (اليوم)');
      kpi(client.id, yesterday, 'interactions_day', day.total_interactions, 'Interactions (day)', 'التفاعلات (اليوم)');
    } catch (e) { log('  account insights:', e.message); }

    // Latest reel
    try {
      const media = await graph(`${acc.id}/media`, { fields: 'id,media_type,media_product_type,timestamp,permalink', limit: 25 });
      const reel = (media.data || []).find((m) => m.media_product_type === 'REELS');
      if (reel) {
        const r = totals(await graph(`${reel.id}/insights`, { metric: 'reach,views,likes,comments,saved,shares,ig_reels_avg_watch_time' }));
        const when = reel.timestamp ? dubaiDate(new Date(reel.timestamp)) : '';
        const L = (en, ar) => [`Latest reel · ${en}` + (when ? ` (${when})` : ''), `آخر ريل · ${ar}`];
        kpi(client.id, today, 'reel_views', r.views, ...L('views', 'مشاهدات'));
        kpi(client.id, today, 'reel_reach', r.reach, ...L('accounts reached', 'حسابات وصلها'));
        kpi(client.id, today, 'reel_avg_watch', r.ig_reels_avg_watch_time == null ? null : Math.round(r.ig_reels_avg_watch_time / 1000), ...L('average watch time (s)', 'متوسط المشاهدة (ث)'));
        kpi(client.id, today, 'reel_likes', r.likes, ...L('likes', 'إعجابات'));
        kpi(client.id, today, 'reel_comments', r.comments, ...L('comments', 'تعليقات'));
        kpi(client.id, today, 'reel_saves', r.saved, ...L('saves', 'حفظ'));
        kpi(client.id, today, 'reel_shares', r.shares, ...L('shares', 'مشاركات'));
      } else log('  no reel found in the last 25 media');
    } catch (e) { log('  reel insights:', e.message); }
  }

  if (!rows.length) { log('Nothing to write.'); return; }
  log(`${rows.length} kpi rows:`); for (const r of rows) log(`  ${r.period_start}  ${r.metric.padEnd(22)} ${r.value}`);
  if (DRY) { log('DRY_RUN: nothing written.'); return; }
  await sb('kpis?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
  log('✓ written to Supabase kpis');
}
main().catch((e) => die(e.message));
