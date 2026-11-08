// NOTIFY LOOP (KJ 6 Nov 2026, DECISIONS 63–64): a new job in public.tasks → one call to the Anthropic API (Sonnet, the key
// KJ saved as the Supabase secret ANTHROPIC_API_KEY) → the job gets "what came in · what I propose · your choice" in plain
// English and Arabic → a bell note (push-send takes it to the phone). Max 30 calls a day, cost logged in sync_runs.
// Called by the database trigger tasks_notify (net.http_post) with {"task_id": "..."}; POST {"task_id"} by hand also works.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const API_KEY = (Deno.env.get('ANTHROPIC_API_KEY') ?? '').trim();
const MODEL = 'claude-sonnet-5-5';                 // KJ's choice (DECISIONS 64): the cheap model, one short call per job
const PRICE = { in: 2 / 1e6, out: 10 / 1e6 };      // USD per token, Claude Sonnet 5.5 list price (6 Nov 2026)
const MAX_PER_DAY = 30;

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
type Task = { id: string; kind: string; title: string; received: string | null; proposal: string | null; options: unknown[]; client_id: string | null; platform: string | null; owner: string | null; priority: string; notified_at: string | null; source_table: string | null };

const RULES = `You write one short note for KJ, the owner of ZKJ SYSTEM (a Dubai studio that runs social media for brands: ZKJ SYSTEM, ZKJ VERSE art store, KJ VISION).
KJ is not a developer. Short sentences. Plain words. No jargon, no emojis, no exclamation marks.
Rules that always hold: nothing is posted, sent or charged without KJ's yes. Never invent numbers, prices or results. Arabic is written natively (Modern Standard Arabic), not translated word by word.
Write three things about the job you are given:
1. received: what came in, in at most 2 sentences (facts only, from the job text).
2. proposal: what you propose KJ does, in at most 2 sentences. If the right next step is unclear, propose the safest one (pause, wait, ask).
3. options: 2 or 3 choices KJ can tap, each 1–4 words, the first one being your proposal. Keys: short lowercase slugs.
If the title starts with "Art enquiry" (a piece from the ZKJ VERSE store): KJ has NOT got the trade licence yet. Never write the words invoice, quote, price offer, deposit, payment or payment link. Call it an "enquiry" and a "print job". The options must be exactly: key "reply", label "Reply first"; key "later", label "Later". Propose only to answer the customer by email or WhatsApp. If the customer is in the UAE, say nothing is sold in the UAE before the licence. If a lab cost is in the text, mention it as KJ's own cost note only.
Also give title_ar: the job title in Arabic (brand names stay in Latin letters).
Return English and Arabic for each.`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['title_ar', 'received', 'received_ar', 'proposal', 'proposal_ar', 'options'],
  properties: {
    title_ar: { type: 'string' }, received: { type: 'string' }, received_ar: { type: 'string' },
    proposal: { type: 'string' }, proposal_ar: { type: 'string' },
    options: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['key', 'label', 'label_ar'], properties: { key: { type: 'string' }, label: { type: 'string' }, label_ar: { type: 'string' } } } },
  },
};

async function write(t: Task, cname: string) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2026-10-21' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 1024,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: RULES,
      messages: [{ role: 'user', content: `Job kind: ${t.kind}\nBrand: ${cname || '—'}\nPlatform: ${t.platform || '—'}\nOwner session: ${t.owner || '—'}\nTitle: ${t.title}\nWhat the system recorded: ${t.received || '(nothing more)'}` }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${j?.error?.message ?? ''}`);
  if (j.stop_reason === 'refusal') throw new Error('Anthropic declined (refusal)');
  const text = (j.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('');
  const out = JSON.parse(text);
  out.options = (Array.isArray(out.options) ? out.options : []).slice(0, 3);
  if (out.options.length < 2) out.options = [{ key: 'ok', label: 'Do it', label_ar: 'نفّذ' }, { key: 'later', label: 'Later', label_ar: 'لاحقًا' }];
  const u = j.usage ?? {};
  const cost = (u.input_tokens ?? 0) * PRICE.in + (u.output_tokens ?? 0) * PRICE.out;
  return { out, cost, usage: u };
}

Deno.serve(async (req) => {
  const json = (s: number, b: unknown) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.task_id ?? body.record?.id ?? '');
    if (!id) return json(400, { ok: false, error: 'task_id missing' });
    if (!API_KEY) { await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'notify-loop', status: 'error', finished_at: new Date().toISOString(), note: 'ANTHROPIC_API_KEY secret is missing' }) }); return json(500, { ok: false, error: 'ANTHROPIC_API_KEY secret is missing' }); }
    const rows: Task[] = await sb(`tasks?select=id,kind,title,received,proposal,options,client_id,platform,owner,priority,notified_at,source_table&id=eq.${id}`);
    const t = rows?.[0]; if (!t) return json(404, { ok: false });
    if (t.notified_at) return json(200, { ok: true, skipped: 'already notified' });
    // daily cap
    const since = new Date(Date.now() - 86400e3).toISOString();
    const runs: { id: string }[] = await sb(`sync_runs?select=id&job=eq.notify-loop&status=eq.ok&finished_at=gte.${since}`);
    const cname = t.client_id ? ((await sb(`clients?select=name&id=eq.${t.client_id}`))?.[0]?.name ?? '') : '';
    let wrote = false, cost = 0;
    if ((runs?.length ?? 0) >= MAX_PER_DAY) {
      await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'notify-loop', status: 'skipped', finished_at: new Date().toISOString(), note: `daily cap ${MAX_PER_DAY} reached; task ${t.id} kept its plain title` }) });
    } else if (!t.proposal) {
      const w = await write(t, cname); cost = w.cost; wrote = true;
      await sb(`tasks?id=eq.${t.id}`, { method: 'PATCH', body: JSON.stringify({ title_ar: w.out.title_ar, received: w.out.received, received_ar: w.out.received_ar, proposal: w.out.proposal, proposal_ar: w.out.proposal_ar, options: w.out.options }) });
      await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'notify-loop', status: 'ok', finished_at: new Date().toISOString(), note: `task ${t.id} · ${MODEL} · in ${w.usage.input_tokens} out ${w.usage.output_tokens} · $${cost.toFixed(5)}` }) });
    }
    // the bell note (push-send carries it to the phone: emergencies at once, normal ones 08:00–22:00 Dubai)
    const fresh: Task[] = await sb(`tasks?select=id,kind,title,title_ar,received,proposal,options,client_id,platform,owner,priority,notified_at,source_table&id=eq.${t.id}`);
    const f = fresh[0];
    const cid = f.client_id ?? (await sb('clients?select=id&name=ilike.ZKJ%20SYSTEM&limit=1'))?.[0]?.id;
    if (cid) await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({
      client_id: cid, audience: 'admin', priority: f.priority === 'emergency' ? 'emergency' : 'normal',
      title: f.title, title_ar: (f as unknown as { title_ar?: string }).title_ar ?? f.title,
      body: [f.received, f.proposal ? 'Proposed: ' + f.proposal : ''].filter(Boolean).join(' — ').slice(0, 600) || 'Open Home to see it.',
      body_ar: null }) });
    await sb(`tasks?id=eq.${t.id}`, { method: 'PATCH', body: JSON.stringify({ notified_at: new Date().toISOString() }) });
    return json(200, { ok: true, wrote, cost });
  } catch (e) {
    const msg = (e as Error).message;
    await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'notify-loop', status: 'error', finished_at: new Date().toISOString(), note: msg.slice(0, 600) }) }).catch(() => null);
    return json(500, { ok: false, error: msg });
  }
});
