import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { isValidObjectId } from "@/app/lib/auth";
import { requireSocietyAdmin } from "@/app/lib/society";
import Membership, { MEMBERSHIP_ROLES } from "@/app/models/Membership";
import type { MembershipRole } from "@/app/lib/types";

type MembershipRow = {
  _id: unknown;
  userId: unknown;
  role: MembershipRole;
  flat?: string;
};

/**
 * Updates a member's society role or flat number.
 *
 * Ownership is never changed here: the owner is fixed so a society can never be
 * accidentally (or maliciously) left without an owner.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;
    const { userId } = await params;

    if (!isValidObjectId(userId)) {
      return apiError("Invalid member id.", 400);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { role, flat } = body as Record<string, unknown>;

    if (
      role !== undefined &&
      (typeof role !== "string" ||
        !(MEMBERSHIP_ROLES as readonly string[]).includes(role))
    ) {
      return apiError(
        `Invalid role. Allowed values: ${MEMBERSHIP_ROLES.join(", ")}.`,
        400
      );
    }

    if (role === "owner") {
      return apiError("Ownership cannot be transferred here.", 400);
    }

    const membership = (await Membership.findOne({
      userId,
      societyId: context.societyId,
    })
      .select("_id userId role flat")
      .lean()) as unknown as MembershipRow | null;

    if (!membership) {
      return apiError("Member not found in this society.", 404);
    }

    if (membership.role === "owner") {
      return apiError("The society owner's role cannot be changed.", 400);
    }

    // Only an owner may manage admin roles; a plain admin can only manage
    // residents.
    if (
      context.membershipRole === "admin" &&
      (membership.role === "admin" || role === "admin")
    ) {
      return apiError("Only an owner can manage admin roles.", 403);
    }

    const update: { role?: MembershipRole; flat?: string } = {};

    if (typeof role === "string") {
      update.role = role as MembershipRole;
    }

    if (typeof flat === "string") {
      update.flat = flat.trim();
    }

    if (Object.keys(update).length === 0) {
      return apiError("At least one valid field is required.", 400);
    }

    const updated = (await Membership.findByIdAndUpdate(
      membership._id,
      update,
      { new: true, runValidators: true }
    )
      .select("_id userId role flat")
      .lean()) as unknown as MembershipRow | null;

    return apiSuccess({ membership: updated }, "Member updated.", 200);
  } catch (error) {
    console.error("Update member error:", error);

    return apiError("Internal server error.", 500);
  }
}

/** Removes a member from the active society. Their data is left untouched. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;
    const { userId } = await params;

    if (!isValidObjectId(userId)) {
      return apiError("Invalid member id.", 400);
    }

    const membership = (await Membership.findOne({
      userId,
      societyId: context.societyId,
    })
      .select("_id userId role")
      .lean()) as unknown as MembershipRow | null;

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

    return apiSuccess({}, "Member removed.", 200);
  } catch (error) {
    console.error("Remove member error:", error);

    return apiError("Internal server error.", 500);
  }
}