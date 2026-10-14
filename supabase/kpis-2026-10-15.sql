-- ZKJ SYSTEM · launch reel numbers as read by KJ in Instagram Insights on 15 Oct 2026.
-- Paste into Supabase → SQL Editor → Run. Safe to run twice (fixed ids, on conflict do nothing).
-- Real numbers only. Nothing here is estimated.
insert into public.kpis (id, client_id, period_start, metric, value, label, label_ar) values
  ('e1000000-0000-4000-8000-000000000102', 'c1000000-0000-4000-8000-000000000003', '2026-10-15', 'reel_views', 48, 'Launch reel · views', 'ريل الإطلاق · مشاهدات'),
  ('e1000000-0000-4000-8000-000000000103', 'c1000000-0000-4000-8000-000000000003', '2026-10-15', 'reel_reach', 22, 'Launch reel · accounts reached', 'ريل الإطلاق · حسابات وصلها'),
  ('e1000000-0000-4000-8000-000000000104', 'c1000000-0000-4000-8000-000000000003', '2026-10-15', 'reel_avg_watch', 21, 'Launch reel · average watch time (s)', 'ريل الإطلاق · متوسط المشاهدة (ث)'),
  ('e1000000-0000-4000-8000-000000000105', 'c1000000-0000-4000-8000-000000000003', '2026-10-15', 'followers', 5, 'Followers (1 new since launch)', 'المتابعون (١ جديد منذ الإطلاق)')
on conflict (id) do nothing;
