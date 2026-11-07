-- DASHBOARD ONE (KJ 6 Nov 2026, DECISIONS 63): one job list behind Home, filled and closed by triggers; 7 targets with % from steps.
-- Applied 6 Nov 2026 through SQL (no DROP statements: every object is created or replaced).
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in ('approval','enquiry','comment','client_change','account','publish_error','delivered','drawing','store','agent_question','agent_blocked','target_step','other')),
  owner text,
  client_id uuid references public.clients(id),
  platform text,
  title text not null, title_ar text,
  received text, received_ar text,
  proposal text, proposal_ar text,
  options jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open','answered','done')),
  priority text not null default 'normal' check (priority in ('normal','emergency')),
  chat_url text,
  source_table text, source_id text,
  answer text, answered_at timestamptz, done_at timestamptz,
  notified_at timestamptz,
  unique (source_table, source_id, kind)
);
create index if not exists tasks_open on public.tasks (status, created_at desc);
alter table public.tasks enable row level security;
do $$ begin
  if not exists (select 1 from pg_policy where polrelid = 'public.tasks'::regclass and polname = 'tasks_admin') then
    create policy tasks_admin on public.tasks for all to authenticated using (public.is_admin()) with check (public.is_admin()); end if;
  if not exists (select 1 from pg_policy where polrelid = 'public.tasks'::regclass and polname = 'tasks_client_read') then
    create policy tasks_client_read on public.tasks for select to authenticated using (client_id = public.my_client_id() and kind in ('delivered','client_change')); end if;
end $$;
revoke all on public.tasks from anon;
grant select, update (status, answer, answered_at, done_at, updated_at) on public.tasks to authenticated;

create or replace function public.task_open(p_kind text, p_source_table text, p_source_id text, p_title text, p_client uuid, p_platform text default null, p_received text default null, p_owner text default null, p_priority text default 'normal')
returns uuid language plpgsql security definer set search_path = public as $$
declare tid uuid;
begin
  select id into tid from tasks where source_table = p_source_table and source_id = p_source_id and kind = p_kind;
  if tid is not null then
    update tasks set status = 'open', done_at = null, title = left(p_title, 200), received = coalesce(p_received, received), updated_at = now() where id = tid and status = 'done';
    return tid;
  end if;
  insert into tasks (kind, source_table, source_id, title, client_id, platform, received, owner, priority)
  values (p_kind, p_source_table, p_source_id, left(p_title, 200), p_client, p_platform, p_received, p_owner, p_priority) returning id into tid;
  return tid;
end $$;
create or replace function public.task_close(p_source_table text, p_source_id text, p_kind text default null)
returns void language sql security definer set search_path = public as $$
  update tasks set status = 'done', done_at = now(), updated_at = now()
  where source_table = p_source_table and source_id = p_source_id and status <> 'done' and (p_kind is null or kind = p_kind);
$$;
revoke all on function public.task_open(text,text,text,text,uuid,text,text,text,text) from public, anon, authenticated;
revoke all on function public.task_close(text,text,text) from public, anon, authenticated;

create or replace function public.task_enquiry() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform task_open('enquiry', 'site_enquiries', new.id::text, 'Website enquiry · ' || coalesce(new.name,'') || case when new.business is not null then ' · ' || new.business else '' end,
      (select id from clients where name ilike 'ZKJ SYSTEM' limit 1), null,
      concat_ws(' · ', nullif(new.country,''), nullif(new.package,''), nullif(left(new.message, 300),'')), 'VRS-INBOX');
  elsif new.status <> 'new' then perform task_close('site_enquiries', new.id::text);
  end if;
  return new;
end $$;
create or replace trigger site_enquiries_task after insert or update of status on public.site_enquiries for each row execute function public.task_enquiry();

create or replace function public.task_publish_error() returns trigger language plpgsql security definer set search_path = public as $$
declare n int; cname text;
begin
  select count(*) into n from items where client_id = new.client_id and platform = new.platform and coalesce(publish_error,'') <> '' and status <> 'published';
  select name into cname from clients where id = new.client_id;
  if n > 0 then
    perform task_open('publish_error', 'items_platform', new.client_id::text || ':' || coalesce(new.platform,''),
      initcap(coalesce(new.platform,'')) || ' refused ' || n || ' post' || case when n = 1 then '' else 's' end || ' · ' || coalesce(cname,''),
      new.client_id, new.platform, left(coalesce(new.publish_error,''), 300), 'Social setup');
  else perform task_close('items_platform', new.client_id::text || ':' || coalesce(new.platform,''));
  end if;
  return new;
end $$;
create or replace trigger items_task_publish_error after update of publish_error, status on public.items for each row execute function public.task_publish_error();

create or replace function public.task_comment() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'waiting' then
    perform task_open('comment', 'comment_replies', new.comment_id, 'Comment waiting · @' || coalesce(new.from_name,'') || ' on ' || initcap(coalesce(new.platform,'')), new.client_id, new.platform, left(coalesce(new.comment,''), 300), 'Content & Publish');
  else perform task_close('comment_replies', new.comment_id);
  end if;
  return new;
end $$;
create or replace trigger comment_replies_task after insert or update of status on public.comment_replies for each row execute function public.task_comment();

create or replace function public.task_account() returns trigger language plpgsql security definer set search_path = public as $$
declare cname text;
begin
  select name into cname from clients where id = new.client_id;
  if new.status <> 'ok' and new.status <> 'revoked' then
    perform task_open('account', 'social_accounts', new.id::text, initcap(new.network) || ' needs reconnecting · ' || coalesce(cname,''), new.client_id, new.network, left(coalesce(new.last_error,''), 300), 'Social setup', 'emergency');
  else perform task_close('social_accounts', new.id::text);
  end if;
  return new;
end $$;
create or replace trigger social_accounts_task after insert or update of status on public.social_accounts for each row execute function public.task_account();

create or replace function public.task_studio() returns trigger language plpgsql security definer set search_path = public as $$
declare cname text;
begin
  select name into cname from clients where id = new.client_id;
  if new.delivered_at is not null and (tg_op = 'INSERT' or old.delivered_at is null) then
    perform task_open('delivered', 'studio_jobs', new.id::text, 'Studio delivered · ' || coalesce(cname,'') || ' · ' || coalesce(new.title,''), new.client_id, null, left(coalesce(new.brief,''), 300), coalesce(new.agent,''));
  end if;
  return new;
end $$;
create or replace trigger studio_jobs_task after insert or update of delivered_at on public.studio_jobs for each row execute function public.task_studio();

create or replace function public.task_drawing() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('quoted','delivered','approved','cancelled') and (tg_op = 'INSERT' or new.status is distinct from old.status) then
    if new.status in ('approved','cancelled') then perform task_close('drawing_jobs', new.id::text);
    else perform task_open('drawing', 'drawing_jobs', new.id::text, 'Drawings order · ' || coalesce(new.name,'') || ' · ' || new.status, null, null, left(coalesce(new.work,''), 300), 'Drawings Agent'); end if;
  end if;
  return new;
end $$;
create or replace trigger drawing_jobs_task after insert or update of status on public.drawing_jobs for each row execute function public.task_drawing();

do $$
declare r record;
begin
  for r in select distinct client_id, platform, (select name from clients c where c.id = i.client_id) cname, count(*) over (partition by client_id, platform) n, publish_error from items i where coalesce(publish_error,'') <> '' and status <> 'published' loop
    perform task_open('publish_error', 'items_platform', r.client_id::text || ':' || coalesce(r.platform,''), initcap(coalesce(r.platform,'')) || ' refused ' || r.n || ' post' || case when r.n = 1 then '' else 's' end || ' · ' || coalesce(r.cname,''), r.client_id, r.platform, left(r.publish_error, 300), 'Social setup');
  end loop;
  for r in select * from site_enquiries where status = 'new' loop
    perform task_open('enquiry', 'site_enquiries', r.id::text, 'Website enquiry · ' || coalesce(r.name,'') || case when r.business is not null then ' · ' || r.business else '' end, (select id from clients where name ilike 'ZKJ SYSTEM' limit 1), null, concat_ws(' · ', nullif(r.country,''), nullif(r.package,''), nullif(left(r.message,300),'')), 'VRS-INBOX');
  end loop;
  for r in select * from comment_replies where status = 'waiting' loop
    perform task_open('comment', 'comment_replies', r.comment_id, 'Comment waiting · @' || coalesce(r.from_name,''), r.client_id, r.platform, left(coalesce(r.comment,''),300), 'Content & Publish');
  end loop;
  for r in select s.*, c.name cname from social_accounts s join clients c on c.id = s.client_id where s.status not in ('ok','revoked') loop
    perform task_open('account', 'social_accounts', r.id::text, initcap(r.network) || ' needs reconnecting · ' || r.cname, r.client_id, r.network, left(coalesce(r.last_error,''),300), 'Social setup', 'emergency');
  end loop;
end $$;

insert into public.tasks (kind, source_table, source_id, title, title_ar, received, received_ar, proposal, proposal_ar, options, owner, client_id)
select 'store', 'shopify_theme', '161468874923', 'Publish the store theme with the Enquire fix and the new form', 'انشر قالب المتجر مع إصلاح زر الاستفسار والنموذج الجديد',
  'Ready and tested in the draft theme. The live store still shows the 404 on the size link.', 'جاهز ومختبَر في القالب المسودة. المتجر الحي ما زال يعرض خطأ 404 على رابط المقاس.',
  'Shopify admin → Online Store → Themes → “Drive — ENQUIRY-ONLY · Enquire fix 5 Nov” → Publish.', 'لوحة Shopify ← المتجر ← القوالب ← "Enquire fix 5 Nov" ← نشر.',
  '[{"key":"published","label":"I published it","label_ar":"نشرته"},{"key":"tomorrow","label":"Remind me tomorrow","label_ar":"ذكّرني غدًا"}]'::jsonb, 'Website & Dashboard', (select id from clients where name ilike 'ZKJ VERSE' limit 1)
where not exists (select 1 from public.tasks where source_table = 'shopify_theme' and source_id = '161468874923');

create table if not exists public.targets (id text primary key, ord int not null, title text not null, title_ar text, owner text, created_at timestamptz not null default now());
create table if not exists public.target_steps (
  id uuid primary key default gen_random_uuid(), target_id text not null references public.targets(id) on delete cascade,
  ord int not null, title text not null, title_ar text, owner text, done_at timestamptz, note text, created_at timestamptz not null default now());
alter table public.targets enable row level security; alter table public.target_steps enable row level security;
do $$ begin
  if not exists (select 1 from pg_policy where polrelid = 'public.targets'::regclass and polname = 'targets_read') then
    create policy targets_read on public.targets for select to authenticated using (public.is_admin()); end if;
  if not exists (select 1 from pg_policy where polrelid = 'public.target_steps'::regclass and polname = 'target_steps_admin') then
    create policy target_steps_admin on public.target_steps for all to authenticated using (public.is_admin()) with check (public.is_admin()); end if;
end $$;
revoke all on public.targets, public.target_steps from anon;
grant select on public.targets to authenticated; grant select, update (done_at, note) on public.target_steps to authenticated;
insert into public.targets (id, ord, title, title_ar, owner) values
 ('T1',1,'Enquiry → delivery runs in the dashboard','من الاستفسار إلى التسليم داخل اللوحة','Website & Dashboard'),
 ('T2',2,'@zkjsystem growth · 4 steps','نمو @zkjsystem · 4 خطوات','Content & Publish'),
 ('T3',3,'Store: Enquire fix → size map → 136 drafts published','المتجر: إصلاح الاستفسار ← خريطة المقاسات ← نشر 136 مسودة','Store · Print · Jobs'),
 ('T4',4,'Platforms public: Google, TikTok, Pinterest audits passed','المنصات علنية: اجتياز مراجعات Google وTikTok وPinterest','Social setup'),
 ('T5',5,'Dashboard ONE: job list + chat links + targets','اللوحة الواحدة: قائمة المهام + روابط المحادثات + الأهداف','Website & Dashboard'),
 ('T6',6,'Verse v3 live','إطلاق Verse v3','Verse Build'),
 ('T7',7,'Certificates 25/25 with Arabic','الشهادات 25/25 بالعربية','Store · Print · Jobs')
on conflict (id) do nothing;
insert into public.target_steps (target_id, ord, title, title_ar, owner, done_at)
select * from (values
 ('T1',1,'Website enquiries saved to the dashboard','حفظ استفسارات الموقع في اللوحة','Website & Dashboard','2026-11-05'::timestamptz),
 ('T1',2,'Bell + phone alert on a new enquiry','تنبيه الجرس والهاتف عند استفسار جديد','Website & Dashboard','2026-11-06'),
 ('T1',3,'Enquiries section with stages and follow-up','قسم الاستفسارات مع المراحل والمتابعة','Website & Dashboard',null),
 ('T1',4,'Private client delivery link (files, approve, download)','رابط تسليم خاص للعميل','Website & Dashboard',null),
 ('T1',5,'Weekly status per client job','حالة أسبوعية لكل عمل عميل','Website & Dashboard',null),
 ('T1',6,'Drive-only option','خيار Drive فقط','Website & Dashboard',null),
 ('T2',1,'Step 1 (owner to fill)','الخطوة 1 (يملؤها المالك)','Content & Publish',null),
 ('T2',2,'Step 2 (owner to fill)','الخطوة 2','Content & Publish',null),
 ('T2',3,'Step 3 (owner to fill)','الخطوة 3','Content & Publish',null),
 ('T2',4,'Step 4 (owner to fill)','الخطوة 4','Content & Publish',null),
 ('T3',1,'Enquire button fix built and tested in the draft theme','إصلاح زر الاستفسار مبني ومختبَر','Website & Dashboard','2026-11-05'),
 ('T3',2,'Theme published by KJ','نشر القالب (KJ)','KJ',null),
 ('T3',3,'Size map','خريطة المقاسات','Store · Print · Jobs',null),
 ('T3',4,'136 drafts published','نشر 136 مسودة','Store · Print · Jobs',null),
 ('T4',1,'Google audit passed (YouTube public)','اجتياز مراجعة Google','Social setup',null),
 ('T4',2,'TikTok audit passed (public posts)','اجتياز مراجعة TikTok','Social setup',null),
 ('T4',3,'Pinterest Standard access','وصول Pinterest القياسي','Social setup',null),
 ('T5',1,'Home design approved by KJ','اعتماد تصميم الصفحة الرئيسية','KJ','2026-11-06'),
 ('T5',2,'Job list + targets in the database','قائمة المهام والأهداف في قاعدة البيانات','Website & Dashboard','2026-11-06'),
 ('T5',3,'Instant notify step with the API key','خطوة التنبيه الفوري','Website & Dashboard',null),
 ('T5',4,'Home + Approve live (merged)','الصفحة الرئيسية والموافقة حيّة','Website & Dashboard',null),
 ('T5',5,'Phone alerts on KJ''s iPhone','تنبيهات الهاتف','Website & Dashboard',null),
 ('T6',1,'Steps to be set by Verse Build','الخطوات يحددها Verse Build','Verse Build',null),
 ('T7',1,'Steps to be set by Store · Print · Jobs','الخطوات يحددها Store · Print · Jobs','Store · Print · Jobs',null)
) v(target_id, ord, title, title_ar, owner, done_at)
where not exists (select 1 from public.target_steps);

create or replace view public.targets_v with (security_invoker = true) as
select t.id, t.ord, t.title, t.title_ar, t.owner,
  count(s.id) steps, count(s.done_at) done,
  case when count(s.id) = 0 then 0 else round(100.0 * count(s.done_at) / count(s.id)) end pct,
  (select title from public.target_steps n where n.target_id = t.id and n.done_at is null order by n.ord limit 1) next_step,
  (select title_ar from public.target_steps n where n.target_id = t.id and n.done_at is null order by n.ord limit 1) next_step_ar,
  max(s.done_at) last_done
from public.targets t left join public.target_steps s on s.target_id = t.id group by t.id;
grant select on public.targets_v to authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create or replace trigger tasks_touch before update on public.tasks for each row execute function public.touch_updated_at();
