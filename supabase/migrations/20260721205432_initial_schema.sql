-- PorchLyte Agent Platform — initial schema
-- Tables per docs/implementation-plan.md "Data model". RLS on every member-facing table.
-- Portal reads/writes as the authenticated member (auth.uid()); the MCP server and
-- admin tooling use the service role, which bypasses RLS.

-- ---------------------------------------------------------------------------
-- members — one row per app user, id mirrors auth.users.id
-- ---------------------------------------------------------------------------
create table public.members (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text not null unique,
  name               text,
  status             text not null default 'active'
                     check (status in ('active', 'paused', 'canceled')),
  plan               text not null default 'foundations'
                     check (plan in ('foundations', 'team', 'trifecta', 'full')),
  stripe_customer_id text unique,
  created_at         timestamptz not null default now()
);

-- Auto-create a member row on signup so the portal and MCP server can assume it exists.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.members (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- profiles — the three Foundations (voice / brand / local)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key default gen_random_uuid(),
  member_id         uuid not null references public.members (id) on delete cascade,
  kind              text not null check (kind in ('voice', 'brand', 'local')),
  content           text,
  status            text not null default 'empty'
                    check (status in ('complete', 'partial', 'empty')),
  interview_answers jsonb,
  updated_at        timestamptz not null default now(),
  updated_by        text check (updated_by in ('portal_wizard', 'mcp_claude', 'admin')),
  unique (member_id, kind)
);

-- ---------------------------------------------------------------------------
-- team_profiles — the nine hires
-- ---------------------------------------------------------------------------
create table public.team_profiles (
  id                uuid primary key default gen_random_uuid(),
  member_id         uuid not null references public.members (id) on delete cascade,
  agent             text not null check (agent in
                    ('darla', 'chloe', 'ella', 'poppy', 'treena',
                     'lia', 'sloane', 'rhonda', 'olivia')),
  content           text,
  status            text not null default 'not_hired'
                    check (status in ('not_hired', 'partial', 'hired')),
  interview_answers jsonb,
  updated_at        timestamptz not null default now(),
  updated_by        text check (updated_by in ('portal_wizard', 'mcp_claude', 'admin')),
  unique (member_id, agent)
);

-- ---------------------------------------------------------------------------
-- usage_events — automatic server-side logging on every tool/API call
-- event stays unchecked text: the tool layer owns the vocabulary and new
-- events must not require a migration.
-- ---------------------------------------------------------------------------
create table public.usage_events (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.members (id) on delete cascade,
  agent      text,
  event      text not null,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index usage_events_member_created_idx
  on public.usage_events (member_id, created_at desc);
create index usage_events_event_idx on public.usage_events (event);

-- ---------------------------------------------------------------------------
-- scheduled_tasks — hub-managed state for Darla's brief and Rhonda's scan
-- ---------------------------------------------------------------------------
create table public.scheduled_tasks (
  id               uuid primary key default gen_random_uuid(),
  member_id        uuid not null references public.members (id) on delete cascade,
  agent            text not null check (agent in ('darla', 'rhonda')),
  state            text not null default 'active'
                   check (state in ('active', 'paused')),
  schedule_label   text,
  last_run_at      timestamptz,
  last_run_summary text,
  updated_at       timestamptz not null default now(),
  unique (member_id, agent)
);

-- ---------------------------------------------------------------------------
-- connector_status — diagnostic dashboard data
-- ---------------------------------------------------------------------------
create table public.connector_status (
  member_id                uuid primary key references public.members (id) on delete cascade,
  plugin_installed_version text,
  plugin_latest_version    text,
  last_successful_sync_at  timestamptz,
  connector_linked_at      timestamptz
);

-- ---------------------------------------------------------------------------
-- audit_log — admin/actor actions on member data
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid references public.members (id) on delete set null,
  actor      text not null,
  action     text not null,
  entity     text,
  created_at timestamptz not null default now()
);

create index audit_log_member_idx on public.audit_log (member_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger team_profiles_set_updated_at
  before update on public.team_profiles
  for each row execute function public.set_updated_at();

create trigger scheduled_tasks_set_updated_at
  before update on public.scheduled_tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Members see and edit only their own rows. Inserts/updates from the portal
-- run as the member; the MCP server and Stripe webhooks use the service role.
-- ---------------------------------------------------------------------------
alter table public.members enable row level security;
alter table public.profiles enable row level security;
alter table public.team_profiles enable row level security;
alter table public.usage_events enable row level security;
alter table public.scheduled_tasks enable row level security;
alter table public.connector_status enable row level security;
alter table public.audit_log enable row level security;

-- members: read own record. Only `name` is member-editable — status, plan,
-- and stripe_customer_id change exclusively via service role (Stripe webhooks,
-- admin), enforced with column-level grants rather than policy subqueries.
revoke update on public.members from authenticated, anon;
grant update (name) on public.members to authenticated;

create policy "members can read own record"
  on public.members for select
  to authenticated
  using (id = (select auth.uid()));

create policy "members can update own name"
  on public.members for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- profiles: full read/write on own foundations
create policy "members read own profiles"
  on public.profiles for select
  to authenticated
  using (member_id = (select auth.uid()));

create policy "members insert own profiles"
  on public.profiles for insert
  to authenticated
  with check (member_id = (select auth.uid()));

create policy "members update own profiles"
  on public.profiles for update
  to authenticated
  using (member_id = (select auth.uid()))
  with check (member_id = (select auth.uid()));

-- team_profiles: read own; writes go through the portal API / MCP server
-- (service role) because hiring is plan-gated server-side.
create policy "members read own team profiles"
  on public.team_profiles for select
  to authenticated
  using (member_id = (select auth.uid()));

-- usage_events: members can read their own usage (powers member-facing stats);
-- writes are server-side only.
create policy "members read own usage events"
  on public.usage_events for select
  to authenticated
  using (member_id = (select auth.uid()));

-- scheduled_tasks: read own + toggle state/schedule from the hub panel
create policy "members read own scheduled tasks"
  on public.scheduled_tasks for select
  to authenticated
  using (member_id = (select auth.uid()));

create policy "members insert own scheduled tasks"
  on public.scheduled_tasks for insert
  to authenticated
  with check (member_id = (select auth.uid()));

create policy "members update own scheduled tasks"
  on public.scheduled_tasks for update
  to authenticated
  using (member_id = (select auth.uid()))
  with check (member_id = (select auth.uid()));

-- connector_status: read own; written by the MCP server (service role)
create policy "members read own connector status"
  on public.connector_status for select
  to authenticated
  using (member_id = (select auth.uid()));

-- audit_log: no member-facing policies — service role only.
