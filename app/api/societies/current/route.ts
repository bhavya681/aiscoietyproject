import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { canManageSociety, getSocietyContext } from "@/app/lib/society";

/** Returns the signed-in user's active society and their role in it. */
export async function GET(request: NextRequest) {
  try {
    const result = await getSocietyContext(request);

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    const { context } = result;

    return apiSuccess(
      {
        society: {
          _id: context.society._id,
          name: context.society.name,
          slug: context.society.slug,
          inviteCode: context.society.inviteCode,
          address: context.society.address,
          monthlyMaintenance: context.society.monthlyMaintenance,
          role: context.membershipRole,
          flat: context.membership.flat,
        },
        canManage: canManageSociety(context.membershipRole),
      },
      "Active society fetched.",
      200
    );
  } catch (error) {
    console.error("Current society error:", error);

    return apiError("Internal server error.", 500);
  }
}