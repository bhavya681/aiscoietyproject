import { cn } from "@/app/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
  size?: "sm" | "md";
}

const VARIANTS: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border bg-card text-foreground",
  success: "bg-emerald/10 text-emerald",
  warning: "bg-amber/10 text-amber",
  danger: "bg-destructive/10 text-destructive",
};

const SIZES: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
};

export default function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
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