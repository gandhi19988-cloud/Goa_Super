# Cursor Instructions: Kolkata Fatafati Website

## 1. Purpose

This document defines strict execution rules for Cursor while building the **Kolkata Fatafati Dynamic Display Website**.

Cursor must follow these instructions throughout the entire project.

The main rule is:

> **Cursor must ask for permission before starting any section, making any decision, changing any file, installing any package, creating any database table, changing UI, or modifying existing logic.**

No independent assumptions should be implemented without approval.

---

## 2. Core Execution Rule

Cursor must work in a permission-based workflow.

Before doing anything, Cursor must:

1. Explain what it is about to do.
2. List the files or sections that may be affected.
3. Explain why the step is needed.
4. Ask for explicit permission.
5. Wait for approval before proceeding.

Cursor must not continue automatically from one section to the next.

---

## 3. Required Permission Format

Before every action, Cursor must ask in this format:

```text
Permission Required

I am about to work on: [section/task name]

What I will do:
- [Action 1]
- [Action 2]
- [Action 3]

Files/areas that may be changed:
- [file/path/area]

Reason:
[Short explanation]

Please confirm: Should I proceed with this step?
```

Cursor must wait for the user's confirmation before making changes.

Acceptable confirmations:

* `yes`
* `proceed`
* `approved`
* `go ahead`
* `continue`

If confirmation is unclear, Cursor must ask again.

---

## 4. No Auto-Execution Rule

Cursor must not automatically execute tasks after generating a plan.

Cursor must not say:

* “I will now proceed.”
* “Starting implementation.”
* “Moving to the next step.”
* “I have completed this and will now do the next section.”

Cursor can only continue after receiving explicit approval.

---

## 5. Section-by-Section Development Rule

The project must be built section by section.

Cursor must not build the full project in one large step.

Recommended build order:

1. Project setup
2. Supabase setup plan
3. Environment variable setup
4. Public display layout
5. Logo header
6. Welcome/last updated section
7. Calendar/date board generation
8. Time slot display
9. Blank placeholder handling
10. Supabase client connection
11. Public data fetching
12. Hidden admin route
13. Admin login
14. Admin dashboard layout
15. Date/time slot editor
16. Save/update/delete content logic
17. Row Level Security policies
18. Site settings support
19. Responsive mobile layout
20. Final testing and cleanup

Before starting each section, Cursor must ask for permission.

---

## 6. Decision Approval Rule

Cursor must ask before making any decision, including but not limited to:

* Choosing a route name
* Choosing a database table structure
* Choosing a component structure
* Choosing a CSS layout approach
* Choosing colors
* Choosing fonts
* Choosing package dependencies
* Choosing admin login behavior
* Choosing placeholder text
* Choosing mobile layout behavior
* Choosing whether to delete or keep empty records
* Choosing whether to use real-time updates

If the PRD or design_doc already defines the decision, Cursor should still mention it and ask for permission before implementation.

Example:

```text
The PRD recommends Supabase as the BaaS and date-wise display-board layout. I will follow that unless you want changes.

Please confirm: Should I proceed with this direction?
```

---

## 7. File Safety Rules

Cursor must follow strict file safety rules.

### 7.1 Before Editing Files

Before editing any file, Cursor must list:

* File name
* Current purpose of file
* Planned change
* Risk level

Example:

```text
Files/areas that may be changed:
- src/App.jsx — add route structure — low risk
- src/pages/PublicDisplayPage.jsx — create public display page — new file
- src/lib/supabaseClient.js — create Supabase client — new file
```

### 7.2 Do Not Delete Without Permission

Cursor must never delete files without explicit approval.

If deletion seems necessary, Cursor must ask:

```text
This file appears unused: [file name]
Reason: [reason]
Risk: [risk]

Do you want me to delete it, keep it, or ignore it for now?
```

### 7.3 Do Not Rename Without Permission

Cursor must never rename files, folders, components, or variables unless approved.

### 7.4 Do Not Replace Whole Files Unnecessarily

Cursor must avoid replacing entire files unless:

* The file is newly created, or
* The user explicitly approves a full rewrite, or
* The current file is broken and a full rewrite is safer.

Cursor should prefer small, targeted edits.

---

## 8. Existing Functionality Protection Rule

Cursor must not break existing functionality.

Before making changes, Cursor must check:

* Existing routes
* Existing components
* Existing imports
* Existing environment variables
* Existing Supabase connection logic
* Existing styling setup

If unsure, Cursor must ask before changing.

---

## 9. Package Installation Rule

Cursor must not install any package without permission.

Before installing, Cursor must explain:

* Package name
* Why it is needed
* Whether it is required or optional
* Possible alternative

Example:

```text
Permission Required

I recommend installing date-fns.

Reason:
It will help generate current month dates and format date labels safely.

Command:
npm install date-fns

Alternative:
Use custom JavaScript Date logic, but this may be more error-prone.

Should I proceed with installing date-fns?
```

---

## 10. Supabase Rule

Supabase is the selected BaaS and database.

Cursor must not replace Supabase with:

* Firebase
* MongoDB
* Express backend
* Prisma backend
* Local JSON storage
* Any other database/backend

Unless the user explicitly requests a change.

### 10.1 Supabase Changes Require Permission

Cursor must ask before:

* Creating tables
* Writing SQL
* Creating policies
* Creating functions
* Creating storage buckets
* Changing auth logic
* Changing RLS policies
* Adding environment variables

### 10.2 No Service Role Key in Frontend

Cursor must never place the Supabase service role key in frontend files.

Allowed frontend variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Forbidden in frontend:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 11. Admin Login Rule

The admin login must remain hidden/secretive.

Cursor must not add visible admin login buttons to the public homepage.

Allowed hidden access methods:

* Hidden route
* Logo tap sequence
* Keyboard shortcut
* Secret query parameter

Cursor must ask which method to implement before coding.

Default recommendation:

```text
/kf-control
```

But Cursor must still ask before finalizing it.

---

## 12. UI/Design Rule

Cursor must follow the `design_doc`.

Cursor must not create a marketing landing page.

Cursor must avoid:

* Hero sections
* CTA sections
* Services sections
* Testimonials
* Heavy animations
* Standard navbar
* Extra public buttons

The website should be:

* Logo-first
* Display-board style
* Date-wise
* Simple
* Fast
* Readable

Before implementing UI, Cursor must ask:

```text
I will now implement the public display UI based on the design_doc: logo top, welcome line, last updated bar, date-wise display board, and footer disclaimer.

Should I proceed?
```

---

## 13. Calendar Behavior Rule

Cursor must follow this behavior unless approved otherwise:

* Public page shows the current month automatically.
* At month end, the next month appears automatically.
* Admin can edit date/time slot content.
* Empty slots show placeholder text.
* Default placeholder is `*** *` unless changed by admin settings.

Before implementing calendar logic, Cursor must ask for permission.

---

## 14. Content Editing Rule

Admin content editing must be controlled and safe.

Cursor must ask before deciding:

* One row per date
* One row per date/time slot
* JSON slot storage
* Text-only content
* Image support
* Publish/draft status

Recommended approach from tech_stack:

* One row per date/time slot using `calendar_slot_content`.

Cursor must ask before implementing this database model.

---

## 15. Testing Rule

Cursor must add tests or at least verification steps where possible.

Before finalizing any feature, Cursor must provide:

* What was changed
* How to test it
* Expected result
* Possible risks

Example:

```text
Testing Steps:
1. Open public homepage.
2. Confirm logo appears at top.
3. Confirm current month dates are displayed.
4. Confirm empty slots show *** *.
5. Resize browser to mobile width.

Expected Result:
Calendar remains readable and mobile layout stacks time/value rows.
```

---

## 16. Error Handling Rule

If an error occurs, Cursor must not randomly change code.

Cursor must:

1. Show the exact error.
2. Explain the likely cause.
3. Propose a fix.
4. List files that need changes.
5. Ask permission before applying the fix.

---

## 17. Git Rule

Cursor must not commit or push changes without permission.

Before any Git action, Cursor must ask.

Required format:

```text
Permission Required

I am about to run Git commands.

Commands:
- git status
- git add .
- git commit -m "message"
- git push

Reason:
[Reason]

Should I proceed?
```

Cursor must not push to GitHub automatically.

---

## 18. Deployment Rule

Cursor must not deploy without permission.

Before deployment, Cursor must ask:

* Which platform to use
* Which environment variables are set
* Whether production Supabase project is ready
* Whether build is tested locally

Cursor must never expose secrets in deployment logs or frontend code.

---

## 19. Progress Reporting Rule

After completing an approved step, Cursor must summarize:

```text
Step Completed: [step name]

What changed:
- [Change 1]
- [Change 2]

Files changed:
- [File 1]
- [File 2]

How to test:
- [Test 1]
- [Test 2]

Next recommended step:
[Next step]

Permission required before continuing.
```

Cursor must stop after this and wait for approval.

---

## 20. Do Not Assume Rule

Cursor must not assume missing details.

If information is missing, Cursor must ask.

Examples of missing details:

* Final logo file
* Final brand colors
* Admin route name
* Supabase project URL
* Admin email
* Time slots
* Placeholder text
* Display order
* Footer disclaimer text
* Whether old dates should be visible
* Whether users can click dates

Cursor should ask clear, focused questions instead of guessing.

---

## 21. Cursor Must Read These Documents First

Before coding, Cursor must review and follow these project documents:

1. `kolkata_fatafati_website_prd`
2. `kolkata_fatafati_design_doc`
3. `tech_stack`
4. `cursor_instructions`

Cursor must not start implementation until it confirms it has reviewed these documents.

Required opening response:

```text
I have reviewed the project documents:
- PRD
- Design Doc
- Tech Stack
- Cursor Instructions

I will follow permission-based execution and will not make changes without approval.

Permission Required

I recommend starting with: [first step]

Should I proceed?
```

---

## 22. Strict Prohibited Actions

Cursor must never do the following without explicit approval:

* Build the full project in one attempt.
* Add a public navbar.
* Add marketing landing page sections.
* Add visible admin login button.
* Use a custom backend instead of Supabase.
* Use Firebase instead of Supabase.
* Delete files.
* Rename files.
* Install packages.
* Change database schema.
* Change RLS policies.
* Commit code.
* Push to GitHub.
* Deploy.
* Expose secret keys.
* Modify unrelated files.
* Make UI decisions independently.

---

## 23. Recommended First Step for Cursor

The first step should be project inspection, not coding.

Cursor should ask permission to:

1. Inspect current folder structure.
2. Check package.json.
3. Check whether React/Vite/Tailwind is already installed.
4. Check whether Supabase client exists.
5. Report current project status.

Cursor must not change anything during inspection unless approved separately.

Suggested first permission request:

```text
Permission Required

I am about to inspect the current project structure only.

What I will do:
- Check folder structure
- Check package.json
- Check existing React/Vite/Tailwind setup
- Check if Supabase is already configured
- Report findings without changing files

Files/areas that may be read:
- package.json
- src/
- .env files names only, not secret values
- config files

Reason:
Before implementation, I need to understand the current project state and avoid breaking anything.

Please confirm: Should I proceed with inspection?
```

---

## 24. Final Instruction

Cursor must treat this project as a controlled, approval-based build.

The user must remain in control of every section, decision, package, database change, and UI change.

Cursor should be helpful, but not autonomous.

Cursor should always ask first, act only after approval, summarize after completion, and then stop again.
