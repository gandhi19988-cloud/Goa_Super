# Kolkata Fatafati Testing Steps

## 1. Local Build Check

Run:

```bash
npm.cmd run build
```

Expected result:

- Build completes without errors.
- `dist/` is generated.

## 2. Supabase Setup Check

In Supabase SQL editor, run:

```sql
-- Use the contents of supabase/schema.sql
```

Expected result:

- `calendar_slot_content` table exists.
- `site_settings` table exists.
- `admin_profiles` table exists.
- RLS is enabled on all three tables.
- `site-assets` storage bucket exists and is public.
- Storage policies exist for public reads and admin writes.

## 3. Admin User Setup Check

Create an auth user in Supabase Auth, then add that user to `admin_profiles`.

Example:

```sql
insert into public.admin_profiles (user_id, email)
values ('AUTH_USER_ID_HERE', 'admin@example.com');
```

Expected result:

- Admin user can log in from `/kf-control`.
- Non-admin users cannot manage content when RLS is active.

## 4. Environment Variable Check

Create a local `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Expected result:

- Public page can fetch Supabase settings/content.
- Admin page can use Supabase Auth.
- No service role key is present in frontend files.

## 5. Public Display Check

Open the homepage.

Expected result:

- Kolkata Fatafati header appears.
- Current month appears automatically.
- Every date in the current month appears.
- Time slots appear for each date.
- Empty slots show the configured placeholder.
- Last updated text appears.
- Page remains readable on mobile width.

## 6. Admin Login Check

Open:

```text
/kf-control
```

Expected result:

- Admin login appears.
- Public homepage does not show a visible admin link.
- Valid admin credentials open the admin dashboard.
- Logout returns to the login form.

## 7. Slot Editor Check

In the admin dashboard:

1. Enter a value in one date/time slot.
2. Click Save.
3. Refresh the public page.

Expected result:

- Value is saved in Supabase.
- Public page shows the value in the matching date/time slot.
- Last updated timestamp changes.

Clear test:

1. Click Clear for that slot.
2. Refresh the public page.

Expected result:

- Public page returns to the placeholder for that slot.

## 8. Site Settings Check

In the admin dashboard:

1. Change the site title.
2. Change the blank placeholder.
3. Change default slots.
4. Save settings.
5. Refresh the public page.

Expected result:

- Public page uses the new title.
- Empty cells use the new placeholder.
- Display board uses the updated slot list.

## 9. Logo Upload Check

In the admin dashboard:

1. Choose an image file in Upload logo.
2. Wait for upload success message.
3. Click Save settings.
4. Refresh the public page.

Expected result:

- Logo URL field is filled with a Supabase public URL.
- Public page shows the uploaded logo.

## 10. Error and Fallback Check

Temporarily remove Supabase env vars.

Expected result:

- Public page still renders with placeholders.
- Admin page shows the Supabase configuration warning.
- App does not crash.

## 11. Final Visual Check

Check desktop and mobile widths.

Expected result:

- Text does not overlap.
- Buttons remain usable.
- Slot editor remains readable.
- Display board remains scannable.
