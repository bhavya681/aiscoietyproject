import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

export const TOKEN_COOKIE = "token";

export type AuthRole = "admin" | "resident";

/**
 * The identity carried by a verified JWT.
 *
 * This is the ONLY source of truth for "who is asking". Route handlers must
 * never take a user id from the request body or query string.
 */
export type AuthUser = {
  userId: string;
  role: AuthRole;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // Never fall back to an empty/guessed secret.
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}

/** "7d" | "24h" | number (seconds). Defaults to 7 days. */
function getJwtExpiresIn(): jwt.SignOptions["expiresIn"] {
  const configured = process.env.JWT_EXPIRES_IN?.trim();

  if (!configured) {
    return "7d";
  }

  // A bare number is treated as seconds; anything else is passed through so
  // jsonwebtoken can validate the format ("7d", "12h", ...).
  if (/^\d+$/.test(configured)) {
    return Number(configured);
  }

  return configured as jwt.SignOptions["expiresIn"];
}

export function signAuthToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.userId, role: user.role },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );
}

/**
 * Verifies a raw JWT and returns its payload.
 *
 * @returns the decoded identity, or `null` when the token is missing,
 * malformed, expired or signed with a different secret.
 */
export function verifyAuthToken(token: string | undefined): AuthUser | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return null;
    }

    return {
      userId: decoded.userId,
      role: decoded.role as AuthRole,
    };
  } catch {
    return null;
  }
}

/**
 * Resolves the authenticated user for an incoming request by verifying the
 * httpOnly cookie. Returns `null` for missing or invalid tokens.
 */
export function getAuthenticatedUser(request: NextRequest): AuthUser | null {
  return verifyAuthToken(request.cookies.get(TOKEN_COOKIE)?.value);
}

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
