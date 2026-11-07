// Phone alerts for the dashboard (KJ, 6 Nov 2026): "working from 8 morning for normal duties and 24/7 for live emergency
// notification — if some big very huge issue send me notification any time".
// GET  → { publicKey } for the browser to subscribe (keys are made once and kept server-side in public.push_keys).
// POST → sends what is due: every unsent EMERGENCY note at once, any hour; NORMAL notes only 08:00–22:00 Dubai.
//        Normal notes that arrive at night wait and go out as one summary at 08:00. Runs from pg_cron every 5 minutes,
//        and is also called at once when an emergency note is written (trigger notify_emergency_push).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import webpush from 'npm:web-push@3.6.7';

const SB_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUBJECT = 'mailto:system@zkjverse.com';
const START = 8, END = 22; // Dubai hours for normal alerts

async function sb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(`Supabase ${path.split('?')[0]}: ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
async function keys() {
  const k = await sb('push_keys?select=public_key,private_key&id=eq.1');
  if (k?.[0]) return k[0];
  const v = webpush.generateVAPIDKeys();
  await sb('push_keys', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify({ id: 1, public_key: v.publicKey, private_key: v.privateKey }) });
  return (await sb('push_keys?select=public_key,private_key&id=eq.1'))[0];
}
const dubaiHour = () => (new Date().getUTCHours() + 4) % 24;
type Note = { id: string; client_id: string; audience: string; title: string; body: string | null; priority: string; created_at: string };
type Sub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; fails: number };

Deno.serve(async (req) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type' };
  const json = (s: number, b: unknown) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    const k = await keys();
    if (req.method === 'GET') return json(200, { publicKey: k.public_key });
    webpush.setVapidDetails(SUBJECT, k.public_key, k.private_key);
    const since = new Date(Date.now() - 3 * 86400e3).toISOString();
    const notes: Note[] = await sb(`notifications?select=id,client_id,audience,title,body,priority,created_at&pushed_at=is.null&created_at=gte.${since}&order=created_at.asc&limit=200`);
    if (!notes.length) return json(200, { ok: true, sent: 0 });
    const inHours = dubaiHour() >= START && dubaiHour() < END;
    const due = notes.filter((n) => n.priority === 'emergency' || inHours);
    if (!due.length) return json(200, { ok: true, sent: 0, waiting: notes.length, note: 'quiet hours: normal alerts wait for 08:00 Dubai' });
    const profiles: { id: string; role: string; client_id: string | null }[] = await sb('profiles?select=id,role,client_id');
    const subs: Sub[] = await sb('push_subscriptions?select=id,user_id,endpoint,p256dh,auth,fails');
    const admins = new Set(profiles.filter((p) => p.role === 'admin').map((p) => p.id));
    const who = (n: Note) => subs.filter((s) => n.audience === 'admin' ? admins.has(s.user_id) : profiles.some((p) => p.id === s.user_id && (p.client_id === n.client_id || p.role === 'admin')));
    // build messages per subscription: emergencies one by one; normal ones folded into one summary when there are more than 2
    const out = new Map<string, { sub: Sub; msgs: { title: string; body: string; tag: string; emergency: boolean }[] }>();
    const add = (s: Sub, m: { title: string; body: string; tag: string; emergency: boolean }) => { if (!out.has(s.id)) out.set(s.id, { sub: s, msgs: [] }); out.get(s.id)!.msgs.push(m); };
    const normalBySub = new Map<string, Note[]>();
    for (const n of due) for (const s of who(n)) {
      if (n.priority === 'emergency') add(s, { title: '⚠ ' + n.title, body: n.body ?? '', tag: 'em-' + n.id, emergency: true });
      else { if (!normalBySub.has(s.id)) normalBySub.set(s.id, []); normalBySub.get(s.id)!.push(n); }
    }
    for (const [sid, list] of normalBySub) {
      const s = subs.find((x) => x.id === sid)!;
      if (list.length <= 2) list.forEach((n) => add(s, { title: n.title, body: n.body ?? '', tag: 'n-' + n.id, emergency: false }));
      else add(s, { title: `${list.length} things need you`, body: list.slice(0, 3).map((n) => n.title).join(' · '), tag: 'summary', emergency: false });
    }
    let sent = 0, failed = 0;
    for (const { sub, msgs } of out.values()) for (const m of msgs) {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify({ ...m, url: '/app/#notif' }), { TTL: m.emergency ? 86400 : 43200, urgency: m.emergency ? 'high' : 'normal' });
        sent++; await sb(`push_subscriptions?id=eq.${sub.id}`, { method: 'PATCH', body: JSON.stringify({ last_ok_at: new Date().toISOString(), fails: 0 }) }).catch(() => null);
      } catch (e) {
        failed++; const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410 || sub.fails >= 9) await sb(`push_subscriptions?id=eq.${sub.id}`, { method: 'DELETE' }).catch(() => null); // phone unsubscribed
        else await sb(`push_subscriptions?id=eq.${sub.id}`, { method: 'PATCH', body: JSON.stringify({ fails: sub.fails + 1 }) }).catch(() => null);
      }
    }
    // mark as pushed (also when nobody has a phone subscribed yet, so they do not pile up)
    await sb(`notifications?id=in.(${due.map((n) => n.id).join(',')})`, { method: 'PATCH', body: JSON.stringify({ pushed_at: new Date().toISOString() }) });
    return json(200, { ok: true, sent, failed, notes: due.length, phones: subs.length, inHours });
  } catch (e) {
    return json(500, { ok: false, error: (e as Error).message });
  }
});
