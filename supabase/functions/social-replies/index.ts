// Comment replies on YouTube: answers new top-level comments on each brand's latest videos with the reply KJ approved for that brand
// (public.reply_bank, approved_at set) — the same bank and the same rules as meta-replies (Instagram/Facebook), KJ 17 Oct 2026 "yes bank".
// Runs from pg_cron every 20 minutes, or by hand:  POST ?dry=1  (list what it would answer, posts nothing)
// Rules: only comments by other people, newer than app_settings.replies_lookback_hours (48 h); one reply per comment and at most one per
// person per video; never a reply to a reply; at most MAX_PER_RUN replies a run; pause switch app_settings.replies_paused (shared with Meta).
// A brand without an approved reply posts nothing: the comment is kept as "waiting" and KJ gets one bell note.
// Token: the brand's own YouTube connection (public.social_accounts, network youtube, scope youtube.force-ssl). Until Google's audit passes
// the API may refuse comment writes for an unverified app: those comments stay "waiting" and are retried every run, never failed.
// Quota: ~1 unit per list call; POSTS videos per brand per run → about 2,000 units a day for 3 brands, inside the 10,000 default.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const env = (k: string) => (Deno.env.get(k) ?? '').trim();
const YT = 'https://www.googleapis.com/youtube/v3';
const MAX_PER_RUN = 20;
const POSTS = 8;

type Account = { id: string; client_id: string; external_id: string; name: string | null; access_token: string; refresh_token: string | null; expires_at: string | null; status: string };
type Client = { id: string; name: string };
type Seen = { comment_id: string; media_id: string | null; from_name: string | null; status: string; note?: string | null };
type Found = { id: string; mediaId: string; permalink: string; from: string; text: string; at: string };
// Google refuses comment writes for an unverified app or a missing scope: keep those comments waiting, retry every run
const NO_PERMISSION = /insufficient|forbidden|permission|scope|403|unverified/i;
const retry = (s: Seen) => s.status === 'waiting' || (s.status === 'failed' && NO_PERMISSION.test(s.note ?? ''));

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
async function yt(method: 'GET' | 'POST', path: string, token: string, params: Record<string, string> = {}, body?: unknown) {
  const u = new URL(`${YT}/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`YouTube ${path}: ${j.error?.message ?? r.status} (${j.error?.errors?.[0]?.reason ?? r.status})`);
  return j;
}
// refresh the brand's token when it is about to expire (same as social-publisher)
async function fresh(acc: Account): Promise<string> {
  if (!acc.expires_at || Date.parse(acc.expires_at) - Date.now() > 120e3) return acc.access_token;
  if (!acc.refresh_token) throw new Error('YouTube token expired and cannot be renewed: reconnect from the portal.');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ refresh_token: acc.refresh_token, client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), grant_type: 'refresh_token' }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`Google refresh: ${j.error_description ?? j.error ?? r.status}`);
  await sb(`social_accounts?id=eq.${acc.id}`, { method: 'PATCH', body: JSON.stringify({ access_token: j.access_token, expires_at: new Date(Date.now() + (Number(j.expires_in) || 3600) * 1000).toISOString(), refreshed_at: new Date().toISOString(), status: 'ok', last_error: null }) });
  return j.access_token;
}

async function youtubeComments(acc: Account, token: string, since: number): Promise<Found[]> {
  const ch = await yt('GET', 'channels', token, { part: 'contentDetails', id: acc.external_id });
  const uploads = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return [];
  const list = await yt('GET', 'playlistItems', token, { part: 'contentDetails', playlistId: uploads, maxResults: String(POSTS) });
  const out: Found[] = [];
  for (const it of list.items ?? []) {
    const videoId = it.contentDetails?.videoId;
    if (!videoId) continue;
    let threads: any;
    try { threads = await yt('GET', 'commentThreads', token, { part: 'snippet,replies', videoId, order: 'time', maxResults: '50', textFormat: 'plainText' }); }
    catch (e) { if (/commentsDisabled|disabled/i.test((e as Error).message)) continue; throw e; }
    for (const t of threads.items ?? []) {
      const c = t.snippet?.topLevelComment?.snippet;
      if (!c) continue;
      if (c.authorChannelId?.value === acc.external_id) continue; // our own comment
      if (Date.parse(c.publishedAt) < since) continue;
      if ((t.replies?.comments ?? []).some((r: any) => r.snippet?.authorChannelId?.value === acc.external_id)) continue; // already answered by hand
      out.push({ id: t.snippet.topLevelComment.id, mediaId: videoId, permalink: `https://www.youtube.com/watch?v=${videoId}&lc=${t.snippet.topLevelComment.id}`, from: c.authorDisplayName ?? '', text: c.textDisplay ?? c.textOriginal ?? '', at: c.publishedAt });
    }
  }
  return out;
}

Deno.serve(async (req) => {
  const dry = new URL(req.url).searchParams.get('dry') === '1';
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body, null, 1), { status, headers: { 'Content-Type': 'application/json' } });
  const log: string[] = [];
  const say = (s: string) => log.push(s);
  let replied = 0, failed = 0;
  try {
    const settings: { key: string; value: string }[] = await sb('app_settings?select=key,value');
    const get = (k: string, d: string) => settings.find((s) => s.key === k)?.value ?? d;
    if (get('replies_paused', 'false') === 'true' && !dry) return json(200, { ok: true, paused: true });
    const since = Date.now() - (Number(get('replies_lookback_hours', '48')) || 48) * 3600e3;
    const clients: Client[] = await sb('clients?select=id,name&active=eq.true');
    const bank: { client_id: string; body: string }[] = await sb('reply_bank?select=client_id,body&active=eq.true&approved_at=not.is.null&order=created_at.asc');
    const accs: Account[] = await sb('social_accounts?select=id,client_id,external_id,name,access_token,refresh_token,expires_at,status&network=eq.youtube&status=neq.revoked');
    if (!accs.length) return json(200, { ok: true, dry, replied: 0, failed: 0, note: 'No YouTube channel connected yet.' });

    for (const c of clients) {
      const acc = accs.find((a) => a.client_id === c.id);
      if (!acc) continue;
      const text = bank.find((b) => b.client_id === c.id)?.body ?? null;
      let found: Found[] = [], token = '';
      try { token = await fresh(acc); found = await youtubeComments(acc, token, since); }
      catch (e) { const m = (e as Error).message; say(`${c.name} YouTube: ${m}`); if (!NO_PERMISSION.test(m)) failed++; continue; }
      if (!found.length) continue;
      const seen: Seen[] = await sb(`comment_replies?select=comment_id,media_id,from_name,status,note&comment_id=in.(${found.map((f) => `"${f.id}"`).join(',')})`);
      const done: Seen[] = await sb(`comment_replies?select=comment_id,media_id,from_name,status&status=eq.replied&media_id=in.(${[...new Set(found.map((f) => `"${f.mediaId}"`))].join(',')})`);
      let waiting = 0;
      for (const f of found.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
        const prev = seen.find((s) => s.comment_id === f.id);
        if (prev && !(retry(prev) && text)) continue;
        const row = { comment_id: f.id, client_id: c.id, platform: 'youtube', media_id: f.mediaId, permalink: f.permalink, from_name: f.from, comment: f.text.slice(0, 2000), comment_at: f.at };
        const again = done.some((d) => d.media_id === f.mediaId && f.from && d.from_name === f.from);
        if (dry) { say(`DRY ${c.name} YouTube ${f.from}: "${f.text.slice(0, 80)}" → ${again ? 'skip (already answered this person here)' : text ? 'reply' : 'waiting (no approved reply)'}`); continue; }
        if (again) { await sb('comment_replies', { method: 'POST', headers: { Prefer: 'return=minimal,resolution=ignore-duplicates' }, body: JSON.stringify({ ...row, status: 'skipped', note: 'Already answered this person on this video.' }) }).catch(() => null); continue; }
        if (!text) { if (prev) continue; await sb('comment_replies', { method: 'POST', headers: { Prefer: 'return=minimal,resolution=ignore-duplicates' }, body: JSON.stringify({ ...row, status: 'waiting', note: 'No approved reply for this account yet.' }) }).catch(() => null); waiting++; continue; }
        if (replied >= MAX_PER_RUN) { say('limit reached, the rest next run'); break; }
        const claimed = prev
          ? await sb(`comment_replies?comment_id=eq.${encodeURIComponent(f.id)}&status=eq.${prev.status}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'claimed', updated_at: new Date().toISOString() }) }).catch(() => null)
          : await sb('comment_replies', { method: 'POST', headers: { Prefer: 'return=representation,resolution=ignore-duplicates' }, body: JSON.stringify({ ...row, status: 'claimed' }) }).catch(() => null);
        if (!claimed?.length) continue;
        try {
          const r = await yt('POST', 'comments', token, { part: 'snippet' }, { snippet: { parentId: f.id, textOriginal: text } });
          await sb(`comment_replies?comment_id=eq.${encodeURIComponent(f.id)}`, { method: 'PATCH', body: JSON.stringify({ status: 'replied', reply_id: r.id, reply_text: text, updated_at: new Date().toISOString() }) });
          done.push({ comment_id: f.id, media_id: f.mediaId, from_name: f.from, status: 'replied' });
          replied++; say(`✓ ${c.name} YouTube ${f.from}`);
        } catch (e) {
          const msg = (e as Error).message, blocked = NO_PERMISSION.test(msg);
          await sb(`comment_replies?comment_id=eq.${encodeURIComponent(f.id)}`, { method: 'PATCH', body: JSON.stringify({ status: blocked ? 'waiting' : 'failed', note: (blocked ? 'Google: not allowed yet (audit / scope), retried every run. ' : '') + msg.slice(0, 900), updated_at: new Date().toISOString() }) }).catch(() => null);
          say(`✗ ${c.name} YouTube ${f.from}: ${msg}`);
          if (blocked) break;
          failed++;
        }
      }
      if (waiting) await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: c.id, audience: 'admin', title: `${waiting} new YouTube comment(s) on ${c.name}, no approved reply yet`, title_ar: `${waiting} تعليق جديد على يوتيوب ${c.name}، لا يوجد رد معتمد بعد`, body: 'Approve the reply for this account and they will be answered.', body_ar: 'اعتمد الرد لهذا الحساب وسيتم الرد عليها.' }) }).catch(() => null);
    }
    const status = failed ? 'error' : 'ok';
    if (!dry && (replied || failed)) await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'social-replies', status, finished_at: new Date().toISOString(), note: log.join('\n') }) }).catch(() => null);
    return json(200, { ok: !failed, dry, replied, failed, log });
  } catch (e) {
    const msg = (e as Error).message;
    await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'social-replies', status: 'error', finished_at: new Date().toISOString(), note: msg }) }).catch(() => null);
    return json(500, { ok: false, error: msg, log });
  }
});
