import Link from "next/link";
import { formatCurrency, formatDate, type MaintenanceRecord } from "@/app/lib/types";
import { ArrowUpRight, CheckCircle2, Clock, AlertTriangle, FileText } from "lucide-react";

type HistoryTableProps = {
  history: MaintenanceRecord[];
};

export default function HistoryTable({ history }: HistoryTableProps) {
  if (!history.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-semibold text-foreground">No transaction records found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your maintenance records and payment receipts will appear here once invoices are raised.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop / Tablet Table View (hidden on mobile) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/60 p-5">
          <h2 className="text-base font-bold text-foreground">Maintenance Ledger</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full chronological archive of dues, payments, and generated invoices.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 text-[11px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-5 py-3.5">Billing Due Date</th>
                <th className="px-5 py-3.5">Billed Amount</th>
                <th className="px-5 py-3.5">Settlement Date</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5">Audit Status</th>
                <th className="px-5 py-3.5 text-right">Invoice</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 font-sans">
              {history.map((record) => (
                <tr key={record._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 font-mono text-muted-foreground">
                    {formatDate(record.dueDate)}
                  </td>

                  <td className="px-5 py-4 font-bold text-foreground">
                    {formatCurrency(
                      record.status === "paid"
                        ? record.monthlyAmount
                        : record.pendingAmount
                    )}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground font-mono">
                    {record.paidAt ? formatDate(record.paidAt) : "—"}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground font-mono uppercase text-[11px]">
                    {record.paymentMethod?.replace("_", " ") ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                        record.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : record.status === "overdue"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <span className={`h-1 w-1 rounded-full ${record.status === "paid" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {record.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/maintenance/invoice/${record._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#315CF5] hover:underline"
                    >
                      <span>Receipt</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout (Shown on small screens, preventing table overflow) */}
      <div className="md:hidden space-y-3">
        {history.map((record) => (
          <div
            key={record._id}
            className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                Due: {formatDate(record.dueDate)}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                  record.status === "paid"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {record.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(
                    record.status === "paid"
                      ? record.monthlyAmount
                      : record.pendingAmount
                  )}
                </span>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {record.paidAt ? `Paid on ${formatDate(record.paidAt)}` : "Awaiting payment"}
                </p>
              </div>

              <Link
                href={`/maintenance/invoice/${record._id}`}
                className="inline-flex items-center gap-1 rounded-lg bg-black/5 dark:bg-white/5 border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                <span>Invoice</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}