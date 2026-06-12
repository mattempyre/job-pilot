export const E2E_AUTH_COOKIE = "jobpilot_e2e_auth";
export const E2E_PROFILE_COOKIE = "jobpilot_e2e_profile";

export type E2EProfileScenario = "blank" | "ready" | "resume" | "populated";

export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type E2ESession = {
  isE2E: true;
  profileScenario: E2EProfileScenario;
  user: AuthenticatedUser;
};

const DEFAULT_E2E_USER_ID = "00000000-0000-4000-8000-000000000007";
const DEFAULT_E2E_EMAIL = "playwright@example.test";

export function isE2EAuthEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.JOB_PILOT_E2E_AUTH === "1"
  );
}

export function getE2EProfileScenario(
  value: string | undefined,
): E2EProfileScenario {
  if (value === "ready" || value === "resume" || value === "populated") {
    return value;
  }

  return "blank";
}

export function getE2ESessionFromCookieValues(
  authCookieValue: string | undefined,
  profileCookieValue: string | undefined,
): E2ESession | null {
  if (!isE2EAuthEnabled() || authCookieValue !== "1") {
    return null;
  }

  return {
    isE2E: true,
    profileScenario: getE2EProfileScenario(profileCookieValue),
    user: {
      id: process.env.JOB_PILOT_E2E_USER_ID || DEFAULT_E2E_USER_ID,
      email: process.env.JOB_PILOT_E2E_EMAIL || DEFAULT_E2E_EMAIL,
    },
  };
}
