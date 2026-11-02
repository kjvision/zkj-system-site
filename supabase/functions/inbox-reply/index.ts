// Inbox reply: KJ answers one comment by hand from the portal Inbox (KJ, 2 Nov 2026: "all comments and inbox can be replied from dashboard").
//   POST { comment_id, text }  with Authorization: Bearer <KJ's portal session>
// Only the owner (profiles.role = 'admin') may call it. The reply is posted under the comment on its own platform:
//   Instagram → POST /{comment_id}/replies (META_ACCESS_TOKEN) · Facebook → POST /{comment_id}/comments (the Page's token)
//   YouTube → comments.insert with parentId (the brand's own YouTube connection in public.social_accounts).
// The comment must already be in public.comment_replies (seen by meta-replies / social-replies). The automatic reply is never touched:
// the hand reply is stored in manual_reply_* (supabase/inbox-reply.sql). X, TikTok and Pinterest have no reply API for us: open them on the platform.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const env = (k: string) => (Deno.env.get(k) ?? '').trim();
const RAW_TOKEN = Deno.env.get('META_ACCESS_TOKEN') ?? Deno.env.get('META_ACCESS_TOLEN') ?? '';
const META = RAW_TOKEN.trim().replace(/^["'`]+|["'`]+$/g, '').replace(/^Bearer\s+/i, '').trim();
const SB_URL = env('SUPABASE_URL').replace(/\/$/, '');
const SB_KEY = env('SUPABASE_SERVICE_ROLE_KEY');
const GRAPH = 'https://graph.facebook.com/' + (env('GRAPH_VERSION') || 'v26.0');
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
async function graph(method: 'GET' | 'POST', path: string, params: Record<string, string | number> = {}, token = META) {
  const u = new URL(GRAPH + '/' + path.replace(/^\//, ''));
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) (method === 'GET' ? u.searchParams : body).set(k, String(v));
  (method === 'GET' ? u.searchParams : body).set('access_token', token);
  const r = await fetch(u, method === 'GET' ? {} : { method: 'POST', body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Meta: ${j.error?.message ?? r.status}` + (j.error?.code ? ` (code ${j.error.code})` : ''));
  return j;
}
const handle = (s: unknown) => String(s ?? '').replace(/^@/, '').trim().toLowerCase();

async function adminFromRequest(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  if (!/^Bearer /i.test(auth)) throw new Error('Sign in to the portal first.');
  const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: auth } });
  const u = await r.json().catch(() => ({}));
  if (!r.ok || !u.id) throw new Error('Session not valid: sign in again.');
  const p = (await sb(`profiles?select=role&id=eq.${u.id}`))?.[0];
  if (p?.role !== 'admin') throw new Error('Only the owner can reply from the portal.');
  return u.id as string;
}

async function pageToken(clientId: string) {
  const c = (await sb(`clients?select=id,name,instagram&id=eq.${clientId}`))?.[0];
  if (!c) throw new Error('Client not found.');
  const pages = await graph('GET', 'me/accounts', { fields: 'id,name,access_token,instagram_business_account{username}', limit: 50 });
  const ig = handle(c.instagram);
  const p = (pages.data ?? []).find((x: any) => ig && handle(x.instagram_business_account?.username) === ig) || (pages.data ?? []).find((x: any) => String(x.name).toLowerCase() === String(c.name).toLowerCase());
  if (!p) throw new Error(`No Facebook Page found for ${c.name}.`);
  return p.access_token as string;
}

async function youtubeToken(clientId: string) {
  const acc = (await sb(`social_accounts?select=id,access_token,refresh_token,expires_at&client_id=eq.${clientId}&network=eq.youtube&limit=1`))?.[0];
  if (!acc) throw new Error('This brand has no YouTube connection.');
  if (!acc.expires_at || Date.parse(acc.expires_at) - Date.now() > 120e3) return acc.access_token as string;
  if (!acc.refresh_token) throw new Error('YouTube token expired: reconnect YouTube from the portal.');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ refresh_token: acc.refresh_token, client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), grant_type: 'refresh_token' }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`Google refresh: ${j.error_description ?? j.error ?? r.status}`);
  await sb(`social_accounts?id=eq.${acc.id}`, { method: 'PATCH', body: JSON.stringify({ access_token: j.access_token, expires_at: new Date(Date.now() + (Number(j.expires_in) || 3600) * 1000).toISOString(), refreshed_at: new Date().toISOString() }) });
  return j.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only.' });
  let uid = '';
  try { uid = await adminFromRequest(req); } catch (e) { return json(401, { ok: false, error: (e as Error).message }); }
  try {
    const b = await req.json().catch(() => ({}));
    const id = String(b.comment_id ?? '').trim();
    const text = String(b.text ?? '').trim();
    if (!id) return json(400, { ok: false, error: 'Missing comment.' });
    if (!text) return json(400, { ok: false, error: 'Write a reply first.' });
    if (text.length > 2000) return json(400, { ok: false, error: 'Reply is too long (2,000 characters at most).' });
    const row = (await sb(`comment_replies?select=comment_id,client_id,platform,status&comment_id=eq.${encodeURIComponent(id)}`))?.[0];
    if (!row) return json(404, { ok: false, error: 'Comment not found.' });

    let replyId = '';
    if (row.platform === 'instagram') {
      if (!META) throw new Error('META_ACCESS_TOKEN secret is missing.');
      replyId = (await graph('POST', `${id}/replies`, { message: text })).id;
    } else if (row.platform === 'facebook') {
      if (!META) throw new Error('META_ACCESS_TOKEN secret is missing.');
      replyId = (await graph('POST', `${id}/comments`, { message: text }, await pageToken(row.client_id))).id;
    } else if (row.platform === 'youtube') {
      const tok = await youtubeToken(row.client_id);
      const r = await fetch('https://www.googleapis.com/youtube/v3/comments?part=snippet', { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ snippet: { parentId: id, textOriginal: text } }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.error) throw new Error(`YouTube: ${j.error?.message ?? r.status}`);
      replyId = j.id;
    } else {
      return json(400, { ok: false, error: `Replies on ${row.platform} are made on the platform itself.` });
    }

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { manual_reply_text: text, manual_reply_id: replyId, manual_reply_at: now, manual_reply_by: uid, updated_at: now };
    if (row.status !== 'replied') Object.assign(patch, { status: 'replied', reply_id: replyId, reply_text: text, note: 'Answered by hand from the portal.' });
    await sb(`comment_replies?comment_id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) });
    return json(200, { ok: true, reply_id: replyId, at: now });
  } catch (e) {
    return json(502, { ok: false, error: (e as Error).message });
  }
});
