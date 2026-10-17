// Publisher: posts APPROVED items at their scheduled time through Meta's official publishing API.
// Instagram (professional account): image, carousel, story (image or mp4), reel (mp4). Facebook Page: photo, carousel, photo story, reel (mp4).
// Runs from pg_cron every 5 minutes, or by hand:  POST ?dry=1  (plan only)  ·  POST ?item=<uuid>  (one item now)  ·  &force=1 (ignore the time window)
// Secrets: META_ACCESS_TOKEN (system-user token with instagram_basic, instagram_content_publish, pages_show_list,
// pages_read_engagement, pages_manage_posts). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.
// Rules: only status = approved; only at or after scheduled_at; never older than the window (app_settings.publisher_window_hours,
// default 36 h); at most 3 attempts per item; a pause switch in app_settings.publisher_paused. Nothing else is ever posted.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// The secret may have been saved under a misspelled name once (META_ACCESS_TOLEN); both names are accepted.
const RAW_TOKEN = Deno.env.get('META_ACCESS_TOKEN') ?? Deno.env.get('META_ACCESS_TOLEN') ?? '';
const TOKEN = RAW_TOKEN.trim().replace(/^["'`]+|["'`]+$/g, '').replace(/^Bearer\s+/i, '').trim();
const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const GRAPH_VERSION = Deno.env.get('GRAPH_VERSION') ?? 'v26.0';
const GRAPH = 'https://graph.facebook.com/' + GRAPH_VERSION;
const MAX_ATTEMPTS = 3;
const LOCK_MIN = 15;

type Item = { id: string; client_id: string; kind: string; platform: string | null; title: string; caption: string | null; caption_ar: string | null; media_url: string | null; scheduled_at: string | null; status: string; publish_attempts: number; clients: { id: string; name: string; instagram: string | null; active: boolean } };
type Account = { igId: string | null; username: string | null; pageId: string; pageName: string; pageToken: string };

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
  if (!r.ok || j.error) throw new Error(`Meta ${path}: ${j.error?.message ?? r.status}` + (j.error?.code ? ` (code ${j.error.code}${j.error.error_subcode ? '/' + j.error.error_subcode : ''})` : ''));
  return j;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const handle = (s: unknown) => String(s ?? '').replace(/^@/, '').trim().toLowerCase();

function captionOf(x: Item) {
  if (x.kind === 'story') return '';
  const en = (x.caption ?? '').trim(), ar = (x.caption_ar ?? '').trim();
  const both = en && ar && en !== ar ? en + '\n\n' + ar : (en || ar);
  return both.slice(0, 2200);
}
// Meta accepts JPEG (and MP4 for video). Our site keeps .webp; a .jpg twin must exist next to it.
async function mediaOf(x: Item) {
  const list = String(x.media_url ?? '').split(/[\s,]+/).filter((u) => /^https:\/\//i.test(u));
  const out: { url: string; video: boolean }[] = [];
  for (const u of list) {
    if (/\.(mp4|mov)(\?.*)?$/i.test(u)) { out.push({ url: u, video: true }); continue; }
    const jpg = u.replace(/\.(webp|png)(\?.*)?$/i, '.jpg');
    const h = await fetch(jpg, { method: 'HEAD' }).catch(() => null);
    if (!h || !h.ok || !/image\/jpe?g/i.test(h.headers.get('content-type') ?? '')) throw new Error(`No JPEG version reachable for ${u} (tried ${jpg}). Meta accepts JPEG only.`);
    out.push({ url: jpg, video: false });
  }
  return out;
}
async function accounts(): Promise<Account[]> {
  const pages = await graph('GET', 'me/accounts', { fields: 'id,name,access_token,instagram_business_account{id,username}', limit: 50 });
  return (pages.data ?? []).map((p: any) => ({ igId: p.instagram_business_account?.id ?? null, username: p.instagram_business_account?.username ?? null, pageId: p.id, pageName: p.name, pageToken: p.access_token }));
}
function accountFor(x: Item, accs: Account[]) {
  const ig = handle(x.clients.instagram);
  return accs.find((a) => a.username && handle(a.username) === ig) || accs.find((a) => a.pageName.toLowerCase() === x.clients.name.toLowerCase()) || null;
}
async function waitContainer(id: string) {
  for (let i = 0; i < 20; i++) {
    const s = await graph('GET', id, { fields: 'status_code,status' });
    if (s.status_code === 'FINISHED') return;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`Meta container ${s.status_code}: ${s.status ?? ''}`);
    await sleep(3000);
  }
  throw new Error('Meta container still processing after 60 s; will retry next run.');
}

async function publishInstagram(x: Item, acc: Account, media: { url: string; video: boolean }[]) {
  if (!acc.igId) throw new Error(`No Instagram professional account is linked to the Page "${acc.pageName}".`);
  const ig = acc.igId, caption = captionOf(x);
  let creation: string;
  if (x.kind === 'story') {
    if (media.length !== 1) throw new Error('A story needs exactly one image or video.');
    creation = (await graph('POST', `${ig}/media`, media[0].video ? { media_type: 'STORIES', video_url: media[0].url } : { media_type: 'STORIES', image_url: media[0].url })).id;
  } else if (x.kind === 'reel') {
    if (media.length !== 1 || !media[0].video) throw new Error('A reel needs one MP4 video link in the media field.');
    creation = (await graph('POST', `${ig}/media`, { media_type: 'REELS', video_url: media[0].url, caption, share_to_feed: true })).id;
  } else if (media.length > 1) {
    const children: string[] = [];
    for (const m of media.slice(0, 10)) children.push((await graph('POST', `${ig}/media`, { image_url: m.url, is_carousel_item: true })).id);
    for (const c of children) await waitContainer(c);
    creation = (await graph('POST', `${ig}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption })).id;
  } else {
    if (!media.length) throw new Error('No image link on this item.');
    creation = (await graph('POST', `${ig}/media`, { image_url: media[0].url, caption })).id;
  }
  await waitContainer(creation);
  const pub = await graph('POST', `${ig}/media_publish`, { creation_id: creation });
  const info = await graph('GET', pub.id, { fields: 'permalink' }).catch(() => ({}));
  return info.permalink ?? `https://www.instagram.com/${acc.username ?? ''}/`;
}
// Facebook Reels API: start an upload, let Meta fetch the mp4 from its public link, then publish with the caption.
async function facebookReel(x: Item, acc: Account, media: { url: string; video: boolean }[]) {
  if (media.length !== 1 || !media[0].video) throw new Error('A reel needs one MP4 video link in the media field.');
  const t = acc.pageToken, page = acc.pageId;
  const start = await graph('POST', `${page}/video_reels`, { upload_phase: 'start' }, t);
  const up = await fetch(`https://rupload.facebook.com/video-upload/${GRAPH_VERSION}/${start.video_id}`, { method: 'POST', headers: { Authorization: `OAuth ${t}`, file_url: media[0].url } });
  const uj = await up.json().catch(() => ({}));
  if (!up.ok || !uj.success) throw new Error(`Facebook reel upload: ${uj.debug_info?.message ?? uj.error?.message ?? up.status}`);
  await graph('POST', `${page}/video_reels`, { upload_phase: 'finish', video_id: start.video_id, video_state: 'PUBLISHED', description: captionOf(x) }, t);
  const info = await graph('GET', start.video_id, { fields: 'permalink_url' }, t).catch(() => ({}));
  const link = String(info.permalink_url ?? '');
  return link ? (link.startsWith('http') ? link : 'https://www.facebook.com' + link) : `https://www.facebook.com/reel/${start.video_id}`;
}
async function publishFacebook(x: Item, acc: Account, media: { url: string; video: boolean }[]) {
  const t = acc.pageToken, page = acc.pageId, message = captionOf(x);
  if (x.kind === 'reel') return await facebookReel(x, acc, media);
  if (!media.length || media.some((m) => m.video)) throw new Error('Facebook publishing here supports images only (one or several).');
  if (x.kind === 'story') {
    const ph = await graph('POST', `${page}/photos`, { url: media[0].url, published: false }, t);
    await graph('POST', `${page}/photo_stories`, { photo_id: ph.id }, t);
    return `https://www.facebook.com/${page}`;
  }
  if (media.length === 1) {
    const ph = await graph('POST', `${page}/photos`, { url: media[0].url, message }, t);
    const postId = ph.post_id ?? ph.id;
    const info = await graph('GET', postId, { fields: 'permalink_url' }, t).catch(() => ({}));
    return info.permalink_url ?? `https://www.facebook.com/${postId}`;
  }
  const ids: string[] = [];
  for (const m of media.slice(0, 10)) ids.push((await graph('POST', `${page}/photos`, { url: m.url, published: false }, t)).id);
  const params: Record<string, string> = { message };
  ids.forEach((id, i) => { params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id }); });
  const post = await graph('POST', `${page}/feed`, params, t);
  const info = await graph('GET', post.id, { fields: 'permalink_url' }, t).catch(() => ({}));
  return info.permalink_url ?? `https://www.facebook.com/${post.id}`;
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const dry = u.searchParams.get('dry') === '1', one = u.searchParams.get('item'), force = u.searchParams.get('force') === '1';
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body, null, 1), { status, headers: { 'Content-Type': 'application/json' } });
  const log: string[] = [];
  const say = (s: string) => log.push(s);
  try {
    if (!TOKEN) throw new Error('META_ACCESS_TOKEN secret is missing.');
    const settings: { key: string; value: string }[] = await sb('app_settings?select=key,value');
    const get = (k: string, d: string) => settings.find((s) => s.key === k)?.value ?? d;
    if (get('publisher_paused', 'false') === 'true' && !one) return json(200, { ok: true, paused: true, note: 'Publisher is paused (app_settings.publisher_paused = true).' });
    const hours = Number(get('publisher_window_hours', '36')) || 36;
    const now = new Date();
    let q = `items?select=*,clients!inner(id,name,instagram,active)&status=eq.approved&clients.active=eq.true&order=scheduled_at.asc&limit=10`;
    if (one) q += `&id=eq.${one}`;
    else q += `&scheduled_at=lte.${now.toISOString()}&publish_attempts=lt.${MAX_ATTEMPTS}`;
    if (!one && !force) q += `&scheduled_at=gte.${new Date(now.getTime() - hours * 3600e3).toISOString()}`;
    const due: Item[] = await sb(q);
    // approved items whose time passed by more than the window: say so once on the card, never post them silently late
    if (!one) {
      const late: { id: string; title: string }[] = await sb(`items?select=id,title&status=eq.approved&publish_error=is.null&scheduled_at=lt.${new Date(now.getTime() - hours * 3600e3).toISOString()}`).catch(() => []);
      for (const l of late) await sb(`items?id=eq.${l.id}`, { method: 'PATCH', body: JSON.stringify({ publish_error: `Scheduled time passed by more than ${hours} hours, so it was not posted. Give it a new date in the Control Center, or post it by hand.` }) }).catch(() => null);
      if (late.length) say(`late, not posted: ${late.map((l) => l.title).join(' | ')}`);
    }
    if (!due.length) return json(200, { ok: true, due: 0, note: 'Nothing due.' + (log.length ? ' ' + log.join(' ') : '') });
    if (one && !force && due[0].scheduled_at && Date.parse(due[0].scheduled_at) > now.getTime()) throw new Error('This item is scheduled for later. Add &force=1 to post it now.');
    const accs = await accounts();
    say('Accounts: ' + accs.map((a) => `${a.pageName}${a.username ? ' / @' + a.username : ''}`).join(', '));
    const results: { id: string; title: string; ok: boolean; url?: string; error?: string }[] = [];
    for (const x of due) {
      const tag = `${x.platform ?? '?'} ${x.kind} "${x.title}"`;
      try {
        const acc = accountFor(x, accs);
        if (!acc) throw new Error(`No Page / Instagram account for ${x.clients.name} (${x.clients.instagram ?? 'no handle'}) is assigned to the system user.`);
        if (!['instagram', 'facebook'].includes(x.platform ?? '')) throw new Error(`Platform "${x.platform}" is not published by the system; post it by hand.`);
        const media = await mediaOf(x);
        if (dry) { say(`DRY ${tag} → ${acc.pageName}${acc.username ? ' / @' + acc.username : ''} · ${media.length} media · caption ${captionOf(x).length} chars`); results.push({ id: x.id, title: x.title, ok: true }); continue; }
        // claim (prevents a second run from posting the same item)
        const claimed = await sb(`items?id=eq.${x.id}&status=eq.approved&or=(publish_lock.is.null,publish_lock.lt.${new Date(now.getTime() - LOCK_MIN * 60000).toISOString()})`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ publish_lock: now.toISOString() }) });
        if (!claimed?.length) { say(`skip ${tag}: being handled by another run`); continue; }
        const url = x.platform === 'instagram' ? await publishInstagram(x, acc, media) : await publishFacebook(x, acc, media);
        await sb(`items?id=eq.${x.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'published', published_at: new Date().toISOString(), published_url: url, publish_error: null, publish_lock: null }) });
        await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: x.client_id, audience: 'client', title: `Published: ${x.title}`, title_ar: `نُشر: ${x.title}`, body: url, body_ar: url }) }).catch(() => null);
        say(`✓ ${tag} → ${url}`); results.push({ id: x.id, title: x.title, ok: true, url });
      } catch (e) {
        const msg = (e as Error).message;
        if (!dry) await sb(`items?id=eq.${x.id}`, { method: 'PATCH', body: JSON.stringify({ publish_error: msg.slice(0, 1000), publish_attempts: (x.publish_attempts ?? 0) + 1, publish_lock: null }) }).catch(() => null);
        say(`✗ ${tag}: ${msg}`); results.push({ id: x.id, title: x.title, ok: false, error: msg });
      }
    }
    const status = results.every((r) => r.ok) ? 'ok' : 'error';
    await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'meta-publisher', status, finished_at: new Date().toISOString(), note: (dry ? 'DRY RUN\n' : '') + log.join('\n') }) }).catch(() => null);
    return json(200, { ok: status === 'ok', dry, results, log });
  } catch (e) {
    const msg = (e as Error).message;
    await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'meta-publisher', status: 'error', finished_at: new Date().toISOString(), note: msg }) }).catch(() => null);
    return json(500, { ok: false, error: msg, log });
  }
});
