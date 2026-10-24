import { formatCurrency, formatDate, type MaintenanceRecord } from "@/app/lib/types";

type HistoryTableProps = {
  history: MaintenanceRecord[];
};

const STATUS_STYLES: Record<MaintenanceRecord["status"], string> = {
  paid: "bg-emerald/15 text-emerald",
  pending: "bg-amber/15 text-amber",
  overdue: "bg-destructive/15 text-destructive",
};

export default function HistoryTable({ history }: HistoryTableProps) {
  if (!history.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="font-medium">No payment history</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Your maintenance records will appear here once the society raises
          your first invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="font-semibold">Maintenance Records</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your previous and upcoming maintenance
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-4">Due Date</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Paid On</th>
              <th className="px-5 py-4">Method</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {history.map((record) => (
              <tr key={record._id} className="hover:bg-muted/50">
                <td className="px-5 py-4 text-muted-foreground">
                  {formatDate(record.dueDate)}
                </td>

                <td className="px-5 py-4 font-semibold">
                  {formatCurrency(
                    record.status === "paid"
                      ? record.monthlyAmount
                      : record.pendingAmount
                  )}
                </td>

                <td className="px-5 py-4 text-muted-foreground">
                  {record.paidAt ? formatDate(record.paidAt) : "-"}
                </td>

                <td className="px-5 py-4 text-muted-foreground">
                  {record.paymentMethod?.replace("_", " ") ?? "-"}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      STATUS_STYLES[record.status]
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}