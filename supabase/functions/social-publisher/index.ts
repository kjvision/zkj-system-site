// Social publisher: posts APPROVED items at their scheduled time to YouTube, Pinterest and LinkedIn Company Pages through the official APIs.
// Runs from pg_cron every 5 minutes, or by hand:  POST ?dry=1  (plan only)  ·  POST ?item=<uuid>  (one item now)  ·  &force=1 (ignore the time window)
//   POST ?publish=<uuid>  with Authorization: Bearer <KJ's portal session>  → the "Publish" tap: YouTube private → public.
//        If Google refuses (compliance audit not passed yet) the answer carries the YouTube Studio link so KJ flips it there.
// Rules (same as meta-publisher): only status = approved; only at or after scheduled_at; never older than app_settings.publisher_window_hours
// (default 36 h); at most 3 attempts per item; app_settings.publisher_paused pauses everything. Nothing else is ever posted.
// Waiting-time mode (KJ, 22 Oct 2026): YouTube uploads land PRIVATE until app_settings.youtube_public_allowed = 'true' (the day Google's audit
// passes); items then carry publish_state = 'private' and KJ taps Publish in the portal. Pinterest: on Trial access pins are visible only to the
// account itself; nothing here can change that. LinkedIn: Company Page posts only (needs the Community Management API on the app).
// Tokens come from public.social_accounts (filled by social-connect); SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const env = (k: string) => (Deno.env.get(k) ?? '').trim();
const MAX_ATTEMPTS = 3;
const LOCK_MIN = 15;
const NETS = ['youtube', 'pinterest', 'linkedin'];
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

type Item = { id: string; client_id: string; kind: string; platform: string | null; title: string; caption: string | null; caption_ar: string | null; media_url: string | null; scheduled_at: string | null; status: string; publish_attempts: number; external_id: string | null; publish_state: string | null; clients: { id: string; name: string; website: string | null; active: boolean } };
type Account = { id: string; client_id: string; network: string; external_id: string; name: string | null; access_token: string; refresh_token: string | null; expires_at: string | null; extra: Record<string, any>; status: string };
type Media = { url: string; video: boolean };

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
async function api(label: string, url: string, init: RequestInit = {}) {
  const r = await fetch(url, init);
  const txt = await r.text();
  let j: any = {};
  try { j = txt ? JSON.parse(txt) : {}; } catch { j = { raw: txt }; }
  if (!r.ok || j.error) throw new Error(`${label}: ${j.error?.message ?? j.error_description ?? j.message ?? (typeof j.error === 'string' ? j.error : null) ?? j.raw ?? r.status}` + (j.code ? ` (code ${j.code})` : ''));
  return { j, headers: r.headers };
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const basic = (id: string, secret: string) => 'Basic ' + btoa(`${id}:${secret}`);

function captionOf(x: Item, max: number) {
  const en = (x.caption ?? '').trim(), ar = (x.caption_ar ?? '').trim();
  const both = en && ar && en !== ar ? en + '\n\n' + ar : (en || ar);
  return both.slice(0, max);
}
// Pinterest and LinkedIn take JPEG/PNG; the site keeps .webp with a .jpg twin next to it when one was made. Video = mp4/mov.
async function mediaOf(x: Item, preferJpg: boolean): Promise<Media[]> {
  const list = String(x.media_url ?? '').split(/[\s,]+/).filter((u) => /^https:\/\//i.test(u));
  const out: Media[] = [];
  for (const u of list) {
    if (/\.(mp4|mov)(\?.*)?$/i.test(u)) { out.push({ url: u, video: true }); continue; }
    if (preferJpg && /\.webp(\?.*)?$/i.test(u)) {
      const jpg = u.replace(/\.webp(\?.*)?$/i, '.jpg');
      const h = await fetch(jpg, { method: 'HEAD' }).catch(() => null);
      if (h?.ok && /image\/jpe?g/i.test(h.headers.get('content-type') ?? '')) { out.push({ url: jpg, video: false }); continue; }
    }
    out.push({ url: u, video: false });
  }
  return out;
}
async function bytes(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Media not reachable: ${url} (${r.status})`);
  return { buf: await r.arrayBuffer(), type: r.headers.get('content-type') ?? 'application/octet-stream' };
}

// ---- tokens: refresh when within 2 minutes of expiry ----
async function fresh(acc: Account): Promise<string> {
  if (!acc.expires_at || Date.parse(acc.expires_at) - Date.now() > 120e3) return acc.access_token;
  if (!acc.refresh_token) throw new Error(`${acc.network} token expired and cannot be renewed: reconnect from the portal.`);
  let j: any;
  if (acc.network === 'youtube') j = (await api('Google', 'https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ refresh_token: acc.refresh_token, client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), grant_type: 'refresh_token' }) })).j;
  else if (acc.network === 'pinterest') j = (await api('Pinterest', 'https://api.pinterest.com/v5/oauth/token', { method: 'POST', headers: { Authorization: basic(env('PINTEREST_CLIENT_ID'), env('PINTEREST_CLIENT_SECRET')), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: acc.refresh_token }) })).j;
  else j = (await api('LinkedIn', 'https://www.linkedin.com/oauth/v2/accessToken', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: acc.refresh_token, client_id: env('LINKEDIN_CLIENT_ID'), client_secret: env('LINKEDIN_CLIENT_SECRET') }) })).j;
  const patch: Record<string, unknown> = { access_token: j.access_token, expires_at: new Date(Date.now() + (Number(j.expires_in) || 3600) * 1000).toISOString(), refreshed_at: new Date().toISOString(), status: 'ok', last_error: null };
  if (j.refresh_token) patch.refresh_token = j.refresh_token;
  await sb(`social_accounts?id=eq.${acc.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  return j.access_token;
}

// ---- YouTube: resumable upload; private until Google's audit passes ----
async function publishYouTube(x: Item, token: string, media: Media[], publicAllowed: boolean) {
  const v = media.find((m) => m.video);
  if (!v) throw new Error('YouTube needs a video file (mp4) in the media link.');
  const privacy = publicAllowed ? 'public' : 'private';
  const meta = { snippet: { title: x.title.slice(0, 100), description: captionOf(x, 5000), categoryId: '22' }, status: { privacyStatus: privacy, selfDeclaredMadeForKids: false } };
  const file = await bytes(v.url);
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/*', 'X-Upload-Content-Length': String(file.buf.byteLength) }, body: JSON.stringify(meta) });
  if (!init.ok) throw new Error(`YouTube: ${init.status} ${(await init.text()).slice(0, 400)}`);
  const loc = init.headers.get('location');
  if (!loc) throw new Error('YouTube gave no upload address.');
  const up = await fetch(loc, { method: 'PUT', headers: { 'Content-Type': 'video/*', 'Content-Length': String(file.buf.byteLength) }, body: file.buf });
  const j = await up.json().catch(() => ({}));
  if (!up.ok || !j.id) throw new Error(`YouTube upload: ${up.status} ${JSON.stringify(j).slice(0, 400)}`);
  return { url: `https://youtu.be/${j.id}`, external_id: String(j.id), state: j.status?.privacyStatus ?? privacy };
}
async function youtubePublic(videoId: string, token: string) {
  const r = await fetch('https://www.googleapis.com/youtube/v3/videos?part=status', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: videoId, status: { privacyStatus: 'public', selfDeclaredMadeForKids: false } }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`YouTube: ${j.error?.message ?? r.status}`);
  return j.status?.privacyStatus ?? 'public';
}

// ---- Pinterest: image pin, carousel pin or video pin on the brand's board ----
async function publishPinterest(x: Item, token: string, media: Media[], acc: Account) {
  const board = acc.extra?.board_id;
  if (!board) throw new Error('No Pinterest board saved for this brand: reconnect Pinterest from the portal.');
  if (!media.length) throw new Error('A pin needs an image or a video in the media link.');
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const base: Record<string, unknown> = { board_id: board, title: x.title.slice(0, 100), description: captionOf(x, 800), alt_text: x.title.slice(0, 500) };
  if (x.clients.website && /^https:\/\//i.test(x.clients.website)) base.link = x.clients.website;
  let media_source: Record<string, unknown>;
  const first = media[0];
  if (first.video) {
    const cover = media.find((m) => !m.video)?.url;
    if (!cover) throw new Error('A video pin needs a cover image: add an image link after the video link in the media field.');
    const reg = (await api('Pinterest', 'https://api.pinterest.com/v5/media', { method: 'POST', headers: H, body: JSON.stringify({ media_type: 'video' }) })).j;
    const file = await bytes(first.url);
    const fd = new FormData();
    for (const [k, v] of Object.entries(reg.upload_parameters ?? {})) fd.append(k, String(v));
    fd.append('file', new Blob([file.buf], { type: 'video/mp4' }), 'video.mp4');
    const up = await fetch(reg.upload_url, { method: 'POST', body: fd });
    if (!up.ok) throw new Error(`Pinterest video upload: ${up.status}`);
    let state = '';
    for (let i = 0; i < 40; i++) {
      await sleep(3000);
      state = (await api('Pinterest', `https://api.pinterest.com/v5/media/${reg.media_id}`, { headers: H })).j.status;
      if (state === 'succeeded') break;
      if (state === 'failed') throw new Error('Pinterest could not process the video.');
    }
    if (state !== 'succeeded') throw new Error('Pinterest is still processing the video; it will be retried.');
    media_source = { source_type: 'video_id', media_id: reg.media_id, cover_image_url: cover };
  } else if (media.length > 1) media_source = { source_type: 'multiple_image_urls', items: media.filter((m) => !m.video).slice(0, 5).map((m) => ({ url: m.url, title: x.title.slice(0, 100) })) };
  else media_source = { source_type: 'image_url', url: first.url };
  const j = (await api('Pinterest', 'https://api.pinterest.com/v5/pins', { method: 'POST', headers: H, body: JSON.stringify({ ...base, media_source }) })).j;
  return { url: `https://www.pinterest.com/pin/${j.id}/`, external_id: String(j.id), state: 'public' };
}

// ---- LinkedIn Company Page: text + image(s) or video ----
const liEscape = (s: string) => s.replace(/[\\()\[\]{}<>@|~_*#]/g, (c) => '\\' + c);
async function publishLinkedIn(x: Item, token: string, media: Media[], acc: Account, version: string) {
  const owner = acc.external_id;
  if (!/^urn:li:organization:/.test(owner)) throw new Error('This LinkedIn connection is not a Company Page. Only Pages are posted to; reconnect from the portal.');
  const LI = 'https://api.linkedin.com/rest';
  const H = { Authorization: `Bearer ${token}`, 'LinkedIn-Version': version, 'X-Restli-Protocol-Version': '2.0.0', 'Content-Type': 'application/json' };
  const upImage = async (url: string) => {
    const init = (await api('LinkedIn', `${LI}/images?action=initializeUpload`, { method: 'POST', headers: H, body: JSON.stringify({ initializeUploadRequest: { owner } }) })).j.value;
    const file = await bytes(url);
    const r = await fetch(init.uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type }, body: file.buf });
    if (!r.ok) throw new Error(`LinkedIn image upload: ${r.status}`);
    return init.image as string;
  };
  let content: Record<string, unknown> | null = null;
  const m = media[0];
  if (m?.video) {
    const file = await bytes(m.url);
    const init = (await api('LinkedIn', `${LI}/videos?action=initializeUpload`, { method: 'POST', headers: H, body: JSON.stringify({ initializeUploadRequest: { owner, fileSizeBytes: file.buf.byteLength, uploadCaptions: false, uploadThumbnail: false } }) })).j.value;
    const etags: string[] = [];
    for (const ins of init.uploadInstructions ?? []) {
      const r = await fetch(ins.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: file.buf.slice(ins.firstByte, ins.lastByte + 1) });
      if (!r.ok) throw new Error(`LinkedIn video upload: ${r.status}`);
      etags.push(r.headers.get('etag') ?? '');
    }
    await api('LinkedIn', `${LI}/videos?action=finalizeUpload`, { method: 'POST', headers: H, body: JSON.stringify({ finalizeUploadRequest: { video: init.video, uploadToken: init.uploadToken ?? '', uploadedPartIds: etags } }) });
    for (let i = 0; i < 30; i++) {
      await sleep(3000);
      const st = (await api('LinkedIn', `${LI}/videos/${encodeURIComponent(init.video)}`, { headers: H }).catch(() => ({ j: {} }))).j;
      if (st.status === 'AVAILABLE') break;
      if (st.status === 'PROCESSING_FAILED') throw new Error('LinkedIn could not process the video.');
    }
    content = { media: { id: init.video, title: x.title.slice(0, 200) } };
  } else if (media.length > 1) {
    const ids: string[] = [];
    for (const im of media.filter((q) => !q.video).slice(0, 9)) ids.push(await upImage(im.url));
    content = { multiImage: { images: ids.map((id) => ({ id, altText: x.title.slice(0, 300) })) } };
  } else if (m) content = { media: { id: await upImage(m.url), altText: x.title.slice(0, 300) } };
  const text = liEscape([x.title, captionOf(x, 2800)].filter(Boolean).join('\n\n')).slice(0, 3000);
  const body: Record<string, unknown> = { author: owner, commentary: text, visibility: 'PUBLIC', distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] }, lifecycleState: 'PUBLISHED', isReshareDisabledByAuthor: false };
  if (content) body.content = content;
  const r = await fetch(`${LI}/posts`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`LinkedIn: ${r.status} ${(await r.text()).slice(0, 400)}`);
  const urn = r.headers.get('x-restli-id') ?? '';
  return { url: urn ? `https://www.linkedin.com/feed/update/${urn}/` : (acc.name ? `https://www.linkedin.com/company/` : ''), external_id: urn, state: 'public' };
}

async function adminFromRequest(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  if (!/^Bearer /i.test(auth)) throw new Error('Sign in to the portal first.');
  const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: auth } });
  const u = await r.json().catch(() => ({}));
  if (!r.ok || !u.id) throw new Error('Session not valid: sign in again.');
  const p = (await sb(`profiles?select=role&id=eq.${u.id}`))?.[0];
  if (p?.role !== 'admin') throw new Error('Only the owner can publish.');
  return u.id as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  const u = new URL(req.url);
  const dry = u.searchParams.get('dry') === '1';
  const one = u.searchParams.get('item');
  const force = u.searchParams.get('force') === '1';
  const log: string[] = [];
  const say = (s: string) => { log.push(s); console.log(s); };
  try {
    const settings: { key: string; value: string }[] = await sb('app_settings?select=key,value');
    const get = (k: string, d: string) => settings.find((s) => s.key === k)?.value ?? d;
    const version = get('linkedin_version', '202509');
    const ytPublic = get('youtube_public_allowed', 'false') === 'true';

    // the Publish tap from the portal (YouTube private → public)
    const pub = u.searchParams.get('publish');
    if (pub) {
      await adminFromRequest(req);
      const x: Item | undefined = (await sb(`items?select=*,clients!inner(id,name,website,active)&id=eq.${pub}`))?.[0];
      if (!x) return json(404, { ok: false, error: 'Item not found.' });
      if (x.platform !== 'youtube' || !x.external_id) return json(400, { ok: false, error: 'Only uploaded YouTube videos can be published from here.' });
      const studio = `https://studio.youtube.com/video/${x.external_id}/edit`;
      const acc: Account | undefined = (await sb(`social_accounts?select=*&client_id=eq.${x.client_id}&network=eq.youtube`))?.[0];
      if (!acc) return json(200, { ok: false, studio, error: 'YouTube is not connected for this brand.' });
      try {
        const state = await youtubePublic(x.external_id, await fresh(acc));
        await sb(`items?id=eq.${x.id}`, { method: 'PATCH', body: JSON.stringify({ publish_state: state, publish_error: null }) });
        return json(200, { ok: true, state, url: x.published_url ?? `https://youtu.be/${x.external_id}` });
      } catch (e) {
        return json(200, { ok: false, studio, error: (e as Error).message });
      }
    }

    if (get('publisher_paused', 'false') === 'true' && !one) return json(200, { ok: true, paused: true, note: 'Publisher is paused (app_settings.publisher_paused = true).' });
    const hours = Number(get('publisher_window_hours', '36')) || 36;
    const now = new Date();
    let q = `items?select=*,clients!inner(id,name,website,active)&status=eq.approved&clients.active=eq.true&platform=in.(${NETS.join(',')})&order=scheduled_at.asc&limit=10`;
    if (one) q += `&id=eq.${one}`;
    else q += `&scheduled_at=lte.${now.toISOString()}&publish_attempts=lt.${MAX_ATTEMPTS}&scheduled_at=gte.${new Date(now.getTime() - hours * 3600e3).toISOString()}`;
    const due: Item[] = await sb(q);
    if (!due.length) return json(200, { ok: true, due: 0, note: 'Nothing due.' });
    if (one && !force && due[0].scheduled_at && Date.parse(due[0].scheduled_at) > now.getTime()) throw new Error('This item is scheduled for later. Add &force=1 to post it now.');
    const accs: Account[] = await sb('social_accounts?select=*');
    const results: { id: string; title: string; ok: boolean; url?: string; state?: string; error?: string }[] = [];
    for (const x of due) {
      const tag = `${x.platform} ${x.kind} "${x.title}"`;
      try {
        const acc = accs.find((a) => a.client_id === x.client_id && a.network === x.platform);
        if (!acc) throw new Error(`${x.platform} is not connected for ${x.clients.name}: HQ → Control Center → Connect.`);
        if (acc.status === 'revoked') throw new Error(`${x.platform} access was revoked for ${x.clients.name}: reconnect from the portal.`);
        const media = await mediaOf(x, x.platform !== 'youtube');
        if (dry) { say(`DRY ${tag} → ${acc.name} · ${media.length} media`); results.push({ id: x.id, title: x.title, ok: true }); continue; }
        const claimed = await sb(`items?id=eq.${x.id}&status=eq.approved&or=(publish_lock.is.null,publish_lock.lt.${new Date(now.getTime() - LOCK_MIN * 60000).toISOString()})`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ publish_lock: now.toISOString() }) });
        if (!claimed?.length) { say(`skip ${tag}: being handled by another run`); continue; }
        const token = await fresh(acc);
        const r = x.platform === 'youtube' ? await publishYouTube(x, token, media, ytPublic) : x.platform === 'pinterest' ? await publishPinterest(x, token, media, acc) : await publishLinkedIn(x, token, media, acc, version);
        await sb(`items?id=eq.${x.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'published', published_at: new Date().toISOString(), published_url: r.url, external_id: r.external_id, publish_state: r.state, publish_error: null, publish_lock: null }) });
        const priv = r.state === 'private';
        await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: x.client_id, audience: priv ? 'admin' : 'client', title: priv ? `Uploaded to YouTube (private) · tap Publish: ${x.title}` : `Published: ${x.title}`, title_ar: priv ? `رُفع إلى يوتيوب (خاص) · اضغط نشر: ${x.title}` : `نُشر: ${x.title}`, body: r.url, body_ar: r.url }) }).catch(() => null);
        say(`✓ ${tag} → ${r.url} (${r.state})`); results.push({ id: x.id, title: x.title, ok: true, url: r.url, state: r.state });
      } catch (e) {
        const msg = (e as Error).message;
        if (!dry) await sb(`items?id=eq.${x.id}`, { method: 'PATCH', body: JSON.stringify({ publish_error: msg.slice(0, 1000), publish_attempts: (x.publish_attempts ?? 0) + 1, publish_lock: null }) }).catch(() => null);
        say(`✗ ${tag}: ${msg}`); results.push({ id: x.id, title: x.title, ok: false, error: msg });
      }
    }
    const status = results.every((r) => r.ok) ? 'ok' : 'error';
    await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'social-publisher', status, finished_at: new Date().toISOString(), note: (dry ? 'DRY RUN\n' : '') + log.join('\n') }) }).catch(() => null);
    return json(200, { ok: status === 'ok', dry, results, log });
  } catch (e) {
    const msg = (e as Error).message;
    if (!u.searchParams.get('publish')) await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'social-publisher', status: 'error', finished_at: new Date().toISOString(), note: msg }) }).catch(() => null);
    return json(u.searchParams.get('publish') ? 200 : 500, { ok: false, error: msg, log });
  }
});
