import { NextResponse, type NextRequest } from "next/server";

import { TOKEN_COOKIE, verifyAuthToken } from "./app/lib/auth";

/**
 * CORS headers attached to every /api/* response (including errors and OPTIONS
 * preflight). The Expo mobile app sends X-Client-Platform: mobile, so that
 * header must be explicitly allowed.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, X-Client-Platform, Authorization",
  "Access-Control-Max-Age": "86400",
};

function applyCors(response: NextResponse) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/**
 * Authentication boundary (Next.js 16 `proxy` convention).
 *
 * Responsibilities:
 *  - reject protected API routes without a valid JWT (401)
 *  - redirect signed-out users away from private pages to /login
 *  - keep already-authenticated users out of /login and /signup
 *  - attach CORS headers to every /api/* response
 *
 * Authorization (ownership checks, admin checks) is still enforced inside each
 * route handler, so this file is a fast first gate and not the only gate.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api/");

  // CORS preflight: answer OPTIONS immediately with 200 and no body.
  if (isApiRoute && request.method === "OPTIONS") {
    return applyCors(new NextResponse(null, { status: 200 }));
  }

  const user = verifyAuthToken(request.cookies.get(TOKEN_COOKIE)?.value);

  // A signed-in user has no reason to see the login or signup screen.
  if (pathname === "/login" || pathname === "/signup") {
    return user
      ? applyCors(NextResponse.redirect(new URL("/dashboard", request.url)))
      : applyCors(NextResponse.next());
  }

  if (!user) {
    // API consumers get JSON, browsers get a redirect to the login page.
    if (isApiRoute) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Authentication required." },
          { status: 401 }
        )
      );
    }

    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("next", pathname);

    return applyCors(NextResponse.redirect(loginUrl));
  }

  const response = NextResponse.next();
  return applyCors(response);
}

export const config = {
  // The matcher values must be literals: Next.js parses this statically at
  // build time, so it cannot reference a spread of other constants.
  matcher: [
    // All API routes — CORS headers must reach every /api/* response,
    // including public auth routes like login/signup.
    "/api/:path*",
    // Protected pages
    "/dashboard/:path*",
    "/maintenance/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/ai/:path*",
    // Public auth pages
    "/login",
    "/signup",
  ],
};