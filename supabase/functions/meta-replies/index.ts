// Comment replies: answers new comments on the latest Instagram and Facebook posts of each account with the reply KJ approved
// for that account (public.reply_bank, approved_at set). KJ, 17 Oct 2026: "yes bank"; rules 1 and 3 changed for this case.
// Runs from pg_cron every 10 minutes, or by hand:  POST ?dry=1  (list what it would answer, posts nothing)
// Rules: only comments from other people, newer than app_settings.replies_lookback_hours (48 h); one reply per comment and at most
// one per person per post; never a reply to a reply; at most MAX_PER_RUN replies a run; pause switch app_settings.replies_paused.
// An account without an approved reply posts nothing: the comment is kept as "waiting" and KJ gets one bell note.
// Meta permissions on the token: instagram_manage_comments (Instagram), pages_manage_engagement + pages_read_user_content (Facebook).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const RAW_TOKEN = Deno.env.get('META_ACCESS_TOKEN') ?? Deno.env.get('META_ACCESS_TOLEN') ?? '';
const TOKEN = RAW_TOKEN.trim().replace(/^["'`]+|["'`]+$/g, '').replace(/^Bearer\s+/i, '').trim();
const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const GRAPH = 'https://graph.facebook.com/' + (Deno.env.get('GRAPH_VERSION') ?? 'v26.0');
const MAX_PER_RUN = 20;
const POSTS = 12;

type Account = { igId: string | null; username: string | null; pageId: string; pageName: string; pageToken: string };
type Client = { id: string; name: string; instagram: string | null };
type Seen = { comment_id: string; media_id: string | null; from_name: string | null; status: string; note?: string | null };
// Meta refuses until the token carries the comment permissions: keep those comments waiting instead of failing them
const NO_PERMISSION = /permission|\(code 10\)|\(code 200\)/i;
const retry = (s: Seen) => s.status === 'waiting' || (s.status === 'failed' && NO_PERMISSION.test(s.note ?? ''));
type Found = { id: string; platform: 'instagram' | 'facebook'; mediaId: string; permalink: string | null; from: string; text: string; at: string; token: string };

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
async function graph(method: 'GET' | 'POST', path: string, params: Record<string, string | number | boolean> = {}, token = TOKEN) {
  const u = new URL(GRAPH + '/' + path.replace(/^\//, ''));
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) (method === 'GET' ? u.searchParams : body).set(k, String(v));
  (method === 'GET' ? u.searchParams : body).set('access_token', token);
  const r = await fetch(u, method === 'GET' ? {} : { method: 'POST', body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Meta ${path.split('?')[0]}: ${j.error?.message ?? r.status}` + (j.error?.code ? ` (code ${j.error.code})` : ''));
  return j;
}
const handle = (s: unknown) => String(s ?? '').replace(/^@/, '').trim().toLowerCase();

async function accounts(): Promise<Account[]> {
  const pages = await graph('GET', 'me/accounts', { fields: 'id,name,access_token,instagram_business_account{id,username}', limit: 50 });
  return (pages.data ?? []).map((p: any) => ({ igId: p.instagram_business_account?.id ?? null, username: p.instagram_business_account?.username ?? null, pageId: p.id, pageName: p.name, pageToken: p.access_token }));
}
function accountFor(c: Client, accs: Account[]) {
  const ig = handle(c.instagram);
  return accs.find((a) => a.username && handle(a.username) === ig) || accs.find((a) => a.pageName.toLowerCase() === c.name.toLowerCase()) || null;
}

async function instagramComments(acc: Account, since: number): Promise<Found[]> {
  if (!acc.igId) return [];
  const media = await graph('GET', `${acc.igId}/media`, { fields: 'id,permalink,timestamp,comments_count', limit: POSTS });
  const out: Found[] = [];
  for (const m of media.data ?? []) {
    if (!m.comments_count) continue;
    const cs = await graph('GET', `${m.id}/comments`, { fields: 'id,text,timestamp,username,from{id,username},replies{username,from{id}}', limit: 50 });
    const ours = (x: any) => x.from?.id === acc.igId || (!!x.username && handle(x.username) === handle(acc.username));
    for (const c of cs.data ?? []) {
      if (ours(c)) continue; // our own comment
      if (Date.parse(c.timestamp) < since) continue;
      if ((c.replies?.data ?? []).some(ours)) continue; // already answered by hand
      out.push({ id: c.id, platform: 'instagram', mediaId: m.id, permalink: m.permalink ?? null, from: c.username || c.from?.username || '', text: c.text ?? '', at: c.timestamp, token: TOKEN });
    }
  }
  return out;
}
async function facebookComments(acc: Account, since: number): Promise<Found[]> {
  const t = acc.pageToken;
  const posts = await graph('GET', `${acc.pageId}/posts`, { fields: 'id,permalink_url,created_time', limit: POSTS }, t);
  const out: Found[] = [];
  for (const p of posts.data ?? []) {
    const cs = await graph('GET', `${p.id}/comments`, { fields: 'id,message,created_time,from{id,name},comments{from{id}}', filter: 'toplevel', limit: 50 }, t);
    for (const c of cs.data ?? []) {
      if (c.from?.id === acc.pageId) continue; // the Page's own comment
      if (Date.parse(c.created_time) < since) continue;
      if ((c.comments?.data ?? []).some((r: any) => r.from?.id === acc.pageId)) continue; // already answered by hand
      out.push({ id: c.id, platform: 'facebook', mediaId: p.id, permalink: p.permalink_url ?? null, from: c.from?.name ?? '', text: c.message ?? '', at: c.created_time, token: t });
    }
  }
  return out;
}
async function reply(f: Found, text: string) {
  return f.platform === 'instagram' ? (await graph('POST', `${f.id}/replies`, { message: text }, f.token)).id : (await graph('POST', `${f.id}/comments`, { message: text }, f.token)).id;
}

Deno.serve(async (req) => {
  const dry = new URL(req.url).searchParams.get('dry') === '1';
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body, null, 1), { status, headers: { 'Content-Type': 'application/json' } });
  const log: string[] = [];
  const say = (s: string) => log.push(s);
  let replied = 0, failed = 0;
  try {
    if (!TOKEN) throw new Error('META_ACCESS_TOKEN secret is missing.');
    const settings: { key: string; value: string }[] = await sb('app_settings?select=key,value');
    const get = (k: string, d: string) => settings.find((s) => s.key === k)?.value ?? d;
    if (get('replies_paused', 'false') === 'true' && !dry) return json(200, { ok: true, paused: true });
    const since = Date.now() - (Number(get('replies_lookback_hours', '48')) || 48) * 3600e3;
    const clients: Client[] = await sb('clients?select=id,name,instagram&active=eq.true');
    const bank: { client_id: string; body: string }[] = await sb('reply_bank?select=client_id,body&active=eq.true&approved_at=not.is.null&order=created_at.asc');
    const accs = await accounts();

    for (const c of clients) {
      const acc = accountFor(c, accs);
      if (!acc) continue;
      const text = bank.find((b) => b.client_id === c.id)?.body ?? null;
      let found: Found[] = [];
      for (const [name, fn] of [['Instagram', instagramComments], ['Facebook', facebookComments]] as const) {
        try { found = found.concat(await fn(acc, since)); } catch (e) { const m = (e as Error).message; say(`${c.name} ${name}: ${m}`); if (!NO_PERMISSION.test(m)) failed++; }
      }
      if (!found.length) continue;
      const seen: Seen[] = await sb(`comment_replies?select=comment_id,media_id,from_name,status,note&comment_id=in.(${found.map((f) => `"${f.id}"`).join(',')})`);
      const done: Seen[] = await sb(`comment_replies?select=comment_id,media_id,from_name,status&status=eq.replied&media_id=in.(${[...new Set(found.map((f) => `"${f.mediaId}"`))].join(',')})`);
      let waiting = 0;
      for (const f of found.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
        const prev = seen.find((s) => s.comment_id === f.id);
        if (prev && !(retry(prev) && text)) continue; // a "waiting" comment is answered once its reply is approved and Meta allows it
        const row = { comment_id: f.id, client_id: c.id, platform: f.platform, media_id: f.mediaId, permalink: f.permalink, from_name: f.from, comment: f.text.slice(0, 2000), comment_at: f.at };
        const again = done.some((d) => d.media_id === f.mediaId && f.from && d.from_name === f.from);
        if (dry) { say(`DRY ${c.name} ${f.platform} @${f.from}: "${f.text.slice(0, 80)}" → ${again ? 'skip (already answered this person here)' : text ? 'reply' : 'waiting (no approved reply)'}`); continue; }
        if (again) { await sb('comment_replies', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ...row, status: 'skipped', note: 'Already answered this person on this post.' }) }).catch(() => null); continue; }
        if (!text) { if (prev) continue; await sb('comment_replies', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ...row, status: 'waiting', note: 'No approved reply for this account yet.' }) }).catch(() => null); waiting++; continue; }
        if (replied >= MAX_PER_RUN) { say('limit reached, the rest next run'); break; }
        // claim first (primary key), so two runs never answer the same comment
        const claimed = prev
          ? await sb(`comment_replies?comment_id=eq.${encodeURIComponent(f.id)}&status=eq.${prev.status}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'claimed', updated_at: new Date().toISOString() }) }).catch(() => null)
          : await sb('comment_replies', { method: 'POST', headers: { Prefer: 'return=representation,resolution=ignore-duplicates' }, body: JSON.stringify({ ...row, status: 'claimed' }) }).catch(() => null);
        if (!claimed?.length) continue;
        try {
          const id = await reply(f, text);
          await sb(`comment_replies?comment_id=eq.${encodeURIComponent(f.id)}`, { method: 'PATCH', body: JSON.stringify({ status: 'replied', reply_id: id, reply_text: text, updated_at: new Date().toISOString() }) });
          done.push({ comment_id: f.id, media_id: f.mediaId, from_name: f.from, status: 'replied' });
          replied++; say(`✓ ${c.name} ${f.platform} @${f.from}`);
        } catch (e) {
          const msg = (e as Error).message, blocked = NO_PERMISSION.test(msg);
          await sb(`comment_replies?comment_id=eq.${encodeURIComponent(f.id)}`, { method: 'PATCH', body: JSON.stringify({ status: blocked ? 'waiting' : 'failed', note: (blocked ? 'Meta: missing permission, retried every run. ' : '') + msg.slice(0, 900), updated_at: new Date().toISOString() }) }).catch(() => null);
          say(`✗ ${c.name} ${f.platform} @${f.from}: ${msg}`);
          if (blocked) break; // the same refusal for the rest of this account; next run tries again
          failed++;
        }
      }
      if (waiting) await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: c.id, audience: 'admin', title: `${waiting} new comment(s) on ${c.name}, no approved reply yet`, title_ar: `${waiting} تعليق جديد على ${c.name}، لا يوجد رد معتمد بعد`, body: 'Approve the reply for this account and they will be answered.', body_ar: 'اعتمد الرد لهذا الحساب وسيتم الرد عليها.' }) }).catch(() => null);
    }
    const status = failed ? 'error' : 'ok';
    if (!dry && (replied || failed)) await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'meta-replies', status, finished_at: new Date().toISOString(), note: log.join('\n') }) }).catch(() => null);
    return json(200, { ok: !failed, dry, replied, failed, log });
  } catch (e) {
    const msg = (e as Error).message;
    await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'meta-replies', status: 'error', finished_at: new Date().toISOString(), note: msg }) }).catch(() => null);
    return json(500, { ok: false, error: msg, log });
  }
});
