import { cn } from "@/app/lib/utils";
import { type ReactNode } from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
  badge?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  badge,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:border-[#315CF5]/30",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </span>
            {badge && (
              <span className="rounded-full bg-[#315CF5]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[#315CF5]">
                {badge}
              </span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-muted-foreground transition-colors group-hover:bg-[#315CF5]/10 group-hover:text-[#315CF5]">
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs border-t border-border/40 pt-3">
          {trend && (
            <span
              className={cn(
                "font-semibold font-mono",
                trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              )}
            >
              {trend.value}
            </span>
          )}
          {description && (
            <span className="text-muted-foreground truncate font-sans">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}