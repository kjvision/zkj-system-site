-- Cross-posting (KJ, 18 Oct 2026): every Instagram post also goes to the Facebook Page and to Threads.
alter table public.clients add column if not exists mirror_facebook text not null default 'none' check (mirror_facebook in ('none', 'stories', 'all'));
alter table public.clients add column if not exists mirror_threads boolean not null default false;
alter table public.items add column if not exists fb_url text;
alter table public.items add column if not exists fb_error text;
alter table public.items add column if not exists threads_url text;
alter table public.items add column if not exists threads_error text;
-- Threads tokens: server-only (RLS on, no policy). Filled by the threads-connect function, renewed weekly.
create table if not exists public.threads_accounts (
  client_id uuid primary key references public.clients(id) on delete cascade,
  threads_user_id text not null,
  username text,
  access_token text not null,
  expires_at timestamptz,
  connected_at timestamptz not null default now(),
  refreshed_at timestamptz
);
alter table public.threads_accounts enable row level security;
-- ZKJ SYSTEM keeps its own Facebook feed cards, so only its stories are copied.
update public.clients set mirror_facebook = 'all' where name in ('KJ VISION', 'ZKJ VERSE');
update public.clients set mirror_facebook = 'stories' where name = 'ZKJ SYSTEM';
update public.clients set mirror_threads = true where name in ('KJ VISION', 'ZKJ VERSE', 'ZKJ SYSTEM');
