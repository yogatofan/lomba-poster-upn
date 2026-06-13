import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "yellow" | "gray" | "blue";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "green", size = "sm", className }: BadgeProps) {
  const variants = {
    green:  "bg-upn-green-100 text-upn-green-800 border border-upn-green-400/40",
    red:    "bg-upn-red-100 text-upn-red-700 border border-upn-red-600/30",
    yellow: "bg-yellow-50 text-yellow-800 border border-yellow-300",
    gray:   "bg-canvas-parchment text-ink-muted-48 border border-hairline",
    blue:   "bg-blue-50 text-blue-700 border border-blue-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-semibold rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  color?: "green" | "red" | "blue" | "yellow";
}

export function StatCard({ label, value, icon, trend, className, color = "green" }: StatCardProps) {
  const iconColors = {
    green:  "text-upn-green-700 bg-upn-green-100",
    red:    "text-upn-red-700 bg-upn-red-100",
    blue:   "text-blue-700 bg-blue-50",
    yellow: "text-yellow-700 bg-yellow-50",
  };

  return (
    <div
      className={clsx(
        "bg-white border border-hairline rounded-[18px] p-5 animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted-48 font-medium">{label}</p>
          <p className="text-3xl font-bold text-ink mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-upn-green-700 mt-1 font-medium">
              +{trend.value} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={clsx("p-2.5 rounded-xl", iconColors[color])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={clsx(
        "bg-white border border-hairline rounded-[18px]",
        paddings[padding],
        hover && "hover:border-upn-green-400/60 hover:shadow-sm transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <hr className={clsx("border-0 border-t border-hairline", className)} />
  );
}
