-- Instagram collaborators per post (board order 2026-11-04 organic growth; APPLIED 4 Nov 2026 after KJ: "YES SWITCH ON ALSO FOR ZKJ VERSE").
-- Up to 3 public Instagram usernames, without @. meta-publisher sends them as `collaborators` on reels, feed photos and carousels.
alter table public.items add column if not exists collaborators text[];
alter table public.items add column if not exists collab_error text;
alter table public.items drop constraint if exists items_collaborators_max3;
alter table public.items add constraint items_collaborators_max3 check (collaborators is null or cardinality(collaborators) <= 3);
-- a brand's standing partner, used when a post has none of its own
alter table public.clients add column if not exists default_collaborators text[];
alter table public.clients drop constraint if exists clients_default_collaborators_max3;
alter table public.clients add constraint clients_default_collaborators_max3 check (default_collaborators is null or cardinality(default_collaborators) <= 3);
-- set 4 Nov: ZKJ VERSE → @kjvision.zkj; ZKJ SYSTEM reels per post (Ep3, Ep4, Ep6 → @kjvision.zkj; What-if, Ep5 → @zkjverse)
