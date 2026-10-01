import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Invoice from "@/app/models/Invoice";
import Maintenance from "@/app/models/Maintenance";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return apiError("Invalid maintenance id.", 400);
    }

    await connectDB();

    // Residents may only read their own records; admins may read any record.
    const ownerFilter =
      user.role === "admin" ? { _id: id } : { _id: id, userId: user.userId };

    const maintenance = await Maintenance.findOne(ownerFilter).lean();

    if (!maintenance) {
      return apiError("Invoice not found.", 404);
    }

    // The formal invoice document is optional: many maintenance rows are
    // created before the society issues the invoice for that cycle.
    const invoice = await Invoice.findOne({
      maintenanceId: maintenance._id,
      ...(user.role === "admin" ? {} : { userId: user.userId }),
    }).lean();

    return apiSuccess({ invoice, maintenance }, "Invoice fetched.");
  } catch (error) {
    console.error("Invoice error:", error);

    return apiError("Internal server error.", 500);
  }
}
