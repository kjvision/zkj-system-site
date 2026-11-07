// STORE CONTROL POINT (KJ 7 Nov 2026): "I will receive the enquiry, I manage the payment with the customer, then I press
// go ahead and you continue all the work from there."
// Flow: art enquiry (site_enquiries) → KJ taps "Send the invoice" → a Shopify draft order for that piece and size, invoice
// sent to the customer → the customer pays in the store checkout and writes the delivery address there → Shopify creates
// the order → the Gelato app (connected on the store, fulfillment service "gelato") prints and ships with KJ's branding →
// this function watches the order every 10 minutes and tells KJ: paid · at the lab · shipped (tracking) · needs attention.
// Needs the Supabase secret SHOPIFY_ADMIN_TOKEN (custom app: write_draft_orders, read_orders, read_products,
// read_merchant_managed_fulfillment_orders, read_third_party_fulfillment_orders). KJ saves it in Supabase, never in chat.
// Actions (POST {"action": ...}):
//   invoice {enquiry_id, amount?}  admin or service role → draft order + invoice. Nothing is sent without this tap.
//   sync                            cron (no key) → stage changes + bell notes.
//   ping                            is the token there, which shop
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SHOP = (Deno.env.get('SHOPIFY_SHOP') ?? 'p3f801-9a.myshopify.com').trim();
const TOKEN = (Deno.env.get('SHOPIFY_ADMIN_TOKEN') ?? '').trim();
const API = `https://${SHOP}/admin/api/2026-10/graphql.json`;
const LAB = 'gelato';

type J = Record<string, unknown>;
async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
async function gql(query: string, variables: J = {}) {
  const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN }, body: JSON.stringify({ query, variables }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.errors) throw new Error(`Shopify ${r.status}: ${JSON.stringify(j.errors ?? j).slice(0, 300)}`);
  return j.data as J;
}
async function log(status: string, note: string) {
  await sb('sync_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job: 'store-control', status, finished_at: new Date().toISOString(), note: note.slice(0, 600) }) }).catch(() => null);
}
async function bell(title: string, title_ar: string, body: string, priority = 'normal') {
  const cl = (await sb('clients?select=id&name=ilike.ZKJ%20VERSE&limit=1').catch(() => []))?.[0] ?? (await sb('clients?select=id&name=ilike.ZKJ%20SYSTEM&limit=1'))?.[0];
  if (!cl) return;
  await sb('notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: cl.id, audience: 'admin', priority, title: title.slice(0, 200), title_ar: title_ar.slice(0, 200), body: body.slice(0, 600), body_ar: null }) }).catch(() => null);
}
async function allowed(req: Request, action: string) {
  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (bearer && bearer === SB_KEY) return true;
  if (bearer && bearer !== (Deno.env.get('SUPABASE_ANON_KEY') ?? '')) {
    const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${bearer}` } });
    if (r.ok) { const u = await r.json(); const p = await sb(`profiles?select=role&id=eq.${u.id}`); if (p?.[0]?.role === 'admin') return true; }
  }
  return ['sync', 'ping'].includes(action);
}
const field = (m: string, k: string) => { const r = new RegExp(k + ': ([^·]+)', 'i').exec(m || ''); return r ? r[1].trim() : ''; };
const sizeKey = (s: string) => { const m = s.toLowerCase().replace(/\s|cm/g, '').replace(/×/g, 'x').match(/(\d{2,3})x(\d{2,3})/); return m ? `${m[1]}x${m[2]}` : ''; };

// the piece and the size → the Shopify variant (by handle from the enquiry page, else by title)
async function findVariant(e: J) {
  const page = String(e.page ?? ''); const msg = String(e.message ?? '');
  const handle = (/[?&]h=([a-z0-9-]+)/i.exec(page) ?? [])[1] ?? '';
  const artwork = field(msg, 'Artwork') || decodeURIComponent((/[?&]artwork=([^&]+)/.exec(page) ?? [])[1] ?? '').replace(/\+/g, ' ');
  const size = sizeKey(field(msg, 'Size') || String(e.package ?? ''));
  if (!artwork && !handle) throw new Error('the enquiry does not name a piece');
  const q = handle ? `handle:${handle}` : `title:'${artwork.replace(/'/g, '')}'`;
  const d = await gql(`query($q:String!){ products(first:1, query:$q){ nodes{ id title handle variants(first:10){ nodes{ id title sku price } } } } }`, { q });
  const p = ((d.products as J).nodes as J[])[0];
  if (!p) throw new Error(`piece not found in the store: ${artwork || handle}`);
  const vs = (p.variants as J).nodes as J[];
  const v = vs.find((x) => sizeKey(String(x.title)) === size) ?? (vs.length === 1 ? vs[0] : null);
  if (!v) throw new Error(`size ${size || '(none)'} is not a variant of ${p.title}`);
  return { product: p, variant: v, artwork: String(p.title), size: String(v.title) };
}

async function invoice(b: J) {
  const e = (await sb(`site_enquiries?select=*&id=eq.${b.enquiry_id}`))?.[0];
  if (!e) throw new Error('enquiry not found');
  const dup = (await sb(`art_orders?select=id,stage,draft_order_name&enquiry_id=eq.${e.id}&stage=neq.cancelled&limit=1`))?.[0];
  if (dup) throw new Error(`an invoice already exists for this enquiry (${dup.draft_order_name ?? dup.stage})`);
  const f = await findVariant(e);
  const listPrice = Number(f.variant.price);
  const amount = b.amount != null && Number(b.amount) > 0 ? Number(b.amount) : listPrice;
  const input: J = {
    email: e.email, note: `ZKJ VERSE · enquiry ${e.id} · ${f.artwork} · ${f.size}`, tags: ['zkj-dashboard', 'art-enquiry'],
    customAttributes: [{ key: 'enquiry', value: String(e.id) }],
    lineItems: [{ variantId: f.variant.id, quantity: 1 }],
  };
  if (amount < listPrice) input.appliedDiscount = { value: listPrice - amount, valueType: 'FIXED_AMOUNT', description: 'Agreed price' };
  const c = await gql(`mutation($input: DraftOrderInput!){ draftOrderCreate(input:$input){ draftOrder{ id name invoiceUrl totalPriceSet{ shopMoney{ amount currencyCode } } } userErrors{ field message } } }`, { input });
  const dc = c.draftOrderCreate as J; const ue = dc.userErrors as J[];
  if (ue?.length) throw new Error('Shopify: ' + ue.map((u) => u.message).join('; '));
  const d = dc.draftOrder as J;
  const s = await gql(`mutation($id: ID!){ draftOrderInvoiceSend(id:$id){ draftOrder{ id invoiceSentAt } userErrors{ field message } } }`, { id: d.id });
  const se = (s.draftOrderInvoiceSend as J).userErrors as J[];
  if (se?.length) throw new Error('Shopify invoice: ' + se.map((u) => u.message).join('; '));
  const money = (d.totalPriceSet as J).shopMoney as J;
  const row = await sb('art_orders', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({
    enquiry_id: e.id, artwork: f.artwork, size: f.size, product_id: f.product.id, variant_id: f.variant.id,
    amount: Number(money.amount), currency: money.currencyCode, customer_email: e.email, customer_name: e.name,
    draft_order_id: d.id, draft_order_name: d.name, invoice_url: d.invoiceUrl, invoice_sent_at: new Date().toISOString(), stage: 'invoice_sent',
    note: amount < listPrice ? `agreed price ${amount} (list ${listPrice})` : null }) });
  await sb(`site_enquiries?id=eq.${e.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'contacted', note: `${e.note ? e.note + '\n' : ''}Invoice ${d.name} sent ${new Date().toISOString().slice(0, 16)} · ${money.amount} ${money.currencyCode}` }) });
  await log('ok', `invoice ${d.name} · ${f.artwork} · ${f.size} · ${money.amount} ${money.currencyCode} → ${e.email}`);
  return { ok: true, order: row?.[0], invoice_url: d.invoiceUrl, name: d.name };
}

async function sync() {
  const rows: J[] = await sb(`art_orders?select=*&stage=in.(invoice_sent,paid,at_lab,shipped)&order=created_at.asc&limit=50`);
  const out: string[] = [];
  for (const o of rows) {
    try {
      const d = await gql(`query($id: ID!){ draftOrder(id:$id){ status order{ id name displayFinancialStatus displayFulfillmentStatus cancelledAt
        fulfillmentOrders(first:5){ nodes{ status assignedLocation{ name } fulfillmentService{ handle serviceName } } }
        fulfillments(first:5){ nodes{ status createdAt deliveredAt trackingInfo{ url company number } } } } } }`, { id: o.draft_order_id });
      const dr = d.draftOrder as J | null; const ord = (dr?.order ?? null) as J | null;
      const patch: J = { last_checked_at: new Date().toISOString() };
      let stage = String(o.stage);
      if (ord) {
        patch.order_id = ord.id; patch.order_name = ord.name;
        if (ord.cancelledAt) stage = 'cancelled';
        else {
          if (/PAID/.test(String(ord.displayFinancialStatus)) && stage === 'invoice_sent') { stage = 'paid'; patch.paid_at = new Date().toISOString(); }
          const fos = ((ord.fulfillmentOrders as J).nodes as J[]) ?? [];
          const lab = fos.find((x) => String(((x.fulfillmentService as J) ?? {}).handle ?? '').toLowerCase() === LAB);
          if (lab) { patch.fulfillment_service = LAB; if (stage === 'paid') stage = 'at_lab'; }
          const fs = ((ord.fulfillments as J).nodes as J[]) ?? [];
          const f = fs.find((x) => /SUCCESS|OPEN|IN_TRANSIT/i.test(String(x.status))) ?? fs[0];
          if (f) {
            const t = ((f.trackingInfo as J[]) ?? [])[0];
            if (t?.url) { patch.tracking_url = t.url; patch.tracking_company = t.company; }
            if (['paid', 'at_lab'].includes(stage)) { stage = 'shipped'; patch.shipped_at = f.createdAt; }
            if (f.deliveredAt) { stage = 'delivered'; patch.delivered_at = f.deliveredAt; }
          }
          // paid for a day and no lab took it → KJ must connect the piece in the Gelato app
          if (stage === 'paid' && patch.paid_at == null && o.paid_at && Date.now() - new Date(String(o.paid_at)).getTime() > 86400e3 && !lab) stage = 'attention';
        }
      }
      if (stage !== o.stage) {
        patch.stage = stage;
        const who = `${o.artwork} · ${o.size} · ${o.customer_name ?? o.customer_email}`;
        const say: Record<string, [string, string, string, string?]> = {
          paid: [`Paid · ${ord?.name ?? ''} · ${who}`, `تم الدفع · ${ord?.name ?? ''} · ${who}`, `${o.amount} ${o.currency} received in the store. Gelato takes it from here.`],
          at_lab: [`At the lab · ${who}`, `في المعمل · ${who}`, `Gelato has the order ${ord?.name ?? ''}.`],
          shipped: [`Shipped · ${who}`, `شُحن · ${who}`, `${patch.tracking_company ?? 'Carrier'} ${patch.tracking_url ? patch.tracking_url : ''}`.trim()],
          delivered: [`Delivered · ${who}`, `سُلِّم · ${who}`, `Order ${ord?.name ?? ''} delivered.`],
          cancelled: [`Cancelled in the store · ${who}`, `أُلغي في المتجر · ${who}`, `Order ${ord?.name ?? ''} was cancelled.`],
          attention: [`Nobody is printing ${ord?.name ?? ''} · ${who}`, `لا أحد يطبع ${ord?.name ?? ''} · ${who}`, `Paid a day ago and no lab picked it up. Connect "${o.artwork}" to Gelato in the Gelato app, then it goes by itself.`, 'emergency'],
        };
        const s = say[stage]; if (s) await bell(s[0], s[1], s[2], s[3] ?? 'normal');
        if (stage === 'attention') await sb('tasks', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ kind: 'store', source_table: 'art_orders', source_id: String(o.id), title: `Connect "${o.artwork}" to Gelato · order ${ord?.name ?? ''} is paid and waiting`, platform: 'shopify', received: say.attention[2], owner: 'VRS-STORE', priority: 'normal', status: 'open' }) }).catch(() => null);
        out.push(`${o.draft_order_name}: ${o.stage} → ${stage}`);
      }
      await sb(`art_orders?id=eq.${o.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    } catch (e) { out.push(`${o.draft_order_name}: ${(e as Error).message}`); }
  }
  if (rows.length) await log('ok', `sync ${rows.length} orders · ${out.join(' · ') || 'no change'}`);
  return { ok: true, checked: rows.length, changes: out };
}

Deno.serve(async (req) => {
  const json = (s: number, b: unknown) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return json(405, { ok: false });
  const b = await req.json().catch(() => ({}));
  const action = String(b.action ?? 'sync');
  if (!(await allowed(req, action))) return json(401, { ok: false, error: 'admin only' });
  if (!TOKEN) { await log('error', 'SHOPIFY_ADMIN_TOKEN secret is missing'); return json(500, { ok: false, error: 'SHOPIFY_ADMIN_TOKEN secret is missing' }); }
  try {
    if (action === 'ping') { const d = await gql(`{ shop { name myshopifyDomain currencyCode } }`); return json(200, { ok: true, shop: d.shop }); }
    if (action === 'invoice') return json(200, await invoice(b));
    if (action === 'sync') return json(200, await sync());
    return json(400, { ok: false, error: 'unknown action' });
  } catch (e) {
    const msg = (e as Error).message; await log('error', msg); return json(500, { ok: false, error: msg });
  }
});
