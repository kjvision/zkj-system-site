-- YouTube · Pinterest · LinkedIn (KJ, 22 Oct 2026: three accounts per network, one per brand; LinkedIn = Company Pages only).
-- Tokens live here, server-only (RLS on, no policy; anon/authenticated revoked). Filled by the social-connect function; never through chat or the repo.
create table if not exists public.social_accounts (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  network       text not null check (network in ('youtube', 'pinterest', 'linkedin')),
  external_id   text not null,          -- YouTube channel id · Pinterest user id · LinkedIn organization URN
  name          text,                   -- channel title · @username · Page name
  url           text,
  access_token  text not null,
  refresh_token text,
  expires_at    timestamptz,
  scope         text,
  extra         jsonb not null default '{}'::jsonb,   -- pinterest: board_id, board_name · linkedin: orgs (the Pages KJ administers)
  status        text not null default 'ok' check (status in ('ok', 'expired', 'revoked')),
  last_error    text,
  connected_at  timestamptz not null default now(),
  refreshed_at  timestamptz,
  unique (client_id, network)
);
alter table public.social_accounts enable row level security;
revoke all on public.social_accounts from anon, authenticated;

-- What the portal may see (admin only): never the tokens.
create or replace function public.social_links()
returns table (client_id uuid, network text, external_id text, name text, url text, expires_at timestamptz, status text, last_error text, connected_at timestamptz, extra jsonb)
language sql stable security definer set search_path = public as $$
  select client_id, network, external_id, name, url, expires_at, status, last_error, connected_at, extra
  from public.social_accounts where public.is_admin() order by network, connected_at;
$$;
revoke execute on function public.social_links() from public, anon;
grant execute on function public.social_links() to authenticated;

-- Per-item result of the new networks. publish_state: 'private' = uploaded to YouTube, waiting for KJ's Publish tap (Google blocks public
-- uploads by API until its compliance audit); 'public' once public. external_id = YouTube video id · pin id · post URN.
alter table public.items add column if not exists publish_state text;
alter table public.items add column if not exists external_id text;

insert into public.app_settings (key, value) values
  ('social_connect_key', gen_random_uuid()::text),   -- guards the Connect links in the portal
  ('youtube_public_allowed', 'false'),               -- set to 'true' the day Google's audit passes: uploads then go public at once
  ('linkedin_version', '202509')                     -- LinkedIn-Version header (YYYYMM); each version is supported about 12 months
on conflict (key) do nothing;

-- Every 5 minutes: post what is approved and due on YouTube / Pinterest / LinkedIn. Daily 03:10 UTC: renew tokens that expire soon.
select cron.schedule('social-publisher', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/social-publisher',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"source": "pg_cron"}'::jsonb,
    timeout_milliseconds := 300000)
$$);
select cron.schedule('social-refresh', '10 3 * * *', $$
  select net.http_post(
    url := 'https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/social-connect?refresh=1',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"source": "pg_cron"}'::jsonb,
    timeout_milliseconds := 120000)
$$);

-- 23 Oct 2026 (KJ): TikTok now, LinkedIn later. Before TikTok's audit every post is private (SELF_ONLY).
alter table public.social_accounts drop constraint if exists social_accounts_network_check;
alter table public.social_accounts add constraint social_accounts_network_check check (network in ('youtube', 'pinterest', 'tiktok', 'linkedin'));
insert into public.app_settings (key, value) values ('tiktok_public_allowed', 'false') on conflict (key) do nothing;

-- 27 Oct 2026 (KJ): X added, ahead of LinkedIn. Pay-per-use API; posts are public at once (no audit).
alter table public.social_accounts drop constraint if exists social_accounts_network_check;
alter table public.social_accounts add constraint social_accounts_network_check check (network in ('youtube', 'pinterest', 'tiktok', 'x', 'linkedin'));

-- 27 Oct 2026 (KJ): YouTube comment replies, same bank and rules as Meta (replies.sql). comment_replies takes the new platforms.
alter table public.comment_replies drop constraint if exists comment_replies_platform_check;
alter table public.comment_replies add constraint comment_replies_platform_check check (platform in ('instagram', 'facebook', 'youtube', 'x', 'tiktok'));
select cron.schedule('social-replies', '7,27,47 * * * *', $$
  select net.http_post(
    url := 'https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/social-replies',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"source": "pg_cron"}'::jsonb,
    timeout_milliseconds := 120000)
$$);
