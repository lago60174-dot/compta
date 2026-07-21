"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-ink-800 px-4 py-2 text-sm font-semibold text-paper-raised hover:bg-ink-900"
    >
      Imprimer
    </button>
  );
}
