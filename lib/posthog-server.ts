import { PostHog } from "posthog-node";

import {
  POSTHOG_EVENT_NAMES,
  type CompanyResearchedProperties,
  type JobFoundProperties,
  type JobSearchStartedProperties,
  type PostHogEventName,
  type PostHogEventProperties,
  type ProfileCompletedProperties,
} from "@/lib/posthog-events";

type PostHogConfig = {
  key: string;
  host: string;
};

function getPostHogConfig(): PostHogConfig | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    console.warn("[posthog/server] Missing PostHog environment variables.");
    return null;
  }

  return { key, host };
}

export function createPostHogServer(): PostHog | null {
  const config = getPostHogConfig();

  if (!config) {
    return null;
  }

  return new PostHog(config.key, {
    host: config.host,
    flushAt: 1,
    flushInterval: 0,
  });
}

async function withPostHogServer(
  callback: (posthog: PostHog) => void,
): Promise<void> {
  const posthog = createPostHogServer();

  if (!posthog) {
    return;
  }

  try {
    callback(posthog);
  } catch (error) {
    console.error("[posthog/server]", error);
  } finally {
    try {
      await posthog.shutdown();
    } catch (error) {
      console.error("[posthog/server]", error);
    }
  }
}

export async function identifyPostHogServerUser(
  userId: string,
): Promise<void> {
  if (!userId) {
    return;
  }

  await withPostHogServer((posthog) => {
    posthog.identify({
      distinctId: userId,
      properties: { userId },
    });
  });
}

async function capturePostHogServerEvent(
  distinctId: string,
  event: PostHogEventName,
  properties: PostHogEventProperties,
): Promise<void> {
  if (!distinctId) {
    return;
  }

  await withPostHogServer((posthog) => {
    posthog.capture({
      distinctId,
      event,
      properties,
    });
  });
}

export async function captureJobSearchStartedEvent(
  properties: JobSearchStartedProperties,
): Promise<void> {
  await capturePostHogServerEvent(
    properties.userId,
    POSTHOG_EVENT_NAMES.jobSearchStarted,
    properties,
  );
}

export async function captureJobFoundEvent(
  properties: JobFoundProperties,
): Promise<void> {
  await capturePostHogServerEvent(
    properties.userId,
    POSTHOG_EVENT_NAMES.jobFound,
    properties,
  );
}

export async function captureProfileCompletedEvent(
  properties: ProfileCompletedProperties,
): Promise<void> {
  await capturePostHogServerEvent(
    properties.userId,
    POSTHOG_EVENT_NAMES.profileCompleted,
    properties,
  );
}

export async function captureCompanyResearchedEvent(
  properties: CompanyResearchedProperties,
): Promise<void> {
  await capturePostHogServerEvent(
    properties.userId,
    POSTHOG_EVENT_NAMES.companyResearched,
    properties,
  );
}
