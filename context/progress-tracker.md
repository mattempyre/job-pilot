# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 08 Resume PDF Generation from Profile
**Next:** 09 Find Jobs Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

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
- 2026-06-10 — Feature 06 uses independent save paths: profile fields save through a Server Action, while resume PDFs upload through `/api/resume/upload` with real XHR upload progress before InsForge storage/DB processing completes.
- 2026-06-10 — Feature 06 stores only `profiles.is_complete`; completion percentage, completed labels, and missing-field labels are derived in app code from the shared required-field checklist.
- 2026-06-10 — The profile email is the user's application contact email, not necessarily their authentication email. New profiles prefill it from auth email, but the field remains editable and the submitted value is persisted.
- 2026-06-10 — Profile education is repeatable without a DB migration. `profiles.education` remains an object-shaped JSON column and stores `{ entries: EducationEntry[] }`; legacy singular education objects are normalized into a one-entry array in app code.
- 2026-06-10 — Profile role and education ordering is persisted through the existing JSON array order. Reordering uses Atlassian Pragmatic Drag and Drop with handle-only dragging plus keyboard move controls; no database migration is required.
- 2026-06-11 — Feature 07 keeps resume extraction transient until the user saves the profile. `/api/resume/extract` reads the authenticated user's active private resume, parses text with `pdf-parse`, asks GPT-4o for structured profile JSON, and returns validated data to the profile page without writing profile fields to the database.
- 2026-06-11 — Extracted resume data applies directly into the local profile draft: non-empty extracted scalar values overwrite populated form values, extracted lists replace current lists, and extracted Work Experience or Education sections replace populated sections without an extra confirmation. Users still must review and click Save Profile before the database changes.
- 2026-06-11 — Local Playwright auth support uses a server-only fixture path instead of mocked InsForge cookies. `JOB_PILOT_E2E_AUTH=1` and `jobpilot_e2e_auth=1` are both required, the mode is disabled in production, and profile scenarios are selected with `jobpilot_e2e_profile=blank|resume|populated`.
- 2026-06-11 — Resume extraction configures `pdf-parse` with the packaged worker file path from `node_modules` instead of importing `pdf-parse/worker`. This avoids the missing `.next/.../pdf.worker.mjs` runtime failure and Turbopack's native `@napi-rs/canvas` route-bundling failure. Parser infrastructure errors now return a temporary-unavailable response instead of the unreadable-PDF message.
- 2026-06-11 — Resume extraction validates OpenAI responses with conservative normalization instead of brittle rejection. Overlong extracted text is truncated, list sizes are capped, work roles are limited to 3 newest entries, single work/education objects are accepted as one-item arrays, and OpenAI JSON truncation is logged separately from schema issues.
- 2026-06-11 — Resume extraction is limited to one successful extraction per active PDF. The app records `profiles.resume_extracted_pdf_key` after a successful extraction, rejects duplicate extraction before PDF download or OpenAI calls, and clears the marker when a new resume is uploaded.
- 2026-06-11 — Remote preference is now multi-select in the profile form. The app stores selected values in the existing `profiles.remote_preference` text column as comma-separated values for backward compatibility; legacy single values such as `hybrid` still hydrate correctly. `any` is exclusive, while `remote`, `hybrid`, and `onsite` can be combined.
- 2026-06-11 — Resume extraction seeds `jobTitlesSeeking` from the resume. Explicit target roles are preserved, and the parser appends the extracted current title plus the newest few work role titles as removable chips when target roles are missing or sparse.
- 2026-06-12 — Feature 07 review fixes: `profiles.remote_preference` now has a named database check constraint that accepts comma-separated remote/hybrid/onsite selections or `any` by itself; resume extraction reserves `resume_extracted_pdf_key` before the OpenAI call to prevent concurrent duplicate API spend; GPT-4o extraction prompt/response handling moved into `agent/resume-extraction.ts`.
- 2026-06-12 — Feature 08 generates active resume PDFs from saved profile data only. The UI blocks generation while required saved profile fields are incomplete or local profile edits are unsaved, confirms before replacing an existing active resume, and reviews private PDFs through authenticated `/api/resume/current` instead of direct storage URLs.
- 2026-06-12 — Feature 08 uses `@react-pdf/renderer` server-side through `lib/resume-renderer.tsx`. GPT-4o returns validated, capped resume content in `agent/resume-generation.ts`; generated PDFs are controlled to one or two pages by limiting roles, bullets, skills, and education entries.
- 2026-06-12 — Resume generation now has a deterministic fallback. If GPT-4o is unavailable or returns invalid resume content, `/api/resume/generate` logs the AI failure, formats the saved profile directly, renders a PDF, and leaves the user with a usable generated resume instead of failing.
- 2026-06-12 — Resume generation hardening: `/api/resume/generate` now saves with an active-resume compare-and-swap guard and removes the just-uploaded PDF on save conflicts, while generated PDF colors resolve from `app/globals.css` UI tokens instead of duplicated renderer literals.
- 2026-06-12 — Pending Feature 07 backend migrations were applied to InsForge before Feature 08 real testing: `resume_extracted_pdf_key`, `resume_extracted_at`, `profiles_extracted_resume_key_matches_user`, and multi-select `profiles_remote_preference_valid` are now present.

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
- 2026-06-10 — Profile Page Full UI follow-up: top profile cards now stack vertically, and `/profile` includes a mock Connected Accounts card for LinkedIn above the Resume section. This remains UI-only; no LinkedIn OAuth or workflow logic is wired.
- 2026-06-10 — Profile Save Logic completed. `/profile` now loads the authenticated user's InsForge profile row, pre-fills the form from saved data, saves profile fields to `profiles`, uploads/replaces active resume PDFs independently in the private `resumes` bucket, cleans up the previous referenced resume object after successful replacement, recalculates completion after both mutation paths, and fires `profile_completed` only on incomplete-to-complete transitions.
- 2026-06-10 — Profile Save Logic follow-up: Education now supports unlimited add/remove education cards, serializes entries through the profile form, and saves them as `education.entries`. Completion is satisfied when at least one education entry is complete.
- 2026-06-10 — Profile Save Logic follow-up: Work Experience and Education cards can be reordered with drag handles or move up/down buttons when more than one card exists. Save persists the reordered array order through the existing profile form payload.
- 2026-06-10 — Profile Save Logic follow-up: `/profile` now debounces unsaved form edits into user-scoped browser localStorage, restores them after refresh, and clears the local draft after a successful profile save.
- 2026-06-10 — Profile Save Logic follow-up: the Ready to save action section is now a fixed bottom floating bar with tokenized translucent surface, backdrop blur, and glass-style shadow treatment.
- 2026-06-10 — Profile Save Logic follow-up: profile completion now exposes stable missing-item keys, missing badges jump to their matching form targets, and `/profile` shows live inline missing indicators on required fields, groups, and resume upload.
- 2026-06-10 — Profile Save Logic follow-up: deleting populated Work Experience or Education cards now opens an in-app confirmation dialog, while empty cards still remove immediately.
- 2026-06-10 — Profile Save Logic security hardening: profile form mutations now enforce server-side field, array, role, and education payload caps; Server Action bodies are limited to `512kb`; resume uploads validate the PDF magic bytes and only delete prior resume objects under the authenticated user's key prefix.
- 2026-06-10 — Profile UX polish follow-up: protected mobile pages now include a tokenized bottom navigation, `/profile` positions its sticky save bar above that nav on mobile, profile sections show icon-leading headers with completion chips, role and education cards support multi-card collapse with summaries, populated-card deletion uses a focus-trapped dialog, and resume replacement asks for inline confirmation.
- 2026-06-11 — AI Profile Extraction from Resume completed. `/profile` now shows an Extract from Resume action after an active PDF is uploaded, renders inline extraction loading/error/success states in the Resume card, applies extracted data directly into the controlled form, shows "Profile fields filled in. Review and save below.", and leaves final persistence to the existing Save Profile action.
- 2026-06-11 — Credential-free Playwright coverage added for `/profile`. `npm run test:e2e` starts Next on port 3100 with e2e auth enabled, sets local auth/profile cookies, and verifies no-resume, extraction auto-fill, and populated-field overwrite behavior without OAuth credentials.
- 2026-06-11 — Resume extraction parser regression added in `tests/resume-pdf-parser.spec.ts` to exercise real `pdf-parse` text extraction with the configured worker path.
- 2026-06-11 — Extracted profile parser regression added in `tests/extracted-profile-parser.spec.ts` to ensure oversized model responses normalize instead of returning a 500.
- 2026-06-11 — Resume extraction repeat guard regression added through the credential-free profile e2e path: after one successful extraction, the UI disables the action and the duplicate API call returns 409.
- 2026-06-11 — Remote preference multi-select regression added in `tests/remote-preferences.spec.ts` for legacy hydration, multi-value save serialization, and `Any` exclusivity.
- 2026-06-11 — Extracted profile parser regression now verifies `Job Titles Seeking` is seeded from current and recent role titles when the model returns no explicit target roles.
- 2026-06-11 — Profile page header follow-up: added the same compact accent icon tile treatment used by profile section headers to the top Profile card.
- 2026-06-11 — Connected Accounts follow-up: added a compact LinkedIn-token connection icon tile to the card header for consistency with the other profile page sections.
- 2026-06-11 — Work Experience follow-up: removed the role card briefcase icon and kept reorder drag handles visible so role titles do not appear offset by hidden controls.
- 2026-06-12 — Resume PDF Generation from Profile completed. `/profile` now reviews active private resumes through `/api/resume/current`, generates polished PDFs through `/api/resume/generate`, replaces the active resume reference on success, clears extraction markers for generated replacements, and includes e2e fixture support for first-time generation and replacement confirmation.
