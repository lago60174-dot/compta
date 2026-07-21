"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { signOut } from "@/app/(app)/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: "dashboard", color: "var(--color-ink-800)" },
  { href: "/transactions", label: "Transactions", icon: "transactions", color: "var(--color-emerald-600)" },
  { href: "/facturation", label: "Facturation", icon: "facturation", color: "var(--color-gold-600)" },
  { href: "/tresorerie", label: "Trésorerie", icon: "tresorerie", color: "var(--color-steel-600)" },
  { href: "/rapports", label: "Rapports", icon: "rapports", color: "var(--color-brick-600)" },
  { href: "/parametres", label: "Paramètres", icon: "parametres", color: "var(--color-ink-500)" },
] as const;

export default function Sidebar({
  entrepriseNom,
  userEmail,
}: {
  entrepriseNom: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const initials =
    entrepriseNom
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GL";

  return (
    <aside className="stitch-line relative flex w-full flex-row items-center gap-1 overflow-x-auto bg-ink-900 px-4 py-3 text-paper-raised print:hidden md:w-[230px] md:flex-shrink-0 md:flex-col md:items-stretch md:gap-0.5 md:overflow-visible md:py-6 md:pl-6 md:pr-0">
      <div className="mr-4 flex flex-shrink-0 items-center gap-3 border-white/10 pb-0 pr-0 md:mb-2 md:mr-0 md:border-b md:pb-5 md:pr-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold-600 font-display text-sm font-bold text-ink-900">
          {initials}
        </div>
        <div className="hidden md:block">
          <div className="font-display text-sm font-semibold leading-tight">{entrepriseNom}</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">Grand Livre</div>
        </div>
      </div>

      <nav className="flex flex-row gap-0.5 md:mt-2 md:flex-col">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ ["--tab-color" as string]: item.color }}
              className={`relative flex flex-shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md border-l-[3px] px-3 py-2 text-[13px] transition-colors md:gap-3 md:rounded-l-md md:rounded-r-none md:py-2.5 md:pl-2 md:pr-5 md:text-sm ${
                active
                  ? "nav-tab-flag border-transparent bg-white/10 text-white md:border-l-[var(--tab-color)] md:bg-paper md:text-ink-800"
                  : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex flex-shrink-0 items-center gap-3 md:ml-0 md:mt-auto md:flex-col md:items-stretch md:gap-2 md:pr-5 md:pt-6">
        <div className="hidden text-[11px] leading-relaxed text-white/40 md:block">
          {userEmail}
          <br />
          Données partagées avec toute l&apos;équipe.
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-white/60 hover:bg-white/5 hover:text-white md:w-full"
          >
            <Icon name="logout" />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
