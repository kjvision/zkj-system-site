-- STORE CONTROL POINT (KJ 7 Nov 2026): one row per art order, from "Send the invoice" to delivered.
-- Applied with execute_sql (no DROP statements: the tool asks for confirmation on those).
create table if not exists public.art_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  enquiry_id uuid references public.site_enquiries(id),
  artwork text, size text, product_id text, variant_id text,
  amount numeric, currency text,
  customer_email text, customer_name text,
  draft_order_id text, draft_order_name text, invoice_url text, invoice_sent_at timestamptz,
  order_id text, order_name text, paid_at timestamptz,
  fulfillment_status text, fulfillment_service text, tracking_url text, tracking_company text, shipped_at timestamptz, delivered_at timestamptz,
  stage text not null default 'invoice_pending' check (stage in ('invoice_pending','invoice_sent','paid','at_lab','shipped','delivered','cancelled','attention')),
  note text, last_checked_at timestamptz
);
alter table public.art_orders enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='art_orders' and policyname='art_orders_admin') then
    create policy art_orders_admin on public.art_orders for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
create or replace function public.art_orders_touch() returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
do $$ begin
  if not exists (select 1 from pg_trigger where tgname='art_orders_touch') then
    create trigger art_orders_touch before update on public.art_orders for each row execute function public.art_orders_touch();
  end if;
end $$;
-- every 10 minutes: the control point looks at the store and tells KJ what moved
select cron.schedule('store-control', '5,15,25,35,45,55 * * * *',
  $$select net.http_post(url := 'https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/store-control', headers := '{"Content-Type":"application/json"}'::jsonb, body := '{"action":"sync"}'::jsonb, timeout_milliseconds := 60000)$$)
where not exists (select 1 from cron.job where jobname = 'store-control');
