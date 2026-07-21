import Link from "next/link";

export function FacturationTabs({ active }: { active: "factures" | "clients" }) {
  const tabCls = (isActive: boolean) =>
    `border-b-2 px-4 py-2.5 text-[13.5px] transition-colors ${
      isActive ? "border-ink-800 font-semibold text-ink-800" : "border-transparent text-ink-500 hover:text-ink-800"
    }`;

  return (
    <div className="mb-5 flex gap-1 border-b border-line">
      <Link href="/facturation" className={tabCls(active === "factures")}>
        Factures
      </Link>
      <Link href="/facturation/clients" className={tabCls(active === "clients")}>
        Clients
      </Link>
    </div>
  );
}
