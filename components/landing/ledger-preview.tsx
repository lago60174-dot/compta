"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { fmt } from "@/lib/utils";

const TABS = [
  { key: "dashboard", label: "Tableau de bord", icon: "dashboard", color: "var(--color-ink-800)" },
  { key: "transactions", label: "Transactions", icon: "transactions", color: "var(--color-emerald-600)" },
  { key: "facturation", label: "Facturation", icon: "facturation", color: "var(--color-gold-600)" },
  { key: "tresorerie", label: "Trésorerie", icon: "tresorerie", color: "var(--color-steel-600)" },
  { key: "rapports", label: "Rapports", icon: "rapports", color: "var(--color-brick-600)" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function LedgerPreview() {
  const [active, setActive] = useState<TabKey>("dashboard");
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setActive((cur) => {
        const i = TABS.findIndex((t) => t.key === cur);
        return TABS[(i + 1) % TABS.length].key;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [auto]);

  function select(key: TabKey) {
    setAuto(false);
    setActive(key);
  }

  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <div className="relative mx-auto w-full max-w-sm md:mx-0 md:max-w-[360px]">
      <div className="rounded-card border border-line-soft bg-paper-raised p-5 shadow-2xl md:p-6">
        {/* Onglets — version mobile (rangée horizontale) */}
        <div className="mb-4 flex gap-1.5 overflow-x-auto md:hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => select(t.key)}
              aria-current={t.key === active}
              className="flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
              style={{
                backgroundColor: t.key === active ? t.color : "var(--color-line-soft)",
                color: t.key === active ? "#fff" : "var(--color-ink-500)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-2.5 border-b border-line-soft pb-4">
          <span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-paper-raised"
            style={{ backgroundColor: activeTab.color }}
          >
            <Icon name={activeTab.icon} />
          </span>
          <span className="font-display text-[15px] font-semibold text-ink-800">{activeTab.label}</span>
        </div>

        <div key={active} className="reveal">
          {active === "dashboard" && <DashboardPreview />}
          {active === "transactions" && <TransactionsPreview />}
          {active === "facturation" && <FacturationPreview />}
          {active === "tresorerie" && <TresoreriePreview />}
          {active === "rapports" && <RapportsPreview />}
        </div>
      </div>

      {/* Onglets — version bureau (fanions dans la marge, comme la barre latérale) */}
      <div className="absolute right-0 top-9 hidden translate-x-[calc(100%-2px)] flex-col gap-2 md:flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => select(t.key)}
            aria-label={t.label}
            aria-current={t.key === active}
            title={t.label}
            className="rounded-r-md shadow-md transition-all duration-200"
            style={{
              width: t.key === active ? 30 : 18,
              height: 30,
              backgroundColor: t.color,
              opacity: t.key === active ? 1 : 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12.5px] text-ink-500">{label}</span>
      <span className="tabular-mono text-[12.5px] font-semibold text-ink-800">{value}</span>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const border =
    tone === "positive" ? "border-t-emerald-600" : tone === "negative" ? "border-t-brick-600" : "border-t-ink-800";
  const text = tone === "positive" ? "text-emerald-700" : tone === "negative" ? "text-brick-700" : "text-ink-800";
  return (
    <div className={`rounded-md border border-line-soft border-t-[3px] ${border} bg-paper px-2.5 py-2`}>
      <div className="text-[9.5px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className={`tabular-mono text-[12.5px] font-semibold ${text}`}>{value}</div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <MiniStat label="Solde" value={fmt(1284500)} />
      <MiniStat label="Recettes" value={fmt(612000)} tone="positive" />
      <MiniStat label="Dépenses" value={fmt(238400)} tone="negative" />
    </div>
  );
}

function TransactionsPreview() {
  const rows = [
    { date: "18/07", label: "Vente comptoir", montant: 45000, sens: "positive" as const },
    { date: "17/07", label: "Achat fournitures", montant: 18200, sens: "negative" as const },
    { date: "15/07", label: "Paiement client — F-0031", montant: 96000, sens: "positive" as const },
  ];
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between border-b border-line-soft py-2 last:border-0">
          <div>
            <div className="text-[12.5px] text-ink-800">{r.label}</div>
            <div className="text-[11px] text-ink-400">{r.date}</div>
          </div>
          <span
            className={`tabular-mono text-[12.5px] font-semibold ${
              r.sens === "positive" ? "text-emerald-700" : "text-brick-700"
            }`}
          >
            {r.sens === "positive" ? "+ " : "− "}
            {fmt(r.montant)}
          </span>
        </div>
      ))}
    </div>
  );
}

function FacturationPreview() {
  const total = 45000 * 3 + 12000;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-[13.5px] font-semibold text-ink-800">Facture F-0032</span>
        <span className="rounded-full bg-steel-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-steel-700">
          Envoyée
        </span>
      </div>
      <div className="mb-2 text-[11.5px] text-ink-500">Client — Boutique Ndolo SARL</div>
      <Line label="3 × Prestation conseil" value={fmt(45000 * 3)} />
      <Line label="1 × Frais de dossier" value={fmt(12000)} />
      <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2">
        <span className="text-[12.5px] font-semibold text-ink-800">Total</span>
        <span className="tabular-mono text-[13.5px] font-bold text-ink-900">{fmt(total)}</span>
      </div>
    </div>
  );
}

function TresoreriePreview() {
  const rows = [
    { label: "Espèces", value: 184000, max: 1284500 },
    { label: "Banque", value: 860500, max: 1284500 },
    { label: "Mobile Money", value: 240000, max: 1284500 },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex justify-between text-[11.5px]">
            <span className="text-ink-500">{r.label}</span>
            <span className="tabular-mono font-semibold text-ink-800">{fmt(r.value)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
            <div
              className="h-full rounded-full bg-steel-600"
              style={{ width: `${(r.value / r.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RapportsPreview() {
  const mois = [
    { m: "Avr", rec: 58, dep: 32 },
    { m: "Mai", rec: 64, dep: 40 },
    { m: "Juin", rec: 52, dep: 35 },
    { m: "Juil", rec: 72, dep: 30 },
  ];
  return (
    <div>
      <div className="mb-3 flex h-24 items-end gap-3">
        {mois.map((m) => (
          <div key={m.m} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-full items-end gap-0.5">
              <div className="w-2.5 rounded-t bg-emerald-600" style={{ height: `${m.rec}%` }} />
              <div className="w-2.5 rounded-t bg-brick-500" style={{ height: `${m.dep}%` }} />
            </div>
            <span className="text-[10px] text-ink-400">{m.m}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-[11px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-600" /> Recettes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-brick-500" /> Dépenses
        </span>
      </div>
    </div>
  );
}
