// Website enquiries: the system.zkjverse.com form posts here as well as to Formspree (email stays as it is).
// Saves the enquiry in public.site_enquiries and rings KJ's bell (notifications, audience admin) — KJ, 5 Nov 2026:
// "i have one new inquiry and no one updated me … yes add it".
// Public endpoint (verify_jwt off): only this site's origins, honeypot, size limits, no duplicate within 10 minutes,
// at most 5 a day from one email. Nothing is sent to the visitor from here.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ORIGINS = ['https://system.zkjverse.com', 'http://127.0.0.1:8765', 'http://localhost:8765'];

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
const clip = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const allow = ORIGINS.includes(origin) ? origin : ORIGINS[0];
  const cors = { 'Access-Control-Allow-Origin': allow, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type', Vary: 'Origin' };
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json(405, { ok: false });
  if (origin && !ORIGINS.includes(origin)) return json(403, { ok: false });
  try {
    const b = await req.json().catch(() => ({}));
    if (b._gotcha) return json(200, { ok: true }); // bot filled the hidden field
    const row = {
      name: clip(b.name, 120), business: clip(b.business, 160), country: clip(b.country, 80), phone: clip(b.phone, 40),
      email: clip(b.email, 160).toLowerCase(), tools: clip(b.tools, 600), platforms: clip(b.platforms, 400), package: clip(b.package, 40),
      message: clip(b.message, 4000), language: clip(b.language, 5), page: clip(b.page, 300),
    };
    if (row.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email)) return json(400, { ok: false, error: 'invalid' });
    const since10 = new Date(Date.now() - 10 * 60e3).toISOString(), since24 = new Date(Date.now() - 24 * 3600e3).toISOString();
    const recent: { message: string | null; created_at: string }[] = await sb(`site_enquiries?select=message,created_at&email=eq.${encodeURIComponent(row.email)}&created_at=gte.${since24}`);
    if (recent.some((r) => r.created_at >= since10 && (r.message ?? '') === row.message)) return json(200, { ok: true, duplicate: true });
    if (recent.length >= 5) return json(429, { ok: false, error: 'too many' });
    const saved = await sb('site_enquiries', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) });
    // the bell: notifications need a client; enquiries belong to the ZKJ SYSTEM business
    const cl: { id: string }[] = await sb('clients?select=id&name=ilike.ZKJ%20SYSTEM&limit=1').catch(() => []);
    if (cl?.[0]) {
      const who = [row.name, row.business, row.country].filter(Boolean).join(' · ');
      await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({
        client_id: cl[0].id, audience: 'admin',
        title: `New website enquiry: ${who}`.slice(0, 200), title_ar: `استفسار جديد من الموقع: ${who}`.slice(0, 200),
        body: (row.package ? `Package: ${row.package}. ` : '') + (row.message || 'No message.').slice(0, 300) + ' — Open Inbox → Enquiries.',
        body_ar: (row.message || 'بدون رسالة.').slice(0, 300) + ' — افتح الوارد ← الاستفسارات.' }) }).catch(() => null);
    }
    return json(200, { ok: true, id: saved?.[0]?.id ?? null });
  } catch (e) {
    console.error((e as Error).message);
    return json(500, { ok: false });
  }
});
