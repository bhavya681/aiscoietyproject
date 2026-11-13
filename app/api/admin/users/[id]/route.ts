import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { isValidObjectId } from "@/app/lib/auth";
import { requireSocietyAdmin } from "@/app/lib/society";
import Membership from "@/app/models/Membership";

/**
 * Removes a resident from the active society.
 *
 * Their maintenance, payment and invoice rows are kept: history belongs to the
 * account and must survive a membership change. Only the membership is removed,
 * which revokes access to this society.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return apiError("Invalid resident id.", 400);
    }

    const membership = await Membership.findOne({
      userId: id,
      societyId: context.societyId,
    })
      .select("_id role userId")
      .lean();

    if (!membership) {
      return apiError("Member not found in this society.", 404);
    }

    if (membership.role === "owner") {
      return apiError("The society owner cannot be removed.", 400);
    }

    if (String(membership.userId) === context.auth.userId) {
      return apiError("You cannot remove yourself from the society.", 400);
    }

    await Membership.deleteOne({ _id: membership._id });

    return apiSuccess({}, "Member removed from the society.", 200);
  } catch (error) {
    console.error("Admin delete member error:", error);

    return apiError("Internal server error.", 500);
  }
}