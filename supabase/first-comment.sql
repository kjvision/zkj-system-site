-- First comment on every post (KJ, 29 Oct 2026; built 31 Oct). The owner writes it on the card; the client approves it together with the post;
-- the publishers post it right after the post is live (Instagram and Facebook: both; YouTube: once public; X: as a reply; TikTok, Pinterest, LinkedIn: none).
alter table public.items add column if not exists first_comment text;
alter table public.items add column if not exists first_comment_at timestamptz;     -- set when it was posted
alter table public.items add column if not exists first_comment_error text;         -- why it was not posted (the post itself is never undone)
