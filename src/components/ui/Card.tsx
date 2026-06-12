import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "yellow" | "gray" | "blue";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "green", size = "sm", className }: BadgeProps) {
  const variants = {
    green: "bg-upn-green-800/30 text-green-400 border border-upn-green-700/30",
    red: "bg-upn-red-800/30 text-red-400 border border-upn-red-700/30",
    yellow: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/30",
    gray: "bg-white/5 text-gray-400 border border-white/10",
    blue: "bg-blue-900/30 text-blue-400 border border-blue-700/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-medium rounded-full",
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
  const colors = {
    green: "from-upn-green-800/20 to-upn-green-900/20 border-upn-green-700/20",
    red: "from-upn-red-800/20 to-upn-red-900/20 border-upn-red-700/20",
    blue: "from-blue-800/20 to-blue-900/20 border-blue-700/20",
    yellow: "from-yellow-800/20 to-yellow-900/20 border-yellow-700/20",
  };

  const iconColors = {
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
    yellow: "text-yellow-400",
  };

  return (
    <div
      className={clsx(
        "glass rounded-2xl p-5 bg-gradient-to-br animate-fade-in",
        colors[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-green-300/60 font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-green-400 mt-1">
              +{trend.value} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={clsx("p-3 rounded-xl bg-white/5", iconColors[color])}>
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
        "glass rounded-2xl",
        paddings[padding],
        hover && "hover:border-upn-green-700/30 hover:bg-upn-green-900/5 transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <hr className={clsx("border-0 border-t border-white/8", className)} />
  );
}
