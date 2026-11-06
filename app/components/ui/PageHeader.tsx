import type { ReactNode } from "react";
import { cn } from "@/app/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  action?: ReactNode;
  eyebrow?: string;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumb,
  action,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumb && (
        <div className="text-xs text-muted-foreground">{breadcrumb}</div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1.5 text-xs font-medium text-primary">{eyebrow}</p>
          )}
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-foreground sm:text-[32px]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}