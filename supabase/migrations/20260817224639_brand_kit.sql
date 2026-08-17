-- Brand kit — the structured half of the Brand foundation.
--
-- The Brand foundation profile is prose: how the brand should feel, what to
-- avoid, the aesthetic. That reads well and personalizes writing, but Brooke
-- can't build a file from it, because "warm and editorial" is not a hex code.
-- This adds the parts a designer actually needs as data: exact colors, named
-- fonts, and the real logo files. The prose profile stays where it is.

create table public.brand_kits (
  member_id  uuid primary key references public.members (id) on delete cascade,
  -- [{ "name": "Deep Olive", "hex": "#3B4A2F", "role": "primary" }, ...]
  colors     jsonb not null default '[]'::jsonb
             check (jsonb_typeof(colors) = 'array'),
  -- [{ "role": "heading", "name": "Canela", "notes": "Tracking +2" }, ...]
  fonts      jsonb not null default '[]'::jsonb
             check (jsonb_typeof(fonts) = 'array'),
  -- Logo usage rules, photography direction, what never to do.
  notes      text,
  updated_at timestamptz not null default now(),
  updated_by text check (updated_by in ('portal_wizard', 'mcp_claude', 'admin'))
);

-- ---------------------------------------------------------------------------
-- brand_assets — uploaded files, one row per object in the brand-assets bucket
-- ---------------------------------------------------------------------------
create table public.brand_assets (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references public.members (id) on delete cascade,
  kind         text not null check (kind in
               ('primary_logo', 'secondary_logo', 'submark', 'headshot', 'other')),
  storage_path text not null unique,
  file_name    text not null,
  mime_type    text not null,
  size_bytes   integer not null check (size_bytes > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- The named slots hold one file each: uploading a new primary logo replaces
-- the old one. 'other' is the open shelf, so it stays out of the constraint.
create unique index brand_assets_member_kind_key
  on public.brand_assets (member_id, kind)
  where kind <> 'other';

create index brand_assets_member_idx on public.brand_assets (member_id);

create trigger brand_kits_set_updated_at
  before update on public.brand_kits
  for each row execute function public.set_updated_at();

create trigger brand_assets_set_updated_at
  before update on public.brand_assets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Members read their own rows. Writes are service-role only: uploads have to
-- go through the portal API so the file is validated and the storage object
-- and its row are written together.
-- ---------------------------------------------------------------------------
alter table public.brand_kits enable row level security;
alter table public.brand_assets enable row level security;

create policy "members read own brand kit"
  on public.brand_kits for select
  to authenticated
  using (member_id = (select auth.uid()));

create policy "members read own brand assets"
  on public.brand_assets for select
  to authenticated
  using (member_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage
-- Private bucket, no storage.objects policies: every read is a signed URL
-- minted server-side, every write goes through the service role. Raster only
-- on purpose — an uploaded SVG can carry script, and these files get handed
-- back to members (and to Claude) as URLs on a Supabase origin.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;
