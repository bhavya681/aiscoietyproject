import type { NextRequest } from "next/server";

import { POST as chat } from "./chat/route";

/**
 * Alias kept for backwards compatibility: `/api/ai` and `/api/ai/chat` are the
 * same endpoint. `POST /api/ai/chat` is the documented one.
 */
export async function POST(request: NextRequest) {
  return chat(request);
}
