import { formatCurrency, formatDate, type MaintenanceRecord } from "@/app/lib/types";

type HistoryTableProps = {
  history: MaintenanceRecord[];
};

const STATUS_STYLES: Record<MaintenanceRecord["status"], string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
};

export default function HistoryTable({ history }: HistoryTableProps) {
  if (!history.length) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <p className="font-medium text-zinc-900">No payment history</p>

        <p className="mt-1 text-sm text-zinc-500">
          Your maintenance records will appear here once the society raises
          your first invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <h2 className="font-semibold text-zinc-900">Maintenance Records</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Your previous and upcoming maintenance
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-5 py-4">Due Date</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Paid On</th>
              <th className="px-5 py-4">Method</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {history.map((record) => (
              <tr key={record._id} className="hover:bg-zinc-50">
                <td className="px-5 py-4 text-zinc-600">
                  {formatDate(record.dueDate)}
                </td>

                <td className="px-5 py-4 font-semibold text-zinc-900">
                  {formatCurrency(
                    record.status === "paid"
                      ? record.monthlyAmount
                      : record.pendingAmount
                  )}
                </td>

                <td className="px-5 py-4 text-zinc-600">
                  {record.paidAt ? formatDate(record.paidAt) : "-"}
                </td>

                <td className="px-5 py-4 text-zinc-600">
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
