import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";
import User from "@/app/models/User";

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

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

    await connectDB();

    const resident = await User.findById(userId).select("-password").lean();

    if (!resident) {
      return apiError("Resident not found.", 404);
    }

    const normalizedDueDate = new Date(dueDate);

    const existing = await Maintenance.findOne({
      userId,
      dueDate: normalizedDueDate,
    }).lean();

    if (existing) {
      return apiError("Maintenance already exists for this due date.", 409);
    }

    const maintenance = await Maintenance.create({
      userId,
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

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();

    const maintenance = await Maintenance.find()
      .populate("userId", "name email flat address")
      .sort({ dueDate: -1 })
      .lean();

    return apiSuccess({ maintenance }, "All maintenance fetched.");
  } catch (error) {
    console.error("Get all maintenance error:", error);

    return apiError("Internal server error.", 500);
  }
}
