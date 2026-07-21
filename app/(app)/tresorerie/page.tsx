import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ViewHeader, Panel, StatCard, EmptyState, Badge, Th, Td } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { DonutChart } from "@/components/charts/donut-chart";
import { ProjectionChart } from "@/components/charts/projection-chart";
import { PrevisionnelForm } from "./previsionnel-form";
import { deletePrevisionnel, realizePrevisionnel } from "./actions";
import { fmt, fmtDate, fmtDateCourt } from "@/lib/utils";
import { MODES_PAIEMENT } from "@/lib/types";
import type { Previsionnel } from "@/lib/types";

export const dynamic = "force-dynamic";

const MODE_COLORS = ["#1F6F54", "#B98A22", "#2E5C73", "#A8442F"];

function tabCls(active: boolean) {
  return `border-b-2 px-4 py-2.5 text-[13.5px] transition-colors ${
    active ? "border-ink-800 font-semibold text-ink-800" : "border-transparent text-ink-500 hover:text-ink-800"
  }`;
}

export default async function TresoreriePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "previsionnel" ? "previsionnel" : "apercu";

  const supabase = await createClient();
  const [{ data: entreprise }, { data: transactions }, { data: previsionnelData }] = await Promise.all([
    supabase.from("entreprise").select("solde_initial").limit(1).maybeSingle(),
    supabase.from("transactions").select("type, montant, mode_paiement"),
    supabase.from("previsionnel").select("id, date, type, montant, description").order("date"),
  ]);

  const soldeInitial = Number(entreprise?.solde_initial || 0);
  const tx = (transactions || []) as { type: string; montant: number; mode_paiement: string }[];
  const solde =
    soldeInitial +
    tx.filter((t) => t.type === "recette").reduce((s, t) => s + Number(t.montant), 0) -
    tx.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.montant), 0);

  const previsionnel = (previsionnelData || []) as Previsionnel[];
  const entrees = previsionnel.filter((p) => p.type === "recette").reduce((s, p) => s + Number(p.montant), 0);
  const sorties = previsionnel.filter((p) => p.type === "depense").reduce((s, p) => s + Number(p.montant), 0);
  const soldePrevu = solde + entrees - sorties;

  const modeTotals: Record<string, number> = {};
  MODES_PAIEMENT.forEach((m) => (modeTotals[m] = 0));
  tx.forEach((t) => {
    const v = (t.type === "recette" ? 1 : -1) * Number(t.montant);
    modeTotals[t.mode_paiement] = (modeTotals[t.mode_paiement] || 0) + v;
  });
  const modeData = Object.entries(modeTotals)
    .map(([name, value]) => ({ name, value: Math.abs(value) }))
    .filter((d) => d.value > 0);

  const sortedPrev = [...previsionnel].sort((a, b) => a.date.localeCompare(b.date));
  let running = solde;
  const projectionData = [{ label: "Aujourd'hui", solde: running }];
  sortedPrev.forEach((p) => {
    running += (p.type === "recette" ? 1 : -1) * Number(p.montant);
    projectionData.push({ label: fmtDateCourt(p.date), solde: running });
  });

  return (
    <div>
      <ViewHeader title="Trésorerie" subtitle="Suivez votre solde et anticipez les mouvements à venir." />

      <div className="mb-5 flex gap-1 border-b border-line">
        <Link href="/tresorerie" className={tabCls(tab === "apercu")}>
          Vue d&apos;ensemble
        </Link>
        <Link href="/tresorerie?tab=previsionnel" className={tabCls(tab === "previsionnel")}>
          Prévisionnel
        </Link>
      </div>

      {tab === "previsionnel" ? (
        <>
          <Panel title="Ajouter un mouvement prévisionnel">
            <PrevisionnelForm />
          </Panel>
          <Panel>
            {previsionnel.length === 0 ? (
              <EmptyState>Aucun mouvement prévisionnel enregistré.</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]">
                  <thead>
                    <tr>
                      <Th>Date prévue</Th>
                      <Th>Type</Th>
                      <Th>Description</Th>
                      <Th right>Montant</Th>
                      <Th>{""}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {previsionnel.map((p) => (
                      <tr key={p.id}>
                        <Td>{fmtDate(p.date)}</Td>
                        <Td>
                          <Badge tone={p.type === "recette" ? "positive" : "negative"}>
                            {p.type === "recette" ? "Entrée" : "Sortie"}
                          </Badge>
                        </Td>
                        <Td>{p.description || "—"}</Td>
                        <Td right className={`tabular-mono ${p.type === "recette" ? "text-emerald-600" : "text-brick-600"}`}>
                          {p.type === "recette" ? "+" : "-"}
                          {fmt(p.montant)}
                        </Td>
                        <Td>
                          <div className="flex justify-end gap-1.5 whitespace-nowrap">
                            <form action={realizePrevisionnel.bind(null, p.id)}>
                              <ConfirmSubmitButton
                                confirmMessage="Marquer ce mouvement comme réalisé ? Il sera ajouté aux transactions réelles."
                                className="rounded border border-line px-2 py-1 text-[11.5px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
                              >
                                Réalisé
                              </ConfirmSubmitButton>
                            </form>
                            <form action={deletePrevisionnel.bind(null, p.id)}>
                              <ConfirmSubmitButton
                                confirmMessage="Supprimer ce mouvement prévisionnel ?"
                                className="rounded border border-line px-2 py-1 text-[11.5px] text-ink-500 hover:border-brick-600 hover:text-brick-600"
                              >
                                Supprimer
                              </ConfirmSubmitButton>
                            </form>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Solde actuel" value={fmt(solde)} />
            <StatCard label="Entrées prévues" value={fmt(entrees)} tone="positive" />
            <StatCard label="Sorties prévues" value={fmt(sorties)} tone="negative" />
            <StatCard label="Solde prévisionnel" value={fmt(soldePrevu)} tone={soldePrevu >= 0 ? "positive" : "negative"} />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Mouvements par mode de paiement">
              <DonutChart data={modeData} colors={MODE_COLORS} />
            </Panel>
            <Panel title="Projection du solde">
              <ProjectionChart data={projectionData} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
