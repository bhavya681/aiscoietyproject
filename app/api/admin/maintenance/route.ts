import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { isValidObjectId } from "@/app/lib/auth";
import { requireSocietyAdmin } from "@/app/lib/society";
import Maintenance from "@/app/models/Maintenance";
import Membership from "@/app/models/Membership";

/**
 * Raises a maintenance charge for a member of the active society.
 *
 * The target resident must already be a member of that society; an admin cannot
 * bill somebody who belongs to a different society.
 */
export async function POST(request: NextRequest) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { userId, amount, dueDate } = body as Record<string, unknown>;

    if (typeof userId !== "string" || !userId) {
      return apiError("userId is required.", 400);
    }

    if (!isValidObjectId(userId)) {
      return apiError("Invalid resident id.", 400);
    }

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return apiError("Amount must be a number greater than zero.", 400);
    }

    if (typeof dueDate !== "string" || Number.isNaN(Date.parse(dueDate))) {
      return apiError("A valid dueDate is required.", 400);
    }

    const membership = await Membership.findOne({
      userId,
      societyId: context.societyId,
    }).select("_id");

    if (!membership) {
      return apiError(
        "That resident is not a member of this society.",
        404
      );
    }

    const normalizedDueDate = new Date(dueDate);

    const existing = await Maintenance.findOne({
      userId,
      societyId: context.societyId,
      dueDate: normalizedDueDate,
    }).lean();

    if (existing) {
      return apiError("Maintenance already exists for this due date.", 409);
    }

    const maintenance = await Maintenance.create({
      userId,
      societyId: context.societyId,
      // A newly raised bill starts fully outstanding.
      monthlyAmount: amount,
      pendingAmount: amount,
      dueDate: normalizedDueDate,
      status: "pending",
    });

    return apiSuccess(
      { maintenance },
      "Maintenance created successfully.",
      201
    );
  } catch (error) {
    console.error("Create maintenance error:", error);

    return apiError("Internal server error.", 500);
  }
}

/** All maintenance for the active society (admins only). */
export async function GET(request: NextRequest) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;

    const maintenance = await Maintenance.find({
      societyId: context.societyId,
    })
      .populate("userId", "name email")
      .sort({ dueDate: -1 })
      .lean();

    return apiSuccess({ maintenance }, "All maintenance fetched.", 200);
  } catch (error) {
    console.error("Get all maintenance error:", error);

    return apiError("Internal server error.", 500);
  }
}