# Memory — Feature 08 Resume PDF Generation and Review

Last updated: 2026-06-12 15:25 CEST

## What was built

Feature 08 is implemented. `/profile` now lets authenticated users generate a new active private PDF resume from saved profile data, review the current active resume inline through `/api/resume/current`, and replace an existing active resume only after inline confirmation. Generation clears the extraction lock for the new active PDF and updates the Resume card state.

Key files added or changed for Feature 08 include `app/api/resume/generate/route.ts`, `app/api/resume/current/route.ts`, `agent/resume-generation.ts`, `lib/resume-renderer.tsx`, `lib/ui-token-values.ts`, `components/profile/ResumeUpload.tsx`, `components/profile/ProfileEditor.tsx`, `components/profile/ProfileForm.tsx`, `lib/e2e-auth.ts`, `lib/e2e-profile.ts`, `tests/resume-generation.spec.ts`, and `tests/profile-e2e-auth.spec.ts`. `@react-pdf/renderer@4.5.1` was added.

Feature 07 extraction work is also present in the same dirty worktree: `/api/resume/extract`, `agent/resume-extraction.ts`, `lib/resume-pdf.ts`, extraction marker fields, remote preference multi-select support, e2e fixture auth, and related tests.

Project context files were updated for the completed features: `context/architecture.md`, `context/build-plan.md`, `context/code-standards.md`, `context/library-docs.md`, `context/progress-tracker.md`, and `context/ui-registry.md`.

## Decisions made

- Generated resumes replace, not version, the active `profiles.resume_pdf_url` / `profiles.resume_pdf_key`.
- Resume generation uses saved profile data only. Unsaved local profile edits disable generation until saved.
- GPT-4o is still the primary resume-content path, but generation now has a deterministic fallback from saved profile fields when OpenAI is unavailable or returns invalid content.
- Generated PDF content is capped before rendering: up to 3 roles, 3 bullets per role, 18 skills, and 4 education entries.
- Generated private resumes are reviewed through authenticated `/api/resume/current`; the browser never receives a direct private storage URL for review.
- `/api/resume/generate` now saves with an active `resume_pdf_key` compare-and-swap guard. If the active resume changes during generation, the just-uploaded PDF is deleted and the route returns `409`.
- React PDF styles cannot use Tailwind classes, so PDF colors are resolved from `app/globals.css` token names through `lib/ui-token-values.ts` instead of duplicating hex literals in the renderer.

## Problems solved

- Added extra padding below the generated resume name by increasing the name style spacing in `lib/resume-renderer.tsx`.
- Answered and implemented the non-ChatGPT fallback request: missing or failed OpenAI no longer blocks resume generation.
- Fixed review finding: concurrent resume generation can no longer leave orphaned uploaded PDFs after a save race.
- Fixed review finding: generated PDF renderer no longer hardcodes color literals.
- Applied pending live InsForge migrations `0002_resume_extraction_marker.sql` and `0003_remote_preference_multi_select.sql`; the backend now has extraction marker columns, matching user-prefix constraint, and the multi-select remote preference constraint.

## Current state

Verification passed after the final fixes:

- `npm run lint`
- `npx tsc --noEmit`
- `git diff --check`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test tests/resume-generation.spec.ts`
- `npm run build`

The build and Playwright runs still show the existing Node `[DEP0205] module.register()` warning, but they pass.

The full profile e2e suite was not run in the final pass because the user has the app open on the existing `localhost:3000` dev server, while `npm run test:e2e` is configured to start its own e2e-enabled Next dev server on port 3100. Next.js 16 only allows one dev server per project.

The worktree is intentionally dirty with Feature 07 and Feature 08 implementation, tests, migrations, docs, package changes, and context updates. No commit has been made.

## Next session starts with

Run `/remember restore`, then do a final QA pass before committing. Stop the existing dev server or run against an e2e-enabled server, then execute the full profile e2e coverage:

```bash
npm run test:e2e
```

If keeping the current dev server on port 3000, restart it with e2e auth enabled and run:

```bash
JOB_PILOT_E2E_AUTH=1 npm run dev
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

After e2e verification, manually smoke test real `/profile` with InsForge auth: upload, extract, duplicate extraction guard, generate with active resume replacement, review current resume, fallback behavior if no OpenAI key, and extraction-lock reset after generated replacement.

## Open questions

- Decide whether to clean up the existing Node `[DEP0205] module.register()` warning later.
- Decide whether to add a dedicated concurrency regression test for `/api/resume/generate` beyond the current route logic review.
- Next planned product feature is 09 Find Jobs Page — Full UI.
