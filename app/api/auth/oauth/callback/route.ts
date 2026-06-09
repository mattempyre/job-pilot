import { setAuthCookies } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";

import {
  OAUTH_VERIFIER_COOKIE,
  oauthVerifierCookieOptions,
} from "@/lib/insforge-auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import { identifyPostHogServerUser } from "@/lib/posthog-server";
import {
  enforceRateLimit,
  forbiddenResponse,
  isSameOriginRequest,
  rateLimitResponse,
} from "@/lib/security";

const AUTH_RATE_LIMIT = 20;
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

type OAuthCallbackRequestBody = {
  code?: unknown;
};

function isOAuthCallbackRequestBody(
  value: unknown,
): value is OAuthCallbackRequestBody {
  return typeof value === "object" && value !== null;
}

function clearVerifierCookie(response: NextResponse): void {
  response.cookies.set(OAUTH_VERIFIER_COOKIE, "", {
    ...oauthVerifierCookieOptions(0),
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return forbiddenResponse();
    }

    const rateLimit = enforceRateLimit(
      request,
      "auth:oauth:callback",
      AUTH_RATE_LIMIT,
      AUTH_RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body: unknown = await request.json();

    if (!isOAuthCallbackRequestBody(body) || typeof body.code !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid OAuth callback payload" },
        { status: 400 },
      );
    }

    const codeVerifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;

    if (!codeVerifier) {
      return NextResponse.json(
        { success: false, error: "OAuth session expired" },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.auth.exchangeOAuthCode(
      body.code,
      codeVerifier,
    );

    if (error || !data?.accessToken || !data.user) {
      return NextResponse.json(
        { success: false, error: "OAuth exchange failed" },
        { status: 401 },
      );
    }

    await identifyPostHogServerUser(data.user.id);

    const response = NextResponse.json({
      success: true,
      data: { userId: data.user.id },
    });

    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    clearVerifierCookie(response);

    return response;
  } catch (error) {
    console.error("[auth/oauth/callback]", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete OAuth" },
      { status: 500 },
    );
  }
}
