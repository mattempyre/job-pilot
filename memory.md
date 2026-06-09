# Memory — Database Schema and Review Fixes

Last updated: 2026-06-09 22:54 CEST

## What was built

Completed Phase 1 Feature 04 Database Schema and addressed the follow-up `/review` findings.

- Created `db/migrations/0001_initial_schema.sql` as the repo-owned source of truth for the initial InsForge app schema.
- Applied the migration to the InsForge backend. It created `profiles`, `agent_runs`, `jobs`, and `agent_logs` with foreign keys, check constraints, indexes, authenticated own-row RLS policies, and a `profiles` updated-at trigger.
- Created the private InsForge `resumes` storage bucket.
- Fixed review finding 1: `jobs.run_id` now uses `ON DELETE CASCADE`, so deleting an agent run removes its search jobs instead of trying to null a required search `run_id`.
- Fixed review finding 2 as far as the InsForge permissions allow: added `profiles_resume_key_matches_user`, which rejects `profiles.resume_pdf_key` values outside `resumes/{profile_id}/...`.
- Updated `context/progress-tracker.md`, `context/ui-registry.md`, `context/architecture.md`, `context/build-plan.md`, and `context/library-docs.md`.
- The developer removed the stale Tailwind 3.4 instruction from `AGENTS.md`; Tailwind v4 is now consistent with the local UI docs and package deps.

## Decisions made

- Schema changes should be tracked in repo migrations first, then applied to InsForge from that SQL.
- `jobs.run_id` remains nullable because future non-search jobs with `source = 'url'` may not have a run, but `source = 'search'` requires a run through a check constraint.
- Deleting an `agent_runs` row cascades to its jobs. This preserves the search-job invariant and avoids `ON DELETE SET NULL` conflicts.
- `agent_logs.run_id` remains nullable so company-research or job-specific logs can attach to `job_id` without inventing a search run.
- Resume storage references use both `resume_pdf_url` and `resume_pdf_key`. Current InsForge storage returns both values, and future replace/delete/download flows need the key.
- The `resumes` bucket is private. `profiles.resume_pdf_key` must point under the profile owner's key prefix, and app logic should scope all storage operations through the current user.

## Problems solved

- Confirmed the backend initially only had InsForge auth tables and no app tables.
- Confirmed `auth.users(id)` is UUID and `auth.uid()` exists, so RLS policies can use the documented ownership pattern.
- Confirmed InsForge storage docs no longer match older local `upsert` examples; local docs now say to save returned `url` and `key`, and to remove the previous object by key when a single active resume object is required.
- Attempted to attach a trigger to `storage.objects`, but InsForge rejected it with `permission denied for table objects`. Ownership enforcement was moved to the app schema via `profiles_resume_key_matches_user`.
- Verified the applied schema through InsForge table schema calls, raw catalog checks, bucket listing, and a live smoke test.

## Current state

- `context/progress-tracker.md` says Phase 2 is next, with Feature 05 Profile Page — Full UI.
- InsForge backend has all four app tables with RLS enabled and four own-row policies per table.
- `jobs_run_id_fkey` is live as `ON DELETE CASCADE`.
- `profiles_resume_key_matches_user` is live and rejects resume keys outside `resumes/{profile_id}/...`.
- InsForge backend has a private `resumes` bucket.
- Verification passed:
  - `git diff --check`
  - `npm run lint`
  - `npx tsc --noEmit`
  - Live smoke test for cascade delete and bad resume key rejection
- Working tree is dirty and uncommitted. It includes Feature 04 changes plus the developer's `AGENTS.md` edit:
  - modified `AGENTS.md`
  - modified context docs
  - modified `memory.md`
  - new `db/` migration folder

## Next session starts with

Run `/remember restore`, then start Phase 2 Feature 05 Profile Page — Full UI. Before building UI, read the required context files in order and inspect existing placeholder pages/components. Feature 05 is UI-only with mock data; do not wire save logic, resume upload, resume extraction, or PDF generation yet.

## Open questions

- Should the completed Foundation work through Feature 04 be committed before starting Profile UI?
- For Feature 05, should `/architect` be used first because the profile form is a large multi-section UI?
