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
        "rounded-2xl border border-border/80 bg-card p-5 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-medium text-muted-foreground">
              {title}
            </span>
            {badge && (
              <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                {badge}
              </span>
            )}
          </div>
          <p className="truncate text-[26px] font-semibold tracking-[-0.03em] text-foreground tabular-nums">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-[11px]">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                trend.positive ? "text-emerald" : "text-destructive"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  trend.positive ? "bg-emerald" : "bg-destructive"
                )}
              />
              {trend.value}
            </span>
          )}
          {description && (
            <span className="truncate text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}