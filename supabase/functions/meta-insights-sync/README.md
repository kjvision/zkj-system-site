# meta-insights-sync (Supabase Edge Function)

Deployed to the ZKJ SYSTEM project on 15 Oct 2026 through the Supabase connector. The live source is in
Supabase → Edge Functions → meta-insights-sync. It is the Deno version of `scripts/meta-insights-sync.mjs`
(same metrics, same kpis rows, same stable ids), plus a `sync_runs` log and a 10-minute guard.

Schedule: pg_cron job `meta-insights-sync`, `20 23 * * *` UTC (03:20 Dubai), set by the migration
`meta_insights_sync_schedule`. Secret needed: `META_ACCESS_TOKEN` (Edge Functions → Secrets).
See `supabase/META-SYNC.md`.
