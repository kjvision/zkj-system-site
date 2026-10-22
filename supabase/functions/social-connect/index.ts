// Social connect: links one YouTube channel / Pinterest account / LinkedIn Company Page to one client (brand) so the
// social-publisher can post there (KJ, 22 Oct 2026: one account per brand per network; LinkedIn = Company Pages only, never a personal profile).
// Tokens go from the network straight into public.social_accounts (server-only table); they never pass through chat or the repo.
//   GET  ?client=<client name>&network=youtube|pinterest|linkedin&key=<app_settings.social_connect_key>  → login + allow at the network
//   GET  ?code=…&state=<network>.<client id>.<key>   → the network comes back here; token saved; page says what was linked
//   GET  ?pick=<organization urn>&state=…            → LinkedIn only: KJ administers several Pages and picks the one for this brand
//   POST ?refresh=1                                  → renews tokens that expire within 7 days (daily cron)
// Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PINTEREST_CLIENT_ID, PINTEREST_CLIENT_SECRET, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET.
// Redirect URI to register in all three apps: this function's URL.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SELF = `${SB_URL}/functions/v1/social-connect`;
const env = (k: string) => (Deno.env.get(k) ?? '').trim();
type Net = 'youtube' | 'pinterest' | 'linkedin';
const NETS: Record<Net, { label: string; id: string; secret: string; auth: string; scope: string }> = {
  youtube: { label: 'YouTube', id: env('GOOGLE_CLIENT_ID'), secret: env('GOOGLE_CLIENT_SECRET'), auth: 'https://accounts.google.com/o/oauth2/v2/auth', scope: 'https://www.googleapis.com/auth/youtube' },
  pinterest: { label: 'Pinterest', id: env('PINTEREST_CLIENT_ID'), secret: env('PINTEREST_CLIENT_SECRET'), auth: 'https://www.pinterest.com/oauth/', scope: 'boards:read,boards:write,pins:read,pins:write,user_accounts:read' },
  linkedin: { label: 'LinkedIn', id: env('LINKEDIN_CLIENT_ID'), secret: env('LINKEDIN_CLIENT_SECRET'), auth: 'https://www.linkedin.com/oauth/v2/authorization', scope: 'openid profile w_organization_social r_organization_social rw_organization_admin' },
};

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
async function tj(label: string, url: string, init: RequestInit = {}) {
  const r = await fetch(url, init);
  const txt = await r.text();
  let j: any = {};
  try { j = txt ? JSON.parse(txt) : {}; } catch { j = { raw: txt }; }
  if (!r.ok || j.error) throw new Error(`${label}: ${j.error_description ?? j.error?.message ?? j.message ?? j.error ?? j.raw ?? r.status}`);
  return j;
}
async function setting(key: string) { return ((await sb(`app_settings?select=value&key=eq.${key}`))?.[0]?.value ?? '').trim(); }
const page = (title: string, line: string, ok = true) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>` +
  `<body style="font:17px/1.5 system-ui;background:#0c0b10;color:#eee;padding:32px;max-width:640px;margin:auto"><h1 style="color:${ok ? '#c9a84c' : '#e66'};font-size:24px">${title}</h1><p>${line}</p></body>`,
  { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
const esc = (s: string) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const basic = (id: string, secret: string) => 'Basic ' + btoa(`${id}:${secret}`);
const expiry = (sec: unknown, fallback: number) => new Date(Date.now() + (Number(sec) || fallback) * 1000).toISOString();

// ---- token exchange / refresh per network ----
async function exchange(net: Net, code: string) {
  const n = NETS[net];
  if (net === 'youtube') return tj('Google', 'https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ code, client_id: n.id, client_secret: n.secret, redirect_uri: SELF, grant_type: 'authorization_code' }) });
  if (net === 'pinterest') return tj('Pinterest', 'https://api.pinterest.com/v5/oauth/token', { method: 'POST', headers: { Authorization: basic(n.id, n.secret), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: SELF }) });
  return tj('LinkedIn', 'https://www.linkedin.com/oauth/v2/accessToken', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: SELF, client_id: n.id, client_secret: n.secret }) });
}
export async function refreshToken(net: Net, refresh: string) {
  const n = NETS[net];
  if (net === 'youtube') return tj('Google', 'https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ refresh_token: refresh, client_id: n.id, client_secret: n.secret, grant_type: 'refresh_token' }) });
  if (net === 'pinterest') return tj('Pinterest', 'https://api.pinterest.com/v5/oauth/token', { method: 'POST', headers: { Authorization: basic(n.id, n.secret), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh, scope: n.scope }) });
  return tj('LinkedIn', 'https://www.linkedin.com/oauth/v2/accessToken', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh, client_id: n.id, client_secret: n.secret }) });
}

// ---- who am I on each network (id, name, url) + network-specific extras ----
async function identity(net: Net, token: string, clientName: string) {
  const H = { Authorization: `Bearer ${token}` };
  if (net === 'youtube') {
    const j = await tj('YouTube', 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: H });
    const ch = j.items?.[0];
    if (!ch) throw new Error('This Google account has no YouTube channel yet. Create the channel first (YouTube → Create a channel), then connect again.');
    return { external_id: ch.id, name: ch.snippet?.title ?? '', url: `https://www.youtube.com/channel/${ch.id}`, extra: { custom_url: ch.snippet?.customUrl ?? null } };
  }
  if (net === 'pinterest') {
    const me = await tj('Pinterest', 'https://api.pinterest.com/v5/user_account', { headers: H });
    const boards = await tj('Pinterest', 'https://api.pinterest.com/v5/boards?page_size=50', { headers: H });
    let board = (boards.items ?? []).find((b: any) => String(b.name).toLowerCase() === clientName.toLowerCase()) ?? (boards.items ?? [])[0];
    if (!board) board = await tj('Pinterest', 'https://api.pinterest.com/v5/boards', { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: clientName, privacy: 'PUBLIC' }) });
    return { external_id: String(me.id ?? me.username), name: '@' + me.username, url: `https://www.pinterest.com/${me.username}/`, extra: { board_id: board.id, board_name: board.name, account_type: me.account_type ?? null } };
  }
  const V = await setting('linkedin_version') || '202509';
  const LH = { ...H, 'LinkedIn-Version': V, 'X-Restli-Protocol-Version': '2.0.0' };
  const acls = await tj('LinkedIn', 'https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED', { headers: LH });
  const urns: string[] = (acls.elements ?? []).map((e: any) => e.organization).filter(Boolean);
  if (!urns.length) throw new Error('This LinkedIn login administers no Company Page. Only Company Pages are connected (never a personal profile): make this login an admin of the brand’s Page first, then connect again.');
  const orgs: { urn: string; name: string; vanity: string }[] = [];
  for (const urn of urns.slice(0, 20)) {
    const id = urn.split(':').pop();
    const o = await tj('LinkedIn', `https://api.linkedin.com/rest/organizations/${id}`, { headers: LH }).catch(() => null);
    orgs.push({ urn, name: o?.localizedName ?? urn, vanity: o?.vanityName ?? '' });
  }
  const pick = orgs.find((o) => o.name.toLowerCase().replace(/\s+/g, '') === clientName.toLowerCase().replace(/\s+/g, '')) ?? orgs.find((o) => o.name.toLowerCase().includes(clientName.toLowerCase())) ?? orgs[0];
  return { external_id: pick.urn, name: pick.name, url: pick.vanity ? `https://www.linkedin.com/company/${pick.vanity}/` : '', extra: { orgs } };
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  try {
    // daily renewal of tokens that expire soon
    if (req.method === 'POST' && u.searchParams.get('refresh') === '1') {
      const soon = new Date(Date.now() + 7 * 86400e3).toISOString();
      const rows: { id: string; network: Net; refresh_token: string | null; client_id: string }[] = await sb(`social_accounts?select=id,network,refresh_token,client_id&expires_at=lt.${soon}&status=neq.revoked`);
      const out: Record<string, string> = {};
      for (const r of rows) {
        if (!r.refresh_token) { await sb(`social_accounts?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'expired', last_error: 'No refresh token: reconnect from the portal.' }) }); out[r.id] = 'expired'; continue; }
        try {
          const j = await refreshToken(r.network, r.refresh_token);
          const patch: Record<string, unknown> = { access_token: j.access_token, expires_at: expiry(j.expires_in, 3600), refreshed_at: new Date().toISOString(), status: 'ok', last_error: null };
          if (j.refresh_token) patch.refresh_token = j.refresh_token;
          await sb(`social_accounts?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
          out[r.id] = 'ok';
        } catch (e) {
          await sb(`social_accounts?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'expired', last_error: (e as Error).message.slice(0, 500) }) });
          out[r.id] = 'failed';
        }
      }
      return new Response(JSON.stringify({ ok: true, checked: rows.length, result: out }), { headers: { 'Content-Type': 'application/json' } });
    }

    const key = await setting('social_connect_key');
    const code = u.searchParams.get('code');
    const state = u.searchParams.get('state') ?? '';
    const pick = u.searchParams.get('pick');

    if (!code && !pick) {
      // start: which client + which network, guarded by the connect key so nobody else can link a profile to KJ's brands
      if (!key || u.searchParams.get('key') !== key) return page('Link not valid', 'Open Connect from the ZKJ SYSTEM portal (HQ → Control Center).', false);
      const net = u.searchParams.get('network') as Net;
      const n = NETS[net];
      if (!n) return page('Unknown network', esc(String(net)), false);
      if (!n.id || !n.secret) return page(`${n.label} app not set up yet`, `Add the ${n.label} client id and secret to the Supabase secrets (see supabase/functions/social-connect), then tap Connect again.`, false);
      const name = u.searchParams.get('client') ?? '';
      const client = (await sb(`clients?select=id,name&name=eq.${encodeURIComponent(name)}`))?.[0];
      if (!client) return page('Unknown brand', esc(name), false);
      const auth = new URL(n.auth);
      const p: Record<string, string> = { client_id: n.id, redirect_uri: SELF, response_type: 'code', scope: n.scope, state: `${net}.${client.id}.${key}` };
      if (net === 'youtube') Object.assign(p, { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' });
      auth.search = new URLSearchParams(p).toString();
      return Response.redirect(auth.toString(), 302);
    }

    const [net, clientId, k] = state.split('.') as [Net, string, string];
    const n = NETS[net];
    if (!key || k !== key || !n) return page('Link not valid', 'Start again from Connect in the portal.', false);
    const client = (await sb(`clients?select=id,name&id=eq.${clientId}`))?.[0];
    if (!client) return page('Unknown brand', 'Start again from Connect in the portal.', false);

    if (pick) {
      // LinkedIn: KJ chose one of several Pages
      const row = (await sb(`social_accounts?select=id,extra&client_id=eq.${client.id}&network=eq.linkedin`))?.[0];
      const org = (row?.extra?.orgs ?? []).find((o: any) => o.urn === pick);
      if (!row || !org) return page('Page not found', 'Start again from Connect in the portal.', false);
      await sb(`social_accounts?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ external_id: org.urn, name: org.name, url: org.vanity ? `https://www.linkedin.com/company/${org.vanity}/` : '' }) });
      return page('Connected', `LinkedIn Page <b>${esc(org.name)}</b> is now linked to <b>${esc(client.name)}</b>. You can close this page.`);
    }

    const err = u.searchParams.get('error');
    if (err) return page(`${n.label} said no`, esc(u.searchParams.get('error_description') ?? err) + (net === 'linkedin' && /scope/i.test(err) ? '<br><br>The LinkedIn app has no Community Management access yet: the request is reviewed by LinkedIn first. Until then Page posts are prepared as packs in the portal.' : ''), false);
    const tok = await exchange(net, code!);
    const me = await identity(net, tok.access_token, client.name);
    await sb('social_accounts?on_conflict=client_id,network', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({
      client_id: client.id, network: net, external_id: me.external_id, name: me.name, url: me.url, access_token: tok.access_token, refresh_token: tok.refresh_token ?? null,
      expires_at: expiry(tok.expires_in, 3600), scope: tok.scope ?? n.scope, extra: me.extra, status: 'ok', last_error: null, connected_at: new Date().toISOString(), refreshed_at: null }) });
    await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: client.id, audience: 'admin', title: `${n.label} connected: ${me.name} → ${client.name}`, title_ar: `تم ربط ${n.label}: ${me.name} ← ${client.name}` }) });
    let more = '';
    if (net === 'linkedin' && (me.extra as any).orgs?.length > 1) {
      more = '<br><br>You administer several Pages. This brand is linked to <b>' + esc(me.name) + '</b>; tap another to change:<br>' +
        (me.extra as any).orgs.map((o: any) => `<a style="color:#c9a84c" href="${SELF}?pick=${encodeURIComponent(o.urn)}&state=${encodeURIComponent(state)}">${esc(o.name)}</a>`).join(' · ');
    }
    if (net === 'pinterest') more = `<br><br>Pins go to the board <b>${esc((me.extra as any).board_name)}</b>. While the Pinterest app is on Trial access, pins are visible only in this account, not to the public.`;
    if (net === 'youtube') more = '<br><br>Until Google’s audit passes, uploads land as <b>private</b> and you make them public with one tap in the portal.';
    return page('Connected', `${n.label} <b>${esc(me.name)}</b> is now linked to <b>${esc(client.name)}</b>. Approved items for ${n.label} will go there.${more}<br><br>You can close this page.`);
  } catch (e) {
    return page('Something went wrong', esc((e as Error).message), false);
  }
});
