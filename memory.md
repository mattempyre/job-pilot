# Memory — Auth, Security Hardening, and Imprint

Last updated: 2026-06-09 21:24 CEST

## What was built

Completed Phase 1 Feature 02 Auth and follow-up hardening work:

- Created auth UI and flow in `app/(auth)/login/page.tsx`, `app/(auth)/callback/page.tsx`, and `components/auth/OAuthButtons.tsx`.
- Added protected placeholder pages for `app/dashboard/page.tsx`, `app/profile/page.tsx`, and `app/find-jobs/page.tsx`.
- Added `components/auth/LogoutButton.tsx` and placed it on the profile placeholder.
- Added InsForge helpers in `lib/insforge-client.ts`, `lib/insforge-server.ts`, and `lib/insforge-auth.ts`.
- Added auth API routes under `app/api/auth/`: OAuth start, OAuth callback, refresh, and logout.
- Added Next.js 16 `proxy.ts` protection for `/dashboard`, `/profile`, and `/find-jobs`, plus auth-route redirects back to `/profile` when signed in.
- Added `lib/security.ts` with same-origin auth POST checks, generic API errors, and bounded in-memory rate limiting.
- Added global security headers and disabled `X-Powered-By` in `next.config.ts`.
- Added `package.json` npm override so Next's transitive PostCSS resolves to patched `8.5.10`; `package-lock.json` was refreshed.
- Updated `context/progress-tracker.md` and `context/ui-registry.md`; `/imprint` was run for the auth pages/buttons/profile placeholder patterns.

## Decisions made

- Auth uses the installed `@insforge/sdk` package and its SSR helpers from `@insforge/sdk/ssr`; `@insforge/ssr` is not a separate published package for this project.
- OAuth PKCE verifier is stored in an app-owned httpOnly cookie during provider redirect, then exchanged server-side in `/api/auth/oauth/callback`.
- Successful OAuth callback always redirects to `/profile`; authenticated visits to `/login` and `/callback` are also redirected to `/profile`.
- Logout clears both the browser SDK session and app-owned InsForge auth cookies through `/api/auth/logout`.
- Global security headers are configured in `next.config.ts`; CSP allows the InsForge API URL from `NEXT_PUBLIC_INSFORGE_URL`.
- The current rate limiter is an in-process baseline. A shared backing store is needed later if strict throttling is required across multiple server instances.

## Problems solved

- Login design was corrected to match the supplied split-card reference while preserving the top navbar and footer.
- Google/GitHub OAuth initialization error was fixed by using SDK `skipBrowserRedirect: true`, storing the PKCE verifier server-side, and redirecting manually.
- Post-login navigation incorrectly landed on `/login?next=%2Fdashboard`; callback flow now establishes server auth cookies and routes to `/profile`.
- Removed an unsafe open token-to-session endpoint from the earlier auth pass.
- Security audit originally found a moderate PostCSS vulnerability inside Next's bundled dependency; npm's suggested fix was a breaking downgrade, so the safe local resolution is the targeted npm override to `postcss@8.5.10`.

## Current state

- `context/progress-tracker.md` says Phase 1 Feature 02 Auth is complete and the next planned item is Feature 03 PostHog Initialization.
- Latest verification passed:
  - `npm run lint`
  - `npm run build`
  - `npm audit --audit-level=moderate`
- Route smoke tests passed on `http://localhost:3000`:
  - `/login` returns security headers and no `X-Powered-By`.
  - Cross-origin auth/logout POSTs return `403`.
  - Same-origin OAuth start returns `200` and sets the httpOnly verifier cookie.
  - Same-origin logout returns `200` and clears InsForge cookies.
- Current auth/security changes are uncommitted in the working tree.

## Next session starts with

Start Phase 1 Feature 03 PostHog Initialization. Before implementing, read the required context files from `AGENTS.md`, check the installed Next.js 16 docs relevant to analytics/script/client setup, and inspect `context/build-plan.md` for the expected PostHog scope.

## Open questions

- Should the completed Auth/Security changes be committed before starting PostHog?
- Should rate limiting stay in-process for now, or should the project introduce shared rate-limit storage before deployment?
