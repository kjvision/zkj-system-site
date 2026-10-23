// Drawings desk: the order → make → approve → deliver loop for T-12 2D Engineering Drawings (KJ, 21 Oct 2026).
// Files never become public: inputs and outputs sit in the private `drawings` bucket and are handed out as short signed links.
//
// Customer (website /drawings/, key = customer_key from the order):
//   POST ?action=create                       JSON order + file list → job, key, signed upload links
//   POST ?action=submitted&job&key            after the uploads → HQ gets a bell note
//   GET  ?job&key                             status, quote, previews; final files once approved
//   POST ?action=confirm|approve&job&key      accept the quote · approve the drawings
//   POST ?action=changes&job&key  {note}      ask for changes
//   POST ?action=addon&job&key {work,note}    after approval: order a 3D model or a method statement built on these drawings
//                                             → a new linked job (parent_id) with its own quote and its own order page
// Agent (KJ's drawings agent, key = agent_key, only on KJ's private board / HQ page):
//   GET  ?job&agent                           brief + signed links to the customer's files
//   POST ?action=start&job&agent              work started
//   PUT  ?job&agent&name=<file>               upload one output (pdf, dxf, dwg, png, jpg, webp, skp, docx, mp4)
//   POST ?action=ready&job&agent              done → status "check": KJ looks first, then releases it to the customer in HQ
//   GET  ?inbox=<inbox key>                   the agent's inbox: every job that needs the agent, each with its own agent link
//                                             (key = app_settings.drawings_agent_inbox_key; one permanent link for the agent chat)
// Quotes and releases are set by KJ on /drawings/hq.html (admin login, row-level security), never here.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const BUCKET = 'drawings';
const SITE = 'https://system.zkjverse.com';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IN_TYPES = /\.(pdf|jpe?g|png|webp|heic|dxf|dwg)$/i;
const OUT_TYPES: Record<string, string> = {
  pdf: 'application/pdf', dxf: 'application/dxf', dwg: 'application/acad', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  skp: 'application/octet-stream', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', mp4: 'video/mp4',
  html: 'text/html', // the interactive study (one self-contained file): opens in any phone or desktop browser from its signed link
};
const PREVIEW = /\.(pdf|png|jpe?g|webp|mp4|html)$/i;
// method = installation method statement (sequence, scaffolding, crane / lifting, equipment, safety); model3d = SketchUp model + views
const WORK = ['redraw', 'plans', 'sections', 'elevations', 'details', 'method', 'model3d'];
const ADDONS = ['model3d', 'method'];
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'content-type' };

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
async function storage(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/storage/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, ...(init.headers ?? {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Storage ${path.split('?')[0]}: ${r.status} ${j.message ?? j.error ?? ''}`);
  return j;
}
const signDownload = async (path: string, secs = 3600) => SB_URL + '/storage/v1' + (await storage(`object/sign/${BUCKET}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: secs }) })).signedURL;
const json = (status: number, body: unknown) => new Response(JSON.stringify(body, null, 1), { status, headers: { 'Content-Type': 'application/json', ...cors } });
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const safeName = (n: string) => n.normalize('NFKD').replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_').slice(-100) || 'file';
const notify = (title: string, title_ar: string, body: string) => sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ audience: 'admin', title, title_ar, body, body_ar: body }) }).catch(() => null);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const u = new URL(req.url);
  const action = u.searchParams.get('action') ?? '';
  try {
    // ---------- new order ----------
    if (req.method === 'POST' && action === 'create') {
      const b = await req.json().catch(() => null);
      if (!b || typeof b !== 'object') return json(400, { ok: false, error: 'bad_request' });
      if (str(b.website, 50)) return json(200, { ok: true }); // honeypot: bots fill every field
      const order = {
        name: str(b.name, 120), company: str(b.company, 160), email: str(b.email, 200).toLowerCase(), phone: str(b.phone, 40),
        lang: b.lang === 'ar' ? 'ar' : 'en', labels: ['en', 'ar', 'both'].includes(b.labels) ? b.labels : 'en',
        units: ['mm', 'cm', 'm', 'in', 'ft'].includes(b.units) ? b.units : 'mm', scale: str(b.scale, 30),
        sheet: ['A4', 'A3', 'A2', 'A1', 'A0'].includes(b.sheet) ? b.sheet : 'A3',
        work: (Array.isArray(b.work) ? b.work : []).filter((w: string) => WORK.includes(w)).slice(0, WORK.length),
        details: str(b.details, 4000),
      };
      if (!order.name || !order.details || (!order.email && !order.phone) || !order.work.length) return json(400, { ok: false, error: 'missing_fields' });
      if (order.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(order.email)) return json(400, { ok: false, error: 'bad_email' });
      const files = (Array.isArray(b.files) ? b.files : []).slice(0, 10).map((f: any) => ({ name: safeName(str(f?.name, 200)), size: Number(f?.size) || 0 }));
      if (files.some((f: any) => !IN_TYPES.test(f.name) || f.size > 50 * 1024 * 1024)) return json(400, { ok: false, error: 'bad_file' });
      // simple flood guard
      const hour = new Date(Date.now() - 3600e3).toISOString();
      const recent: { id: string }[] = await sb(`drawing_jobs?select=id&created_at=gte.${hour}`);
      if (recent.length >= 30) return json(429, { ok: false, error: 'busy' });
      const job = (await sb('drawing_jobs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(order) }))[0];
      const seen = new Set<string>();
      const uploads = [];
      for (const f of files) {
        let n = f.name; let i = 1;
        while (seen.has(n)) n = `${i++}-${f.name}`;
        seen.add(n);
        const s = await storage(`object/upload/sign/${BUCKET}/inputs/${job.id}/${n}`, { method: 'POST' });
        uploads.push({ name: n, url: SB_URL + '/storage/v1' + s.url });
      }
      return json(200, { ok: true, job: job.id, key: job.customer_key, uploads, view: `${SITE}/drawings/view.html?job=${job.id}&k=${job.customer_key}` });
    }

    // ---------- agent inbox: one permanent link, no per-job copying ----------
    const inbox = u.searchParams.get('inbox') ?? '';
    if (inbox) {
      const row = (await sb(`app_settings?key=eq.drawings_agent_inbox_key&select=value`))?.[0];
      if (!row?.value || !UUID.test(inbox) || inbox !== row.value) return json(404, { ok: false, error: 'not_found' });
      // approved jobs stay on the list until the current revision has its STUDY-01.html (KJ, 23 Oct: the customer got PDFs and PNGs only)
      const all = await sb(`drawing_jobs?status=in.(received,quoted,confirmed,changes,in_work,check,approved,review)&order=created_at.asc&select=id,agent_key,name,company,status,revision,work,labels,units,sheet,sheets,price_per_sheet,currency,details,customer_note,hq_note,parent_id,inputs,outputs,created_at,updated_at`);
      const hasStudy = (j: any) => (j.outputs ?? []).some((o: any) => o.rev === j.revision && /^STUDY-01\.html$/i.test(o.name));
      const jobs = (all ?? []).filter((j: any) => !['approved', 'review'].includes(j.status) || !hasStudy(j));
      const self = `${SB_URL}/functions/v1/drawings-desk`;
      const todo = (jobs ?? []).map((j: any) => ({
        id: j.id, customer: j.name + (j.company ? ' · ' + j.company : ''), status: j.status, revision: j.revision, work: j.work, labels: j.labels, units: j.units, sheet: j.sheet,
        sheets: j.sheets, files: (j.inputs ?? []).length, delivered: (j.outputs ?? []).filter((o: any) => o.rev === j.revision).map((o: any) => o.name),
        brief: j.details, customer_note: j.customer_note, hq_note: j.hq_note, addon: !!j.parent_id, created_at: j.created_at, updated_at: j.updated_at,
        agent_link: `${self}?job=${j.id}&agent=${j.agent_key ?? ''}`,
        next: (j.status === 'approved' || j.status === 'review') && !hasStudy(j) ? `No study page yet: upload ONE self-contained STUDY-01.html now (phone-first, revision ${j.revision} content, same sheets): curl -X PUT --data-binary @STUDY-01.html "<agent_link>&name=STUDY-01.html". No start, no new revision; nothing else changes.`
          : j.status === 'received' || j.status === 'quoted' ? 'Read the brief and files now; list the TBC questions; drawing starts only after the customer confirms the price (KJ sets it).'
          : j.status === 'confirmed' ? 'Start: POST &action=start, then draw.'
          : j.status === 'changes' ? 'KJ or the customer sent it back: read hq_note / customer_note, POST &action=start, fix only what is named.'
          : j.status === 'in_work' ? 'You are on it: finish, upload, POST &action=ready.'
          : 'Waiting for KJ\'s check. Nothing to do unless KJ sends it back.',
      }));
      return json(200, { ok: true, jobs: todo, rules: 'Each job has its own private agent link (never share it). Work the oldest first. Never invent a number: TBC. Never redo approved sheets. Nothing goes to the customer: ready = KJ checks.' });
    }

    const id = u.searchParams.get('job') ?? '';
    if (!UUID.test(id)) return json(404, { ok: false, error: 'not_found' });
    const job = (await sb(`drawing_jobs?id=eq.${id}&select=*`))?.[0];
    if (!job) return json(404, { ok: false, error: 'not_found' });
    const ck = u.searchParams.get('key') ?? u.searchParams.get('k') ?? '', ak = u.searchParams.get('agent') ?? '';
    const isCustomer = UUID.test(ck) && ck === job.customer_key, isAgent = UUID.test(ak) && ak === job.agent_key;
    if (!isCustomer && !isAgent) return json(404, { ok: false, error: 'not_found' });
    const patch = (p: Record<string, unknown>) => sb(`drawing_jobs?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ ...p, updated_at: new Date().toISOString() }) });
    const total = job.sheets && job.price_per_sheet != null ? Number(job.sheets) * Number(job.price_per_sheet) : null; // 0 is a valid price (trial)

    // ---------- customer ----------
    if (isCustomer) {
      if (req.method === 'POST' && action === 'submitted') {
        const listed = await storage(`object/list/${BUCKET}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix: `inputs/${id}/`, limit: 20 }) });
        const inputs = (listed ?? []).filter((o: any) => o.name && o.id).map((o: any) => ({ name: o.name, size: o.metadata?.size ?? null }));
        await patch({ inputs });
        await notify(`New drawing order: ${job.name}${job.company ? ' · ' + job.company : ''}`, `طلب رسومات جديد: ${job.name}`, `${job.work.join(', ')} · ${inputs.length} file(s). Open /drawings/hq.html to quote it.`);
        return json(200, { ok: true, files: inputs.length });
      }
      if (req.method === 'POST' && action === 'confirm') {
        if (job.status !== 'quoted') return json(409, { ok: false, error: 'not_quoted' });
        await patch({ status: 'confirmed', confirmed_at: new Date().toISOString() });
        await notify(`Quote accepted: ${job.name}`, `تمت الموافقة على العرض: ${job.name}`, `${job.sheets} sheet(s). The agent can start.`);
        return json(200, { ok: true, status: 'confirmed' });
      }
      if (req.method === 'POST' && action === 'addon') {
        if (job.status !== 'approved') return json(409, { ok: false, error: 'not_approved' });
        const b = await req.json().catch(() => ({}));
        const work = (Array.isArray(b?.work) ? b.work : []).filter((w: string) => ADDONS.includes(w));
        if (!work.length) return json(400, { ok: false, error: 'missing_fields' });
        const kids: { id: string }[] = await sb(`drawing_jobs?select=id&parent_id=eq.${id}&status=neq.cancelled`);
        if (kids.length >= 5) return json(429, { ok: false, error: 'busy' });
        const note = str(b?.note, 2000);
        const child = (await sb('drawing_jobs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({
          parent_id: id, name: job.name, company: job.company, email: job.email, phone: job.phone, lang: job.lang, labels: job.labels, units: job.units, scale: job.scale, sheet: job.sheet,
          work, details: `Add-on to the approved drawings (order ${id.slice(0, 8)}).` + (note ? `\n${note}` : ''),
        }) }))[0];
        await notify(`Add-on ordered: ${job.name}`, `طلب إضافة: ${job.name}`, `${work.join(', ')} on approved order ${id.slice(0, 8)}. Open /drawings/hq.html to quote it.`);
        return json(200, { ok: true, job: child.id, view: `${SITE}/drawings/view.html?job=${child.id}&k=${child.customer_key}&lang=${job.lang}` });
      }
      if (req.method === 'POST' && (action === 'approve' || action === 'changes')) {
        if (job.status !== 'review') return json(409, { ok: false, error: 'not_in_review' });
        if (action === 'approve') {
          await patch({ status: 'approved', approved_at: new Date().toISOString() });
          await notify(`Drawings approved: ${job.name}`, `تم اعتماد الرسومات: ${job.name}`, 'Final files are open for the customer.');
          return json(200, { ok: true, status: 'approved' });
        }
        const b = await req.json().catch(() => ({}));
        const note = str(b?.note, 2000);
        if (!note) return json(400, { ok: false, error: 'note_needed' });
        await patch({ status: 'changes', customer_note: note });
        await notify(`Changes asked: ${job.name}`, `طلب تعديلات: ${job.name}`, note.slice(0, 300));
        return json(200, { ok: true, status: 'changes' });
      }
      if (req.method !== 'GET') return json(405, { ok: false, error: 'method' });
      // what the customer sees: never the agent key, previews only until approval
      const rev = job.revision;
      const show = ['review', 'changes', 'approved'].includes(job.status);
      const outs = show ? (job.outputs ?? []).filter((o: any) => o.rev === rev) : [];
      const files = [];
      for (const o of outs) {
        if (job.status !== 'approved' && !PREVIEW.test(o.name)) continue;
        files.push({ name: o.name, url: await signDownload(o.path, 3600) });
      }
      const addons = job.status === 'approved'
        ? ((await sb(`drawing_jobs?select=id,customer_key,work,status&parent_id=eq.${id}&status=neq.cancelled&order=created_at`)) ?? []).map((c: any) => ({ work: c.work, status: c.status, view: `${SITE}/drawings/view.html?job=${c.id}&k=${c.customer_key}` }))
        : [];
      return json(200, { ok: true, job: { id, status: job.status, name: job.name, work: job.work, sheet: job.sheet, labels: job.labels, created_at: job.created_at, sheets: job.sheets, price_per_sheet: job.price_per_sheet, currency: job.currency, total, revision: rev, files, final: job.status === 'approved', addon: !!job.parent_id, addons } });
    }

    // ---------- agent ----------
    if (req.method === 'GET') {
      const inputs = [];
      for (const f of job.inputs ?? []) inputs.push({ name: f.name, url: await signDownload(`inputs/${id}/${f.name}`, 6 * 3600) });
      // add-on job: the approved 2D drawings it builds on, plus the original customer files
      const parent_files = [];
      if (job.parent_id) {
        const p = (await sb(`drawing_jobs?id=eq.${job.parent_id}&select=id,revision,inputs,outputs,details`))?.[0];
        if (p) {
          for (const o of (p.outputs ?? []).filter((o: any) => o.rev === p.revision)) parent_files.push({ name: o.name, from: 'approved drawings', url: await signDownload(o.path, 6 * 3600) });
          for (const f of p.inputs ?? []) parent_files.push({ name: f.name, from: 'original customer file', url: await signDownload(`inputs/${p.id}/${f.name}`, 6 * 3600) });
        }
      }
      const self = `${SB_URL}/functions/v1/drawings-desk?job=${id}&agent=${ak}`;
      return json(200, {
        ok: true,
        job: { id, status: job.status, revision: job.revision, work: job.work, labels: job.labels, units: job.units, scale: job.scale, sheet: job.sheet, details: job.details, customer_note: job.customer_note, hq_note: job.hq_note, sheets: job.sheets, inputs, parent_id: job.parent_id, parent_files },
        deliver: {
          started: `curl -X POST "${self}&action=start"`,
          upload: `curl -X PUT --data-binary @<file> "${self}&name=<STUDY-01.html|A101.pdf|A101.dxf|A101.png|MS-01.pdf|MS-01.docx|M3D-01.skp|M3D-01.png>"`,
          ready: `curl -X POST "${self}&action=ready"`,
          rules: 'One upload per file. Same sheet number in every format (A101.pdf, A101.dxf, A101.png). Every sheet carries the title block and the note "For design and fabrication reference. Not stamped; authority submissions need a licensed engineer\'s review." in one corner only. Method statement = MS-01.pdf + MS-01.docx (+ A6xx method sheets). 3D model = M3D-01.skp + view images + a PDF of the views. The interactive study = ONE self-contained STUDY-01.html (all images, fonts and 3D inline, no outside links, phone-first: no sideways scroll, side panel becomes a drawer on phones); it is opened from its signed link on any phone or desktop, never from a claude.ai artifact. Ready sends it to KJ, not to the customer.',
        },
      });
    }
    if (req.method === 'POST' && action === 'start') {
      if (!['confirmed', 'changes', 'in_work', 'check'].includes(job.status)) return json(409, { ok: false, error: 'not_confirmed', status: job.status });
      // 'check' = KJ is looking, but the agent may reopen it to fix one file (same revision, other files stay untouched)
      const keep = job.status === 'in_work' || job.status === 'check';
      await patch({ status: 'in_work', revision: keep ? job.revision : job.revision + 1 });
      return json(200, { ok: true, status: 'in_work', revision: keep ? job.revision : job.revision + 1 });
    }
    if (req.method === 'PUT' || (req.method === 'POST' && u.searchParams.get('name'))) {
      const name = safeName(u.searchParams.get('name') ?? '');
      // the study page may be added to a delivered job (review/approved) without reopening it; everything else needs start
      const studyOnly = ['review', 'approved'].includes(job.status) && /^STUDY-01\.html$/i.test(name);
      if (job.status !== 'in_work' && !studyOnly) return json(409, { ok: false, error: 'start_first', status: job.status });
      const ext = (name.split('.').pop() ?? '').toLowerCase();
      if (!OUT_TYPES[ext]) return json(400, { ok: false, error: 'pdf, dxf, dwg, png, jpg, webp, skp, docx, mp4 or html only' });
      if (!req.body) return json(400, { ok: false, error: 'empty' });
      const path = `outputs/${id}/r${job.revision}/${name}`;
      const up = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST', body: req.body, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': OUT_TYPES[ext], 'x-upsert': 'true' },
        // @ts-ignore streaming upload
        duplex: 'half',
      });
      if (!up.ok) return json(502, { ok: false, error: `storage ${up.status}` });
      const outputs = [...(job.outputs ?? []).filter((o: any) => o.path !== path), { name, path, rev: job.revision, at: new Date().toISOString() }];
      await patch({ outputs });
      return json(200, { ok: true, name, revision: job.revision });
    }
    if (req.method === 'POST' && action === 'ready') {
      if (job.status !== 'in_work') return json(409, { ok: false, error: 'start_first', status: job.status });
      const mine = (job.outputs ?? []).filter((o: any) => o.rev === job.revision);
      if (!mine.some((o: any) => /\.(pdf|skp)$/i.test(o.name))) return json(400, { ok: false, error: 'upload at least one PDF (or the .skp model) first' });
      await patch({ status: 'check', delivered_at: new Date().toISOString() });
      await notify(`Drawings ready to check: ${job.name}`, `الرسومات جاهزة للمراجعة: ${job.name}`, `${mine.length} file(s), revision ${job.revision}. Check them in /drawings/hq.html, then send to the customer.`);
      return json(200, { ok: true, status: 'check' });
    }
    return json(405, { ok: false, error: 'method' });
  } catch (e) {
    return json(500, { ok: false, error: (e as Error).message });
  }
});
