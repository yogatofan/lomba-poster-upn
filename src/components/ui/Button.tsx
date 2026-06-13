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
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-upn-green-700 text-white hover:bg-upn-green-800 hover:shadow-lg hover:shadow-upn-green-700/25 active:scale-[0.97] active:shadow-none",
    danger:
      "bg-upn-red-700 text-white hover:bg-upn-red-800 hover:shadow-lg hover:shadow-upn-red-800/25 active:scale-[0.97]",
    ghost:
      "bg-transparent text-ink hover:bg-canvas-parchment active:bg-hairline",
    outline:
      "bg-transparent border border-hairline text-ink hover:border-upn-green-600 hover:bg-upn-green-50 active:scale-[0.97]",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-5 py-2.5 text-[0.9375rem]",
    lg: "px-7 py-3 text-base",
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
