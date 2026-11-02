-- Inbox: KJ replies to a comment by hand from the portal (KJ, 2 Nov 2026). The automatic reply columns are never overwritten.
alter table public.comment_replies add column if not exists manual_reply_text text;
alter table public.comment_replies add column if not exists manual_reply_id text;
alter table public.comment_replies add column if not exists manual_reply_at timestamptz;
alter table public.comment_replies add column if not exists manual_reply_by uuid references auth.users (id) on delete set null;
create index if not exists comment_replies_client_at on public.comment_replies (client_id, comment_at desc);
