-- =====================================================================
-- ZKJ SYSTEM workspace (added 14 Oct 2026, launch day of @zkjsystem)
--
-- Paste the whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run twice: fixed IDs + "on conflict do nothing" never add a
-- row twice and never overwrite your edits. No keys or passwords here.
--
-- What it adds:
--   • ZKJ SYSTEM as client #3, your own brand (internal = true), so you
--     can "Approve as owner" in its workspace.
--   • The launch reel (published 14 Oct) and the 4 posts waiting for
--     your approval, matching launch/APPROVALS.md.
--   • One fact as a number: 14 tools live. No invented results — add
--     reel numbers yourself after 24 h (Table Editor → kpis).
--   • Gold #C9A84C for all three brands (only where the old gold is
--     still set, so a colour you picked yourself stays).
-- =====================================================================

insert into public.clients (id, name, name_ar, logo_url, primary_color, accent_color, instagram, website, plan, plan_ar, active, internal, cover_urls, brand) values
  ('c1000000-0000-4000-8000-000000000003', 'ZKJ SYSTEM', 'زد كي جي سيستم',
   '/assets/brand/zkjsystem-icon-primary.svg', '#0B0B0F', '#C9A84C', '@zkjsystem', 'https://system.zkjverse.com', 'Own brand · Launch', 'علامتنا · الإطلاق', true, true,
   array['/assets/try/zkjsystem-1.webp', '/assets/try/zkjsystem-2.webp', '/assets/try/zkjsystem-3.webp', '/assets/art/kj/kj-067.webp', '/assets/art/kj/kj-054.webp', '/assets/art/kj/kj-060.webp'],
   '{"bg": "#0B0B0F", "surface": "#15151B", "text": "#FFFFFF", "primary": "#C9A84C", "accent": "#E6D5A3", "font_display": "Cinzel", "font_body": "Inter", "radius": 22}'::jsonb)
on conflict (id) do nothing;

-- Launch content (status mirrors launch/APPROVALS.md on 14 Oct 2026)
insert into public.items (id, client_id, kind, title, title_ar, caption, caption_ar, platform, scheduled_at, status) values
  ('d1000000-0000-4000-8000-000000000101', 'c1000000-0000-4000-8000-000000000003', 'reel',
   $t$Launch reel v3 — Every project becomes a tool.$t$, $t$ريل الإطلاق — كل مشروع يصبح أداة.$t$,
   $c$44 s launch reel: logo reveal, 14 AI tools, 10 dashboard screens, a visitor trying tools on the website, approval, Burj finale. Posted by KJ.$c$,
   $c$ريل الإطلاق ٤٤ ثانية: ظهور الشعار، ١٤ أداة ذكاء اصطناعي، ١٠ شاشات لوحة تحكم، زائر يجرّب الأدوات على الموقع، الموافقة، ثم برج خليفة. نشره KJ.$c$,
   'instagram', '2026-10-14 20:30:00+04', 'published'),
  ('d1000000-0000-4000-8000-000000000102', 'c1000000-0000-4000-8000-000000000003', 'carousel',
   $t$P10 · Try it before you start (6 slides)$t$, $t$P10 · جرّبها قبل أن تبدأ (٦ شرائح)$t$,
   $c$Brand Kit · Content Studio · Publisher · Dialect Writer · CTA. Real website screens. Caption: CAPTIONS.md · P10.$c$,
   $c$هوية العلامة · استوديو المحتوى · الناشر · كاتب اللهجات · دعوة. شاشات حقيقية من الموقع.$c$,
   'instagram', '2026-10-15 13:00:00+04', 'needs_approval'),
  ('d1000000-0000-4000-8000-000000000103', 'c1000000-0000-4000-8000-000000000003', 'carousel',
   $t$Pinned set v2 — 14 AI tools$t$, $t$المنشورات المثبّتة v2 — ١٤ أداة$t$,
   $c$v2: "13" → "14 AI tools", gold #C9A84C. If v1 is already posted, leave it (Instagram can't swap images).$c$,
   $c$النسخة ٢: «١٤ أداة ذكاء اصطناعي» والذهبي الجديد.$c$,
   'instagram', null, 'needs_approval'),
  ('d1000000-0000-4000-8000-000000000104', 'c1000000-0000-4000-8000-000000000003', 'carousel',
   $t$P01 v2 — Launch · 14 Oct 2026$t$, $t$P01 v2 — الإطلاق · ١٤ أكتوبر ٢٠٢٦$t$,
   $c$v2: "14 AI tools", label "Launch · 14 Oct 2026", gold #C9A84C.$c$,
   $c$النسخة ٢: «١٤ أداة»، عنوان الإطلاق، الذهبي الجديد.$c$,
   'instagram', null, 'needs_approval'),
  ('d1000000-0000-4000-8000-000000000105', 'c1000000-0000-4000-8000-000000000003', 'carousel',
   $t$P02 v2 — 14 tools. 5 groups.$t$, $t$P02 v2 — ١٤ أداة. ٥ مجموعات.$t$,
   $c$Includes T-14 Arabic Dialect Writer and T-05 now with email.$c$,
   $c$تشمل الأداة ١٤ كاتب اللهجات العربية والأداة ٥ مع الإيميل.$c$,
   'instagram', '2026-10-17 13:00:00+04', 'needs_approval')
on conflict (id) do nothing;

-- A fact, not a result
insert into public.kpis (id, client_id, period_start, metric, value, label, label_ar) values
  ('e1000000-0000-4000-8000-000000000101', 'c1000000-0000-4000-8000-000000000003', '2026-10-14', 'tools_live', 14,
   'AI tools live on system.zkjverse.com', 'أداة ذكاء اصطناعي على الموقع')
on conflict (id) do nothing;

insert into public.reports (id, client_id, title, title_ar, period, file_url) values
  ('f1000000-0000-4000-8000-000000000101', 'c1000000-0000-4000-8000-000000000003',
   'Launch kit & project handoff', 'حقيبة الإطلاق وملف التسليم', '14 Oct 2026', null)
on conflict (id) do nothing;

insert into public.notifications (id, client_id, audience, title, title_ar, body, body_ar) values
  ('a1000000-0000-4000-8000-000000000101', 'c1000000-0000-4000-8000-000000000003', 'client',
   'ZKJ SYSTEM is live',
   'ZKJ SYSTEM انطلق',
   'The launch reel is published. 4 posts are waiting for your approval. Nothing goes out until you approve it.',
   'ريل الإطلاق منشور. ٤ منشورات بانتظار موافقتك. لا شيء يُنشر قبل موافقتك.')
on conflict (id) do nothing;

-- Gold #C9A84C for KJ VISION and ZKJ VERSE too (only if still the old gold)
update public.clients set accent_color = '#C9A84C'
 where id in ('c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002')
   and upper(accent_color) = '#D4AF37';
update public.clients set brand = brand || '{"primary": "#C9A84C", "accent": "#E6D5A3"}'::jsonb
 where id in ('c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002')
   and upper(brand->>'primary') = '#D4AF37';
