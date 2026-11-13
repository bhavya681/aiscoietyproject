import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { isValidObjectId } from "@/app/lib/auth";
import { requireSocietyAdmin } from "@/app/lib/society";
import Membership, { MEMBERSHIP_ROLES } from "@/app/models/Membership";

/**
 * Changes a member's role inside the active society.
 *
 * Ownership cannot be granted or revoked here, and an admin cannot promote or
 * demote another admin — only an owner can do that.
 */
export async function PUT(
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

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { role } = body as Record<string, unknown>;

    if (
      typeof role !== "string" ||
      !(MEMBERSHIP_ROLES as readonly string[]).includes(role)
    ) {
      return apiError(
        `Invalid role. Allowed values: ${MEMBERSHIP_ROLES.join(", ")}.`,
        400
      );
    }

    if (role === "owner") {
      return apiError("Ownership cannot be transferred here.", 400);
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
      return apiError("The society owner's role cannot be changed.", 400);
    }

    if (String(membership.userId) === context.auth.userId) {
      return apiError("You cannot change your own role.", 400);
    }

    if (
      context.membershipRole === "admin" &&
      (membership.role === "admin" || role === "admin")
    ) {
      return apiError("Only an owner can manage admin roles.", 403);
    }

    const updated = await Membership.findByIdAndUpdate(
      membership._id,
      { role },
      { new: true, runValidators: true }
    )
      .select("_id role")
      .lean();

    return apiSuccess({ membership: updated }, "Member role updated.", 200);
  } catch (error) {
    console.error("Update member role error:", error);

    return apiError("Internal server error.", 500);
  }
}