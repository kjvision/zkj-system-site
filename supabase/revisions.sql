-- Items sent back for approval after a client's change request (16 Oct 2026).
-- revised_at: when the owner sent it back · revision_note: one line on what changed, shown on the card,
-- in the item detail and in the HQ to-do ("Edited — waiting for approval"). Applied to the live project.
alter table public.items
  add column if not exists revised_at timestamptz,
  add column if not exists revision_note text;
