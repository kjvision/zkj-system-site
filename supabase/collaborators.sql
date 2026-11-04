-- Instagram collaborators per post (board order 2026-11-04 organic growth; PREPARED, apply only after KJ says yes).
-- Up to 3 public Instagram usernames, without @. meta-publisher sends them as `collaborators` on reels, feed photos and carousels.
alter table public.items add column if not exists collaborators text[];
alter table public.items add column if not exists collab_error text;
alter table public.items drop constraint if exists items_collaborators_max3;
alter table public.items add constraint items_collaborators_max3 check (collaborators is null or cardinality(collaborators) <= 3);
