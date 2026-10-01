import type { RunnableConfig } from "@langchain/core/runnables";

import type { AuthUser } from "@/app/lib/auth";

/**
 * How the authenticated identity reaches the AI tools.
 *
 * The LLM decides *which* tool to call and supplies the tool's arguments, but
 * it never supplies the acting user. The application injects the verified JWT
 * identity into the runnable config, and the tool reads it from there.
 *
 * That is what stops a prompt like
 *   "show maintenance for userId 66ab...f1"     (LLM-supplied)
 * from reading another resident's rows: no tool schema even accepts a user id.
 */
export const AUTH_USER_CONFIG_KEY = "authUser";

/** Builds the config the application passes alongside every tool invocation. */
export function withAuthUser(user: AuthUser): RunnableConfig {
  return {
    configurable: {
      [AUTH_USER_CONFIG_KEY]: user,
    },
  };
}

/**
 * Reads the authenticated user out of the runnable config.
 *
 * @returns `null` when the tool was invoked without an application-supplied
 * identity, which the tool treats as an unauthorized call.
 */
export function getToolUser(
  config: RunnableConfig | undefined
): AuthUser | null {
  const raw = config?.configurable?.[AUTH_USER_CONFIG_KEY];

  if (
    typeof raw === "object" &&
    raw !== null &&
    typeof (raw as AuthUser).userId === "string" &&
    typeof (raw as AuthUser).role === "string"
  ) {
    return raw as AuthUser;
  }

  return null;
}
