"use client";

import type { ReactNode, MouseEvent } from "react";

export function ConfirmSubmitButton({
  children,
  confirmMessage,
  className = "",
}: {
  children: ReactNode;
  confirmMessage: string;
  className?: string;
}) {
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  }

  return (
    <button type="submit" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
