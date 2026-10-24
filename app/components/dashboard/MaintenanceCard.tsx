import { formatCurrency } from "@/app/lib/types";

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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Maintenance</p>

          <h2 className="mt-2 text-3xl font-bold">
            {formatCurrency(pendingAmount)}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {hasPending ? "Pending maintenance" : "No pending maintenance"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            hasPending
              ? "bg-amber/15 text-amber"
              : "bg-emerald/15 text-emerald"
          }`}
        >
          {hasPending ? "Pending" : "Paid"}
        </span>
      </div>

      <div className="my-6 h-px bg-border" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Monthly amount</p>

          <p className="mt-1 font-semibold">
            {formatCurrency(monthlyAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Due date</p>

          <p className="mt-1 font-semibold">{dueDate}</p>
        </div>
      </div>

      {hasPending && onPay && (
        <button
          onClick={onPay}
          className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Pay Maintenance
        </button>
      )}
    </div>
  );
}