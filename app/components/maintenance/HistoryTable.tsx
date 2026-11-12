import Link from "next/link";

import StatusBadge from "@/app/components/ui/StatusBadge";
import {
  formatCurrency,
  formatDate,
  type MaintenanceRecord,
} from "@/app/lib/types";

type HistoryTableProps = {
  history: MaintenanceRecord[];
};

function statusVariant(status: MaintenanceRecord["status"]) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "overdue") {
    return "danger" as const;
  }

  return "warning" as const;
}

export default function HistoryTable({ history }: HistoryTableProps) {
  if (!history.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
        <p className="text-sm font-medium text-foreground">
          No transaction records found
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          Your maintenance records and payment receipts will appear here once an
          invoice is raised.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card md:block">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Maintenance ledger
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A chronological record of dues, payments, and receipts.
            </p>
          </div>
          <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
            {history.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-medium text-muted-foreground">
                <th className="px-5 py-3">Due date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Paid date</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Document</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 text-[13px]">
              {history.map((record) => (
                <tr
                  key={record._id}
                  className="transition-colors hover:bg-muted/25"
                >
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {formatDate(record.dueDate)}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground tabular-nums">
                    {formatCurrency(
                      record.status === "paid"
                        ? record.monthlyAmount
                        : record.pendingAmount
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {record.paidAt ? formatDate(record.paidAt) : "—"}
                  </td>
                  <td className="px-5 py-3.5 capitalize text-muted-foreground">
                    {record.paymentMethod?.replace("_", " ") ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      variant={statusVariant(record.status)}
                      size="sm"
                    >
                      {record.status}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/maintenance/invoice/${record._id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View invoice
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2.5 md:hidden">
        {history.map((record) => (
          <div
            key={record._id}
            className="rounded-2xl border border-border/80 bg-card p-4 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">
                Due {formatDate(record.dueDate)}
              </p>
              <StatusBadge variant={statusVariant(record.status)} size="sm">
                {record.status}
              </StatusBadge>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground tabular-nums">
                  {formatCurrency(
                    record.status === "paid"
                      ? record.monthlyAmount
                      : record.pendingAmount
                  )}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {record.paidAt
                    ? `Paid ${formatDate(record.paidAt)}`
                    : "Awaiting payment"}
                  {record.paymentMethod
                    ? ` · ${record.paymentMethod.replace("_", " ")}`
                    : ""}
                </p>
              </div>

              <Link
                href={`/maintenance/invoice/${record._id}`}
                className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-2.5 text-[11px] font-medium text-foreground"
              >
                Invoice
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
