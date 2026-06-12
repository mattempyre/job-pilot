import { clearAuthCookies } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";

import { E2E_AUTH_COOKIE, E2E_PROFILE_COOKIE } from "@/lib/e2e-auth";
import {
  enforceRateLimit,
  forbiddenResponse,
  isSameOriginRequest,
  rateLimitResponse,
} from "@/lib/security";

const AUTH_RATE_LIMIT = 30;
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return forbiddenResponse();
    }

    const rateLimit = enforceRateLimit(
      request,
      "auth:logout",
      AUTH_RATE_LIMIT,
      AUTH_RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const response = NextResponse.json({ success: true });
    clearAuthCookies(response.cookies);
    response.cookies.set(E2E_AUTH_COOKIE, "", { maxAge: 0, path: "/" });
    response.cookies.set(E2E_PROFILE_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    console.error("[auth/logout]", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 },
    );
  }
}
