-- Publisher (Meta official publishing API) — run once in the SQL editor (already applied on 16 Oct 2026).
-- Per-item result fields + a settings table with the pause switch and the time window.
alter table public.items
  add column if not exists published_url text,
  add column if not exists published_at timestamptz,
  add column if not exists publish_error text,
  add column if not exists publish_attempts integer not null default 0,
  add column if not exists publish_lock timestamptz;

create table if not exists public.app_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
drop policy if exists app_settings_admin on public.app_settings;
create policy app_settings_admin on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.app_settings from anon;
grant select, insert, update on public.app_settings to authenticated;
insert into public.app_settings (key, value) values ('publisher_paused', 'false'), ('publisher_window_hours', '36') on conflict (key) do nothing;

-- Every 5 minutes: post what is approved and due (the function itself enforces the rules).
select cron.schedule('meta-publisher', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/meta-publisher',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"source": "pg_cron"}'::jsonb,
    timeout_milliseconds := 120000)
$$);
-- Pause / resume:  update public.app_settings set value = 'true'  where key = 'publisher_paused';
--                  update public.app_settings set value = 'false' where key = 'publisher_paused';
