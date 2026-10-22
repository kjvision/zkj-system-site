-- Drawings desk (T-12 2D Engineering Drawings), KJ 21 Oct 2026: order → quote → confirm → draw → KJ check → customer review → approved.
create table if not exists public.drawing_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  customer_key uuid not null default gen_random_uuid(),   -- the customer's private order-page key
  agent_key uuid not null default gen_random_uuid(),      -- the drawings agent's key (HQ only)
  name text not null, company text, email text, phone text, lang text not null default 'en',
  work text[] not null default '{}', labels text not null default 'en', units text not null default 'mm', scale text, sheet text not null default 'A3',
  details text not null, inputs jsonb not null default '[]', outputs jsonb not null default '[]',
  sheets int, price_per_sheet numeric, currency text not null default 'USD',
  status text not null default 'received' check (status in ('received','quoted','confirmed','in_work','check','review','changes','approved','cancelled')),
  revision int not null default 0, customer_note text, hq_note text,
  quoted_at timestamptz, confirmed_at timestamptz, delivered_at timestamptz, approved_at timestamptz
);
alter table public.drawing_jobs enable row level security;
create policy drawing_jobs_admin on public.drawing_jobs for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- private file store: customers upload through signed links from the desk; KJ reads with his admin login
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('drawings', 'drawings', false, 52428800, array['application/pdf','image/jpeg','image/png','image/webp','image/heic','application/dxf','image/vnd.dxf','application/acad','image/vnd.dwg','application/octet-stream'])
on conflict (id) do nothing;
create policy drawings_files_admin_read on storage.objects for select to authenticated using (bucket_id = 'drawings' and public.is_admin());
insert into public.app_settings (key, value) values ('drawings_price_per_sheet', ''), ('drawings_currency', 'USD') on conflict (key) do nothing;

-- 21 Oct 2026 · add-ons after approval (3D model, method statement): a linked job with its own quote; agents may upload .skp, .docx and .mp4.
alter table public.drawing_jobs add column if not exists parent_id uuid references public.drawing_jobs(id) on delete set null;
create index if not exists drawing_jobs_parent_idx on public.drawing_jobs(parent_id);
update storage.buckets set allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp','image/heic','application/dxf','image/vnd.dxf','application/acad','image/vnd.dwg','application/octet-stream','application/vnd.openxmlformats-officedocument.wordprocessingml.document','video/mp4'] where id = 'drawings';

-- 22 Oct 2026 · KJ: "change the AED" — drawings are priced in USD (the account currency), not AED. Applied live.
alter table public.drawing_jobs alter column currency set default 'USD';
update public.drawing_jobs set currency = 'USD' where currency = 'AED';
update public.app_settings set value = 'USD' where key = 'drawings_currency';

-- 22 Oct 2026 · the agent's inbox: one permanent private key (value = a random uuid, set once in app_settings) lists every job that needs the agent.
insert into public.app_settings (key, value) values ('drawings_agent_inbox_key', gen_random_uuid()::text) on conflict (key) do nothing;
