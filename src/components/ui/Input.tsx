"use client";

import clsx from "clsx";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-ink-muted-80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            "input-field",
            error && "border-upn-red-600 focus:border-upn-red-500 focus:shadow-[0_0_0_3px_rgba(198,40,40,0.12)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-upn-red-700 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-ink-muted-48">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-ink-muted-80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={clsx(
            "input-field resize-none",
            error && "border-upn-red-600",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-upn-red-700">⚠ {error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-ink-muted-48">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink-muted-80">
          {label}
        </label>
      )}
      <select
        id={id}
        className={clsx(
          "input-field",
          error && "border-upn-red-600",
          className
        )}
        style={{ colorScheme: "light" }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-upn-red-700">⚠ {error}</p>}
    </div>
  );
}
