"use client";

/**
 * Thin fetch wrapper for the app's own API.
 *
 * Authentication is an httpOnly cookie, so there is no token to attach and
 * nothing sensitive in the browser. We only need to make sure the cookie is
 * sent and that errors surface as readable messages.
 */

const API_BASE_URL = "/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // A non-JSON body means an unexpected server/proxy error.
  }

  const payload = (data ?? {}) as {
    message?: string;
    success?: boolean;
  };

  if (!response.ok) {
    throw new ApiError(
      payload.message || "Something went wrong. Please try again.",
      response.status
    );
  }

  return data as T;
}
