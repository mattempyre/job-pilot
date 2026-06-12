import { cookies } from "next/headers";

import { createInsforgeServer } from "@/lib/insforge-server";
import {
  E2E_AUTH_COOKIE,
  E2E_PROFILE_COOKIE,
  type AuthenticatedUser,
  type E2EProfileScenario,
  getE2ESessionFromCookieValues,
} from "@/lib/e2e-auth";

export type CurrentUserSession = {
  error: null;
  isE2E: true;
  profileScenario: E2EProfileScenario;
  user: AuthenticatedUser;
} | {
  error: unknown;
  isE2E: false;
  profileScenario: "blank";
  user: AuthenticatedUser | null;
};

export async function getCurrentUserSession(): Promise<CurrentUserSession> {
  const cookieStore = await cookies();
  const e2eSession = getE2ESessionFromCookieValues(
    cookieStore.get(E2E_AUTH_COOKIE)?.value,
    cookieStore.get(E2E_PROFILE_COOKIE)?.value,
  );

  if (e2eSession) {
    return {
      error: null,
      isE2E: true,
      profileScenario: e2eSession.profileScenario,
      user: e2eSession.user,
    };
  }

  const insforge = await createInsforgeServer();
  const {
    data: { user },
    error,
  } = await insforge.auth.getCurrentUser();

  return {
    error,
    isE2E: false,
    profileScenario: "blank",
    user: user
      ? {
          id: user.id,
          email: user.email ?? "",
        }
      : null,
  };
}
