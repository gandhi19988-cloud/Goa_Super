-- Goa Super Supabase schema
-- Run this in the Supabase SQL editor after creating the project.

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null default 'Goa Super',
  logo_url text,
  empty_state_text text not null default '*** *',
  default_slots jsonb not null default '[
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM"
  ]'::jsonb,
  theme_config jsonb not null default '{}'::jsonb,
  last_updated_at timestamptz default now(),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_slot_content (
  id uuid primary key default gen_random_uuid(),
  content_date date not null,
  slot_time text not null,
  display_value text,
  status text not null default 'published',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_date, slot_time)
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_calendar_slot_content_updated_at on public.calendar_slot_content;
create trigger set_calendar_slot_content_updated_at
before update on public.calendar_slot_content
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.calendar_slot_content enable row level security;

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
on public.admin_profiles
for select
using (public.is_admin());

drop policy if exists "Admins can manage admin profiles" on public.admin_profiles;
create policy "Admins can manage admin profiles"
on public.admin_profiles
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published calendar content" on public.calendar_slot_content;
create policy "Public can read published calendar content"
on public.calendar_slot_content
for select
using (status = 'published');

drop policy if exists "Admins can manage calendar content" on public.calendar_slot_content;
create policy "Admins can manage calendar content"
on public.calendar_slot_content
for all
using (public.is_admin())
with check (public.is_admin());

insert into public.site_settings (site_title)
select 'Goa Super'
where not exists (
  select 1 from public.site_settings
);

update public.site_settings
set site_title = 'Goa Super'
where site_title = 'Kolkata Fatafati';

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read site assets" on storage.objects;
create policy "Public can read site assets"
on storage.objects
for select
using (bucket_id = 'site-assets');

drop policy if exists "Admins can upload site assets" on storage.objects;
create policy "Admins can upload site assets"
on storage.objects
for insert
with check (
  bucket_id = 'site-assets'
  and public.is_admin()
);

drop policy if exists "Admins can update site assets" on storage.objects;
create policy "Admins can update site assets"
on storage.objects
for update
using (
  bucket_id = 'site-assets'
  and public.is_admin()
)
with check (
  bucket_id = 'site-assets'
  and public.is_admin()
);

drop policy if exists "Admins can delete site assets" on storage.objects;
create policy "Admins can delete site assets"
on storage.objects
for delete
using (
  bucket_id = 'site-assets'
  and public.is_admin()
);
