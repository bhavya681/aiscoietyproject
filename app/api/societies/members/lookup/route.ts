import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { requireSocietyAdmin } from "@/app/lib/society";
import Membership from "@/app/models/Membership";
import User from "@/app/models/User";

/**
 * Looks up an existing account by email so an admin can add them.
 *
 * Returns `user: null` (HTTP 200) when nobody matches, which lets the UI show
 * a friendly "ask them to sign up first" message instead of an error toast.
 */
export async function GET(request: NextRequest) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;

    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return apiError("An email query parameter is required.", 400);
    }

    const account = await User.findOne({ email })
      .select("_id name email phone address")
      .lean();

    if (!account) {
      return apiSuccess({ user: null }, "No account found.", 200);
    }

    const membership = await Membership.findOne({
      userId: account._id,
      societyId: context.societyId,
    }).select("_id");

    return apiSuccess(
      {
        user: {
          _id: String(account._id),
          name: account.name,
          email: account.email,
          phone: account.phone ?? "",
          address: account.address ?? "",
          alreadyMember: Boolean(membership),
        },
      },
      "Account found.",
      200
    );
  } catch (error) {
    console.error("Lookup member error:", error);

    return apiError("Internal server error.", 500);
  }
}