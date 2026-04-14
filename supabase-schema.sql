create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  photo_url text not null default '',
  saved_track_ids text[] not null default '{}',
  recent_track_ids text[] not null default '{}',
  followed_artist_ids text[] not null default '{}',
  read_notification_ids text[] not null default '{}',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tracks (
  id text primary key,
  title text not null,
  artist text not null,
  artist_id text,
  album text,
  album_art text not null,
  url text not null,
  duration integer not null default 0,
  genre text,
  mood text,
  lyrics text,
  source text not null check (source in ('catalog', 'community', 'studio')),
  user_id uuid references auth.users (id) on delete set null,
  uploader_name text,
  description text,
  plays integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.playlists (
  id text primary key,
  name text not null,
  description text not null default '',
  cover_art text not null,
  track_ids text[] not null default '{}',
  user_id uuid not null references auth.users (id) on delete cascade,
  owner_name text not null default '',
  is_public boolean not null default true,
  followers integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.users enable row level security;
alter table public.tracks enable row level security;
alter table public.playlists enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
for select using (auth.uid() = id);

drop policy if exists "users_upsert_own" on public.users;
create policy "users_upsert_own" on public.users
for insert with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
for update using (auth.uid() = id);

drop policy if exists "tracks_select_public" on public.tracks;
create policy "tracks_select_public" on public.tracks
for select using (true);

drop policy if exists "tracks_insert_owner" on public.tracks;
create policy "tracks_insert_owner" on public.tracks
for insert with check (auth.uid() = user_id);

drop policy if exists "tracks_update_owner" on public.tracks;
create policy "tracks_update_owner" on public.tracks
for update using (auth.uid() = user_id);

drop policy if exists "playlists_select_public_or_owner" on public.playlists;
create policy "playlists_select_public_or_owner" on public.playlists
for select using (is_public or auth.uid() = user_id);

drop policy if exists "playlists_insert_owner" on public.playlists;
create policy "playlists_insert_owner" on public.playlists
for insert with check (auth.uid() = user_id);

drop policy if exists "playlists_update_owner" on public.playlists;
create policy "playlists_update_owner" on public.playlists
for update using (auth.uid() = user_id);

drop policy if exists "playlists_delete_owner" on public.playlists;
create policy "playlists_delete_owner" on public.playlists
for delete using (auth.uid() = user_id);
