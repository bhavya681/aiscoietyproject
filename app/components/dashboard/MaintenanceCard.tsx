type MaintenanceCardProps = {
    pendingAmount: number;
    monthlyAmount: number;
    dueDate: string;
    onPay?: () => void;
  };
  
  export default function MaintenanceCard({
    pendingAmount,
    monthlyAmount,
    dueDate,
    onPay,
  }: MaintenanceCardProps) {
    const hasPending = pendingAmount > 0;
  
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Maintenance
            </p>
  
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">
              ₹{pendingAmount.toLocaleString("en-IN")}
            </h2>
  
            <p className="mt-1 text-sm text-zinc-500">
              {hasPending
                ? "Pending maintenance"
                : "No pending maintenance"}
            </p>
          </div>
  
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              hasPending
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {hasPending ? "Pending" : "Paid"}
          </span>
        </div>
  
        <div className="my-6 h-px bg-zinc-100" />
  
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500">
              Monthly amount
            </p>
  
            <p className="mt-1 font-semibold text-zinc-900">
              ₹{monthlyAmount.toLocaleString("en-IN")}
            </p>
          </div>
  
          <div>
            <p className="text-xs text-zinc-500">
              Due date
            </p>
  
            <p className="mt-1 font-semibold text-zinc-900">
              {dueDate}
            </p>
          </div>
        </div>
  
        {hasPending && onPay && (
          <button
            onClick={onPay}
            className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Pay Maintenance
          </button>
        )}
      </div>
    );
  }