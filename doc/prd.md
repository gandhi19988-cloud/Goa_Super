# Product Requirements Document: Kolkata Fatafati Website

## 1. Product Overview

Kolkata Fatafati is a dynamic display-board website for showing date-wise and time-wise content for the current month. The public website must be simple, fast, readable, and focused on the display board, while a hidden admin area controls the content shown on the public page.

The product uses React and Vite for the frontend and Supabase for database, authentication, storage, and access control.

## 2. Goals

- Show a clean public display board for the current month.
- Display every date in the month automatically.
- Show fixed time slots for each date.
- Show a placeholder for blank or missing slot content.
- Fetch published slot content from Supabase.
- Provide a hidden admin area for secure content management.
- Allow approved admins to create, update, clear, and delete slot content.
- Keep public visitors away from admin controls.
- Protect all database writes with Supabase Row Level Security.
- Keep the project deployable on Netlify or Vercel.

## 3. Non-Goals

- No marketing landing page.
- No public navbar.
- No visible public admin login button.
- No custom Express, Firebase, MongoDB, or Prisma backend.
- No service role key in frontend code.
- No heavy animations or decorative sections.
- No complex media management in the first version beyond logo support.

## 4. Users

### Public Visitor

The public visitor opens the website and reads the current month display board. They do not log in and cannot edit anything.

### Admin User

The admin user accesses a hidden route, logs in with Supabase Auth, and manages date/time slot content and site settings.

## 5. Public Display Requirements

- The home page must show the Kolkata Fatafati brand/logo first.
- The page must show a welcome/current month section.
- The page must show a date-wise display board for the current month.
- Each date must show the configured time slots.
- Empty slot values must show the placeholder `*** *` unless changed in site settings.
- Only published content should appear publicly.
- If Supabase is not configured, the page should still render with placeholders.
- If data loading fails, the page should show a simple non-technical error message.
- The layout must be readable on desktop and mobile.

## 6. Calendar Requirements

- The public page must generate the current month automatically.
- At month end, the next month must appear automatically based on the system date.
- Dates should use ISO format internally for database matching.
- Display labels should be human-readable.
- Time slots should use the default list until site settings support is added.

Default slots:

- 10:00 AM
- 11:00 AM
- 12:00 PM
- 01:00 PM
- 02:00 PM
- 03:00 PM
- 04:00 PM
- 05:00 PM
- 06:00 PM
- 07:00 PM

## 7. Admin Requirements

- Admin access must use a hidden route.
- Recommended route: `/kf-control`.
- The public page must not show an admin login link.
- Admin login must use Supabase Auth email/password.
- Only approved active admins should access editing controls.
- Admin users must be able to log out.
- Admin users must be able to edit slot content by date and time.
- Admin users must be able to save updates.
- Admin users must be able to clear a slot.
- Admin users must be able to delete or unpublish content where needed.
- Admin users should receive save/error status feedback.

## 8. Database Requirements

Supabase PostgreSQL is the selected database. The first version should use these tables:

- `calendar_slot_content`
- `site_settings`
- `admin_profiles`

The recommended content model is one row per date/time slot in `calendar_slot_content`.

Required public read rule:

- Public visitors can read only published calendar content.

Required admin rule:

- Active admins can create, update, and delete content.
- Active admins can update site settings.

## 9. Site Settings Requirements

Site settings should support:

- Site title
- Logo URL
- Empty placeholder text
- Default time slots
- Last updated timestamp
- Optional theme configuration

## 10. Security Requirements

- Supabase anon key may be used in frontend environment variables.
- Supabase service role key must never be used in frontend code.
- Row Level Security must be enabled on protected tables.
- Public users must not be able to write content.
- Hidden admin route is not a substitute for database security.

## 11. Environment Requirements

Required frontend environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## 12. Acceptance Criteria

- Public homepage loads without JavaScript errors.
- Current month dates appear automatically.
- Time slots appear for every date.
- Empty slots show the configured placeholder.
- Published Supabase content appears in the correct date/time slot.
- Missing Supabase config does not break the public page.
- Hidden admin route exists.
- Admin login works with Supabase Auth.
- Unauthorized users cannot access admin dashboard.
- Admin can save, update, clear, and delete slot content.
- RLS prevents public writes.
- Site settings can update placeholder, logo, and last updated display.
- Production build completes successfully.

## 13. Current Status

The public display foundation is implemented. The remaining major work is the admin area, Supabase schema/RLS, site settings integration, and final testing.
