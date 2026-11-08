// STORE CONTROL POINT (KJ 7 Nov 2026): "I will receive the enquiry, I manage the payment with the customer, then I press
// go ahead and you continue all the work from there."
// Flow: art enquiry (site_enquiries) → KJ taps "Send the invoice" → a Shopify draft order for that piece and size, invoice
// sent to the customer → the customer pays in the store checkout and writes the delivery address there → Shopify creates
// the order → this function reads the paid order and the address from the store, takes the print file KJ dropped once
// (private bucket "prints", signed link for 7 days) and places the print with Gelato through its API (gelato → order_direct).
// Then every 10 minutes it asks Gelato where the print is, writes the tracking onto the Shopify order (the customer gets the
// store's shipping email) and tells KJ: paid · at the lab · shipped · delivered · needs attention. No Gelato app, no Gelato dashboard.
// Needs the Supabase secrets SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (Dev Dashboard app "ZKJ dashboard", scopes write_draft_orders,
// read_orders, read_products, read_merchant_managed_fulfillment_orders, write_merchant_managed_fulfillment_orders, write_fulfillments),
// or an old-style SHOPIFY_ADMIN_TOKEN. KJ saves them in Supabase, never in chat.
// Actions (POST {"action": ...}):
//   invoice {enquiry_id, amount?}  admin or service role → draft order + invoice. Nothing is sent without this tap.
//   sync                            cron (no key) → stage changes + bell notes.
//   ping                            is the token there, which shop
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SHOP = (Deno.env.get('SHOPIFY_SHOP') ?? 'p3f801-9a.myshopify.com').trim();
const API = `https://${SHOP}/admin/api/2026-10/graphql.json`;
// Two ways in: a fixed Admin API token (old custom apps), or the Dev Dashboard app's client id + secret (KJ, 8 Nov 2026):
// the function then mints a 24-hour access token itself (client credentials grant) and keeps it in app_settings.
const FIXED = (Deno.env.get('SHOPIFY_ADMIN_TOKEN') ?? '').trim();
const CID = (Deno.env.get('SHOPIFY_CLIENT_ID') ?? '').trim();
const CSECRET = (Deno.env.get('SHOPIFY_CLIENT_SECRET') ?? '').trim();
type J = Record<string, unknown>;
let TOKEN = FIXED;
async function token(): Promise<string> {
  if (FIXED) return FIXED;
  if (!CID || !CSECRET) return '';
  const raw = (await sb('app_settings?select=value&key=eq.shopify_token&limit=1').catch(() => []))?.[0]?.value;
  let saved: J | null = null; try { saved = raw ? JSON.parse(String(raw)) : null; } catch { saved = null; }
  if (saved && saved.exp && Date.now() < Number(saved.exp) - 10 * 60e3 && saved.t) return String(saved.t);
  const r = await fetch(`https://${SHOP}/admin/oauth/access_token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: CID, client_secret: CSECRET, grant_type: 'client_credentials' }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`Shopify token: ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  const v = { t: j.access_token, exp: Date.now() + Number(j.expires_in ?? 86400) * 1000, scope: j.scope };
  await sb('app_settings', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ key: 'shopify_token', value: JSON.stringify(v), updated_at: new Date().toISOString() }) }).catch(() => null);
  return String(j.access_token);
}

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
async function gql(query: string, variables: J = {}) {
  if (!TOKEN) TOKEN = await token();
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
async function allowed(req: Request, action: string, b: J) {
  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (bearer && bearer === SB_KEY) return true;
  if (bearer && bearer !== (Deno.env.get('SUPABASE_ANON_KEY') ?? '')) {
    const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${bearer}` } });
    if (r.ok) { const u = await r.json(); const p = await sb(`profiles?select=role&id=eq.${u.id}`); if (p?.[0]?.role === 'admin') return true; }
  }
  if (['sync', 'ping'].includes(action)) return true;
  // the live check (KJ 8 Nov): an invoice to KJ's own address may be started from the database without a key;
  // a customer's invoice never can.
  if (action === 'invoice' && /^[0-9a-f-]{36}$/.test(String(b.enquiry_id ?? ''))) {
    const e = (await sb(`site_enquiries?select=email&id=eq.${b.enquiry_id}`).catch(() => []))?.[0];
    return !!e && /@zkjverse\.com$/i.test(String(e.email ?? ''));
  }
  return false;
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
    enquiry_id: e.id, artwork: f.artwork, size: f.size, product_id: f.product.id, variant_id: f.variant.id, handle: f.product.handle,
    amount: Number(money.amount), currency: money.currencyCode, customer_email: e.email, customer_name: e.name,
    draft_order_id: d.id, draft_order_name: d.name, invoice_url: d.invoiceUrl, invoice_sent_at: new Date().toISOString(), stage: 'invoice_sent',
    note: amount < listPrice ? `agreed price ${amount} (list ${listPrice})` : null }) });
  await sb(`site_enquiries?id=eq.${e.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'contacted', note: `${e.note ? e.note + '\n' : ''}Invoice ${d.name} sent ${new Date().toISOString().slice(0, 16)} · ${money.amount} ${money.currencyCode}` }) });
  await log('ok', `invoice ${d.name} · ${f.artwork} · ${f.size} · ${money.amount} ${money.currencyCode} → ${e.email}`);
  return { ok: true, order: row?.[0], invoice_url: d.invoiceUrl, name: d.name };
}

async function signedFile(path: string) {
  const r = await fetch(`${SB_URL}/storage/v1/object/sign/prints/${path}`, { method: 'POST', headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 7 * 86400 }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.signedURL) throw new Error(`signed link failed: ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  return `${SB_URL}/storage/v1${j.signedURL}`;
}
async function gelato(body: J) {
  const r = await fetch(`${SB_URL}/functions/v1/gelato`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SB_KEY}` }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(`Gelato: ${j.error ?? r.status}`);
  return j as J;
}
async function openJob(kind: string, table: string, id: string, title: string, received: string, options: J[]) {
  const dup = (await sb(`tasks?select=id&source_table=eq.${table}&source_id=eq.${encodeURIComponent(id)}&status=eq.open&limit=1`))?.[0];
  if (dup) return;
  const cl = (await sb('clients?select=id&name=ilike.ZKJ%20VERSE&limit=1').catch(() => []))?.[0];
  await sb('tasks', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ kind, source_table: table, source_id: id, title, received, options, client_id: cl?.id ?? null, platform: 'shopify', owner: 'VRS-STORE', priority: 'normal', status: 'open' }) }).catch(() => null);
}
async function closeJob(table: string, id: string) {
  await sb(`tasks?source_table=eq.${table}&source_id=eq.${encodeURIComponent(id)}&status=eq.open`, { method: 'PATCH', body: JSON.stringify({ status: 'done', done_at: new Date().toISOString(), answer: 'auto' }) }).catch(() => null);
}

async function sync() {
  const rows: J[] = await sb(`art_orders?select=*&stage=in.(invoice_sent,paid,attention,at_lab,shipped)&order=created_at.asc&limit=50`);
  const out: string[] = [];
  for (const o of rows) {
    try {
      const patch: J = { last_checked_at: new Date().toISOString() };
      let stage = String(o.stage);
      const who = `${o.artwork} · ${o.size} · ${o.customer_name ?? o.customer_email}`;
      const say = async (k: string, extra = '') => {
        const m: Record<string, [string, string, string, string?]> = {
          paid: [`Paid · ${patch.order_name ?? o.order_name ?? ''} · ${who}`, `تم الدفع · ${patch.order_name ?? o.order_name ?? ''} · ${who}`, `${o.amount} ${o.currency} received in the store. ${extra}`],
          need_file: [`Drop the print file · ${o.artwork}`, `أسقط ملف الطباعة · ${o.artwork}`, `${patch.order_name ?? o.order_name ?? ''} is paid and waiting for the master file of "${o.artwork}". Drop it once in the job; every future order uses it.`],
          at_lab: [`At the lab · ${who}`, `في المعمل · ${who}`, `Gelato has it. ${extra}`],
          shipped: [`Shipped · ${who}`, `شُحن · ${who}`, extra],
          delivered: [`Delivered · ${who}`, `سُلِّم · ${who}`, `${o.order_name ?? ''} delivered.`],
          cancelled: [`Cancelled in the store · ${who}`, `أُلغي في المتجر · ${who}`, `${o.order_name ?? ''} was cancelled.`],
          failed: [`Gelato could not print · ${who}`, `تعذّر على Gelato الطباعة · ${who}`, extra, 'emergency'],
        };
        const s = m[k]; if (s) await bell(s[0], s[1], s[2], s[3] ?? 'normal');
      };

      // 1. invoice sent → is it paid? then take the address from the store
      if (stage === 'invoice_sent') {
        const d = await gql(`query($id: ID!){ draftOrder(id:$id){ status order{ id name displayFinancialStatus cancelledAt email phone
          shippingAddress{ firstName lastName address1 address2 city zip provinceCode countryCodeV2 phone } } } }`, { id: o.draft_order_id });
        const ord = ((d.draftOrder as J | null)?.order ?? null) as J | null;
        if (ord) {
          patch.order_id = ord.id; patch.order_name = ord.name;
          if (ord.cancelledAt) { stage = 'cancelled'; await say('cancelled'); }
          else if (/PAID/.test(String(ord.displayFinancialStatus))) {
            const a = (ord.shippingAddress ?? {}) as J;
            patch.ship_to = { firstName: a.firstName, lastName: a.lastName, addressLine1: a.address1, addressLine2: a.address2 ?? '', city: a.city, postCode: a.zip, state: a.provinceCode ?? '', country: a.countryCodeV2, email: ord.email ?? o.customer_email, phone: a.phone ?? ord.phone ?? '' };
            patch.paid_at = new Date().toISOString(); stage = 'paid';
            await say('paid', 'Sending it to the lab.');
          }
        }
      }
      // 2. paid (or waiting for the file) → the print file → Gelato
      if (stage === 'paid' || stage === 'attention') {
        const shipTo = (patch.ship_to ?? o.ship_to) as J | null;
        const pf = o.handle ? (await sb(`print_files?select=id,path,artwork&handle=eq.${o.handle}&limit=1`))?.[0] : null;
        if (!shipTo) { patch.note = 'paid but the store gave no address'; stage = 'attention'; }
        else if (!pf) {
          if (stage !== 'attention') { await say('need_file'); await openJob('store', 'print_files', String(o.handle), `Drop the print file · ${o.artwork}`, `${patch.order_name ?? o.order_name ?? 'The order'} is paid and waiting for the master file of "${o.artwork}". Drop it once; every future order of this piece uses it.`, [{ key: 'later', label: 'Later', label_ar: 'لاحقًا' }]); }
          stage = 'attention'; patch.note = 'waiting for the print file';
        } else {
          const url = await signedFile(String(pf.path));
          const g = await gelato({ action: 'order_direct', size: o.size, address: shipTo, file_url: url, ref: String(patch.order_name ?? o.order_name ?? o.draft_order_name), currency: 'USD' });
          patch.gelato_order_id = g.order_id; patch.gelato_status = g.status; patch.print_file_id = pf.id; patch.note = null; stage = 'at_lab';
          await closeJob('print_files', String(o.handle));
          await say('at_lab', `Gelato order ${g.order_id}.`);
        }
      }
      // 3. at the lab → where is it?
      if ((stage === 'at_lab' || stage === 'shipped') && (patch.gelato_order_id ?? o.gelato_order_id)) {
        const st = await gelato({ action: 'status', gelato_order_id: patch.gelato_order_id ?? o.gelato_order_id });
        patch.gelato_status = st.status;
        const gs = String(st.status ?? '').toLowerCase();
        if (/cancel|fail|rejected/.test(gs)) { stage = 'attention'; patch.note = `Gelato: ${gs}`; await say('failed', `Gelato says "${gs}" for ${o.order_name ?? ''}. Open Gelato to see why.`); }
        else if (st.tracking_url && stage === 'at_lab') {
          patch.tracking_url = st.tracking_url; patch.tracking_company = st.carrier; patch.shipped_at = new Date().toISOString(); stage = 'shipped';
          // the store's shipping email to the customer
          try {
            const fo = await gql(`query($id: ID!){ order(id:$id){ fulfillmentOrders(first:1){ nodes{ id } } } }`, { id: o.order_id });
            const foId = (((fo.order as J).fulfillmentOrders as J).nodes as J[])[0]?.id;
            if (foId) await gql(`mutation($f: FulfillmentInput!){ fulfillmentCreate(fulfillment:$f){ fulfillment{ id } userErrors{ message } } }`, { f: { lineItemsByFulfillmentOrder: [{ fulfillmentOrderId: foId }], trackingInfo: { number: st.tracking_code ?? undefined, url: st.tracking_url, company: st.carrier ?? undefined }, notifyCustomer: true } });
          } catch (e) { patch.note = `tracking not written to the store: ${(e as Error).message.slice(0, 120)}`; }
          await say('shipped', `${st.carrier ?? 'Carrier'} · ${st.tracking_url}${st.max_date ? ' · by ' + st.max_date : ''}`);
        }
        else if (/delivered/.test(gs)) { stage = 'delivered'; patch.delivered_at = new Date().toISOString(); await say('delivered'); }
      }
      if (stage !== o.stage) { patch.stage = stage; out.push(`${o.draft_order_name}: ${o.stage} → ${stage}`); }
      await sb(`art_orders?id=eq.${o.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    } catch (e) { out.push(`${o.draft_order_name}: ${(e as Error).message}`); await sb(`art_orders?id=eq.${o.id}`, { method: 'PATCH', body: JSON.stringify({ last_checked_at: new Date().toISOString(), note: (e as Error).message.slice(0, 200) }) }).catch(() => null); }
  }
  if (rows.length) await log(out.some((x) => /: [A-Z]/.test(x)) ? 'error' : 'ok', `sync ${rows.length} orders · ${out.join(' · ') || 'no change'}`);
  return { ok: true, checked: rows.length, changes: out };
}

Deno.serve(async (req) => {
  const json = (s: number, b: unknown) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return json(405, { ok: false });
  const b = await req.json().catch(() => ({}));
  const action = String(b.action ?? 'sync');
  if (!(await allowed(req, action, b))) return json(401, { ok: false, error: 'admin only' });
  if (!FIXED && !(CID && CSECRET)) { await log('error', 'Shopify secrets missing (SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET, or SHOPIFY_ADMIN_TOKEN)'); return json(500, { ok: false, error: 'Shopify secrets missing: SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (or SHOPIFY_ADMIN_TOKEN)' }); }
  try {
    if (action === 'ping') { const d = await gql(`{ shop { name myshopifyDomain currencyCode } }`); let sc = FIXED ? 'fixed token' : ''; try { sc = JSON.parse(String((await sb('app_settings?select=value&key=eq.shopify_token&limit=1'))?.[0]?.value ?? '{}')).scope ?? sc; } catch { /* none */ } return json(200, { ok: true, shop: d.shop, scope: sc }); }
    if (action === 'invoice') return json(200, await invoice(b));
    if (action === 'sync') return json(200, await sync());
    return json(400, { ok: false, error: 'unknown action' });
  } catch (e) {
    const msg = (e as Error).message; await log('error', msg); return json(500, { ok: false, error: msg });
  }
});
