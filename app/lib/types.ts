/**
 * Shared client-side response shapes.
 *
 * These mirror what the API routes return. They are intentionally small: the
 * frontend only needs the fields it renders.
 */

export type Role = "admin" | "resident";

export type MaintenanceStatus = "pending" | "paid" | "overdue";

export type Profile = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: Role;
  createdAt?: string;
};

export type MaintenanceRecord = {
  _id: string;
  userId: string;
  monthlyAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: MaintenanceStatus;
  paidAt?: string | null;
  paymentMethod?: string | null;
  createdAt?: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
};

export type ProfileResponse = {
  profile: Profile;
};

export type PendingResponse = {
  totalPending: number;
  monthlyAmount: number;
  nextDueDate: string | null;
  maintenance: MaintenanceRecord[];
};

export type HistoryResponse = {
  history: MaintenanceRecord[];
};

export type InvoiceResponse = {
  invoice: Invoice | null;
  maintenance: MaintenanceRecord;
};

export type PaymentResponse = {
  amount: number;
  transactionId: string;
};

export type ChatConfirmation = {
  id: string;
  amount: number;
  maintenanceId: string;
};

export type ChatToolCall = {
  name: string;
  status: "success" | "error" | "unauthorized" | "unknown";
};

export type ChatResponse = {
  message: string;
  toolCalls: ChatToolCall[];
  source: "rag" | "tool" | "both" | "none";
  confirmation: ChatConfirmation | null;
};

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
