import { updateSession } from "@insforge/sdk/ssr";
import type { CookieOptions, CookieStore } from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];
const authRoutes = ["/login", "/callback"];

function startsWithRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function copyResponseCookies(source: NextResponse, target: NextResponse): void {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
}

function createRequestCookieStore(request: NextRequest): CookieStore {
  return {
    get: (name: string) => request.cookies.get(name),
  };
}

function createResponseCookieStore(response: NextResponse): CookieStore {
  return {
    get: (name: string) => response.cookies.get(name),
    set: (
      nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
      value?: string,
      options?: CookieOptions,
    ) => {
      if (typeof nameOrOptions === "string") {
        response.cookies.set(nameOrOptions, value ?? "", options);
        return;
      }

      response.cookies.set(nameOrOptions);
    },
    delete: (nameOrOptions: string | ({ name: string } & CookieOptions)) => {
      response.cookies.delete(
        typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name,
      );
    },
  };
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next({ request });
  const session = await updateSession({
    requestCookies: createRequestCookieStore(request),
    responseCookies: createResponseCookieStore(response),
  });

  const hasSession = Boolean(session.accessToken);

  if (startsWithRoute(pathname, protectedRoutes) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyResponseCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (startsWithRoute(pathname, authRoutes) && hasSession) {
    const redirectResponse = NextResponse.redirect(
      new URL("/profile", request.url),
    );
    copyResponseCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/find-jobs/:path*",
    "/login",
    "/callback",
  ],
};
