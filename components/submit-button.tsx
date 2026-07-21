"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const cls = {
    primary: "bg-ink-800 text-paper-raised hover:bg-ink-900",
    ghost: "border border-line text-ink-500 hover:border-ink-800 hover:text-ink-800",
    danger: "border border-brick-600 text-brick-600 hover:bg-brick-600 hover:text-white",
  }[variant];
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2.5 text-[13.5px] font-semibold transition-colors disabled:opacity-60 ${cls} ${className}`}
    >
      {pending ? pendingLabel || "Enregistrement…" : children}
    </button>
  );
}
