import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { requireSocietyAdmin } from "@/app/lib/society";
import Membership from "@/app/models/Membership";

type PopulatedMembership = {
  _id: unknown;
  role: "owner" | "admin" | "resident";
  flat?: string;
  createdAt?: unknown;
  userId:
    | {
        _id: unknown;
        name: string;
        email: string;
        phone?: string;
        address?: string;
      }
    | null;
};

/**
 * Members of the caller's active society.
 *
 * This is the admin user list: it is deliberately scoped to one society so an
 * admin of society A can never see or manage society B's residents.
 */
export async function GET(request: NextRequest) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;

    const memberships = (await Membership.find({
      societyId: context.societyId,
    })
      .populate("userId", "name email phone address")
      .sort({ createdAt: 1 })
      .lean()) as unknown as PopulatedMembership[];

    const members = memberships.flatMap((membership) => {
      const account = membership.userId;

      if (!account) {
        return [];
      }

      return [
        {
          _id: String(account._id),
          name: account.name,
          email: account.email,
          phone: account.phone ?? "",
          address: account.address ?? "",
          flat: membership.flat ?? "",
          role: membership.role,
          joinedAt:
            membership.createdAt instanceof Date
              ? membership.createdAt.toISOString()
              : typeof membership.createdAt === "string"
                ? membership.createdAt
                : undefined,
        },
      ];
    });

    return apiSuccess(
      {
        members,
        inviteCode: context.society.inviteCode,
      },
      "Members fetched.",
      200
    );
  } catch (error) {
    console.error("Admin members error:", error);

    return apiError("Internal server error.", 500);
  }
}