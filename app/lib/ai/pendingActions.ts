import { randomUUID } from "node:crypto";

import type { PaymentMethod } from "@/app/lib/maintenanceService";

/**
 * Application-level confirmation store for financial actions.
 *
 * The AI may *propose* a payment, but it can never execute one. The flow is:
 *
 *   1. The model calls `request_payment`, which only writes a short-lived
 *      "pending action" and asks the resident to confirm.
 *   2. The resident confirms.
 *   3. The route handler validates the confirmation and only then calls
 *      `recordMaintenancePayment`.
 *
 * Because the LLM has no tool that can move money, prompt injection or a
 * confused model cannot skip step 1 or 2.
 *
 * Note: this store is in-memory and per server process. That is the simplest
 * thing that works for a single-instance deployment; use Redis or the database
 * if the app is ever scaled to multiple instances.
 */

const ACTION_TTL_MS = 5 * 60 * 1000;

export type PendingActionType = "pay_maintenance";

export type PendingAction = {
  id: string;
  type: PendingActionType;
  /** Owner of the action. Only this user can confirm it. */
  userId: string;
  maintenanceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: number;
  expiresAt: number;
};

const pendingActions = new Map<string, PendingAction>();

function removeExpiredActions(now = Date.now()): void {
  for (const [id, action] of pendingActions) {
    if (action.expiresAt <= now) {
      pendingActions.delete(id);
    }
  }
}

export function createPendingPayment(input: {
  userId: string;
  maintenanceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}): PendingAction {
  const now = Date.now();

  removeExpiredActions(now);

  const action: PendingAction = {
    id: randomUUID(),
    type: "pay_maintenance",
    userId: input.userId,
    maintenanceId: input.maintenanceId,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    createdAt: now,
    expiresAt: now + ACTION_TTL_MS,
  };

  // A new request supersedes any earlier request from the same user.
  for (const [id, existing] of pendingActions) {
    if (existing.userId === input.userId) {
      pendingActions.delete(id);
    }
  }

  pendingActions.set(action.id, action);

  return action;
}

/**
 * Returns the pending action if it exists, is unexpired, belongs to `userId`
 * and is of the expected type. Returns `null` for every other case.
 */
export function getPendingAction(
  id: string,
  userId: string,
  type: PendingActionType
): PendingAction | null {
  removeExpiredActions();

  const action = pendingActions.get(id);

  if (!action) {
    return null;
  }

  if (action.userId !== userId || action.type !== type) {
    return null;
  }

  return action;
}

/** Removes an action after it has been executed (single use). */
export function consumePendingAction(id: string): void {
  pendingActions.delete(id);
}

/** The most recent still-pending action for a user, if any. */
export function findPendingActionForUser(
  userId: string
): PendingAction | null {
  removeExpiredActions();

  let latest: PendingAction | null = null;

  for (const action of pendingActions.values()) {
    if (action.userId !== userId) {
      continue;
    }

    if (!latest || action.createdAt > latest.createdAt) {
      latest = action;
    }
  }

  return latest;
}
