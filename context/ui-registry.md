# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

## Non-UI Feature Notes

- 2026-06-12 — Resume generation and private resume review added backend surfaces. `agent/resume-generation.ts` owns GPT-4o resume content generation, `lib/resume-renderer.tsx` renders server-only PDFs with `@react-pdf/renderer`, `/api/resume/generate` replaces the active private resume from saved profile data, and `/api/resume/current` streams the authenticated user's active PDF inline without exposing the private storage URL.
- 2026-06-11 — Resume extraction parser fix changed no visible UI. `lib/resume-pdf.ts` configures `pdf-parse` with the packaged worker file path from `node_modules` instead of importing `pdf-parse/worker`, and `/api/resume/extract` now separates parser infrastructure failures from unreadable PDF content failures.
- 2026-06-12 — Feature 07 review fixes changed no visible UI. `agent/resume-extraction.ts` now owns GPT-4o extraction prompt/response handling, `/api/resume/extract` reserves the active resume marker before OpenAI to prevent concurrent duplicate API spend, and `profiles.remote_preference` accepts multi-select comma-separated values at the database constraint level.
- 2026-06-11 — Resume extraction validation fix changed no visible UI. `lib/profile.ts` now normalizes oversized OpenAI extraction responses by truncating text, capping list/section sizes, accepting single work/education objects, and avoiding whole-response rejection for harmless model shape drift.
- 2026-06-11 — Resume extraction repeat guard added `profiles.resume_extracted_pdf_key` and `profiles.resume_extracted_at`. `/api/resume/extract` now rejects duplicate extraction for the active PDF before PDF download or OpenAI calls, and resume upload clears the marker for the new active PDF.
- 2026-06-11 — Resume extraction job title seeding changed no visible UI. `lib/profile.ts` now fills `jobPreferences.jobTitlesSeeking` from explicit target roles plus the extracted current title and newest work role titles so the existing removable Job Titles Seeking chips get useful defaults.
- 2026-06-11 — Remote preference multi-select changed ProfileForm UI. The former select is now a tokenized checkbox group where `Remote`, `Hybrid`, and `Onsite` can be combined, while `Any` is exclusive.
- 2026-06-11 — Playwright e2e auth support changed no visible UI. `JOB_PILOT_E2E_AUTH=1` plus the `jobpilot_e2e_auth=1` cookie lets local tests access protected routes with fixture profile scenarios through `lib/auth-session.ts`, `lib/e2e-auth.ts`, and `lib/e2e-profile.ts`; production auth remains InsForge-only.
- 2026-06-11 — AI Profile Extraction from Resume adds `/api/resume/extract`, `openai`, and `pdf-parse`. The route downloads the authenticated user's active private resume from InsForge Storage, parses text server-side, asks GPT-4o for structured profile JSON, validates through `lib/profile.ts`, and returns transient extracted data without writing profile fields to the database.
- 2026-06-10 — Profile Save Logic security hardening changed no visible UI. Profile mutations now cap server-side field lengths/array sizes, Server Action bodies are limited to `512kb`, resume uploads validate the PDF signature, and resume replacement only removes previous keys under the authenticated user's storage prefix.
- 2026-06-10 — Profile Save Logic added real InsForge persistence and independent resume upload behavior. New backend surfaces are `actions/profile.ts`, `app/api/resume/upload/route.ts`, and shared profile normalization/completion helpers in `lib/profile.ts`.
- 2026-06-10 — Repeatable education support changed no database schema. `profiles.education` now stores an object wrapper with `entries`, while legacy singular education objects remain readable through app normalization.
- 2026-06-09 — Database Schema review fixes changed no visible UI. The migration and docs were tightened for agent-run deletion and resume key ownership constraints.
- 2026-06-09 — Database Schema added no visible UI components and made no class changes. Feature 04 created the initial InsForge app schema, private `resumes` bucket, and schema docs only.
- 2026-06-09 — PostHog initialization added no new visible UI components and made no class changes to existing components. Homepage CTA components returned to Server Components after removing wizard-only analytics click handlers.
- 2026-06-09 — PostHog review fixes changed no visible UI. Autocapture was disabled and helper exports were tightened in analytics code only.

### Navbar

File: components/layout/Navbar.tsx
Last updated: 2026-06-08

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` |
| Border           | `border-b border-border` |
| Border radius    | `rounded-md` |
| Text — primary   | `text-text-slate`, `text-accent-foreground` |
| Text — secondary | none |
| Spacing          | `h-20`, `px-6`, `gap-12`, `px-7 py-4` |
| Hover state      | `duration-200 ease-out`, `hover:text-accent`, `hover:-translate-y-0.5`, `hover:bg-overlay`, `hover:shadow-md`, `active:duration-75`, `focus-visible:ring-2 focus-visible:ring-accent` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | `hover:text-accent` |

**Pattern notes:**
Navbar uses the project logo asset, a centered `max-w-[1280px]` row, hidden mobile nav links, and a dark primary CTA. Future top navs should preserve the white surface, bottom border, and `text-text-slate` link treatment.

### MobileBottomNav

File: components/layout/MobileBottomNav.tsx
Last updated: 2026-06-10

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface/80`, `bg-accent-muted`, `hover:bg-surface-secondary` |
| Border           | `border-t border-border/80` |
| Border radius    | `rounded-md` |
| Text — primary   | `text-[12px] font-medium leading-4`, `text-accent`, `text-text-secondary` |
| Text — secondary | none |
| Spacing          | `px-4`, `pt-3`, `gap-2`, `gap-1`, `px-3` |
| Hover state      | `transition-[background-color,color,box-shadow]`, `hover:bg-surface-secondary`, `hover:text-accent`, `focus-visible:ring-2 focus-visible:ring-accent` |
| Shadow           | `shadow-sm`, `shadow-[0_-18px_55px_color-mix(in_srgb,var(--color-overlay)_16%,transparent)]` |
| Accent usage     | `bg-accent-muted`, `text-accent`, `focus-visible:ring-accent` |

**Pattern notes:**
Mobile bottom navigation is protected-route only and hidden at `md`. It uses compact icon-over-label links, active `aria-current="page"` state, tokenized glass surface, and safe-area bottom padding. Keep page-level mobile bottom padding in protected routes so content is not hidden by the fixed nav.

### Footer

File: components/layout/Footer.tsx
Last updated: 2026-06-08

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` |
| Border           | none |
| Border radius    | none |
| Text — primary   | `text-text-slate` |
| Text — secondary | none |
| Spacing          | `px-8 py-16`, `gap-10`, `gap-5`, `md:gap-10` |
| Hover state      | `hover:text-accent` |
| Shadow           | none |
| Accent usage     | `hover:text-accent` |

**Pattern notes:**
Footer mirrors the header brand treatment with simple tokenized text links and no card/background decoration.

### Hero

File: components/homepage/Hero.tsx
Last updated: 2026-06-08

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `landing-gradient`, `bg-surface-tertiary` |
| Border           | `border-y border-border`, `border-b border-border` |
| Border radius    | `rounded-md`, `rounded-xl` |
| Text — primary   | `text-text-slate`, `text-accent-foreground` |
| Text — secondary | `text-text-slate-medium`, `text-text-muted` |
| Spacing          | `pt-16`, `px-6 py-24`, `md:px-16 md:py-28`, `mt-8`, `gap-4` |
| Hover state      | `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:bg-overlay`, `hover:bg-surface`, `hover:border-accent`, `hover:text-accent`, `hover:shadow-md`, `active:duration-75`, `focus-visible:ring-2 focus-visible:ring-accent` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | none |

**Pattern notes:**
Hero uses the pastel landing gradient, centered type, dark primary CTA, bordered secondary CTA, and the `dashboard-demo.png` public asset. Do not rebuild dashboard preview UI in code.

### HowItWorks

File: components/homepage/HowItWorks.tsx
Last updated: 2026-06-08

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface-muted`, `landing-stripes` |
| Border           | `border-b border-border`, `border-t border-border`, `lg:border-r`, `divide-y divide-border` |
| Border radius    | `rounded-xl` |
| Text — primary   | `text-text-slate` |
| Text — secondary | `text-text-slate-medium` |
| Spacing          | `h-20`, `px-8 py-16`, `md:px-16 md:py-20`, `px-8 py-10`, `md:px-16 md:py-12` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | `bg-accent` |

**Pattern notes:**
Two-column homepage feature bands use striped separators, white text panels, muted image panels, bordered rows, and a thin active-state accent rail. Public mockup assets are preferred for product imagery.

### Features

File: components/homepage/Features.tsx
Last updated: 2026-06-08

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface-muted`, `landing-stripes` |
| Border           | `border-b border-border`, `border-t border-border`, `lg:border-r`, `divide-y divide-border` |
| Border radius    | `rounded-xl` |
| Text — primary   | `text-text-slate` |
| Text — secondary | `text-text-slate-medium` |
| Spacing          | `h-20`, `px-8 py-16`, `md:px-16 md:py-20`, `px-8 py-10`, `md:px-16 md:py-12` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | `bg-success` |

**Pattern notes:**
Features mirrors `HowItWorks` with reversed media/text placement and a success-colored active rail for the highlighted row.

### Testimonial

File: components/homepage/Testimonial.tsx
Last updated: 2026-06-08

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` |
| Border           | `border-b border-border` |
| Border radius    | `rounded-md` |
| Text — primary   | `text-text-slate`, `text-text-primary`, `text-accent` |
| Text — secondary | `text-text-secondary` |
| Spacing          | `px-6 py-20`, `md:px-16 md:py-24`, `mt-8`, `gap-4` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | `text-accent` |

**Pattern notes:**
Testimonial uses centered editorial text, an uppercase accent label, and the `user-icon.png` public avatar asset.

### BottomCta

File: components/homepage/BottomCta.tsx
Last updated: 2026-06-08

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `landing-gradient` |
| Border           | `border-b border-border`, `border-border-muted` |
| Border radius    | `rounded-md` |
| Text — primary   | `text-text-slate`, `text-accent-foreground` |
| Text — secondary | `text-text-muted` |
| Spacing          | `px-6 py-20`, `md:px-16 md:py-24`, `mt-8`, `gap-4` |
| Hover state      | `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:bg-overlay`, `hover:bg-surface`, `hover:border-accent`, `hover:text-accent`, `hover:shadow-md`, `active:duration-75`, `focus-visible:ring-2 focus-visible:ring-accent` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | none |

**Pattern notes:**
Bottom CTA reuses the Hero CTA pattern and pastel gradient to close the landing page consistently.

### OAuthButtons

File: components/auth/OAuthButtons.tsx
Last updated: 2026-06-09

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `hover:bg-surface-secondary` |
| Border           | `border border-border`, `hover:border-accent` |
| Border radius    | `rounded-md` |
| Text — primary   | `text-[15px] font-semibold leading-5`, `text-text-primary`, `text-accent`, `text-error` |
| Text — secondary | none |
| Spacing          | `gap-3`, `h-14`, `px-5`, `gap-4`, `text-center` |
| Hover state      | `transition-[background-color,border-color,box-shadow,transform]`, `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:bg-surface-secondary`, `hover:border-accent`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent`, `focus-visible:ring-offset-2 focus-visible:ring-offset-surface`, `disabled:opacity-60`, `active:translate-y-0 active:duration-75` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | `text-accent`, `hover:border-accent`, `focus-visible:ring-accent` |

**Pattern notes:**
OAuth buttons use full-width provider rows with centered icon+label groups. Google uses an accent icon; GitHub uses primary text color. Future auth provider buttons should match this restrained secondary-button treatment.

### Auth Pages

File: app/(auth)/login/page.tsx, app/(auth)/callback/page.tsx
Last updated: 2026-06-09

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-background`, `bg-surface`, `landing-gradient`, `bg-surface/70` |
| Border           | `border border-border`, `border-x border-t border-border`, `border-b border-border`, `lg:border-r` |
| Border radius    | `rounded-xl`, `rounded-full` |
| Text — primary   | `text-[56px] font-bold leading-[1.02]`, `text-[34px] font-bold leading-10`, `text-[16px] font-semibold leading-6`, `text-text-slate`, `text-text-primary`, `text-accent`, `text-accent-foreground` |
| Text — secondary | `text-[22px] leading-9`, `text-[18px] font-semibold leading-7`, `text-[17px] leading-7`, `text-[14px] leading-5`, `text-text-slate-medium`, `text-text-secondary`, `text-error` |
| Spacing          | `my-8`, `md:my-12`, `px-8 py-10`, `lg:px-12 lg:py-14`, `xl:px-16`, `px-8 py-12`, `lg:px-14`, `p-6`, `mt-14`, `mt-8`, `mt-12`, `mt-10`, `mt-6`, `mt-4` |
| Hover state      | `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:bg-accent-dark`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent`, `focus-visible:ring-offset-2 focus-visible:ring-offset-surface`, `active:translate-y-0 active:duration-75` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | `text-accent`, `bg-accent`, `focus-visible:ring-accent`, `landing-gradient` |

**Pattern notes:**
Auth pages use the standard Navbar above a centered split card and the standard Footer below it: soft page background, rounded outer card, gradient left narrative panel with a security badge, and a clean right provider panel. Callback status content may use an inner `rounded-xl border border-border bg-surface p-6 shadow-sm` card and a compact accent CTA for recovery.

### Protected Placeholders

File: app/dashboard/page.tsx
Last updated: 2026-06-10

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-background`, `bg-surface` |
| Border           | `border-x border-border`, `border border-border` |
| Border radius    | `rounded-xl` |
| Text — primary   | `text-[16px] font-semibold leading-6`, `text-text-primary` |
| Text — secondary | `text-[14px] font-normal leading-5`, `text-text-secondary` |
| Spacing          | `px-8 py-8`, `p-6`, `gap-4`, `mt-2` |
| Hover state      | none |
| Shadow           | `shadow-sm` |
| Accent usage     | none |

**Pattern notes:**
This is a temporary protected-route placeholder for Auth verification. The later full dashboard feature should replace it with its planned complete UI while keeping the same page background, centered max-width, card baseline, and mobile bottom-nav padding. Header actions such as logout should sit in the card header area using the existing secondary-button pattern.

### FindJobsPage

File: app/find-jobs/page.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-background` |
| Border           | `border-x border-border` |
| Border radius    | none |
| Text — primary   | `text-text-primary` |
| Text — secondary | none |
| Spacing          | `px-4 pb-32 pt-6`, `md:px-8 md:py-8` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:**
Find Jobs keeps the protected route shell and current shared Navbar unchanged, then delegates the mock interactive surface to `FindJobsExperience`. Future protected pages should continue using the page shell first and compose feature-specific sections inside it.

### FindJobsExperience

File: components/find-jobs/FindJobsExperience.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface-secondary`, `bg-accent-muted` |
| Border           | `border border-border`, `border-b border-border` |
| Border radius    | `rounded-xl`, `rounded-md`, `rounded-full` |
| Text — primary   | `text-[16px] font-semibold leading-6`, `text-text-primary`, `text-accent` |
| Text — secondary | `text-[12px] font-normal leading-4`, `text-text-muted`, `text-text-secondary` |
| Spacing          | `space-y-6`, `px-5 py-4`, `md:px-6`, `px-3 py-1`, `px-5 py-12` |
| Hover state      | none |
| Shadow           | `shadow-sm` |
| Accent usage     | `bg-accent-muted`, `text-accent` |

**Pattern notes:**
FindJobsExperience is the only client-state owner for Feature 09. It filters, sorts, and paginates local mock jobs only; it must not call Adzuna, InsForge, Server Actions, or API routes until later features. It uses `MATCH_THRESHOLD` from `lib/utils.ts` for high/low match logic and keeps page size at 6 for the mock UI.

### SearchControls

File: components/find-jobs/SearchControls.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-success-lightest`, `bg-accent` |
| Border           | `border border-border`, `border-success-light`, `focus-within:border-accent`, `focus:border-accent` |
| Border radius    | `rounded-xl`, `rounded-md` |
| Text — primary   | `text-[14px] font-semibold leading-5`, `text-[15px] font-medium leading-5`, `text-text-primary`, `text-accent-foreground`, `text-success-foreground` |
| Text — secondary | `text-[12px] font-semibold uppercase leading-4`, `text-text-secondary`, `text-text-muted` |
| Spacing          | `p-5`, `md:p-6`, `gap-4`, `gap-3`, `px-4`, `px-6`, `py-3`, `mt-5` |
| Hover state      | `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:bg-accent-dark`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | `bg-accent`, `focus:ring-accent`, `focus-visible:ring-accent` |

**Pattern notes:**
SearchControls uses labeled tokenized inputs, lucide search icon affordances, and a persistent success banner for the mock search result. Submitting refreshes local mock state only and never starts a network request in Feature 09.

### JobFilters

File: components/find-jobs/JobFilters.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` |
| Border           | `border border-border`, `focus-within:border-accent`, `focus:border-accent` |
| Border radius    | `rounded-xl`, `rounded-md` |
| Text — primary   | `text-[14px] font-medium leading-5`, `text-text-primary` |
| Text — secondary | `text-text-muted` |
| Spacing          | `p-4`, `gap-3`, `px-3`, `px-4` |
| Hover state      | none |
| Shadow           | `shadow-sm` |
| Accent usage     | `focus:ring-accent`, `focus-within:ring-accent` |

**Pattern notes:**
JobFilters owns the visible filter bar controls only. Text filter, match filter, and sort changes reset pagination to the first page through the parent state owner.

### JobsTable

File: components/find-jobs/JobsTable.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface-secondary` |
| Border           | `border-b border-border`, `border border-border` |
| Border radius    | `rounded-t-xl`, `rounded-md` |
| Text — primary   | `text-[14px] font-semibold leading-5`, `text-text-primary`, `text-text-dark` |
| Text — secondary | `text-[12px] font-semibold uppercase leading-4`, `text-[14px] font-medium leading-5`, `text-text-secondary`, `text-text-muted` |
| Spacing          | `px-6 py-4`, `px-6 py-5`, `gap-3` |
| Hover state      | `hover:bg-surface-secondary` |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:**
Desktop jobs render as a fixed-column table with white rows, tokenized hover, company icon tile, match score bar, salary estimate, source badge, and date found. Rows are intentionally not links until job details wiring lands.

### JobsMobileList

File: components/find-jobs/JobsMobileList.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface-secondary` |
| Border           | `border border-border` |
| Border radius    | `rounded-xl`, `rounded-md` |
| Text — primary   | `text-[14px] font-semibold leading-5`, `text-text-primary`, `text-text-dark` |
| Text — secondary | `text-[12px] font-medium uppercase leading-4`, `text-text-muted`, `text-text-secondary` |
| Spacing          | `p-4`, `gap-3`, `gap-2`, `mt-4`, `mt-1` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:**
Mobile jobs use stacked cards instead of horizontal table scrolling. Cards preserve the same key fields as desktop: company, role, match score, salary, date found, and source badge.

### JobsPagination

File: components/find-jobs/JobsPagination.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface-secondary`, `bg-accent-muted` |
| Border           | `border border-border`, `border-accent-light` |
| Border radius    | `rounded-b-xl`, `rounded-md` |
| Text — primary   | `text-[14px] font-semibold leading-5`, `text-text-dark`, `text-accent` |
| Text — secondary | `text-[14px] font-normal leading-5`, `text-text-secondary` |
| Spacing          | `p-4`, `md:px-6`, `gap-4`, `gap-2`, `px-4` |
| Hover state      | `hover:bg-surface-secondary`, `hover:text-accent`, `focus-visible:ring-2 focus-visible:ring-accent`, `disabled:opacity-60` |
| Shadow           | `shadow-sm` |
| Accent usage     | `bg-accent-muted`, `border-accent-light`, `text-accent`, `focus-visible:ring-accent` |

**Pattern notes:**
Pagination is local mock pagination only, with 6 jobs per page, accessible current-page state, disabled Previous/Next boundaries, and result count copy.

### MatchScore

File: components/find-jobs/MatchScore.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-border-light`, `bg-success`, `bg-info-medium`, `bg-warning` |
| Border           | none |
| Border radius    | `rounded-full` |
| Text — primary   | `text-[14px] font-semibold leading-5`, `text-text-dark` |
| Text — secondary | none |
| Spacing          | `gap-3` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:**
MatchScore follows the UI rules score ranges: 80+ success, 60-79 info, below 60 warning. Width is inline style percentage only; colors remain tokenized classes.

### SourceBadge

File: components/find-jobs/SourceBadge.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-info-lightest`, `bg-surface-secondary` |
| Border           | none |
| Border radius    | `rounded-full` |
| Text — primary   | `text-[12px] font-medium leading-4`, `text-info-foreground`, `text-text-secondary` |
| Text — secondary | none |
| Spacing          | `px-2 py-0.5` |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:**
SourceBadge reserves the visual home for later `jobs.source` values. `search` renders as Search with info tokens; `url` renders as URL with neutral surface tokens.

### LogoutButton

File: components/auth/LogoutButton.tsx
Last updated: 2026-06-09

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `hover:bg-surface-secondary` |
| Border           | `border border-border`, `hover:border-accent` |
| Border radius    | `rounded-md` |
| Text — primary   | `text-[14px] font-medium leading-5`, `text-text-primary`, `hover:text-accent`, `text-error` |
| Text — secondary | none |
| Spacing          | `gap-2`, `min-h-10`, `px-4` |
| Hover state      | `transition-[background-color,border-color,box-shadow,transform]`, `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:bg-surface-secondary`, `hover:border-accent`, `hover:text-accent`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent`, `focus-visible:ring-offset-2 focus-visible:ring-offset-surface`, `disabled:opacity-60`, `active:translate-y-0 active:duration-75` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | `hover:border-accent`, `hover:text-accent`, `focus-visible:ring-accent` |

**Pattern notes:**
Logout uses the same restrained secondary-button treatment as OAuth provider buttons, with an icon-leading action label and a small inline error state.

### Profile Page

File: app/profile/page.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-background`, `bg-surface`, `bg-accent-muted` |
| Border           | `border-x border-border`, `border border-border` |
| Border radius    | `rounded-xl`, `rounded-md` |
| Text — primary   | `text-[16px] font-semibold leading-6`, `text-text-primary`, `text-accent` |
| Text — secondary | `text-[14px] font-normal leading-5`, `text-text-secondary` |
| Spacing          | `px-8 py-8`, `space-y-6`, `p-6`, `gap-4`, `gap-6`, `gap-3`, `mt-2` |
| Hover state      | none |
| Shadow           | `shadow-sm` |
| Accent usage     | `bg-accent-muted`, `text-accent` |

**Pattern notes:**
The full profile page keeps the protected page shell, stacks the profile status, connected account, and resume management cards above the form, and now loads real authenticated profile data server-side before passing initial values to client editors. The top profile header uses a compact `size-10 rounded-md bg-accent-muted text-accent` icon tile before the title, matching the icon-leading card header language used in profile sub-sections. Future protected full-page UIs should preserve the `bg-background` shell, centered `max-w-[1280px]`, and `rounded-xl border border-border bg-surface p-6 shadow-sm` section baseline.

### CompletionIndicator

File: components/profile/CompletionIndicator.tsx
Last updated: 2026-06-09

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-accent-muted` |
| Border           | `border border-border` |
| Border radius    | `rounded-xl`, `rounded-md`, `rounded-full` |
| Text — primary   | `text-[16px] font-semibold leading-6`, `text-[24px] font-semibold leading-8`, `text-text-primary` |
| Text — secondary | `text-[14px] font-normal leading-5`, `text-[12px] font-normal leading-4`, `text-text-secondary`, `text-text-muted` |
| Spacing          | `p-6`, `gap-6`, `gap-4`, `gap-5`, `gap-2`, `mt-2`, `mt-4`, `px-3 py-1` |
| Hover state      | none |
| Shadow           | `shadow-sm` |
| Accent usage     | `text-accent`, `bg-accent-muted`, `stroke-current`, `stroke-border` |

**Pattern notes:**
Completion status uses the standard card shell with a compact icon tile, clickable pill missing-item tags, and an SVG ring using project token colors. Missing tags link to stable profile form targets and should stay small, uppercase, tokenized, and aligned with the inline completion indicators.

### ConnectedAccounts

File: components/profile/ConnectedAccounts.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-linkedin-light`, `bg-linkedin` |
| Border           | `border border-border` |
| Border radius    | `rounded-xl`, `rounded-md` |
| Text — primary   | `text-[16px] font-semibold leading-6`, `text-[16px] font-medium leading-6`, `text-text-primary`, `text-linkedin`, `text-linkedin-foreground` |
| Text — secondary | `text-[14px] font-normal leading-5`, `text-text-secondary`, `text-text-muted` |
| Spacing          | `p-6`, `p-5`, `gap-4`, `gap-3`, `mt-2`, `mt-6`, `px-6` |
| Hover state      | `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-linkedin` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | `bg-linkedin`, `bg-linkedin-light`, `text-linkedin` |

**Pattern notes:**
Connected account cards use the standard profile card shell with an icon-leading header, inner account row, and brand-token action button. The header icon uses a compact `size-10 rounded-md bg-linkedin-light text-linkedin` connection tile to match the profile page's icon-leading section language. Future provider rows should keep the outer white card, inner bordered row, status copy, and provider-specific token usage instead of raw brand colors.

### ResumeUpload

File: components/profile/ResumeUpload.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface-secondary`, `bg-info-lightest`, `bg-success-lightest`, `bg-accent` |
| Border           | `border border-border`, `border-dashed border-border`, `hover:border-accent` |
| Border radius    | `rounded-xl`, `rounded-md`, `rounded-full` |
| Text — primary   | `text-[16px] font-semibold leading-6`, `text-[14px] font-semibold leading-5`, `text-[14px] font-medium leading-5`, `text-text-primary`, `text-accent-foreground`, `text-success`, `text-error` |
| Text — secondary | `text-[14px] font-normal leading-5`, `text-[12px] font-normal leading-4`, `text-text-secondary`, `text-text-muted` |
| Spacing          | `p-6`, `p-4`, `px-6 py-8`, `px-4`, `gap-4`, `gap-3`, `gap-2`, `mt-6`, `mt-5`, `mt-4`, `mt-2`, `mt-1` |
| Hover state      | `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:bg-accent-dark`, `hover:bg-surface-secondary`, `hover:bg-surface`, `hover:border-accent`, `hover:text-accent`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent`, `active:translate-y-0 active:duration-75`, `disabled:opacity-60` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | `text-accent`, `bg-accent`, `hover:border-accent`, `focus-visible:ring-accent` |

**Pattern notes:**
Resume management uses a left icon-leading card header, dashed tokenized upload panel, real XHR upload progress, a processing state, and a success pulse before refreshing server data. Replacing an existing resume first shows a compact inline confirmation inside the upload panel. Active resumes show an authenticated `Review Current Resume` secondary link to `/api/resume/current`, opening in a new tab instead of exposing the private storage URL. The Feature 07 extraction surface lives below the active resume preview as an inline `rounded-xl border border-border bg-surface-secondary p-4` panel with a primary Extract action, loading spinner, tokenized error copy, and success copy: "Profile fields filled in. Review and save below." Feature 08 adds a matching generate panel with a secondary Generate Resume from Profile action, inline replacement confirmation when an active resume exists, tokenized disabled helper copy for incomplete saved profiles or unsaved local edits, and success copy: "Generated resume saved. Review it in a new tab." After generated or uploaded replacement, the extraction lock clears for the new active PDF. Generated PDF colors resolve from `app/globals.css` token names through the server renderer helper rather than duplicated PDF color literals. Future upload/generation surfaces should use the same tokenized error/success states and independent API route pattern.

### ProfileEditor

File: components/profile/ProfileEditor.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | none |
| Border           | none |
| Border radius    | none |
| Text — primary   | none |
| Text — secondary | none |
| Spacing          | none |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:**
ProfileEditor is a coordination-only Client Component. It keeps `/profile` server-side data loading intact while allowing `ResumeUpload` to call the controlled `ProfileForm` extraction apply handle and receive dirty-state updates from the form. It should stay visually transparent and should not own data fetching or persistence.

### ProfileForm

File: components/profile/ProfileForm.tsx
Last updated: 2026-06-12

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface/55`, `bg-surface-secondary`, `bg-accent-muted`, `bg-info-lightest`, `bg-success-lightest`, `bg-accent`, `bg-overlay/35`, `bg-error` |
| Border           | `border border-border`, `hover:border-accent`, `focus:border-accent` |
| Border radius    | `rounded-xl`, `rounded-md`, `rounded-full` |
| Text — primary   | `text-[16px] font-semibold leading-6`, `text-[14px] font-semibold leading-5`, `text-[14px] font-medium leading-5`, `text-text-primary`, `text-accent-foreground`, `text-error`, `text-error-foreground`, `text-success-foreground` |
| Text — secondary | `text-[12px] font-medium uppercase leading-4`, `text-[12px] font-normal leading-4`, `text-text-secondary`, `text-text-muted` |
| Spacing          | `space-y-6`, `p-6`, `p-5`, `px-3 py-3`, `px-3 py-1`, `px-4`, `px-5`, `gap-5`, `gap-4`, `gap-3`, `gap-2`, `mt-6`, `mt-5`, `mt-4`, `mt-1`, `size-8`, `pb-72`, `md:pb-36` |
| Hover state      | `duration-200 ease-out`, `hover:-translate-y-0.5`, `hover:bg-accent-dark`, `hover:bg-surface-secondary`, `hover:text-accent`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent`, `focus-visible:ring-error`, `active:translate-y-0 active:duration-75`, `disabled:opacity-60`, `cursor-grab`, `active:cursor-grabbing` |
| Shadow           | `shadow-sm`, `hover:shadow-md`, `shadow-[0_24px_70px_color-mix(in_srgb,var(--color-overlay)_22%,transparent)]`, `shadow-[0_28px_90px_color-mix(in_srgb,var(--color-overlay)_20%,transparent),0_12px_36px_color-mix(in_srgb,var(--color-accent)_18%,transparent),0_2px_10px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)]` |
| Accent usage     | `text-accent`, `bg-accent`, `bg-accent-muted`, `focus:border-accent`, `focus:ring-accent`, `focus-visible:ring-accent` |

**Pattern notes:**
Profile form fields use semantic native controls with a shared `h-11 rounded-md border border-border bg-surface px-3 text-[14px] font-medium` baseline. Required completion fields are controlled and show live tokenized inline indicators with `border-accent`, `ring-accent/30`, and compact `text-accent` helper copy. Application Email is prefilled from auth email for new profiles but remains editable as the user's job-application contact email. Section cards use icon-leading headers, uppercase 12px labels, tokenized removable chips, and compact `Complete` / `Missing` section chips. Work role and education cards serialize structured arrays into hidden JSON fields, show compact card summaries, collapse only when multiple cards exist, and keep edited cards expanded. Work role cards put the current-role checkbox on the End Date label row, right-aligned on desktop; checking it clears and disables the End Date input. Work role and education cards expose reorder controls only when multiple cards exist: an always-visible drag handle, move up/down icon buttons, a tokenized drop line, and a screen-reader live announcement. Move controls stay quiet on desktop until hover/focus-within and remain visible on mobile. Removing a populated role or education card opens a tokenized focus-trapped in-app alert dialog before deletion; empty cards remove immediately. Remote preference uses a tokenized checkbox group inside a `rounded-md border bg-surface p-2 shadow-sm` field wrapper; checked options use `border-accent bg-accent-muted text-accent`, and `Any` is exclusive while Remote/Hybrid/Onsite can combine. Extracted resume data applies through the form's imperative handle: non-empty extracted scalars overwrite current values, extracted lists replace current lists, and extracted Work Experience or Education sections replace current sections immediately. Unsaved edits debounce into user-scoped browser localStorage, restore after refresh, surface explicit dirty/local/server save status text in the save card, and are reported to `ProfileEditor` so resume generation can be blocked until saved. Education cards reuse the inner `rounded-xl border border-border bg-surface-secondary p-5` treatment and support unlimited add/remove. Save feedback lives in a fixed bottom floating bar aligned to the profile content column with `bg-surface/55`, `backdrop-blur-2xl`, tokenized gradient sheen, and a glass-style token shadow; on mobile it sits above the protected bottom nav with extra form padding.
