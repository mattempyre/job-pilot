export const OAUTH_VERIFIER_COOKIE = "jobpilot_oauth_verifier";

export function oauthVerifierCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
