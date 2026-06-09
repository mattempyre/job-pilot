import { createBrowserClient } from "@insforge/sdk/ssr";
import type { InsForgeClient } from "@insforge/sdk";

let browserClient: InsForgeClient | null = null;

export function hasInsforgePublicConfig(): boolean {
  return getInsforgePublicConfigError() === null;
}

export function getInsforgePublicConfigError(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    return "Auth is not configured for this environment.";
  }

  try {
    const parsedUrl = new URL(baseUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return "Auth is not configured with a valid InsForge URL.";
    }
  } catch {
    return "Auth is not configured with a valid InsForge URL.";
  }

  return null;
}

export function getInsforgeBrowserClient(): InsForgeClient {
  browserClient ??= createBrowserClient();
  return browserClient;
}
