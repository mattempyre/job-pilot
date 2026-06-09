import { NextRequest, NextResponse } from "next/server";

import {
  OAUTH_VERIFIER_COOKIE,
  oauthVerifierCookieOptions,
} from "@/lib/insforge-auth";
import {
  enforceRateLimit,
  forbiddenResponse,
  isSameOriginRequest,
  rateLimitResponse,
} from "@/lib/security";

const supportedProviders = new Set(["google", "github"]);
const AUTH_RATE_LIMIT = 20;
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

type OAuthStartRequestBody = {
  codeVerifier?: unknown;
  provider?: unknown;
};

function isOAuthStartRequestBody(value: unknown): value is OAuthStartRequestBody {
  return typeof value === "object" && value !== null;
}

function isValidCodeVerifier(value: unknown): value is string {
  return (
    typeof value === "string" && value.length >= 43 && value.length <= 128
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return forbiddenResponse();
    }

    const rateLimit = enforceRateLimit(
      request,
      "auth:oauth:start",
      AUTH_RATE_LIMIT,
      AUTH_RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body: unknown = await request.json();

    if (!isOAuthStartRequestBody(body)) {
      return NextResponse.json(
        { success: false, error: "Invalid OAuth payload" },
        { status: 400 },
      );
    }

    if (
      typeof body.provider !== "string" ||
      !supportedProviders.has(body.provider)
    ) {
      return NextResponse.json(
        { success: false, error: "Unsupported OAuth provider" },
        { status: 400 },
      );
    }

    if (!isValidCodeVerifier(body.codeVerifier)) {
      return NextResponse.json(
        { success: false, error: "Invalid OAuth verifier" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      OAUTH_VERIFIER_COOKIE,
      body.codeVerifier,
      oauthVerifierCookieOptions(10 * 60),
    );

    return response;
  } catch (error) {
    console.error("[auth/oauth/start]", error);
    return NextResponse.json(
      { success: false, error: "Failed to start OAuth" },
      { status: 500 },
    );
  }
}
