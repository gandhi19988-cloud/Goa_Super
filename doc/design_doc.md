# Design Document: Kolkata Fatafati Website

## 1. Design Direction

The website should feel like a practical public display board, not a marketing website. The first screen must immediately communicate Kolkata Fatafati and show the live monthly board.

The design should be:

- Logo-first
- Date-wise
- Board-like
- Compact
- Fast
- Readable
- Mobile-friendly

## 2. Public Page Layout

The public page should use this order:

1. Logo/header
2. Welcome/current month section
3. Last updated/status bar
4. Date-wise display board
5. Footer disclaimer

No public navbar, hero section, service section, testimonial section, or visible admin link should be added.

## 3. Header

The header should show:

- Logo or logo placeholder
- Brand name: Kolkata Fatafati
- Small welcome text

Until a final logo is provided, a simple `KF` logo mark is acceptable as a placeholder.

## 4. Month and Status Area

The month section should:

- Clearly show the current month/year.
- Stay visually connected to the board.
- Show a simple error/status message if public content cannot load.
- Later show the real last updated timestamp from Supabase site settings.

## 5. Display Board

The board should:

- Show one row per date.
- Show date/day information on the left.
- Show time slots to the right on desktop.
- Stack cleanly on mobile.
- Use strong borders or grid separation so values are easy to scan.
- Avoid decorative cards inside cards.
- Keep each slot stable in size.

Each slot should show:

- Time label
- Display value

Empty values should show:

```text
*** *
```

unless changed by admin settings.

## 6. Color and Typography

The current approved direction uses:

- Warm off-white background
- Red month/status band
- Dark board borders
- Yellow logo placeholder
- High contrast black text for values

Typography should be simple and highly readable. The app should avoid decorative fonts unless final brand assets require them.

## 7. Mobile Behavior

On smaller screens:

- Header can align left for better fit.
- Date rows should stack.
- Slot grid should reduce from multiple columns to two columns.
- Very small screens may use one slot per row.
- Text must not overflow or overlap.

## 8. Admin Design Direction

The admin area should be functional and quiet. It should not reuse public marketing patterns.

Admin screens should include:

- Minimal brand header
- Login form
- Protected dashboard
- Month/date editor
- Slot editor table
- Save/clear controls
- Logout control
- Status feedback

The admin route must remain hidden and should not be linked from the public homepage.

## 9. Interaction Rules

- Public users should only read content.
- Admin users should receive clear save/error feedback.
- Empty content should be handled predictably.
- Loading and error states should use simple text.
- Avoid heavy animation.

## 10. Accessibility and Readability

- Use semantic page sections where possible.
- Keep color contrast high.
- Make form fields and buttons large enough for touch.
- Do not rely on color alone for important state.
- Keep labels clear in the admin interface.

## 11. Current Design Status

The public display page has the first version of the board layout, responsive behavior, placeholder logo, month section, slot grid, and footer disclaimer. Admin screens and real last-updated settings are still pending.
