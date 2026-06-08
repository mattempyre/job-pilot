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
| Hover state      | `hover:text-accent`, `hover:-translate-y-0.5`, `hover:bg-overlay`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent` |
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
| Hover state      | `hover:-translate-y-0.5`, `hover:bg-overlay`, `hover:bg-surface`, `hover:border-accent`, `hover:text-accent`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent` |
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
| Hover state      | `hover:-translate-y-0.5`, `hover:bg-overlay`, `hover:bg-surface`, `hover:border-accent`, `hover:text-accent`, `hover:shadow-md`, `focus-visible:ring-2 focus-visible:ring-accent` |
| Shadow           | `shadow-sm`, `hover:shadow-md` |
| Accent usage     | none |

**Pattern notes:**
Bottom CTA reuses the Hero CTA pattern and pastel gradient to close the landing page consistently.
