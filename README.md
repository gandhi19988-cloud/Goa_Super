# Goa Super

Dynamic display-board website for Goa Super.

## Stack

- React
- Vite
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Run locally:

```bash
npm.cmd run dev
```

Build:

```bash
npm.cmd run build
```

## Routes

- `/` public display board
- `/kf-control` hidden admin login and dashboard

## Supabase Setup

Run the SQL from:

```text
supabase/schema.sql
```

This creates:

- `calendar_slot_content`
- `site_settings`
- `admin_profiles`
- `site-assets` storage bucket
- RLS policies
- Storage policies

After creating a Supabase Auth user, add the user to `admin_profiles`:

```sql
insert into public.admin_profiles (user_id, email)
values ('AUTH_USER_ID_HERE', 'admin@example.com');
```

## Testing

Follow:

```text
doc/testing_steps.md
```

## Current Status

Most local app work is complete. The remaining required setup is running the Supabase SQL in the production Supabase project and creating at least one admin profile.
