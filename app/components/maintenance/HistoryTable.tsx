type PaymentHistory = {
    _id: string;
    amount: number;
    status: string;
    paymentDate?: string;
    createdAt?: string;
    paymentMethod?: string;
  };
  
  type HistoryTableProps = {
    history: PaymentHistory[];
  };
  
  export default function HistoryTable({
    history,
  }: HistoryTableProps) {
    if (!history.length) {
      return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
          <p className="font-medium text-zinc-900">
            No payment history
          </p>
  
          <p className="mt-1 text-sm text-zinc-500">
            Your maintenance payments will appear here.
          </p>
        </div>
      );
    }
  
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="font-semibold text-zinc-900">
            Payment History
          </h2>
  
          <p className="mt-1 text-sm text-zinc-500">
            Your previous maintenance payments
          </p>
        </div>
  
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Date
                </th>
  
                <th className="px-5 py-4">
                  Amount
                </th>
  
                <th className="px-5 py-4">
                  Method
                </th>
  
                <th className="px-5 py-4">
                  Status
                </th>
              </tr>
            </thead>
  
            <tbody className="divide-y divide-zinc-100">
              {history.map((payment) => {
                const date =
                  payment.paymentDate ||
                  payment.createdAt;
  
                return (
                  <tr
                    key={payment._id}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 text-zinc-600">
                      {date
                        ? new Date(date).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </td>
  
                    <td className="px-5 py-4 font-semibold text-zinc-900">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </td>
  
                    <td className="px-5 py-4 text-zinc-600">
                      {payment.paymentMethod || "-"}
                    </td>
  
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          payment.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : payment.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }