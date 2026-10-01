import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

import { apiError } from "@/app/lib/apiResponse";
import { signAuthToken, TOKEN_COOKIE } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { email, password } = body as Record<string, unknown>;

    if (typeof email !== "string" || typeof password !== "string") {
      return apiError("Email and password are required.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    // Same message for "no such user" and "wrong password" so the endpoint
    // cannot be used to enumerate registered email addresses.
    if (!user) {
      return apiError("Invalid email or password.", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return apiError("Invalid email or password.", 401);
    }

    const token = signAuthToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Successfully logged in.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return apiError("Internal server error.", 500);
  }
}
