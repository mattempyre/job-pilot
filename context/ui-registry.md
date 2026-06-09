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

File: app/dashboard/page.tsx, app/profile/page.tsx, app/find-jobs/page.tsx
Last updated: 2026-06-09

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
These are temporary protected-route placeholders for Auth verification. Later full dashboard, profile, and find-jobs features should replace them with their planned complete UI while keeping the same page background, centered max-width, and card baseline. Header actions such as logout should sit in the card header area using the existing secondary-button pattern.

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
