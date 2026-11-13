import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { connectDB } from "@/app/lib/mongodb";
import { uniqueInviteCode, uniqueSocietySlug } from "@/app/lib/society";
import Membership from "@/app/models/Membership";
import Society from "@/app/models/Society";
import User from "@/app/models/User";

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 80;
const MAX_SOCIETY_NAME_LENGTH = 80;

type SocietyMode = "create" | "join";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const {
      name,
      email,
      password,
      phone,
      address,
      societyMode,
      societyName,
      inviteCode,
    } = body as Record<string, unknown>;

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

    if (name.trim().length > MAX_NAME_LENGTH) {
      return apiError(
        `Name must be at most ${MAX_NAME_LENGTH} characters.`,
        400
      );
    }

    // Society selection is optional for backwards compatibility, but the
    // signup form always sends one of the two modes.
    let mode: SocietyMode | null = null;

    if (societyMode === "create" || societyMode === "join") {
      mode = societyMode;
    } else if (societyMode !== undefined && societyMode !== null) {
      return apiError("Invalid society option.", 400);
    }

    if (mode === "create") {
      if (typeof societyName !== "string" || !societyName.trim()) {
        return apiError("A society name is required.", 400);
      }

      if (societyName.trim().length > MAX_SOCIETY_NAME_LENGTH) {
        return apiError(
          `Society name must be at most ${MAX_SOCIETY_NAME_LENGTH} characters.`,
          400
        );
      }
    }

    const societyNameValue =
      typeof societyName === "string" ? societyName.trim() : "";

    let normalizedInviteCode: string | null = null;

    if (mode === "join") {
      if (typeof inviteCode !== "string" || !inviteCode.trim()) {
        return apiError("An invite code is required to join a society.", 400);
      }

      normalizedInviteCode = inviteCode.trim().toUpperCase();

      const society = await Society.findOne({
        inviteCode: normalizedInviteCode,
      }).select("_id");

      if (!society) {
        return apiError("No society matches that invite code.", 404);
      }
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return apiError("User already exists. Please log in.", 409);
    }

    // `role` is intentionally NOT taken from the request body. Allowing the
    // client to pick its own role would be a privilege escalation hole.
    // Society permissions live on the Membership row, not on the account.
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      address: address.trim(),
      role: "resident",
    });

    let societyNameOut: string | null = null;
    let roleOut: "owner" | "resident" = "resident";
    let activeSocietyId: string | null = null;

    if (mode === "create") {
      const slug = await uniqueSocietySlug(societyNameValue);
      const code = await uniqueInviteCode();

      const society = await Society.create({
        name: societyNameValue,
        slug,
        inviteCode: code,
        address: address.trim(),
        createdBy: user._id,
      });

      await Membership.create({
        userId: user._id,
        societyId: society._id,
        role: "owner",
        status: "active",
      });

      user.activeSocietyId = society._id;
      await user.save();

      societyNameOut = society.name;
      roleOut = "owner";
      activeSocietyId = society._id.toString();
    } else if (mode === "join") {
      const society = await Society.findOne({
        inviteCode: normalizedInviteCode,
      });

      if (!society) {
        return apiError("No society matches that invite code.", 404);
      }

      await Membership.create({
        userId: user._id,
        societyId: society._id,
        role: "resident",
        status: "active",
      });

      user.activeSocietyId = society._id;
      await user.save();

      societyNameOut = society.name;
      roleOut = "resident";
      activeSocietyId = society._id.toString();
    }

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
        society:
          societyNameOut && activeSocietyId
            ? { name: societyNameOut, role: roleOut }
            : null,
      },
      "Account created successfully. Please log in.",
      201
    );
  } catch (error) {
    console.error("Signup error:", error);

    return apiError("Internal server error.", 500);
  }
}