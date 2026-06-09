# Memory — PostHog Initialization and Review Fixes

Last updated: 2026-06-09 22:19 CEST

## What was built

Completed Phase 1 Feature 03 PostHog Initialization and follow-up review fixes:

- Added PostHog dependencies `posthog-js` and `posthog-node` to `package.json`; `package-lock.json` was refreshed.
- Added `instrumentation-client.ts` to initialize PostHog before the Next.js App Router app becomes interactive.
- Added `lib/posthog-client.ts`, `lib/posthog-server.ts`, and `lib/posthog-events.ts`.
- Wired OAuth success identity through `app/(auth)/callback/page.tsx` and `app/api/auth/oauth/callback/route.ts`.
- Wired logout identity reset through `components/auth/LogoutButton.tsx`.
- Configured the PostHog browser client to use same-origin `/ingest` rewrites in `next.config.ts`.
- Added `posthog-setup-report.md` documenting the current PostHog setup.
- Updated `context/build-plan.md`, `context/progress-tracker.md`, and `context/ui-registry.md`.

## Decisions made

- Use the PostHog wizard/Next.js `instrumentation-client.ts` initialization path instead of a root-layout provider.
- Keep browser ingestion behind the app's `/ingest` reverse proxy; `ui_host` points to the real PostHog app host.
- `NEXT_PUBLIC_POSTHOG_KEY` is the canonical runtime env var. Local `.env.local` aliases it to the wizard-created `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`.
- SDK autocapture is disabled. Only explicit project-approved custom events should be sent.
- Logout does not send a custom event; it only calls `posthog.reset()`.
- The only approved custom events remain `job_search_started`, `job_found`, `profile_completed`, and `company_researched`.
- Generic capture helpers are internal; future code should use the named client/server helpers for each approved event.

## Problems solved

- The PostHog wizard had added out-of-contract events (`cta_clicked`, `oauth_provider_selected`, `sign_in_completed`, `sign_in_failed`, `sign_out_completed`). These were removed.
- Browser remote config originally failed because the client used direct `https://eu.i.posthog.com` ingestion while rewrites existed. The client now uses `api_host: "/ingest"`.
- `/ingest/flags/?v=2` and `/ingest/static/array.js` were verified to return `200` on the existing local dev server.
- A review found SDK autocapture, split env naming, exported generic capture helpers, and docs mismatch. These were fixed.

## Current state

- `context/progress-tracker.md` says Phase 1 Feature 03 PostHog Initialization is complete and the next planned item is Feature 04 Database Schema.
- Current verification passed:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
- The running dev server must be restarted after the latest `.env.local` and `next.config.ts` changes.
- Working tree is dirty and uncommitted. It includes Auth/Security work from the prior memory plus PostHog changes from this session.
- `.env.local` is gitignored and contains the local PostHog key alias.

## Next session starts with

Run `/remember restore`, then decide whether to commit the accumulated Auth/Security/PostHog work or continue with Phase 1 Feature 04 Database Schema. If continuing, read the required context files and use InsForge MCP/docs before schema work.

## Open questions

- Should the completed Auth/Security/PostHog changes be committed before starting the database schema?
- Should PostHog autocapture stay permanently disabled, or only while the project keeps the four-event contract?
- Should the in-process auth rate limiter be replaced with shared storage before deployment?
