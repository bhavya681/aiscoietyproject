import Link from "next/link";
import { formatCurrency } from "@/app/lib/types";
import { CreditCard, Calendar, ArrowUpRight, ShieldCheck, Clock } from "lucide-react";

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
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Current Billing Cycle
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-mono ${
                hasPending
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${hasPending ? "bg-amber-500" : "bg-emerald-500"}`} />
              {hasPending ? "Payment Pending" : "All Clear"}
            </span>
          </div>

          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {formatCurrency(pendingAmount)}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {hasPending
              ? "Outstanding dues requiring settlement"
              : "No pending maintenance balance for this account"}
          </p>
        </div>

        {hasPending && (
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-2 rounded-xl bg-[#315CF5] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#2549d4] transition"
          >
            <span>Proceed to Payment</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="my-6 h-px bg-border/60" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <span className="text-xs font-mono uppercase text-muted-foreground">
            Monthly Base Rate
          </span>
          <p className="mt-1 text-lg font-bold text-foreground">
            {formatCurrency(monthlyAmount)}
          </p>
          <span className="text-[11px] text-muted-foreground">Standard flat tariff</span>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <span className="text-xs font-mono uppercase text-muted-foreground">
            Payment Deadline
          </span>
          <p className="mt-1 text-lg font-bold text-foreground">
            {dueDate}
          </p>
          <span className="text-[11px] text-muted-foreground">Interest waived before due</span>
        </div>
      </div>
    </div>
  );
}