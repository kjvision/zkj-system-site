// Studio delivery desk: KJ's agents (VRS-CONTENT · Content Studio and others) collect a job brief here
// and upload the finished file here. The file lands in the public `studio` bucket, is attached to the
// portal card(s) of the job, and the card goes into KJ's approval queue. Nothing is ever published here:
// the publisher posts only after KJ approves the card.
//   GET  ?job=<uuid>                        → the brief (title, kind, text, cards, upload how-to)
//   POST ?job=<uuid>&status=in_progress     → mark started (optional &note=…)
//   PUT  ?job=<uuid>&name=<file.mp4>        → upload one file (raw body). mp4 / mov / jpg / png, max 300 MB
//   POST ?job=<uuid>&status=delivered       → mark finished (optional; the first upload already does)
// The job id (a random uuid) travels only in KJ's private agent board, so it works as the delivery key.
// Jobs older than 30 days or cancelled accept nothing.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const BUCKET = 'studio';
const MAX_BYTES = 300 * 1024 * 1024;
const TYPES: Record<string, string> = { mp4: 'video/mp4', mov: 'video/quicktime', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
const json = (status: number, body: unknown) => new Response(JSON.stringify(body, null, 1), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const id = u.searchParams.get('job') ?? '';
  if (!UUID.test(id)) return json(404, { ok: false, error: 'Unknown job.' });
  try {
    const job = (await sb(`studio_jobs?id=eq.${id}&select=*`))?.[0];
    if (!job || job.status === 'cancelled' || Date.now() - Date.parse(job.created_at) > 30 * 86400e3) return json(404, { ok: false, error: 'Unknown, cancelled or expired job.' });
    const self = `${SB_URL}/functions/v1/studio-deliver?job=${id}`;

    if (req.method === 'GET') {
      const items = job.item_ids?.length ? await sb(`items?id=in.(${job.item_ids.join(',')})&select=id,title,platform,kind,status,scheduled_at`) : [];
      return json(200, {
        ok: true, job: { id, title: job.title, kind: job.kind, status: job.status, brief: job.brief, files: job.files, cards: items },
        deliver: {
          upload: `curl -X PUT --data-binary @<file> -H "Content-Type: <video/mp4|image/jpeg>" "${self}&name=<file-name>"`,
          started: `curl -X POST "${self}&status=in_progress"`,
          done: `curl -X POST "${self}&status=delivered&note=<one line>"`,
          rules: 'mp4 for video (H.264, 1080x1920, 30 fps, AAC or silent), jpg for images. One upload per file. File names sort in slide order for carousels (01.jpg, 02.jpg …).',
        },
      });
    }

    const status = u.searchParams.get('status');
    if (req.method === 'POST' && status) {
      if (!['in_progress', 'delivered'].includes(status)) return json(400, { ok: false, error: 'status must be in_progress or delivered' });
      const note = (u.searchParams.get('note') ?? '').slice(0, 500) || job.note;
      await sb(`studio_jobs?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status, note, updated_at: new Date().toISOString(), ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}) }) });
      return json(200, { ok: true, status });
    }

    if (req.method !== 'PUT' && req.method !== 'POST') return json(405, { ok: false, error: 'Use GET, PUT or POST.' });
    const name = (u.searchParams.get('name') ?? '').trim();
    const ext = (name.split('.').pop() ?? '').toLowerCase();
    if (!/^[A-Za-z0-9._-]{1,120}$/.test(name) || !TYPES[ext]) return json(400, { ok: false, error: 'name must be like reel.mp4 or 01.jpg (letters, digits, . _ -; mp4, mov, jpg, png).' });
    const len = Number(req.headers.get('content-length') ?? '0');
    if (len > MAX_BYTES) return json(413, { ok: false, error: 'File over 300 MB.' });
    if (!req.body) return json(400, { ok: false, error: 'Empty body. Send the file with --data-binary @file.' });

    const path = `${id}/${name}`;
    const up = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST', body: req.body, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': TYPES[ext], 'x-upsert': 'true', 'cache-control': '3600' },
      // @ts-ignore streaming upload
      duplex: 'half',
    });
    if (!up.ok) return json(502, { ok: false, error: `Storage refused the file: ${up.status} ${await up.text()}` });
    const url = `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`;
    const isVideo = TYPES[ext].startsWith('video/');
    const files = [...(job.files ?? []).filter((f: any) => f.name !== name), { name, url, type: TYPES[ext], bytes: len || null, at: new Date().toISOString() }]
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    await sb(`studio_jobs?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ files, status: 'delivered', delivered_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });

    // attach to the cards and put them in KJ's approval queue (never past approved/published ones)
    const attached: string[] = [];
    if (job.item_ids?.length) {
      const items = await sb(`items?id=in.(${job.item_ids.join(',')})&select=id,kind,status,title,client_id`);
      for (const it of items) {
        if (!['draft', 'changes_requested', 'needs_approval'].includes(it.status)) continue;
        let media: string | null = null;
        if (it.kind === 'reel' && isVideo) media = url;
        else if (it.kind === 'carousel' && !isVideo) media = files.filter((f: any) => f.type.startsWith('image/')).map((f: any) => f.url).join(',');
        else if (it.kind !== 'reel' && it.kind !== 'carousel' && !isVideo) media = url;
        else if (it.kind === 'story' && isVideo) media = url;
        if (!media) continue;
        await sb(`items?id=eq.${it.id}`, { method: 'PATCH', body: JSON.stringify({ media_url: media, status: 'needs_approval', revised_at: new Date().toISOString(), revision_note: `Delivered by ${job.agent === 'content' ? 'Content Studio' : job.agent}: ${name}`, reviewed_at: null, reviewed_by: null, publish_error: null, publish_attempts: 0 }) });
        attached.push(it.title);
      }
    }
    await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: job.client_id, audience: 'admin', title: `Studio delivered: ${job.title}`, title_ar: `وصل من الاستوديو: ${job.title}`, body: attached.length ? `Attached to ${attached.length} card(s), waiting for your approval.` : `File ${name} saved.`, body_ar: attached.length ? `أُرفق بـ ${attached.length} بطاقة وينتظر موافقتك.` : `حُفظ الملف ${name}.` }) }).catch(() => null);
    return json(200, { ok: true, url, attached });
  } catch (e) {
    return json(500, { ok: false, error: (e as Error).message });
  }
});
