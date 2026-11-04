-- Every post on every platform (KJ, 3 Nov 2026: "every post or reel should be shared to all platforms every single time").
-- When the Instagram copy of a post is approved, an approved copy is added for every other account the brand has connected
-- (YouTube, X, Pinterest, TikTok). Facebook already follows Instagram (meta-publisher posts each Instagram item to the brand's Page).
-- Skipped: stories and replies; YouTube without a video; a video pin without a cover image; a platform that already has this post.
-- A newly connected account joins automatically from the next approval. Publishing rules stay in social-publisher.
create or replace function public.fan_out_on_approve() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  n text;
  lead text := split_part(regexp_replace(btrim(coalesce(new.media_url, '')), '[\s,]+', ',', 'g'), ',', 1);
  is_video boolean := coalesce(new.media_url, '') ~* '\.(mp4|mov)(\?[^,\s]*)?([,\s]|$)';
  has_img boolean := coalesce(new.media_url, '') ~* '\.(jpe?g|png|webp)(\?[^,\s]*)?([,\s]|$)';
begin
  if new.status <> 'approved' or old.status = 'approved' then return new; end if;
  if new.kind in ('reply', 'story') or coalesce(new.platform, '') <> 'instagram' or lead = '' then return new; end if;
  for n in select distinct network from public.social_accounts
           where client_id = new.client_id and coalesce(status, 'ok') <> 'revoked' and network in ('youtube', 'x', 'pinterest', 'tiktok') loop
    if n = 'youtube' and not is_video then continue; end if;
    if n = 'pinterest' and is_video and not has_img then continue; end if;
    if exists (select 1 from public.items i where i.client_id = new.client_id and i.kind = new.kind and i.platform = n
               and split_part(regexp_replace(btrim(coalesce(i.media_url, '')), '[\s,]+', ',', 'g'), ',', 1) = lead) then continue; end if;
    insert into public.items (client_id, kind, title, title_ar, caption, caption_ar, media_url, platform, scheduled_at, status, reviewed_at, reviewed_by)
    values (new.client_id, new.kind, new.title, new.title_ar, new.caption, new.caption_ar, new.media_url, n, new.scheduled_at, 'approved', now(), new.reviewed_by);
  end loop;
  return new;
end $$;
revoke execute on function public.fan_out_on_approve() from public, anon, authenticated;
drop trigger if exists items_fan_out on public.items;
create trigger items_fan_out after update of status on public.items for each row execute function public.fan_out_on_approve();
