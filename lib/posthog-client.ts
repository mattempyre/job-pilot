import posthog from "posthog-js";

import {
  POSTHOG_EVENT_NAMES,
  type CompanyResearchedProperties,
  type JobFoundProperties,
  type JobSearchStartedProperties,
  type PostHogEventName,
  type PostHogEventProperties,
  type ProfileCompletedProperties,
} from "@/lib/posthog-events";

let isPostHogInitialized = false;

function getPostHogKey(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

function shouldLogPostHogSetupWarning(): boolean {
  return process.env.NODE_ENV === "development";
}

function getPostHogUiHost(posthogHost: string): string | undefined {
  if (posthogHost.includes("eu.i.posthog.com")) {
    return "https://eu.posthog.com";
  }

  if (posthogHost.includes("us.i.posthog.com")) {
    return "https://us.posthog.com";
  }

  return undefined;
}

export function initPostHog(): void {
  if (typeof window === "undefined" || isPostHogInitialized) {
    return;
  }

  const posthogKey = getPostHogKey();
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!posthogKey || !posthogHost) {
    if (shouldLogPostHogSetupWarning()) {
      console.warn("[posthog/client] Missing PostHog environment variables.");
    }

    return;
  }

  try {
    posthog.init(posthogKey, {
      api_host: "/ingest",
      ui_host: getPostHogUiHost(posthogHost),
      autocapture: false,
      capture_pageview: false,
      defaults: "2026-01-30",
      debug: process.env.NODE_ENV === "development",
    });
    isPostHogInitialized = true;
  } catch (error) {
    console.error("[posthog/client]", error);
  }
}

export function identifyPostHogUser(userId: string): void {
  if (!userId) {
    return;
  }

  initPostHog();

  try {
    posthog.identify(userId, { userId });
  } catch (error) {
    console.error("[posthog/client]", error);
  }
}

export function resetPostHogUser(): void {
  initPostHog();

  try {
    posthog.reset();
  } catch (error) {
    console.error("[posthog/client]", error);
  }
}

function capturePostHogEvent(
  event: PostHogEventName,
  properties: PostHogEventProperties,
): void {
  initPostHog();

  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.error("[posthog/client]", error);
  }
}

export function captureJobSearchStarted(
  properties: JobSearchStartedProperties,
): void {
  capturePostHogEvent(POSTHOG_EVENT_NAMES.jobSearchStarted, properties);
}

export function captureJobFound(properties: JobFoundProperties): void {
  capturePostHogEvent(POSTHOG_EVENT_NAMES.jobFound, properties);
}

export function captureProfileCompleted(
  properties: ProfileCompletedProperties,
): void {
  capturePostHogEvent(POSTHOG_EVENT_NAMES.profileCompleted, properties);
}

export function captureCompanyResearched(
  properties: CompanyResearchedProperties,
): void {
  capturePostHogEvent(POSTHOG_EVENT_NAMES.companyResearched, properties);
}
