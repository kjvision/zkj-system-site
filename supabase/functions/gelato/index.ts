// GELATO (KJ 7 Nov 2026: "Saved it, connect now"): the print lab behind ZKJ VERSE Line A (paper prints up to 76x102 cm).
// The key is the Supabase secret GELATO_API_KEY (saved by KJ, never in chat or the repo).
// Actions (POST {"action": ...}), caller must be the service role (database / cron) or a signed-in admin:
//   ping                         → is the key good, how many catalogs
//   sizes                        → the poster formats Gelato offers (so sizes can be mapped once)
//   search {catalog, filters}    → raw product search
//   quote  {enquiry_id | size, country, file_url, qty, currency} → Gelato cost + delivery options, saved on the enquiry
//   order  {enquiry_id, shipment_method_uid} → places the order. ONLY after KJ said yes (tasks.answer = 'order').
// Nothing is ordered, charged or sent to a customer without KJ's yes (brand law).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
// The secret is expected as GELATO_API_KEY; if KJ saved it under another name that contains "gelato", that one is used.
const KEY_NAME = Deno.env.get('GELATO_API_KEY') ? 'GELATO_API_KEY' : (Object.keys(Deno.env.toObject()).find((k) => /gelato/i.test(k)) ?? '');
const GELATO = (KEY_NAME ? Deno.env.get(KEY_NAME) ?? '' : '').trim();
const PRODUCT_API = 'https://product.gelatoapis.com/v3';
const ORDER_API = 'https://order.gelatoapis.com/v4';
const CATALOG = 'posters';
// ZKJ VERSE ladder (3:4 upright). Store sizes → Gelato PaperFormat (filled by `sizes` once; fallback = metric names).
const SIZES: Record<string, string> = { '15x20': '150x200-mm', '21x28': '210x280-mm', '24x32': '240x320-mm', '30x40': '300x400-mm', '45x60': '450x600-mm', '60x80': '600x800-mm', '75x100': '750x1000-mm' };

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
async function gl(url: string, init: RequestInit = {}) {
  const r = await fetch(url, { ...init, headers: { 'X-API-KEY': GELATO, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const t = await r.text();
  let j: unknown = t; try { j = JSON.parse(t); } catch { /* text */ }
  if (!r.ok) throw new Error(`Gelato ${r.status}: ${typeof j === 'string' ? j.slice(0, 300) : JSON.stringify(j).slice(0, 300)}`);
  return j as Record<string, unknown>;
}
async function log(status: string, note: string) {
  await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'gelato', status, finished_at: new Date().toISOString(), note: note.slice(0, 600) }) }).catch(() => null);
}
// Who may call: the service role or a signed-in admin → everything. The database (triggers / cron, no key, like
// notify-loop) → only the read actions and a quote or order tied to an enquiry id; the order action is guarded again
// below by KJ's recorded yes and by "one order per enquiry".
async function allowed(req: Request, action: string, b: Record<string, unknown>) {
  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (bearer && bearer === SB_KEY) return true;
  if (bearer && bearer !== (Deno.env.get('SUPABASE_ANON_KEY') ?? '')) {
    const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${bearer}` } });
    if (r.ok) { const u = await r.json(); const p = await sb(`profiles?select=role&id=eq.${u.id}`); if (p?.[0]?.role === 'admin') return true; }
  }
  if (['ping', 'sizes', 'search'].includes(action)) return true;
  return ['quote', 'order'].includes(action) && /^[0-9a-f-]{36}$/.test(String(b.enquiry_id ?? ''));
}
const sizeKey = (s: string) => String(s ?? '').toLowerCase().replace(/\s|cm/g, '').replace(/[×x]/, 'x');

async function findProduct(size: string) {
  const fmt = SIZES[sizeKey(size)];
  if (!fmt) throw new Error(`size ${size} is not on the ladder`);
  const res = await gl(`${PRODUCT_API}/catalogs/${CATALOG}/products:search`, { method: 'POST', body: JSON.stringify({ attributeFilters: { Orientation: ['ver'], PaperFormat: [fmt] }, limit: 20 }) });
  const list = (res.products as { productUid: string; attributes: Record<string, string> }[]) ?? [];
  // prefer the museum-quality matte fine-art paper KJ chose (BUILD_BOOK 06), else the first active product
  const pick = list.find((p) => /museum|fine-art|matte/i.test(JSON.stringify(p.attributes))) ?? list[0];
  if (!pick) throw new Error(`no Gelato poster for ${fmt}`);
  return pick;
}

Deno.serve(async (req) => {
  const json = (s: number, b: unknown) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return json(405, { ok: false });
  const b = await req.json().catch(() => ({}));
  const action = String(b.action ?? '');
  if (!(await allowed(req, action, b))) return json(401, { ok: false, error: 'admin only' });
  if (!GELATO) { await log('error', 'GELATO_API_KEY secret is missing'); return json(500, { ok: false, error: 'GELATO_API_KEY secret is missing', secrets_seen: Object.keys(Deno.env.toObject()).filter((k) => !/^(SUPABASE_|DENO_|HOME|PATH|SB_)/.test(k)) }); }
  try {
    if (action === 'ping') {
      const c = await gl(`${PRODUCT_API}/catalogs`);
      const n = Array.isArray(c) ? c.length : (c.data as unknown[])?.length ?? 0;
      await log('ok', `ping: key works, ${n} catalogs`);
      return json(200, { ok: true, catalogs: n, names: (Array.isArray(c) ? c : (c.data as unknown[]) ?? []).map((x) => (x as { catalogUid: string }).catalogUid) });
    }
    if (action === 'sizes') {
      const c = await gl(`${PRODUCT_API}/catalogs/${CATALOG}`);
      const attrs = (c.productAttributes as { productAttributeUid: string; values: { productAttributeValueUid: string; title: string }[] }[]) ?? [];
      const out: Record<string, string[]> = {};
      for (const a of attrs) out[a.productAttributeUid] = a.values.map((v) => v.productAttributeValueUid);
      return json(200, { ok: true, attributes: out });
    }
    if (action === 'search') {
      const res = await gl(`${PRODUCT_API}/catalogs/${b.catalog ?? CATALOG}/products:search`, { method: 'POST', body: JSON.stringify({ attributeFilters: b.filters ?? {}, limit: Math.min(Number(b.limit ?? 20), 100) }) });
      return json(200, { ok: true, products: res.products, hits: res.hits });
    }
    if (action === 'quote') {
      let e: Record<string, string> | null = null;
      if (b.enquiry_id) e = (await sb(`site_enquiries?select=*&id=eq.${b.enquiry_id}`))?.[0] ?? null;
      const size = String(b.size ?? e?.package ?? '');
      const country = String(b.country ?? e?.country ?? '').trim().toUpperCase().slice(0, 2);
      const fileUrl = String(b.file_url ?? '');
      if (!size || country.length !== 2) return json(400, { ok: false, error: 'size and 2-letter country needed' });
      const p = await findProduct(size);
      const q = await gl(`${ORDER_API}/orders:quote`, { method: 'POST', body: JSON.stringify({
        orderReferenceId: `quote-${b.enquiry_id ?? Date.now()}`, customerReferenceId: e?.email ?? 'zkj-verse', currency: String(b.currency ?? 'USD'), allowMultipleQuotes: false,
        recipient: { country, firstName: e?.name ?? 'Client', lastName: '-', addressLine1: '-', city: '-', postCode: '-', email: e?.email ?? 'hello@zkjverse.com' },
        products: [{ itemReferenceId: 'art-1', productUid: p.productUid, quantity: Number(b.qty ?? 1), files: fileUrl ? [{ type: 'default', url: fileUrl }] : [] }],
      }) });
      const quotes = (q.quotes as Record<string, unknown>[]) ?? [];
      const q0 = quotes[0] ?? {};
      const prod = ((q0.products as Record<string, unknown>[]) ?? [])[0] ?? {};
      const ships = ((q0.shipmentMethods as Record<string, unknown>[]) ?? []).map((s) => ({ uid: s.shipmentMethodUid, name: s.name, price: s.price, currency: s.currency, days: `${s.minDeliveryDays}–${s.maxDeliveryDays}`, type: s.type }));
      const out = { productUid: p.productUid, product_price: prod.price, currency: prod.currency ?? b.currency ?? 'USD', fulfillment_country: q0.fulfillmentCountry, shipping: ships, quoted_at: new Date().toISOString() };
      if (e) await sb(`site_enquiries?id=eq.${e.id}`, { method: 'PATCH', body: JSON.stringify({ note: `${e.note ? e.note + '\n' : ''}Gelato quote ${out.quoted_at.slice(0, 10)}: print ${out.product_price} ${out.currency}, ship from ${out.fulfillment_country}: ${ships.map((s) => `${s.name} ${s.price} (${s.days} days)`).join(' · ')}` }) });
      await log('ok', `quote ${size} → ${country}: ${out.product_price} ${out.currency} + shipping from ${out.fulfillment_country}`);
      return json(200, { ok: true, quote: out });
    }
    // Control point path (KJ 7 Nov): the store order is paid, the address came from the store checkout, the print file is
    // the master KJ dropped once. Service role only (store-control calls it); nothing a browser can reach.
    if (action === 'order_direct') {
      const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
      if (bearer !== SB_KEY) return json(401, { ok: false, error: 'service only' });
      const a = (b.address ?? {}) as Record<string, string>;
      for (const k of ['firstName', 'lastName', 'addressLine1', 'city', 'postCode', 'country', 'email']) if (!a[k]) return json(400, { ok: false, error: `address.${k} missing` });
      if (!b.file_url || !b.size) return json(400, { ok: false, error: 'file_url and size needed' });
      const p = await findProduct(String(b.size));
      const o = await gl(`${ORDER_API}/orders`, { method: 'POST', body: JSON.stringify({
        orderType: 'order', orderReferenceId: String(b.ref ?? `zkj-${Date.now()}`), customerReferenceId: a.email, currency: String(b.currency ?? 'USD'),
        items: [{ itemReferenceId: 'art-1', productUid: p.productUid, quantity: Number(b.qty ?? 1), files: [{ type: 'default', url: b.file_url }] }],
        shipmentMethodUid: String(b.shipment_method_uid ?? 'normal'), shippingAddress: a,
      }) });
      await log('ok', `order_direct ${o.id} · ${b.ref ?? ''} · ${p.productUid} → ${a.country}`);
      return json(200, { ok: true, order_id: o.id, status: o.fulfillmentStatus, productUid: p.productUid });
    }
    if (action === 'status') {
      const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
      if (bearer !== SB_KEY) return json(401, { ok: false, error: 'service only' });
      const o = await gl(`${ORDER_API}/orders/${b.gelato_order_id}`);
      const sh = (o.shipment as Record<string, unknown>) ?? {};
      const pk = ((sh.packages as Record<string, unknown>[]) ?? [])[0] ?? {};
      return json(200, { ok: true, status: o.fulfillmentStatus, financial: o.financialStatus, tracking_url: pk.trackingUrl ?? null, tracking_code: pk.trackingCode ?? null, carrier: sh.shipmentMethodName ?? null, min_date: sh.minDeliveryDate ?? null, max_date: sh.maxDeliveryDate ?? null });
    }
    if (action === 'order') {
      // Guard: KJ's yes must be on the job first (tasks.answer = 'order'), and the enquiry must carry a full address.
      const t = (await sb(`tasks?select=id,answer,source_id&source_table=eq.site_enquiries&source_id=eq.${b.enquiry_id}&order=answered_at.desc&limit=1`))?.[0];
      if (!t || t.answer !== 'order') { await log('skipped', `order refused: no KJ yes on enquiry ${b.enquiry_id}`); return json(403, { ok: false, error: 'KJ has not said yes on this job' }); }
      const enq = (await sb(`site_enquiries?select=id,note&id=eq.${b.enquiry_id}`))?.[0];
      if (!enq) return json(404, { ok: false, error: 'enquiry not found' });
      if (/Gelato order /.test(enq.note ?? '')) { await log('skipped', `order refused: enquiry ${b.enquiry_id} already has an order`); return json(409, { ok: false, error: 'already ordered' }); }
      const a = b.address ?? {};
      for (const k of ['firstName', 'lastName', 'addressLine1', 'city', 'postCode', 'country', 'email']) if (!a[k]) return json(400, { ok: false, error: `address.${k} missing` });
      if (!b.file_url || !b.size) return json(400, { ok: false, error: 'file_url and size needed' });
      const p = await findProduct(String(b.size));
      const o = await gl(`${ORDER_API}/orders`, { method: 'POST', body: JSON.stringify({
        orderType: 'order', orderReferenceId: `zkj-${b.enquiry_id}`, customerReferenceId: a.email, currency: String(b.currency ?? 'USD'),
        items: [{ itemReferenceId: 'art-1', productUid: p.productUid, quantity: Number(b.qty ?? 1), files: [{ type: 'default', url: b.file_url }] }],
        shipmentMethodUid: b.shipment_method_uid ?? 'normal', shippingAddress: a,
      }) });
      await sb(`site_enquiries?id=eq.${b.enquiry_id}`, { method: 'PATCH', body: JSON.stringify({ status: 'won', note: `Gelato order ${o.id} placed ${new Date().toISOString().slice(0, 16)} · ${o.fulfillmentStatus}` }) });
      await log('ok', `order ${o.id} for enquiry ${b.enquiry_id}`);
      return json(200, { ok: true, order_id: o.id, status: o.fulfillmentStatus });
    }
    return json(400, { ok: false, error: 'unknown action' });
  } catch (e) {
    const msg = (e as Error).message;
    await log('error', msg);
    return json(500, { ok: false, error: msg });
  }
});
