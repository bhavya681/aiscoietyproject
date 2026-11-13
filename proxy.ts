import { NextResponse, type NextRequest } from "next/server";

import { getRequestToken, verifyAuthToken } from "./app/lib/auth";

/**
 * Authentication boundary (Next.js 16 `proxy` convention).
 *
 * Responsibilities:
 *  - let CORS preflight requests through without requiring a session
 *  - reject protected API routes without a valid JWT (401)
 *  - redirect signed-out users away from private pages to /login
 *  - keep already-authenticated users out of /login and /signup
 *
 * Authorization (ownership checks, admin checks) is still enforced inside each
 * route handler, so this file is a fast first gate and not the only gate.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Preflight requests never carry credentials. Route handlers answer them
  // with 204; the CORS headers themselves come from next.config.ts.
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const user = verifyAuthToken(getRequestToken(request));

  // A signed-in user has no reason to see the login or signup screen.
  if (pathname === "/login" || pathname === "/signup") {
    return user
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  }

  if (!user) {
    // API consumers get JSON, browsers get a redirect to the login page.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // The matcher values must be literals: Next.js parses this statically at
  // build time, so it cannot reference a spread of other constants.
  matcher: [
    // Protected API routes
    "/api/users/profile",
    "/api/users/update",
    "/api/users/delete",
    "/api/users/reset-password",
    "/api/societies",
    "/api/societies/:path*",
    "/api/maintenance/:path*",
    "/api/ai/:path*",
    "/api/admin/:path*",
    // Protected pages
    "/dashboard/:path*",
    "/maintenance/:path*",
    "/profile/:path*",
    "/societies",
    "/societies/:path*",
    "/admin/:path*",
    "/ai/:path*",
    // Public auth pages
    "/login",
    "/signup",
  ],
};
