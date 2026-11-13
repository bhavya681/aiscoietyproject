import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { isValidObjectId } from "@/app/lib/auth";
import { canManageSociety, getSocietyContext } from "@/app/lib/society";
import { connectDB } from "@/app/lib/mongodb";
import Invoice from "@/app/models/Invoice";
import Maintenance from "@/app/models/Maintenance";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const societyResult = await getSocietyContext(request);

    if (!societyResult.ok) {
      return apiError(societyResult.message, societyResult.status);
    }

    const { context } = societyResult;
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return apiError("Invalid maintenance id.", 400);
    }

    await connectDB();

    // Residents may only read their own records inside their active society;
    // society admins may read any record in that society.
    const ownerFilter: Record<string, unknown> = canManageSociety(
      context.membershipRole
    )
      ? { _id: id, societyId: context.societyId }
      : { _id: id, userId: context.auth.userId, societyId: context.societyId };

    const maintenance = await Maintenance.findOne(ownerFilter).lean();

    if (!maintenance) {
      return apiError("Invoice not found.", 404);
    }

    // The formal invoice document is optional: many maintenance rows are
    // created before the society issues the invoice for that cycle.
    const invoice = await Invoice.findOne({
      maintenanceId: maintenance._id,
      ...(canManageSociety(context.membershipRole)
        ? {}
        : { userId: context.auth.userId }),
    }).lean();

    return apiSuccess({ invoice, maintenance }, "Invoice fetched.", 200);
  } catch (error) {
    console.error("Invoice error:", error);

    return apiError("Internal server error.", 500);
  }
}