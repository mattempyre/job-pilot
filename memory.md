# Memory — Feature 06 Profile Save Logic And Profile UX Polish

Last updated: 2026-06-10 21:13 CEST

## What was built

Completed Feature 06 Profile Save Logic plus the requested profile editing UX polish.

- Added real profile persistence through `actions/profile.ts` and shared profile parsing/completion helpers in `lib/profile.ts`.
- Added independent resume PDF upload through `app/api/resume/upload/route.ts` and `components/profile/ResumeUpload.tsx`, with XHR upload progress, processing state, success animation, completion recalculation, and old-resume cleanup after DB success.
- Updated `app/profile/page.tsx` to server-render authenticated InsForge profile data and pass editable initial state into focused client components.
- Converted `components/profile/ProfileForm.tsx` into a controlled client form with editable application email, repeatable work roles, repeatable education entries, hidden JSON payloads, autosaved local draft restore, inline missing completion indicators, reorder controls, collapsible cards, and a fixed glass-style save bar.
- Added `components/profile/ConnectedAccounts.tsx` for the LinkedIn connected-account card in the profile stack.
- Added `components/layout/MobileBottomNav.tsx` and rendered it on protected pages: `/dashboard`, `/find-jobs`, and `/profile`.
- Added Atlassian Pragmatic Drag and Drop dependencies and wired drag-handle plus keyboard move controls for work roles and education entries.
- Added an in-app `alertdialog` confirmation when deleting populated role or education cards; empty cards still remove immediately.
- Added resume replacement confirmation before uploading a new PDF over an existing resume.
- Hardened profile mutations with server-side field/array/count caps, `experimental.serverActions.bodySizeLimit = "512kb"`, PDF magic-byte validation, editable email preservation on resume-only updates, and old-resume deletion restricted to the authenticated user's storage prefix.
- Updated `context/library-docs.md`, `context/ui-registry.md`, `context/progress-tracker.md`, `context/architecture.md`, `package.json`, and `package-lock.json`.

## Decisions made

- Profile fields and resume upload save independently. Resume upload stays on a route handler because XHR gives real browser-to-server upload progress.
- The profile email is the job-application contact email. It prefills from auth email for new profiles but remains editable and is preserved during resume-only updates.
- Education remains in the existing object-shaped `profiles.education` JSON column. New saves use `{ entries: EducationEntry[] }`; legacy singular education objects normalize into one entry.
- Work role and education order is persisted by JSON array order; no order columns or migration.
- Completion details are derived in app code; only `profiles.is_complete` is stored. `profile_completed` fires only on incomplete/missing to complete transitions.
- Missing completion indicators should be inline and always visible, with summary badges jumping to stable field/section ids.
- Unsaved profile form edits are user-scoped browser localStorage drafts, not server drafts. They clear after successful profile save.
- Populated card deletion uses an in-app web dialog, not `window.confirm`.
- Protected mobile navigation is mobile-only, fixed to the bottom, and shown only on authenticated app pages.
- The profile save bar remains fixed; on mobile it sits above the bottom nav with extra form padding so fields and helper text remain reachable.
- Resume replacement uploads a new key first, updates DB second, then deletes the previous referenced object only if it belongs under `resumes/{user_id}/`.

## Problems solved

- Fixed education degree persistence by moving education to repeatable controlled entries and serializing through the `education` hidden JSON field.
- Fixed work role current-state UX: `Currently working here` sits on the End Date label row, clears End Date when checked, and disables the End Date input.
- Fixed two-item drag reordering by calculating adjacent drop indexes correctly for both top-to-bottom and bottom-to-top movement.
- Fixed refresh data loss by adding debounced localStorage drafts.
- Replaced vague missing-summary guidance with direct field/section indicators.
- Replaced system delete confirmation with tokenized in-app dialog controls that trap focus and restore focus to the trigger.
- Added section-level completion chips and icons for Work Experience and Job Preferences.
- Added collapsible role and education cards with compact summaries.
- Added clearer save/draft state copy for restored drafts, unsaved edits, locally saved drafts, saving, server-saved, and save-error states.
- Preserved the user's editable application email during resume-only upload updates.
- Added backend payload limits so crafted hidden JSON fields cannot persist oversized arrays or text.
- Added PDF header validation beyond MIME/extension checks.
- Added mobile protected navigation and adjusted protected page bottom padding so fixed page chrome does not hide content.

## Current state

- `context/progress-tracker.md` marks Feature 06 complete and Feature 07 AI Profile Extraction from Resume as next.
- `context/ui-registry.md` captures `MobileBottomNav`, `ResumeUpload`, and `ProfileForm` patterns, including mobile nav glass treatment, resume replacement confirmation, icon-leading section headers, collapsible role/education cards, focus-trapped delete dialog, reorder controls, and mobile save-bar offset.
- Current working tree is intentionally uncommitted and dirty with Feature 05 follow-up plus Feature 06 changes.
- Modified tracked files include:
  - `app/dashboard/page.tsx`
  - `app/find-jobs/page.tsx`
  - `app/profile/page.tsx`
  - `components/profile/CompletionIndicator.tsx`
  - `components/profile/ProfileForm.tsx`
  - `components/profile/ResumeUpload.tsx`
  - `context/architecture.md`
  - `context/library-docs.md`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`
  - `next.config.ts`
  - `package.json`
  - `package-lock.json`
- New untracked files include:
  - `actions/profile.ts`
  - `app/api/resume/upload/route.ts`
  - `components/layout/MobileBottomNav.tsx`
  - `components/profile/ConnectedAccounts.tsx`
  - `lib/profile.ts`
- Latest verification passed:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
  - `git diff --check`
  - raw color/token scan on touched UI/docs files
  - tracked env/key scan and obvious secret scan
  - `npm audit --audit-level=high` returned `found 0 vulnerabilities`
- Build succeeds on Next.js 16.2.7. It prints the expected experimental notice for `serverActions` because the installed Next type exposes `experimental.serverActions`.
- Mobile unauthenticated sanity check on `/login` confirmed no protected bottom nav and no horizontal overflow.
- Authenticated browser QA for `/profile` and `/find-jobs` was not completed because browser-control tools were not exposed; only `node_repl` was available after tool discovery.

## Next session starts with

Use the existing authenticated in-app browser session to verify `/profile` and protected mobile navigation end to end:

- Check `/dashboard`, `/find-jobs`, and `/profile` on mobile for bottom nav visibility, active state, safe-area spacing, and no horizontal overflow.
- Confirm `/login`, landing, and auth callback pages do not show the protected bottom nav.
- Save profile fields and confirm they persist after refresh.
- Add, collapse, expand, reorder, and delete multiple work roles and education entries.
- Confirm populated delete opens the in-app dialog, traps focus, closes with Escape/backdrop/close/Keep item, and restores focus; empty delete removes immediately.
- Confirm local draft restore works when refreshing before save and clears after successful save.
- Confirm save failure scrolls/focuses the first missing required field or section.
- Upload and replace a PDF resume, verify progress/processing/success states, confirm replacement prompt appears first, and confirm completion updates.
- Check desktop and mobile for no horizontal overflow and no save bar or bottom nav overlap with helper text or dialog actions.

After browser QA, decide whether to commit Feature 05 follow-up and Feature 06 together or split them.

## Open questions

- Should the current combined Feature 05 follow-up and Feature 06 implementation be committed as one commit or split?
- Should future resume display persist original filename and file size, or keep deriving display from the storage key/latest upload response?
- Should the repeatable education UI stay unlimited, or should a soft recommendation/visual grouping be added later if users create many entries?
- Should Feature 07 AI Profile Extraction from Resume adapt to the new `{ entries }` education shape immediately, or include a compatibility adapter at that feature boundary?
