// Website enquiries: the system.zkjverse.com form posts here as well as to Formspree (email stays as it is).
// Saves the enquiry in public.site_enquiries and rings KJ's bell (notifications, audience admin) — KJ, 5 Nov 2026:
// "i have one new inquiry and no one updated me … yes add it".
// 7 Nov 2026 (KJ: "connect gelato and start working for any one is enquiry"): the ZKJ VERSE store form (zkjverse.com/pages/enquire)
// sends a copy here too. For a store enquiry with a ladder size and a known country, Gelato is asked for the print cost and
// delivery options first; that quote is saved in the note, so the job KJ sees carries the cost. Nothing is ordered here.
// Public endpoint (verify_jwt off): only our origins, honeypot, size limits, no duplicate within 10 minutes,
// at most 5 a day from one email. Nothing is sent to the visitor from here.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ORIGINS = ['https://system.zkjverse.com', 'https://zkjverse.com', 'https://www.zkjverse.com', 'https://p3f801-9a.myshopify.com', 'http://127.0.0.1:8765', 'http://localhost:8765'];
// Country as people write it → ISO code Gelato needs. Unknown → no quote (never guessed).
const ISO: Record<string, string> = { uae: 'AE', 'united arab emirates': 'AE', emirates: 'AE', dubai: 'AE', 'abu dhabi': 'AE', 'saudi arabia': 'SA', ksa: 'SA', saudi: 'SA', qatar: 'QA', kuwait: 'KW', bahrain: 'BH', oman: 'OM', uk: 'GB', 'united kingdom': 'GB', england: 'GB', usa: 'US', 'united states': 'US', us: 'US', canada: 'CA', germany: 'DE', france: 'FR', spain: 'ES', italy: 'IT', netherlands: 'NL', switzerland: 'CH', australia: 'AU', india: 'IN', egypt: 'EG', morocco: 'MA', iraq: 'IQ', jordan: 'JO', lebanon: 'LB', turkey: 'TR', japan: 'JP', singapore: 'SG' };
const LADDER = /^(15x20|21x28|24x32|30x40|45x60|60x80|75x100)$/;

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}
const clip = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);
const sizeKey = (s: string) => { const m = s.toLowerCase().replace(/\s|cm/g, '').replace(/×/g, 'x').match(/(\d{2,3})x(\d{2,3})/); return m ? `${m[1]}x${m[2]}` : ''; };

async function gelatoQuote(size: string, country: string) {
  const r = await fetch(`${SB_URL}/functions/v1/gelato`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SB_KEY}` }, body: JSON.stringify({ action: 'quote', size, country, currency: 'USD' }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) return `Gelato: no quote (${j.error ?? r.status})`;
  const q = j.quote;
  const ships = (q.shipping ?? []).map((s: { name: string; price: number; days: string }) => `${s.name} ${s.price} (${s.days} days)`).join(' · ');
  return `Gelato quote: print ${q.product_price} ${q.currency}, ships from ${q.fulfillment_country}: ${ships || 'no shipping option'}`;
}

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
    const row: Record<string, string | null> = {
      name: clip(b.name, 120), business: clip(b.business, 160), country: clip(b.country, 80), phone: clip(b.phone, 40),
      email: clip(b.email, 160).toLowerCase(), tools: clip(b.tools, 600), platforms: clip(b.platforms, 400), package: clip(b.package, 40),
      message: clip(b.message, 4000), language: clip(b.language, 5), page: clip(b.page, 300), note: null,
    };
    if ((row.name ?? '').length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email ?? '')) return json(400, { ok: false, error: 'invalid' });
    const since10 = new Date(Date.now() - 10 * 60e3).toISOString(), since24 = new Date(Date.now() - 24 * 3600e3).toISOString();
    const recent: { message: string | null; created_at: string }[] = await sb(`site_enquiries?select=message,created_at&email=eq.${encodeURIComponent(row.email ?? '')}&created_at=gte.${since24}`);
    if (recent.some((r) => r.created_at >= since10 && (r.message ?? '') === row.message)) return json(200, { ok: true, duplicate: true });
    if (recent.length >= 5) return json(429, { ok: false, error: 'too many' });
    // store enquiry → ask Gelato for the cost before the job is created (so the job text carries it)
    const isStore = /zkjverse\.com\/pages\//i.test(row.page ?? '') || /ZKJ VERSE store/i.test(row.business ?? '');
    const size = sizeKey(row.package ?? '');
    const iso = ISO[(row.country ?? '').toLowerCase().trim()] ?? ((row.country ?? '').length === 2 ? (row.country ?? '').toUpperCase() : '');
    if (isStore && iso === 'AE') {
      row.note = 'UAE enquiry: no quote, no sale before the licence (DECISIONS 31, rule 27).';
    } else if (isStore) {
      row.note = LADDER.test(size) && iso ? await gelatoQuote(size, iso).catch((e) => `Gelato: no quote (${(e as Error).message})`) : `Gelato: no quote (${!LADDER.test(size) ? 'size not on the ladder' : 'country not recognised'})`;
    }
    const saved = await sb('site_enquiries', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) });
    // the bell: notifications need a client; enquiries belong to the ZKJ SYSTEM business
    const cl: { id: string }[] = await sb('clients?select=id&name=ilike.ZKJ%20SYSTEM&limit=1').catch(() => []);
    if (cl?.[0]) {
      const who = [row.name, row.business, row.country].filter(Boolean).join(' · ');
      const head = isStore ? 'New art enquiry' : 'New website enquiry';
      await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({
        client_id: cl[0].id, audience: 'admin',
        title: `${head}: ${who}`.slice(0, 200), title_ar: `${isStore ? 'استفسار فني جديد' : 'استفسار جديد من الموقع'}: ${who}`.slice(0, 200),
        body: (row.package ? `${isStore ? 'Size' : 'Package'}: ${row.package}. ` : '') + (row.message || 'No message.').slice(0, 300) + (row.note ? ` — ${row.note}` : '') + ' — Open Home.',
        body_ar: (row.message || 'بدون رسالة.').slice(0, 300) + ' — افتح الرئيسية.' }) }).catch(() => null);
    }
    return json(200, { ok: true, id: saved?.[0]?.id ?? null });
  } catch (e) {
    console.error((e as Error).message);
    return json(500, { ok: false });
  }
});
