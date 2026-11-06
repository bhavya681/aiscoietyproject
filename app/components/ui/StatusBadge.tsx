import { cn } from "@/app/lib/utils";

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const VARIANTS: Record<NonNullable<StatusBadgeProps["variant"]>, string> = {
  default: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border bg-card text-foreground",
  success: "bg-emerald/10 text-emerald ring-1 ring-inset ring-emerald/20",
  warning: "bg-amber/10 text-amber ring-1 ring-inset ring-amber/20",
  danger:
    "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
  info: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/15",
};

const SIZES: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
};

export default function StatusBadge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}