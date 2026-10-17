-- Comment auto-replies (KJ, 17 Oct 2026: "yes bank"; rules 1 and 3 changed for this case).
-- reply_bank: the replies KJ approved, one or more per client. Only rows with approved_at set are ever posted.
-- comment_replies: one row per comment seen, so nothing is answered twice. Server-only writes (Edge Function meta-replies).
create table if not exists public.reply_bank (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  label text not null default 'welcome',
  body text not null,
  active boolean not null default true,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.comment_replies (
  comment_id text primary key,
  client_id uuid references public.clients(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook')),
  media_id text,
  permalink text,
  from_name text,
  comment text,
  comment_at timestamptz,
  reply_id text,
  reply_text text,
  status text not null check (status in ('claimed', 'replied', 'skipped', 'waiting', 'failed')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comment_replies_media on public.comment_replies (media_id, from_name);
alter table public.reply_bank enable row level security;
alter table public.comment_replies enable row level security;
drop policy if exists reply_bank_admin on public.reply_bank;
create policy reply_bank_admin on public.reply_bank for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists comment_replies_admin on public.comment_replies;
create policy comment_replies_admin on public.comment_replies for select to authenticated using (public.is_admin());
insert into public.app_settings (key, value) values ('replies_paused', 'false'), ('replies_lookback_hours', '48') on conflict (key) do nothing;
