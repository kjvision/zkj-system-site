// Nightly Instagram insights → public.kpis.  Read-only on Meta; writes only kpis + sync_runs.
// Secrets (Supabase → Edge Functions → Secrets): META_ACCESS_TOKEN.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase automatically.
// Called by pg_cron at 03:20 Dubai, or by hand (POST). ?dry=1 prints without writing.
// No JWT: the function only reads our own insights and upserts our own numbers, and it
// refuses to run more than once per 10 minutes (see sync_runs), so there is nothing to abuse.
// v3 (16 Oct 2026): the token is trimmed (spaces, newlines, quotes, a "Bearer " prefix are removed)
// and every run logs a safe description of the token's shape (length and first 3 letters only, never the token).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const RAW_TOKEN = Deno.env.get('META_ACCESS_TOKEN') ?? '';
const TOKEN = RAW_TOKEN.trim().replace(/^["'`]+|["'`]+$/g, '').replace(/^Bearer\s+/i, '').trim();
const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const GRAPH = 'https://graph.facebook.com/' + (Deno.env.get('GRAPH_VERSION') ?? 'v26.0');
const TZ = 'Asia/Dubai';
const GUARD_MIN = 10;
const NS = '7b1a0f3e-4c2d-4e8a-9b6f-2d1c3e4f5a6b';

type Row = { id: string; client_id: string; period_start: string; metric: string; value: number; label: string; label_ar: string; updated_at: string };

// Safe to log: says what the secret looks like without revealing it.
function tokenShape() {
  if (!RAW_TOKEN) return 'token check: the secret is empty or missing';
  const cleaned = RAW_TOKEN !== TOKEN;
  const odd = /[^\x21-\x7e]/.test(TOKEN);
  const looks = /^EA[A-Z][A-Za-z0-9]{40,}$/.test(TOKEN); // Meta tokens start with EAA, EAB, EAC… depending on the app
  return `token check: saved length ${RAW_TOKEN.length}, starts with "${RAW_TOKEN.slice(0, 3)}", used length ${TOKEN.length}` +
    (cleaned ? ' (spaces, a newline, quotes or "Bearer" were around it and were removed)' : '') +
    (odd ? ', contains characters that are not part of a token' : '') +
    (looks ? ', shape looks like a Meta token' : ', shape does NOT look like a Meta token (they start with EA + a letter, e.g. EAA or EAB, and are 150-300 letters and digits)');
}

async function uuid5(name: string) {
  const ns = new Uint8Array(NS.replace(/-/g, '').match(/../g)!.map((h) => parseInt(h, 16)));
  const data = new Uint8Array([...ns, ...new TextEncoder().encode(name)]);
  const h = new Uint8Array(await crypto.subtle.digest('SHA-1', data));
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80;
  const x = Array.from(h.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
}
function dubaiDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
async function graph(path: string, params: Record<string, string | number> = {}) {
  const u = new URL(GRAPH + '/' + path.replace(/^\//, ''));
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  u.searchParams.set('access_token', TOKEN);
  const r = await fetch(u);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Graph ${path}: ${j.error?.message ?? r.status}` + (j.error?.code ? ` (code ${j.error.code}${j.error.error_subcode ? '/' + j.error.error_subcode : ''})` : ''));
  return j;
}
async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}
const num = (v: unknown) => (v == null || isNaN(Number(v)) ? null : Number(v));
function totals(insights: { data?: { name: string; total_value?: { value: unknown }; values?: { value: unknown }[] }[] }) {
  const out: Record<string, number | null> = {};
  for (const m of insights.data ?? []) {
    const v = m.total_value ? m.total_value.value : m.values?.length ? m.values[m.values.length - 1].value : null;
    out[m.name] = num(v);
  }
  return out;
}

async function run(dry: boolean) {
  const log: string[] = [];
  const say = (s: string) => log.push(s);
  if (!TOKEN) throw new Error('META_ACCESS_TOKEN secret is missing (Supabase → Edge Functions → Secrets).');
  say(tokenShape());
  const today = dubaiDate();
  const yesterday = dubaiDate(new Date(Date.now() - 86400000));
  const ySince = Math.floor(Date.parse(yesterday + 'T00:00:00+04:00') / 1000);
  const yUntil = Math.floor(Date.parse(yesterday + 'T23:59:59+04:00') / 1000);

  const pages = await graph('me/accounts', { fields: 'name,instagram_business_account{id,username,followers_count,media_count}', limit: 50 });
  const igs = (pages.data ?? []).filter((p: any) => p.instagram_business_account).map((p: any) => ({ page: p.name, ...p.instagram_business_account }));
  if (!igs.length) throw new Error('The token works, but no Facebook Page with a linked Instagram professional account is assigned to it. In Meta Business Settings → System users → Add assets, give the system user the Pages (and their Instagram accounts). Pages seen: ' + ((pages.data ?? []).map((p: any) => p.name).join(', ') || 'none'));
  say('Instagram accounts: ' + igs.map((a: any) => '@' + a.username).join(', '));

  const clients: { id: string; name: string; instagram: string | null }[] = await sb('clients?select=id,name,instagram&active=eq.true');
  const handle = (s: unknown) => String(s ?? '').replace(/^@/, '').trim().toLowerCase();
  const rows: Row[] = [];
  const kpi = async (client_id: string, period_start: string, metric: string, value: number | null, label: string, label_ar: string) => {
    if (value == null) return;
    rows.push({ id: await uuid5(`${client_id}|${metric}|${period_start}`), client_id, period_start, metric, value, label, label_ar, updated_at: new Date().toISOString() });
  };

  for (const acc of igs) {
    const client = clients.find((c) => handle(c.instagram) === handle(acc.username));
    if (!client) { say(`@${acc.username}: no client with this handle, skipped`); continue; }
    say(`@${acc.username} → ${client.name}`);
    await kpi(client.id, today, 'followers', num(acc.followers_count), 'Followers', 'المتابعون');
    try {
      const day = totals(await graph(`${acc.id}/insights`, { metric: 'reach,views,accounts_engaged,total_interactions', period: 'day', metric_type: 'total_value', since: ySince, until: yUntil }));
      await kpi(client.id, yesterday, 'reach_day', day.reach, 'Accounts reached (day)', 'حسابات وصلها المحتوى (اليوم)');
      await kpi(client.id, yesterday, 'views_day', day.views, 'Views (day)', 'المشاهدات (اليوم)');
      await kpi(client.id, yesterday, 'accounts_engaged_day', day.accounts_engaged, 'Accounts engaged (day)', 'حسابات تفاعلت (اليوم)');
      await kpi(client.id, yesterday, 'interactions_day', day.total_interactions, 'Interactions (day)', 'التفاعلات (اليوم)');
    } catch (e) { say('  account insights: ' + (e as Error).message); }
    try {
      const media = await graph(`${acc.id}/media`, { fields: 'id,media_type,media_product_type,timestamp,permalink', limit: 25 });
      const reel = (media.data ?? []).find((m: any) => m.media_product_type === 'REELS');
      if (reel) {
        const r = totals(await graph(`${reel.id}/insights`, { metric: 'reach,views,likes,comments,saved,shares,ig_reels_avg_watch_time' }));
        const when = reel.timestamp ? dubaiDate(new Date(reel.timestamp)) : '';
        const L = (en: string, ar: string): [string, string] => [`Latest reel · ${en}` + (when ? ` (${when})` : ''), `آخر ريل · ${ar}`];
        await kpi(client.id, today, 'reel_views', r.views, ...L('views', 'مشاهدات'));
        await kpi(client.id, today, 'reel_reach', r.reach, ...L('accounts reached', 'حسابات وصلها'));
        await kpi(client.id, today, 'reel_avg_watch', r.ig_reels_avg_watch_time == null ? null : Math.round(r.ig_reels_avg_watch_time / 1000), ...L('average watch time (s)', 'متوسط المشاهدة (ث)'));
        await kpi(client.id, today, 'reel_likes', r.likes, ...L('likes', 'إعجابات'));
        await kpi(client.id, today, 'reel_comments', r.comments, ...L('comments', 'تعليقات'));
        await kpi(client.id, today, 'reel_saves', r.saved, ...L('saves', 'حفظ'));
        await kpi(client.id, today, 'reel_shares', r.shares, ...L('shares', 'مشاركات'));
      } else say('  no reel in the last 25 media');
    } catch (e) { say('  reel insights: ' + (e as Error).message); }
  }
  for (const r of rows) say(`  ${r.period_start}  ${r.metric}  ${r.value}`);
  if (rows.length && !dry) {
    await sb('kpis?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
    say(`✓ ${rows.length} kpi rows written`);
  } else say(dry ? `DRY RUN: ${rows.length} rows, nothing written` : 'nothing to write');
  return log;
}

Deno.serve(async (req) => {
  const dry = new URL(req.url).searchParams.get('dry') === '1';
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body, null, 1), { status, headers: { 'Content-Type': 'application/json' } });
  // 10-minute guard
  try {
    const last = await sb(`sync_runs?select=started_at,status&job=eq.meta-insights-sync&order=started_at.desc&limit=1`);
    if (last?.[0] && Date.now() - Date.parse(last[0].started_at) < GUARD_MIN * 60000) {
      return json(429, { ok: false, skipped: true, note: `Ran less than ${GUARD_MIN} minutes ago. Try again later.` });
    }
  } catch (e) { return json(500, { ok: false, error: (e as Error).message }); }
  const started = await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ job: 'meta-insights-sync', note: dry ? 'dry run' : null }) });
  const runId = started?.[0]?.id;
  const finish = (status: string, note: string) => runId ? sb(`sync_runs?id=eq.${runId}`, { method: 'PATCH', body: JSON.stringify({ status, note: note.slice(0, 4000), finished_at: new Date().toISOString() }) }) : Promise.resolve(null);
  try {
    const log = await run(dry);
    await finish('ok', log.join('\n'));
    return json(200, { ok: true, dry, log });
  } catch (e) {
    const msg = (e as Error).message + (/access token|OAuth/i.test((e as Error).message) ? '\n' + tokenShape() : '');
    await finish('error', msg);
    return json(500, { ok: false, error: msg });
  }
});
