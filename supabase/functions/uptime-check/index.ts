// Website watcher (KJ 6 Nov 2026: emergencies 24/7). Every 10 minutes from pg_cron: opens the store, the site and the dashboard.
// Two failed checks in a row for the same address → one emergency alert (raise_emergency de-duplicates for 6 hours).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SITES: [string, string][] = [
  ['Store zkjverse.com', 'https://zkjverse.com/'],
  ['Website system.zkjverse.com', 'https://system.zkjverse.com/'],
  ['Dashboard sign-in', 'https://system.zkjverse.com/app/login.html'],
];
async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(`${path.split('?')[0]}: ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
Deno.serve(async () => {
  const rows = await sb('app_settings?select=value&key=eq.uptime_state');
  const state: Record<string, number> = rows?.[0] ? JSON.parse(rows[0].value) : {};
  const out: Record<string, string> = {};
  for (const [name, url] of SITES) {
    let ok = false, why = '';
    try {
      const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'ZKJ-uptime-check' } });
      ok = r.status < 500; why = 'HTTP ' + r.status;
    } catch (e) { why = (e as Error).message.slice(0, 120); }
    state[url] = ok ? 0 : (state[url] ?? 0) + 1;
    out[name] = ok ? 'ok' : why;
    if (state[url] >= 2) await sb('rpc/raise_emergency', { method: 'POST', body: JSON.stringify({ p_title: name + ' is down', p_body: url + ' did not open twice in a row (' + why + '). Checked every 10 minutes.' }) }).catch(() => null);
  }
  await sb('app_settings?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ key: 'uptime_state', value: JSON.stringify(state), updated_at: new Date().toISOString() }) });
  return new Response(JSON.stringify({ ok: true, checks: out }), { headers: { 'Content-Type': 'application/json' } });
});
