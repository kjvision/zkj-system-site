-- Enquiries from the system.zkjverse.com form, saved for the dashboard (KJ, 5 Nov 2026: "yes add it").
-- Written only by the site-enquiry Edge Function (service role). Only admins read or update.
create table if not exists public.site_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null, business text, country text, phone text, email text,
  tools text, platforms text, package text, message text, language text, page text,
  status text not null default 'new' check (status in ('new','contacted','won','lost')),
  note text
);
create index if not exists site_enquiries_created on public.site_enquiries (created_at desc);
alter table public.site_enquiries enable row level security;
drop policy if exists site_enquiries_admin_read on public.site_enquiries;
create policy site_enquiries_admin_read on public.site_enquiries for select to authenticated using (public.is_admin());
drop policy if exists site_enquiries_admin_update on public.site_enquiries;
create policy site_enquiries_admin_update on public.site_enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.site_enquiries from anon;
grant select, update (status, note, updated_at) on public.site_enquiries to authenticated;
