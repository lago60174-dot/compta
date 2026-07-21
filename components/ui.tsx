import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const border =
    tone === "positive"
      ? "border-t-emerald-600"
      : tone === "negative"
      ? "border-t-brick-600"
      : "border-t-ink-800";
  return (
    <div
      className={`flex flex-col gap-2 rounded-card border border-line-soft border-t-[3px] ${border} bg-paper-raised px-5 py-4`}
    >
      <span className="text-xs uppercase tracking-wide text-ink-500">{label}</span>
      <span className="tabular-mono text-xl font-semibold text-ink-800">{value}</span>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "positive" | "negative" | "steel" | "neutral";
}) {
  const cls = {
    positive: "bg-emerald-50 text-emerald-700",
    negative: "bg-brick-50 text-brick-700",
    steel: "bg-steel-50 text-steel-700",
    neutral: "bg-ink-100 text-ink-500",
  }[tone];
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-5 rounded-card border border-line-soft bg-paper-raised p-5 md:p-6 ${className}`}>
      {title && <h2 className="mb-4 font-display text-[17px] font-semibold text-ink-800">{title}</h2>}
      {children}
    </div>
  );
}

export function ViewHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-800 md:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm italic text-ink-400">{children}</p>;
}

export function Th({ children, right = false }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      className={`border-b-2 border-ink-800 px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-500 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  right = false,
  className = "",
}: {
  children: ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <td className={`border-b border-line-soft px-2.5 py-2.5 align-middle ${right ? "text-right" : ""} ${className}`}>
      {children}
    </td>
  );
}
