import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { name, email, password, phone, address } = body as Record<
      string,
      unknown
    >;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !phone.trim() ||
      !address.trim()
    ) {
      return apiError("All fields are required.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return apiError("Enter a valid email address.", 400);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return apiError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        400
      );
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return apiError("User already exists. Please log in.", 409);
    }

    // `role` is intentionally NOT taken from the request body. Allowing the
    // client to pick its own role would be a privilege escalation hole.
    // Admins are created by a bootstrap script or promoted by an existing admin.
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      address: address.trim(),
      role: "resident",
    });

    return apiSuccess(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
      },
      "Account created successfully. Please log in.",
      201
    );
  } catch (error) {
    console.error("Signup error:", error);

    return apiError("Internal server error.", 500);
  }
}
