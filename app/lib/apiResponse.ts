import { NextResponse } from "next/server";

/**
 * Consistent success envelope for every API route.
 */
export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  message: string,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      ...data,
    },
    { status }
  );
}

/**
 * Consistent failure envelope. Only human-readable messages are returned;
 * raw database / stack details stay in the server logs.
 */
export function apiError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

/**
 * Turns an unknown thrown value into a safe client message while keeping the
 * real error in the server log.
 */
export function apiFailure(error: unknown, context: string, status = 500) {
  console.error(`${context}:`, error);

  return apiError(
    status === 500 ? "Internal server error." : "Something went wrong.",
    status
  );
}
