# PostHog Setup Report

PostHog is initialized for the Next.js App Router project through `instrumentation-client.ts`, which calls the shared browser setup in `lib/posthog-client.ts` before the app becomes interactive.

## Current Setup

- Browser client: `lib/posthog-client.ts`
- Server client: `lib/posthog-server.ts`
- Shared event names and property types: `lib/posthog-events.ts`
- Browser ingestion: same-origin `/ingest` proxy through Next.js rewrites
- SDK autocapture: disabled, so only explicit approved product events are sent
- Client identity: `posthog.identify()` after OAuth callback
- Server identity: `posthog.identify()` after server-side OAuth exchange
- Logout cleanup: `posthog.reset()` after sign out

## Approved Events

Only these project-approved custom events are exposed by the helper layer:

| Event | Properties |
|---|---|
| `job_search_started` | `userId`, `jobTitle`, `location` |
| `job_found` | `userId`, `source`, `matchScore` |
| `profile_completed` | `userId` |
| `company_researched` | `userId`, `jobId`, `company` |

Earlier wizard-only events such as CTA, sign-in, sign-out, and provider-selection events were removed because they are outside the current project event contract.

`NEXT_PUBLIC_POSTHOG_KEY` is the canonical app environment variable. The local `.env.local` may keep the wizard's `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` value and alias `NEXT_PUBLIC_POSTHOG_KEY` to it.
