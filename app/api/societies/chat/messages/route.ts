import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getSocietyContext } from "@/app/lib/society";
import { connectDB } from "@/app/lib/mongodb";
import Message from "@/app/models/Message";
import Membership from "@/app/models/Membership";
import { MESSAGE_MAX_LENGTH } from "@/app/models/Message";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

type MessageRow = {
  _id: unknown;
  text: string;
  senderRole: "owner" | "admin" | "resident";
  createdAt: unknown;
  senderId:
    | { _id: unknown; name: string; email?: string }
    | null;
};

function serialize(message: MessageRow) {
  return {
    _id: String(message._id),
    text: message.text,
    sender: {
      _id: String(message.senderId?._id ?? message.senderId),
      name: message.senderId?.name ?? "Unknown member",
      role: message.senderRole,
    },
    createdAt:
      message.createdAt instanceof Date
        ? message.createdAt.toISOString()
        : String(message.createdAt),
  };
}

/**
 * Returns messages from the active society's group chat.
 *
 * With `?since=<iso>` it returns only messages newer than that timestamp
 * (used for polling). Otherwise it returns the most recent page.
 */
export async function GET(request: NextRequest) {
  try {
    const result = await getSocietyContext(request);

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    const { context } = result;

    await connectDB();

    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = Math.min(
      Math.max(Number(limitParam) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    const sinceRaw = request.nextUrl.searchParams.get("since");
    let since: Date | null = null;

    if (sinceRaw) {
      const parsed = new Date(sinceRaw);
      if (!Number.isNaN(parsed.getTime())) {
        since = parsed;
      }
    }

    let rows: MessageRow[];

    if (since) {
      rows = (await Message.find({
        societyId: context.societyId,
        createdAt: { $gt: since },
      })
        .populate("senderId", "name email")
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean()) as unknown as MessageRow[];
    } else {
      const recent = (await Message.find({ societyId: context.societyId })
        .populate("senderId", "name email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()) as unknown as MessageRow[];

      rows = recent.reverse();
    }

    return apiSuccess(
      { messages: rows.map(serialize) },
      "Messages fetched.",
      200
    );
  } catch (error) {
    console.error("Get chat messages error:", error);

    return apiError("Internal server error.", 500);
  }
}

/**
 * Posts a new message to the active society's group chat.
 *
 * Only members of the active society may post. The sender's role is snapshotted
 * at send time.
 */
export async function POST(request: NextRequest) {
  try {
    const result = await getSocietyContext(request);

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    const { context } = result;

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { text } = body as Record<string, unknown>;

    if (typeof text !== "string" || !text.trim()) {
      return apiError("A message is required.", 400);
    }

    if (text.trim().length > MESSAGE_MAX_LENGTH) {
      return apiError(
        `Message must be at most ${MESSAGE_MAX_LENGTH} characters.`,
        400
      );
    }

    await connectDB();

    // Verify (again) that the caller is an active member of this society.
    const membership = await Membership.findOne({
      userId: context.auth.userId,
      societyId: context.societyId,
    })
      .select("role")
      .lean();

    if (!membership) {
      return apiError("You are not a member of this society.", 403);
    }

    const created = await Message.create({
      societyId: context.societyId,
      senderId: context.auth.userId,
      senderRole: membership.role,
      text: text.trim(),
    });

    const populated = (await Message.findById(created._id)
      .populate("senderId", "name email")
      .lean()) as unknown as MessageRow | null;

    if (!populated) {
      return apiError("Could not read the created message.", 500);
    }

    return apiSuccess(
      { message: serialize(populated) },
      "Message sent.",
      201
    );
  } catch (error) {
    console.error("Post chat message error:", error);

    return apiError("Internal server error.", 500);
  }
}