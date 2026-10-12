-- =====================================================================
-- ZKJ SYSTEM · client portal database (Supabase)
-- =====================================================================
--
-- HOW TO USE
--   Supabase → SQL Editor → New query → paste this whole file → Run.
--   It is safe to run again later: it only creates what is missing and
--   replaces the rules and functions with the latest version. It never
--   deletes your data.
--
-- WHAT IT CREATES (in plain English)
--
--   1. TABLES
--      clients        One row per brand you work for (name, Arabic name,
--                     logo, colours, Instagram handle, package, active?).
--                     "plan" is the package name shown in the dashboard
--                     header. It also decides which panels show: a plan
--                     containing "Starter", "Growth" or "Full" (e.g.
--                     "Growth", "Case study · Full"). Anything else = Full.
--      profiles       One row per login. Says whether the person is the
--                     admin (KJ) or a client, and which client they belong to.
--      items          Content and approvals: posts, reels, stories,
--                     carousels, replies and ads, with their status
--                     (draft → needs_approval → approved / changes_requested
--                     → scheduled → published) and the client's note.
--      kpis           Key numbers shown at the top of the dashboard.
--      notifications  Messages shown under the bell. "audience" says who
--                     sees it: the client, or KJ (admin) when a client
--                     approves or asks for changes.
--      reports        Links to reports (audit, strategy, monthly report).
--
--   2. SECURITY (row-level security on every table)
--      • A client can only READ rows that belong to their own client.
--        Drafts stay hidden from clients until you move them on.
--      • The admin (KJ) can read and change everything.
--      • Clients can never insert, edit or delete rows directly. The only
--        things they can do are:
--          - review_item(...)            approve, or request changes with a note
--          - mark_notifications_read()   clear their bell
--      Helper functions is_admin() and my_client_id() are used by the rules.
--
--   3. NEW LOGINS
--      When you invite someone (Authentication → Invite user), a profile
--      is created automatically. kj@zkjverse.com becomes "admin";
--      everyone else becomes "client" with no client yet. You link them by
--      setting profiles.client_id in the Table Editor.
--
--   4. STARTER DATA
--      Two clients are created: KJ VISION (client #1, case study, Full package, with its real audit numbers,
--      first five posts from the 30-day calendar, reports and a welcome
--      notification) and ZKJ VERSE (client #2, Growth package, welcome
--      notification only).
--      Fixed IDs are used, so running the file again adds nothing twice
--      and never overwrites changes you made.
--
--   Nothing secret is stored in this file. Never paste your service_role
--   key or database password anywhere on the website.
-- =====================================================================

-- (gen_random_uuid() is built into Postgres 13+, which Supabase uses.)

-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------

create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  name_ar       text,
  logo_url      text,
  primary_color text default '#0B0B0F',
  accent_color  text default '#D4AF37',
  instagram     text,
  website       text,
  plan          text,
  plan_ar       text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- columns added after the first version (safe if they already exist)
alter table public.clients add column if not exists instagram text;
alter table public.clients add column if not exists website text;
alter table public.clients add column if not exists plan_ar text;

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  role       text not null default 'client' check (role in ('admin', 'client')),
  client_id  uuid references public.clients (id) on delete set null,
  full_name  text,
  lang       text not null default 'en' check (lang in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists email text;

create table if not exists public.items (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  kind         text not null default 'post'
               check (kind in ('post', 'reel', 'story', 'carousel', 'reply', 'ad')),
  title        text not null,
  title_ar     text,
  caption      text,
  caption_ar   text,
  media_url    text,
  platform     text,
  scheduled_at timestamptz,
  status       text not null default 'draft'
               check (status in ('draft', 'needs_approval', 'approved', 'changes_requested', 'scheduled', 'published')),
  client_note  text,
  reviewed_at  timestamptz,
  reviewed_by  uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.items add column if not exists title_ar text;
create index if not exists items_client_idx on public.items (client_id, scheduled_at);

create table if not exists public.kpis (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  period_start date not null default current_date,
  metric       text not null,
  value        numeric not null,
  label        text,
  label_ar     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists kpis_client_idx on public.kpis (client_id, period_start desc);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients (id) on delete cascade,
  audience   text not null default 'client' check (audience in ('client', 'admin')),
  title      text not null,
  title_ar   text,
  body       text,
  body_ar    text,
  read       boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notifications add column if not exists audience text not null default 'client';
create index if not exists notifications_client_idx on public.notifications (client_id, created_at desc);

create table if not exists public.reports (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients (id) on delete cascade,
  title      text not null,
  title_ar   text,
  period     text,
  file_url   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reports add column if not exists title_ar text;
create index if not exists reports_client_idx on public.reports (client_id, created_at desc);

-- keep updated_at fresh on every change
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['clients', 'profiles', 'items', 'kpis', 'notifications', 'reports'] loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format('create trigger touch_updated_at before update on public.%I
                    for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 2. HELPER FUNCTIONS (used by the security rules)
-- ---------------------------------------------------------------------

-- true when the signed-in person is the admin
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- the client the signed-in person belongs to (null if not linked yet)
create or replace function public.my_client_id()
returns uuid language sql stable security definer set search_path = public as $$
  select client_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 3. ROW-LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.clients       enable row level security;
alter table public.profiles      enable row level security;
alter table public.items         enable row level security;
alter table public.kpis          enable row level security;
alter table public.notifications enable row level security;
alter table public.reports       enable row level security;

-- Logged-out visitors get nothing. Logged-in users get table access,
-- and the policies below decide which rows.
revoke all on public.clients, public.profiles, public.items, public.kpis, public.notifications, public.reports from anon;
grant select, insert, update, delete on public.clients, public.profiles, public.items, public.kpis, public.notifications, public.reports to authenticated;

-- clients: a client sees its own brand; admin does everything
drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients for select to authenticated
  using (public.is_admin() or id = public.my_client_id());
drop policy if exists clients_admin on public.clients;
create policy clients_admin on public.clients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- profiles: everyone sees their own profile; admin sees and edits all
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- items: a client sees its own items except drafts
drop policy if exists items_select on public.items;
create policy items_select on public.items for select to authenticated
  using (public.is_admin() or (client_id = public.my_client_id() and status <> 'draft'));
drop policy if exists items_admin on public.items;
create policy items_admin on public.items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- kpis
drop policy if exists kpis_select on public.kpis;
create policy kpis_select on public.kpis for select to authenticated
  using (public.is_admin() or client_id = public.my_client_id());
drop policy if exists kpis_admin on public.kpis;
create policy kpis_admin on public.kpis for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- notifications: a client sees the ones addressed to the client
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated
  using (public.is_admin() or (client_id = public.my_client_id() and audience = 'client'));
drop policy if exists notifications_admin on public.notifications;
create policy notifications_admin on public.notifications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- reports
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports for select to authenticated
  using (public.is_admin() or client_id = public.my_client_id());
drop policy if exists reports_admin on public.reports;
create policy reports_admin on public.reports for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. WHAT A CLIENT IS ALLOWED TO DO (functions)
-- ---------------------------------------------------------------------

-- Approve an item, or request changes with a note.
--   p_decision: 'approved' or 'changes_requested'
-- Only works on an item of the caller's own client that is waiting for
-- approval. Records who reviewed it and when, and tells KJ (admin bell).
create or replace function public.review_item(p_item uuid, p_decision text, p_note text default null)
returns public.items
language plpgsql security definer set search_path = public as $$
declare
  v_item   public.items;
  v_client uuid := public.my_client_id();
  v_note   text := nullif(btrim(coalesce(p_note, '')), '');
  v_who    text;
begin
  if auth.uid() is null then
    raise exception 'Please sign in first.' using errcode = '28000';
  end if;
  if p_decision is null or p_decision not in ('approved', 'changes_requested') then
    raise exception 'Decision must be approved or changes_requested.' using errcode = '22023';
  end if;
  if p_decision = 'changes_requested' and v_note is null then
    raise exception 'Please add a short note about what should change.' using errcode = '22023';
  end if;

  select * into v_item from public.items where id = p_item for update;
  if not found or not (public.is_admin() or (v_client is not null and v_item.client_id = v_client)) then
    raise exception 'Item not found.' using errcode = '42501';
  end if;
  if v_item.status <> 'needs_approval' then
    raise exception 'This item is no longer waiting for approval.' using errcode = 'P0001';
  end if;

  update public.items
     set status = p_decision, client_note = v_note, reviewed_at = now(), reviewed_by = auth.uid()
   where id = p_item
  returning * into v_item;

  select coalesce(nullif(full_name, ''), email, 'Client') into v_who from public.profiles where id = auth.uid();

  insert into public.notifications (client_id, audience, title, title_ar, body, body_ar)
  values (
    v_item.client_id, 'admin',
    case when p_decision = 'approved' then 'Approved: ' else 'Changes requested: ' end || v_item.title,
    case when p_decision = 'approved' then 'تمت الموافقة: ' else 'طلب تعديل: ' end || coalesce(v_item.title_ar, v_item.title),
    coalesce(v_who, 'Client') || coalesce(' — ' || v_note, ''),
    coalesce(v_who, 'Client') || coalesce(' — ' || v_note, '')
  );

  return v_item;
end $$;

-- Mark the bell as read. A client clears their own notifications;
-- the admin clears the admin bell.
create or replace function public.mark_notifications_read()
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if auth.uid() is null then
    raise exception 'Please sign in first.' using errcode = '28000';
  end if;
  if public.is_admin() then
    update public.notifications set read = true where audience = 'admin' and not read;
  else
    update public.notifications set read = true
     where audience = 'client' and client_id = public.my_client_id() and not read;
  end if;
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.review_item(uuid, text, text) from public, anon;
revoke all on function public.mark_notifications_read() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.my_client_id() from public, anon;
grant execute on function public.review_item(uuid, text, text) to authenticated;
grant execute on function public.mark_notifications_read() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_client_id() to authenticated;

-- ---------------------------------------------------------------------
-- 5. NEW LOGIN → PROFILE (automatic)
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role, client_id, full_name)
  values (
    new.id,
    new.email,
    case when lower(new.email) = 'kj@zkjverse.com' then 'admin' else 'client' end,
    null,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- People who were invited before this file was run get a profile too.
insert into public.profiles (id, email, role)
select u.id, u.email, case when lower(u.email) = 'kj@zkjverse.com' then 'admin' else 'client' end
  from auth.users u
on conflict (id) do nothing;
update public.profiles set role = 'admin' where lower(email) = 'kj@zkjverse.com' and role <> 'admin';

-- ---------------------------------------------------------------------
-- 6. STARTER DATA: KJ VISION and ZKJ VERSE
--    Fixed IDs + "on conflict do nothing": running again adds nothing
--    twice and never overwrites your edits.
-- ---------------------------------------------------------------------

insert into public.clients (id, name, name_ar, logo_url, primary_color, accent_color, instagram, website, plan, plan_ar, active) values
  ('c1000000-0000-4000-8000-000000000001', 'KJ VISION', 'كي جي فيجن',
   '/assets/showcase/brandkit/kjvision-emblem-gold.svg', '#0B0B0F', '#D4AF37', '@kjvision.zkj', null, 'Case study · Full', 'دراسة حالة · الكاملة', true),
  ('c1000000-0000-4000-8000-000000000002', 'ZKJ VERSE', 'زد كي جي فيرس',
   '/assets/brand/zkjverse-mark-gold.svg', '#0B0B0F', '#D4AF37', '@zkjverse', 'https://zkjverse.com', 'Growth', 'النمو', true)
on conflict (id) do nothing;

-- KJ VISION key numbers (from the 11 Oct 2026 brand audit and the Oct–Nov plan)
insert into public.kpis (id, client_id, period_start, metric, value, label, label_ar) values
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', '2026-10-11', 'audit_score', 40,
   'Brand audit score (out of 100)', 'نتيجة تدقيق العلامة (من 100)'),
  ('e1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', '2026-10-11', 'views_30d', 587,
   'Views · last 30 days (baseline, 11 Oct)', 'المشاهدات · آخر 30 يومًا (خط الأساس، 11 أكتوبر)'),
  ('e1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', '2026-10-11', 'median_views_ar_reels', 1708,
   'Median views · Arabic-text reels', 'متوسط المشاهدات · ريلز بنص عربي'),
  ('e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', '2026-10-13', 'target_views_30d', 8000,
   'Target views · 30 days (by 11 Nov)', 'هدف المشاهدات · 30 يومًا (حتى 11 نوفمبر)')
on conflict (id) do nothing;

-- KJ VISION: first five posts of the 30-day calendar (13–17 Oct 2026, Dubai time)
insert into public.items (id, client_id, kind, title, title_ar, caption, caption_ar, platform, scheduled_at, status) values
  ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'post', $t$Seeing, engineered. — the relaunch$t$, $t$الرؤية… بدقّة مهندس.$t$, $c$This account has a new name: KJ VISION.
I’m a civil engineer who photographs Dubai. I measure the structure first, then wait for the second the light changes. Same eyes, same city — now signed.
— KJ
Follow along. New work every week.

#KJVISION #seeingengineered #lightart #الرؤية$c$, $c$لهذا الحساب اسمٌ جديد: KJ VISION.
أنا مهندس مدني أصوّر دبي. أقيس البنية أولًا، ثم أنتظر الثانية التي يتغيّر فيها الضوء. نفس العين ونفس المدينة… والآن بتوقيعي.
— KJ
تابعني، كل أسبوع شغل جديد.

#KJVISION #seeingengineered #lightart #الرؤية$c$, 'instagram', '2026-10-13 20:30:00+04', 'needs_approval'),
  ('d1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'reel', $t$Golden hour, Sheikh Zayed Road$t$, $t$ساعة الذهب… على شارع الشيخ زايد$t$, $c$Golden hour on Sheikh Zayed Road lasts about thirty minutes. I filmed it from the passenger seat, one take, no speed ramp.
— KJ
Send it to someone who drives this road every day.

#dubai #dubainight #sheikhzayedroad #دبي #KJVISION$c$, $c$ساعة الذهب على شارع الشيخ زايد ما تطوّل… نص ساعة تقريبًا. صوّرتها من المقعد الجانبي، لقطة وحدة بدون تسريع.
— KJ
أرسلها لأحد يمرّ من هالشارع كل يوم.

#dubai #dubainight #sheikhzayedroad #دبي #KJVISION$c$, 'instagram', '2026-10-14 20:30:00+04', 'needs_approval'),
  ('d1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'reel', $t$Mirror series 02 — the facade folds$t$, $t$سلسلة المرايا ٠٢$t$, $c$Mirror series 02. A facade folded on its own axis while I drove past. Straight lines are only half the structure.
— KJ
Watch it twice. Save it.

#mirroredarchitecture #architectureabstract #symmetry #عمارة #KJVISION$c$, $c$سلسلة المرايا ٠٢. واجهة تنطوي على محورها وأنا أمرّ بجانبها. الخطوط المستقيمة نصف البنية فقط.
— KJ
شوفها مرتين… واحفظها.

#mirroredarchitecture #architectureabstract #symmetry #عمارة #KJVISION$c$, 'instagram', '2026-10-15 20:30:00+04', 'needs_approval'),
  ('d1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'carousel', $t$Mirror series 01 — The Flipped Dimension$t$, $t$سلسلة المرايا ٠١ — البُعد المقلوب$t$, $c$Mirror series 01 — The Flipped Dimension.
Slide 1 is the tower folded on its axis. Slide 2 is what the street sees. Slide 3 is the joint where they meet.
— KJ
Which one is the real building? Tell me in the comments.

#dubaiarchitecture #architecturephotography #mirrorworld #عمارة_دبي #KJVISION$c$, $c$سلسلة المرايا ٠١ — البُعد المقلوب.
الأولى: البرج مطويّ على محوره. الثانية: كما يراه الشارع. الثالثة: النقطة التي يلتقيان فيها.
— KJ
أي وحدة هي البناية الحقيقية؟ قل لي في التعليقات.

#dubaiarchitecture #architecturephotography #mirrorworld #عمارة_دبي #KJVISION$c$, 'instagram', '2026-10-16 13:00:00+04', 'needs_approval'),
  ('d1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000001', 'post', $t$Look closer. Something looks back.$t$, $t$انظر أقرب. شيءٌ ما ينظر إليك.$t$, $c$Look closer. Something looks back.
The eyes in my work were never planned. They arrive when I stay with a frame long enough.
— KJ
Save this for the next time you look again.

#KJVISION #seeingengineered #lightart #الرؤية$c$, $c$انظر أقرب. شيءٌ ما ينظر إليك.
العيون في أعمالي ما كانت مخطّطة… تظهر لما أطوّل النظر في الإطار.
— KJ
احفظها وارجع لها.

#KJVISION #seeingengineered #lightart #الرؤية$c$, 'instagram', '2026-10-17 13:00:00+04', 'needs_approval')

on conflict (id) do nothing;

-- KJ VISION reports (titles only; add a file link later in the Table Editor)
insert into public.reports (id, client_id, title, title_ar, period, file_url) values
  ('f1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001',
   'Brand & market audit — 40/100', 'تدقيق العلامة والسوق — 40/100', '11 Oct 2026', null),
  ('f1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001',
   'Content strategy & 30-day calendar', 'استراتيجية المحتوى وتقويم 30 يومًا', '13 Oct – 11 Nov 2026', null)
on conflict (id) do nothing;

-- Welcome notifications
insert into public.notifications (id, client_id, audience, title, title_ar, body, body_ar) values
  ('a1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'client',
   'Welcome to your KJ VISION dashboard',
   'أهلًا بك في لوحة KJ VISION',
   'Your first five posts are waiting for your approval. Nothing is published until you approve it.',
   'أول خمسة منشورات بانتظار موافقتك. لا شيء يُنشر قبل موافقتك.'),
  ('a1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002', 'client',
   'Welcome to your ZKJ VERSE dashboard',
   'أهلًا بك في لوحة ZKJ VERSE',
   'Your content, approvals and reports will appear here.',
   'محتواك والموافقات والتقارير ستظهر هنا.')
on conflict (id) do nothing;

-- Done. Check: Table Editor → clients should show KJ VISION and ZKJ VERSE.
