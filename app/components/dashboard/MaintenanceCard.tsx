import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Wallet,
} from "lucide-react";

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
}: MaintenanceCardProps) {
  const hasPending = pendingAmount > 0;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Current billing cycle
          </p>
          <div className="mt-2 flex items-center gap-2">
            <h2 className="text-[34px] font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums">
              {formatCurrency(pendingAmount)}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium ${
                hasPending
                  ? "bg-amber/10 text-amber"
                  : "bg-emerald/10 text-emerald"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasPending ? "bg-amber" : "bg-emerald"
                }`}
              />
              {hasPending ? "Payment pending" : "All clear"}
            </span>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {hasPending
              ? "Outstanding maintenance balance for your flat."
              : "There is no pending maintenance balance."}
          </p>
        </div>

        {hasPending && (
          <Link
            href="/maintenance"
            className="inline-flex h-9 items-center gap-2 rounded-[9px] bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Pay now
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="my-5 h-px bg-border/70" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/55 p-3.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            Monthly base rate
          </span>
          <p className="mt-1.5 text-lg font-semibold tracking-tight text-foreground tabular-nums">
            {formatCurrency(monthlyAmount)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Standard flat tariff
          </p>
        </div>

        <div className="rounded-xl bg-muted/55 p-3.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Payment deadline
          </span>
          <p className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
            {dueDate}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Interest waived before due date
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4 text-[11px] text-muted-foreground">
        {hasPending ? (
          <>
            <Clock3 className="h-3.5 w-3.5 text-amber" />
            Paying before the deadline keeps your account in good standing.
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
            Your maintenance account is fully settled.
          </>
        )}
      </div>
    </section>
  );
}
