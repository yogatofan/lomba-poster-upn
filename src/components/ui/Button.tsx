"use client";

import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 relative overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-br from-upn-green-700 to-upn-green-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-upn-green-800/40 active:translate-y-0",
    danger:
      "bg-gradient-to-br from-upn-red-800 to-upn-red-700 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-upn-red-800/40 active:translate-y-0",
    ghost:
      "bg-transparent text-green-300 hover:bg-upn-green-800/20 hover:text-green-200",
    outline:
      "bg-transparent border border-white/10 text-green-200 hover:border-upn-green-600/50 hover:bg-upn-green-800/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
