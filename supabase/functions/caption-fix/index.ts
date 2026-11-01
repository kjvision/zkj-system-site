// Retired 31 Oct 2026: the one-off Facebook caption fix is done (see APPROVALS.md). This stub does nothing.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
Deno.serve(() => new Response(JSON.stringify({ ok: false, retired: true }), { status: 410, headers: { 'Content-Type': 'application/json' } }));
