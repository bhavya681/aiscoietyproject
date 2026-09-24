type StatCardProps = {
    title: string;
    value: string | number;
    description?: string;
    icon?: string;
    trend?: string;
  };
  
  export default function StatCard({
    title,
    value,
    description,
    icon,
    trend,
  }: StatCardProps) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              {title}
            </p>
  
            <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
              {value}
            </p>
          </div>
  
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg">
              {icon}
            </div>
          )}
        </div>
  
        {(description || trend) && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            {trend && (
              <span className="font-medium text-emerald-600">
                {trend}
              </span>
            )}
  
            {description && (
              <span className="text-zinc-500">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }