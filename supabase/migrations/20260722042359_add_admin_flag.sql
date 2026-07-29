-- Admin flag for Tracy + support. Admin pages authenticate the member, check
-- this flag, then use the service-role client to read across all members.
alter table public.members
  add column is_admin boolean not null default false;

-- Members can already read their own row (existing RLS); is_admin rides along.
-- Only the service role can set it — the column-level UPDATE grant added in the
-- initial migration limits authenticated members to the `name` column, so
-- is_admin is not member-writable.
