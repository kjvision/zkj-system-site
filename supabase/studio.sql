-- Studio pipeline (17 Oct 2026): jobs for KJ's agents and the bucket their finished files land in.
-- Applied to the live project. Delivery desk: supabase/functions/studio-deliver.
create table if not exists public.studio_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  agent text not null default 'content',
  client_id uuid references public.clients(id),
  item_ids uuid[] not null default '{}',
  kind text not null default 'video',
  title text not null,
  brief text not null,
  status text not null default 'requested' check (status in ('requested','in_progress','delivered','cancelled')),
  files jsonb not null default '[]'::jsonb,
  note text,
  delivered_at timestamptz
);
alter table public.studio_jobs enable row level security;
create policy studio_jobs_admin on public.studio_jobs for all using (public.is_admin()) with check (public.is_admin());
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studio', 'studio', true, 314572800, array['video/mp4','video/quicktime','image/jpeg','image/png'])
on conflict (id) do nothing;
