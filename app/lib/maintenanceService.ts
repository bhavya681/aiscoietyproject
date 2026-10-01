import { randomUUID } from "node:crypto";

import type { AuthRole } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Invoice from "@/app/models/Invoice";
import Maintenance from "@/app/models/Maintenance";
import Payment from "@/app/models/Payment";

export const PAYMENT_METHODS = [
  "upi",
  "bank_transfer",
  "cash",
  "other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

export type RecordPaymentResult =
  | {
      ok: true;
      amount: number;
      transactionId: string;
      maintenanceId: string;
    }
  | {
      ok: false;
      status: 400 | 403 | 404 | 409;
      message: string;
    };

/**
 * Marks a maintenance record as paid and writes the matching Payment row.
 *
 * This is the single place where money is recorded. It is called by the
 * REST endpoint and by the AI assistant, and in both cases the caller has
 * already satisfied the confirmation + authorization checks — this function
 * only enforces data integrity (ownership, amount, status transitions).
 */
export async function recordMaintenancePayment(options: {
  maintenanceId: string;
  /** The user requesting the payment. */
  requesterId: string;
  requesterRole: AuthRole;
  paymentMethod: PaymentMethod;
}): Promise<RecordPaymentResult> {
  const { maintenanceId, requesterId, requesterRole, paymentMethod } = options;

  await connectDB();

  // Residents may only pay their own maintenance; admins may pay on behalf.
  const ownerFilter =
    requesterRole === "admin"
      ? { _id: maintenanceId }
      : { _id: maintenanceId, userId: requesterId };

  const maintenance = await Maintenance.findOne(ownerFilter);

  if (!maintenance) {
    // Deliberately a 404: a resident probing someone else's id must not be
    // able to distinguish "exists but not yours" from "does not exist".
    return {
      ok: false,
      status: 404,
      message: "Maintenance record not found.",
    };
  }

  if (maintenance.status === "paid") {
    return {
      ok: false,
      status: 409,
      message: "This maintenance has already been paid.",
    };
  }

  const amount = maintenance.pendingAmount;

  if (amount <= 0) {
    return {
      ok: false,
      status: 409,
      message: "There is nothing left to pay on this record.",
    };
  }

  const transactionId = `TXN${Date.now()}-${randomUUID().slice(0, 8)}`;

  const payment = await Payment.create({
    userId: maintenance.userId,
    maintenanceId: maintenance._id,
    amount,
    paymentMethod,
    status: "success",
    transactionId,
  });

  maintenance.status = "paid";
  maintenance.pendingAmount = 0;
  maintenance.paidAt = new Date();
  maintenance.paymentMethod = paymentMethod;

  await maintenance.save();

  await Invoice.updateMany(
    { maintenanceId: maintenance._id, status: { $ne: "paid" } },
    { $set: { status: "paid" } }
  );

  return {
    ok: true,
    amount,
    transactionId: payment.transactionId,
    maintenanceId: maintenance._id.toString(),
  };
}
