import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ViewHeader, StatCard, Panel, EmptyState, Th, Td } from "@/components/ui";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import {
  fmt,
  fmtDate,
  factureTotal,
  last6MonthsKeys,
  moisLabelCourt,
  capitalize,
  todayISO,
} from "@/lib/utils";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

type FactureAttente = {
  id: string;
  numero: string;
  facture_items: { quantite: number; prix_unitaire: number }[];
  clients: { nom: string } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: entreprise }, { data: transactions }, { data: facturesData }] = await Promise.all([
    supabase.from("entreprise").select("solde_initial").limit(1).maybeSingle(),
    supabase
      .from("transactions")
      .select("id, date, type, categorie, montant, description")
      .order("date", { ascending: false }),
    supabase
      .from("factures")
      .select("id, numero, statut, date, facture_items(quantite, prix_unitaire), clients(nom)")
      .neq("statut", "Payée")
      .order("date", { ascending: false }),
  ]);

  const soldeInitial = Number(entreprise?.solde_initial || 0);
  const tx = (transactions || []) as Transaction[];

  const solde =
    soldeInitial +
    tx.filter((t) => t.type === "recette").reduce((s, t) => s + Number(t.montant), 0) -
    tx.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.montant), 0);

  const moisActuelKey = todayISO().slice(0, 7);
  const txMois = tx.filter((t) => t.date.slice(0, 7) === moisActuelKey);
  const recettesMois = txMois.filter((t) => t.type === "recette").reduce((s, t) => s + Number(t.montant), 0);
  const depensesMois = txMois.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.montant), 0);
  const resultatMois = recettesMois - depensesMois;

  const chartData = last6MonthsKeys().map((k) => {
    const list = tx.filter((t) => t.date.slice(0, 7) === k);
    return {
      mois: capitalize(moisLabelCourt(k)),
      recettes: list.filter((t) => t.type === "recette").reduce((s, t) => s + Number(t.montant), 0),
      depenses: list.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.montant), 0),
    };
  });

  const dernieres = tx.slice(0, 6);
  const facturesEnAttente = (facturesData || []) as unknown as FactureAttente[];
  const totalEnAttente = facturesEnAttente.reduce((s, f) => s + factureTotal(f), 0);

  const aujourdHui = capitalize(
    new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  );

  return (
    <div>
      <ViewHeader title="Tableau de bord" subtitle={aujourdHui} />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Solde actuel" value={fmt(solde)} />
        <StatCard label="Recettes du mois" value={fmt(recettesMois)} tone="positive" />
        <StatCard label="Dépenses du mois" value={fmt(depensesMois)} tone="negative" />
        <StatCard
          label="Résultat du mois"
          value={(resultatMois >= 0 ? "+" : "") + fmt(resultatMois)}
          tone={resultatMois >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Recettes & dépenses — 6 derniers mois">
          <MonthlyBarChart data={chartData} />
        </Panel>
        <Panel title="Factures en attente">
          {facturesEnAttente.length === 0 ? (
            <EmptyState>Aucune facture en attente. Tout est à jour.</EmptyState>
          ) : (
            <>
              <p className="mb-3">
                <span className="tabular-mono block text-xl font-semibold text-gold-700">
                  {fmt(totalEnAttente)}
                </span>
                <span className="text-xs text-ink-500">
                  à encaisser ({facturesEnAttente.length} facture{facturesEnAttente.length > 1 ? "s" : ""})
                </span>
              </p>
              <ul className="mb-3 flex flex-col gap-2">
                {facturesEnAttente.slice(0, 5).map((f) => (
                  <li key={f.id} className="flex justify-between border-b border-line-soft pb-2 text-[13px]">
                    <span>
                      {f.numero} — {f.clients?.nom || "Client"}
                    </span>
                    <span className="tabular-mono">{fmt(factureTotal(f))}</span>
                  </li>
                ))}
              </ul>
              <Link href="/facturation" className="text-[13px] text-steel-600 underline">
                Voir toutes les factures →
              </Link>
            </>
          )}
        </Panel>
      </div>

      <Panel title="Dernières transactions">
        {dernieres.length === 0 ? (
          <EmptyState>
            Aucune transaction pour l&apos;instant. Direction l&apos;onglet Transactions pour ajouter la première
            entrée.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Catégorie</Th>
                  <Th>Description</Th>
                  <Th right>Montant</Th>
                </tr>
              </thead>
              <tbody>
                {dernieres.map((t) => (
                  <tr key={t.id}>
                    <Td>{fmtDate(t.date)}</Td>
                    <Td>{t.categorie}</Td>
                    <Td>{t.description || "—"}</Td>
                    <Td right className={`tabular-mono ${t.type === "recette" ? "text-emerald-600" : "text-brick-600"}`}>
                      {t.type === "recette" ? "+" : "-"}
                      {fmt(t.montant)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
