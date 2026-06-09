# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 05 Profile Page — Full UI
**Next:** 06 Profile Save Logic

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- 2026-06-09 — Feature 04 schema is tracked in `db/migrations/0001_initial_schema.sql` and applied to InsForge from that repo-owned source of truth.
- 2026-06-09 — Resume storage references use both `resume_pdf_url` and `resume_pdf_key` because current InsForge storage docs return both values and object replacement/delete operations need the key.
- 2026-06-09 — Feature 04 review fix: search jobs now cascade when their `agent_runs` row is deleted, and profile resume keys are constrained to `resumes/{user_id}/...`.
- 2026-06-09 — Feature 05 is UI-only with mock profile data. It intentionally does not wire save logic, file upload, resume extraction, PDF generation, or InsForge reads/writes.
- 2026-06-09 — Playwright is installed as a dev-only browser verification dependency, with Chromium installed locally for repeatable profile page screenshots.

---

## Notes

- 2026-06-08 — Homepage built from `context/designs/landing-page.png` using public assets. CTA links point to `/login` and `/find-jobs`; auth-aware redirects will be handled when Phase 1 Feature 02 Auth exists.
- 2026-06-08 — Homepage refactored into architecture-defined components under `components/layout/` and `components/homepage/`; `app/page.tsx` is now composition only.
- 2026-06-08 — Homepage CTA buttons received consistent hover, active, shadow, and focus-visible states using project tokens.
- 2026-06-08 — Homepage CTA hover states now use explicit `duration-200 ease-out` transitions with faster active press timing.
- 2026-06-08 — Auth implemented with `@insforge/sdk` / `@insforge/sdk/ssr`, Google and GitHub OAuth buttons, `/callback` handling, `/api/auth/refresh`, and Next.js 16 `proxy.ts` protection for `/dashboard`, `/profile`, and `/find-jobs`.
- 2026-06-08 — Temporary protected placeholders added for `/dashboard`, `/profile`, and `/find-jobs` so successful OAuth redirects do not land on missing routes before later full UI phases.
- 2026-06-08 — InsForge MCP auth docs were fetched before implementation. `@insforge/ssr` is not published; the installed `@insforge/sdk` package provides the current SSR helpers under `@insforge/sdk/ssr`.
- 2026-06-09 — Profile placeholder now includes a logout button. Logout clears both the browser SDK session and app-owned InsForge auth cookies through `/api/auth/logout`.
- 2026-06-09 — OAuth callback flow hardened: provider start stores the SDK PKCE verifier in an app-owned httpOnly cookie, callback exchange runs server-side through the InsForge SDK, app auth cookies are set there, and the open token-to-session endpoint was removed.
- 2026-06-09 — Auth security hardening pass completed: auth POST routes now require same-origin requests, use bounded in-memory rate limiting, and return generic errors; global security headers and `poweredByHeader: false` were added in `next.config.ts`. `package.json` also pins Next's transitive PostCSS dependency to patched `8.5.10` through npm overrides so `npm audit --audit-level=moderate` reports zero vulnerabilities.
- 2026-06-09 — PostHog initialization completed using `instrumentation-client.ts`, `lib/posthog-client.ts`, and `lib/posthog-server.ts`. Auth now identifies users after OAuth and resets identity on logout. Only the four project-approved events are exposed through typed helpers: `job_search_started`, `job_found`, `profile_completed`, and `company_researched`.
- 2026-06-09 — PostHog browser ingestion now uses the same-origin `/ingest` reverse proxy configured in `next.config.ts`, while `ui_host` points to the real PostHog app host for EU/US projects. This avoids direct browser remote-config requests to the third-party ingestion domain.
- 2026-06-09 — PostHog review fixes applied: SDK autocapture is disabled, generic capture helpers are internal, `NEXT_PUBLIC_POSTHOG_KEY` is the canonical app env var, and the build plan now reflects the Next.js `instrumentation-client.ts` initialization path.
- 2026-06-09 — Database Schema completed. Created and applied `profiles`, `agent_runs`, `jobs`, and `agent_logs` with foreign keys, check constraints, indexes, authenticated own-row RLS policies, and a `profiles` updated-at trigger. Created private InsForge `resumes` storage bucket.
- 2026-06-09 — Database Schema review fixes applied after `/review`: changed `jobs.run_id` from `ON DELETE SET NULL` to `ON DELETE CASCADE`, and added `profiles_resume_key_matches_user`.
- 2026-06-09 — Profile Page Full UI completed. `/profile` now renders mock completion status, resume upload/generation controls, and full semantic profile form sections through `CompletionIndicator`, `ResumeUpload`, and `ProfileForm`. Verified with lint, TypeScript, token scan, and Playwright desktop/mobile screenshots with no horizontal overflow.
