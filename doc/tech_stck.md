# Tech Stack: Kolkata Fatafati Dynamic Display Website

## 1. Project Type

**Website Type:** Dynamic display-board website
**Backend Model:** BaaS — Backend as a Service
**Database:** Supabase PostgreSQL
**Primary Use Case:** Admin-controlled date/time-wise content display for the current month calendar.

This website does not need a heavy custom backend because the core requirements are:

* Public display of calendar/date-wise content.
* Admin login.
* Admin content editing.
* Database storage.
* Secure public/admin access rules.
* Automatic current month display.

For these requirements, a **Supabase + React frontend** architecture is the best fit.

---

## 2. Recommended Tech Stack Summary

| Layer            | Recommended Technology      | Purpose                                  |
| ---------------- | --------------------------- | ---------------------------------------- |
| Frontend         | React                       | Main UI framework                        |
| Build Tool       | Vite                        | Fast development and production build    |
| Styling          | Tailwind CSS                | Clean, responsive UI styling             |
| Backend/BaaS     | Supabase                    | Auth, database, storage, security rules  |
| Database         | Supabase PostgreSQL         | Store date/time-wise calendar content    |
| Authentication   | Supabase Auth               | Secure admin login                       |
| Authorization    | Supabase Row Level Security | Protect admin-only content operations    |
| Storage          | Supabase Storage            | Store logo and future media assets       |
| Hosting          | Netlify or Vercel           | Deploy frontend website                  |
| Forms/Admin UI   | React Hook Form             | Admin content editing forms              |
| Validation       | Zod                         | Validate admin inputs                    |
| Date Handling    | date-fns                    | Generate month calendar and format dates |
| Icons            | Inline SVG or Lucide React  | Use inline SVG preferred for reliability |
| State Management | React State + Context       | Enough for this project                  |

---

## 3. Frontend Stack

### 3.1 React

**Recommended:** React

React is suitable because the website needs dynamic UI behavior:

* Current month calendar generation.
* Date-wise content rendering.
* Admin dashboard.
* Login state management.
* Live content updates after admin saves.

React is lightweight enough for this project and works well with Supabase.

---

### 3.2 Vite

**Recommended:** Vite

Vite should be used as the build tool because it is:

* Fast during development.
* Easy to configure.
* Good for React projects.
* Simple to deploy on Netlify or Vercel.

Recommended project setup:

```bash
npm create vite@latest kolkata-fatafati -- --template react
```

---

### 3.3 Tailwind CSS

**Recommended:** Tailwind CSS

Tailwind is best for this website because the UI needs to be:

* Clean
* Responsive
* Compact
* Data-display focused
* Easy to adjust based on the design_doc

Tailwind will allow quick styling of:

* Logo header
* Date display rows
* Time slot tables
* Empty placeholder cells
* Admin dashboard
* Mobile layouts

---

### 3.4 Framer Motion

**Recommended:** Optional only

Framer Motion is not strictly required because this website should be simple and display-focused.

Use it only for very subtle UI animations such as:

* Smooth fade-in on page load.
* Admin panel transitions.
* Minimal content update animation.

Avoid heavy animations on the public display page.

---

## 4. Backend / BaaS Stack

### 4.1 Supabase

**Recommended and selected:** Supabase

Supabase should be used as the complete backend system for this project.

Supabase will provide:

* PostgreSQL database.
* Admin authentication.
* Row Level Security.
* Storage for logo/media.
* API access through Supabase client.
* Optional real-time updates.

No separate Node.js/Express backend is required for the first version.

---

### 4.2 Supabase PostgreSQL Database

Supabase PostgreSQL will store all dynamic website content.

Primary data to store:

* Calendar date.
* Time slot.
* Slot display value/content.
* Publish status.
* Admin user who created/updated content.
* Website settings.
* Logo URL.
* Empty placeholder text.

Recommended main tables:

1. `calendar_slot_content`
2. `site_settings`
3. `admin_profiles`

---

### 4.3 Supabase Auth

Supabase Auth should be used for the hidden admin login.

Admin login should support:

* Email/password login.
* Only approved admin users.
* Protected admin dashboard.
* Logout functionality.

The public website should not show a visible admin login button.

---

### 4.4 Supabase Row Level Security

Row Level Security is required.

RLS should enforce:

* Public users can only read published display content.
* Public users cannot insert, update, or delete content.
* Admin users can create, update, and delete content.
* Only admin users can update site settings.

This is very important because hiding the admin login is not real security by itself.

---

### 4.5 Supabase Storage

Supabase Storage should be used for:

* Company logo.
* Optional future images.
* Optional date-wise media content.

Recommended bucket:

```text
site-assets
```

For first version, only logo storage may be needed.

---

## 5. Recommended Database Tables

## 5.1 `calendar_slot_content`

This table stores the content for each date and each time slot.

Recommended because the reference-style display has multiple time slots per date.

```sql
create table public.calendar_slot_content (
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
```

### Purpose

Example data:

| content_date | slot_time | display_value |
| ------------ | --------- | ------------- |
| 2026-05-11   | 10:00 AM  | *** *         |
| 2026-05-11   | 11:00 AM  | 123           |
| 2026-05-11   | 12:00 PM  | ---           |

If no value exists for a slot, the frontend should show the configured blank placeholder.

---

## 5.2 `site_settings`

This table stores global website settings.

```sql
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null default 'Kolkata Fatafati',
  logo_url text,
  empty_state_text text not null default '*** *',
  default_slots jsonb not null default '["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"]'::jsonb,
  theme_config jsonb not null default '{}'::jsonb,
  last_updated_at timestamptz default now(),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
```

### Purpose

Stores:

* Logo URL
* Site title
* Empty placeholder text
* Default time slots
* Theme configuration
* Last updated time

---

## 5.3 `admin_profiles`

This table controls which authenticated users are admins.

```sql
create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
```

### Purpose

Only users listed here with `is_active = true` should access admin controls.

---

## 6. Suggested Row Level Security Direction

### 6.1 Public Read Policy

Public users should be able to read only published content.

Example direction:

```sql
create policy "Public can read published calendar content"
on public.calendar_slot_content
for select
using (status = 'published');
```

---

### 6.2 Admin Full Access Policy

Admins should be able to insert/update/delete calendar content.

Create a helper function:

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and is_active = true
  );
$$;
```

Then use policies like:

```sql
create policy "Admins can manage calendar content"
on public.calendar_slot_content
for all
using (public.is_admin())
with check (public.is_admin());
```

---

## 7. Admin Access Stack

### 7.1 Hidden Admin Route

Recommended admin route:

```text
/kf-control
```

or

```text
/display-control
```

Do not show this route publicly on the website.

### 7.2 Admin Login UI

Admin login should include:

* Email field
* Password field
* Login button
* Minimal brand logo

### 7.3 Admin Dashboard UI

Admin dashboard should include:

* Current month selector/editor
* Date-wise content editor
* Time slot fields
* Save button
* Clear button
* Logout button
* Save status feedback

---

## 8. Date and Calendar Handling

### 8.1 Recommended Library

Use:

```bash
npm install date-fns
```

Why:

* Lightweight.
* Easy date formatting.
* Easy current month generation.
* Good for calculating month start/end dates.

### 8.2 Required Date Logic

Frontend should:

* Detect current date.
* Generate all dates for the current month.
* Fetch content where `content_date` is between month start and month end.
* Automatically show the next month when the system date changes.

---

## 9. Form Handling and Validation

### 9.1 React Hook Form

Recommended for admin editing forms.

```bash
npm install react-hook-form
```

Use it for:

* Slot value inputs.
* Site settings form.
* Logo URL/settings form if needed.

### 9.2 Zod

Recommended for validation.

```bash
npm install zod
```

Use it to validate:

* Slot values.
* Date fields.
* Site settings.
* Empty placeholder text.

---

## 10. Icons

### Recommended Approach

Use inline SVG icons for important UI icons.

Reason:

* Prevent CDN/icon package loading issues.
* Keeps public page lightweight.
* Avoids unnecessary dependencies.

Alternative:

* `lucide-react` can be used if installed locally through npm.
* Do not rely on CDN-based icon imports.

Recommended:

```bash
npm install lucide-react
```

Only if using local build setup.

---

## 11. Hosting and Deployment

### 11.1 Frontend Hosting

Recommended:

* Netlify

Alternative:

* Vercel

Both work well with React + Vite + Supabase.

### 11.2 Backend Hosting

No custom backend hosting needed.

Supabase will handle:

* Database
* Auth
* Storage
* APIs

### 11.3 Environment Variables

Required frontend environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not expose the Supabase service role key in the frontend.

---

## 12. Recommended Folder Structure

```text
src/
  components/
    public/
      LogoHeader.jsx
      WelcomeBar.jsx
      LastUpdatedBar.jsx
      DateDisplayBoard.jsx
      DateBlock.jsx
      SlotCell.jsx
      FooterDisclaimer.jsx
    admin/
      AdminLogin.jsx
      AdminDashboard.jsx
      DateEditor.jsx
      SlotEditorTable.jsx
      SiteSettingsEditor.jsx
  lib/
    supabaseClient.js
    calendarUtils.js
    adminAuth.js
  pages/
    PublicDisplayPage.jsx
    AdminLoginPage.jsx
    AdminDashboardPage.jsx
  styles/
    globals.css
  App.jsx
  main.jsx
```

---

## 13. Recommended Packages

Install core packages:

```bash
npm install @supabase/supabase-js date-fns react-hook-form zod
```

Install styling tools:

```bash
npm install -D tailwindcss postcss autoprefixer
```

Optional:

```bash
npm install framer-motion lucide-react
```

Use Framer Motion only if required. Use Lucide only if installed locally.

---

## 14. Why This Stack Is Best for This Project

This stack is best because:

1. **No custom backend needed**
   Supabase handles database, auth, and security.

2. **Easy admin content management**
   Admin can update date/time slot content directly through the website.

3. **Secure access control**
   Supabase RLS protects editing operations.

4. **Fast public display**
   React + Vite loads quickly and can fetch only the current month’s content.

5. **Scalable for future features**
   Later, image upload, multiple admins, real-time updates, and site settings can be added.

6. **Simple deployment**
   Netlify/Vercel + Supabase is easy to deploy and maintain.

---

## 15. Features Supported by This Stack

| Feature                    | Supported? | Technology                  |
| -------------------------- | ---------: | --------------------------- |
| Dynamic calendar display   |        Yes | React + date-fns            |
| Current month auto display |        Yes | React + date-fns            |
| Admin login                |        Yes | Supabase Auth               |
| Hidden admin route         |        Yes | React Router                |
| Admin content editing      |        Yes | React + Supabase            |
| Database storage           |        Yes | Supabase PostgreSQL         |
| Secure admin-only edits    |        Yes | Supabase RLS                |
| Logo upload/storage        |        Yes | Supabase Storage            |
| Public blank placeholders  |        Yes | React logic + site_settings |
| Mobile responsive layout   |        Yes | Tailwind CSS                |
| Real-time updates          |   Optional | Supabase Realtime           |

---

## 16. Final Recommended Stack

The final recommended stack for Kolkata Fatafati is:

```text
Frontend: React + Vite
Styling: Tailwind CSS
Database/BaaS: Supabase PostgreSQL
Authentication: Supabase Auth
Authorization: Supabase Row Level Security
Storage: Supabase Storage
Date Logic: date-fns
Forms: React Hook Form
Validation: Zod
Hosting: Netlify or Vercel
Icons: Inline SVG preferred
```

This stack keeps the project clean, secure, dynamic, and easy to maintain while meeting the requirement that the website must be BaaS-based with Supabase as the database.
