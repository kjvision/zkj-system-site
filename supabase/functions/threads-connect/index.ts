// Threads connect: links one Threads profile to one client so the publisher can post there (KJ, 18 Oct: Threads for all accounts).
// The token goes from Threads straight into public.threads_accounts (server-only table); it never passes through chat or the repo.
//   GET  ?client=<client name>&key=<app_settings.threads_connect_key>   → sends KJ to Threads to log in and allow
//   GET  ?code=…&state=…                                              → Threads comes back here; token saved, page says which profile
//   POST ?refresh=1                                                   → renews tokens that expire within 20 days (weekly cron)
// Secrets: THREADS_APP_ID, THREADS_APP_SECRET (Threads use case of KJ's Meta app). Redirect URI to register in the app: this function's URL.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const APP_ID = (Deno.env.get('THREADS_APP_ID') ?? '').trim();
const APP_SECRET = (Deno.env.get('THREADS_APP_SECRET') ?? '').trim();
const SELF = `${SB_URL}/functions/v1/threads-connect`;
const SCOPES = 'threads_basic,threads_content_publish,threads_manage_replies,threads_read_replies';

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
async function tj(url: string, init: RequestInit = {}) {
  const r = await fetch(url, init);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Threads: ${j.error?.message ?? j.error_message ?? r.status}`);
  return j;
}
const page = (title: string, line: string, ok = true) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>` +
  `<body style="font:17px/1.5 system-ui;background:#0c0b10;color:#eee;padding:32px"><h1 style="color:${ok ? '#c9a84c' : '#e66'}">${title}</h1><p>${line}</p></body>`,
  { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

Deno.serve(async (req) => {
  const u = new URL(req.url);
  try {
    if (!APP_ID || !APP_SECRET) return page('Threads app not set up yet', 'Add THREADS_APP_ID and THREADS_APP_SECRET to the Supabase secrets, then open the link again.', false);
    const settings: { key: string; value: string }[] = await sb('app_settings?select=key,value&key=eq.threads_connect_key');
    const key = settings[0]?.value ?? '';

    if (req.method === 'POST' && u.searchParams.get('refresh') === '1') {
      const soon = new Date(Date.now() + 20 * 86400e3).toISOString();
      const rows: { client_id: string; access_token: string }[] = await sb(`threads_accounts?select=client_id,access_token&expires_at=lt.${soon}`);
      let n = 0;
      for (const r of rows) {
        const j = await tj(`https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(r.access_token)}`).catch(() => null);
        if (!j?.access_token) continue;
        await sb(`threads_accounts?client_id=eq.${r.client_id}`, { method: 'PATCH', body: JSON.stringify({ access_token: j.access_token, expires_at: new Date(Date.now() + (j.expires_in ?? 5184000) * 1000).toISOString(), refreshed_at: new Date().toISOString() }) });
        n++;
      }
      return new Response(JSON.stringify({ ok: true, refreshed: n }), { headers: { 'Content-Type': 'application/json' } });
    }

    const code = u.searchParams.get('code');
    if (!code) {
      // start: which client, guarded by the connect key so nobody else can link a profile to KJ's accounts
      if (!key || u.searchParams.get('key') !== key) return page('Link not valid', 'Ask ZKJ SYSTEM HQ for a fresh connect link.', false);
      const name = u.searchParams.get('client') ?? '';
      const client = (await sb(`clients?select=id,name&name=eq.${encodeURIComponent(name)}`))?.[0];
      if (!client) return page('Unknown account', esc(name), false);
      const auth = new URL('https://threads.net/oauth/authorize');
      auth.search = new URLSearchParams({ client_id: APP_ID, redirect_uri: SELF, scope: SCOPES, response_type: 'code', state: `${client.id}.${key}` }).toString();
      return Response.redirect(auth.toString(), 302);
    }

    const [clientId, k] = (u.searchParams.get('state') ?? '').split('.');
    if (!key || k !== key) return page('Link not valid', 'Start again from the connect link.', false);
    const short = await tj('https://graph.threads.net/oauth/access_token', { method: 'POST', body: new URLSearchParams({ client_id: APP_ID, client_secret: APP_SECRET, grant_type: 'authorization_code', redirect_uri: SELF, code }) });
    const long = await tj(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${encodeURIComponent(APP_SECRET)}&access_token=${encodeURIComponent(short.access_token)}`);
    const me = await tj(`https://graph.threads.net/v1.0/me?fields=id,username&access_token=${encodeURIComponent(long.access_token)}`);
    const client = (await sb(`clients?select=id,name&id=eq.${clientId}`))?.[0];
    if (!client) return page('Unknown account', 'Start again from the connect link.', false);
    await sb('threads_accounts?on_conflict=client_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ client_id: client.id, threads_user_id: String(me.id), username: me.username ?? null, access_token: long.access_token, expires_at: new Date(Date.now() + (long.expires_in ?? 5184000) * 1000).toISOString(), connected_at: new Date().toISOString() }) });
    await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: client.id, audience: 'admin', title: `Threads connected: @${me.username} → ${client.name}`, title_ar: `تم ربط ثريدز: @${me.username} ← ${client.name}`, body: 'Approved posts now go to Threads too.', body_ar: 'المنشورات المعتمدة تُنشر على ثريدز أيضًا.' }) }).catch(() => null);
    return page('Connected', `Threads <b>@${esc(me.username ?? '')}</b> is now linked to <b>${esc(client.name)}</b>. Approved posts will go there too. You can close this page.`);
  } catch (e) {
    return page('Something went wrong', esc((e as Error).message), false);
  }
});
