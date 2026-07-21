import { createClient } from "@/lib/supabase/server";
import { ViewHeader, Panel, StatCard, Th, Td } from "@/components/ui";
import { DonutChart } from "@/components/charts/donut-chart";
import { fmt, periodeRange, last12MonthsKeys, moisLabel, type Periode } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEPENSE_COLORS = ["#A8442F", "#C97A63", "#D9A48E", "#8C3527", "#E0BFA8", "#6E2B1D", "#B98A22", "#8A6316"];
const RECETTE_COLORS = ["#1F6F54", "#3F9678", "#77B79E", "#164F3C", "#A8D5C2"];

const inputCls =
  "rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500";

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const periode = (typeof sp.periode === "string" ? sp.periode : "ce-mois") as Periode;
  const debutPerso = typeof sp.debut === "string" ? sp.debut : "";
  const finPerso = typeof sp.fin === "string" ? sp.fin : "";

  const { debut, fin, label } = periodeRange(periode, debutPerso, finPerso);

  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("id, date, type, categorie, montant, mode_paiement, description")
    .order("date", { ascending: false });
  const all = (data || []) as Transaction[];

  const rows = all.filter((t) => t.date >= debut && t.date <= fin);
  const totalRecettes = rows.filter((t) => t.type === "recette").reduce((s, t) => s + Number(t.montant), 0);
  const totalDepenses = rows.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.montant), 0);
  const resultat = totalRecettes - totalDepenses;
  const marge = totalRecettes > 0 ? Math.round((resultat / totalRecettes) * 100) : 0;

  function categoryTotals(list: Transaction[]) {
    const totals: Record<string, number> = {};
    list.forEach((t) => {
      totals[t.categorie] = (totals[t.categorie] || 0) + Number(t.montant);
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }
  const depensesData = categoryTotals(rows.filter((t) => t.type === "depense"));
  const recettesData = categoryTotals(rows.filter((t) => t.type === "recette"));

  const monthly = last12MonthsKeys().map((k) => {
    const list = all.filter((t) => t.date.slice(0, 7) === k);
    const r = list.filter((t) => t.type === "recette").reduce((s, t) => s + Number(t.montant), 0);
    const d = list.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.montant), 0);
    return { key: k, r, d };
  });

  const exportParams = new URLSearchParams();
  exportParams.set("periode", periode);
  if (periode === "personnalise") {
    if (debutPerso) exportParams.set("debut", debutPerso);
    if (finPerso) exportParams.set("fin", finPerso);
  }
  const exportHref = `/rapports/export?${exportParams.toString()}`;

  return (
    <div>
      <ViewHeader
        title="Rapports"
        subtitle={label}
        action={
          <a
            href={exportHref}
            className="rounded-md bg-ink-800 px-4 py-2.5 text-[13.5px] font-semibold text-paper-raised hover:bg-ink-900"
          >
            Exporter en CSV
          </a>
        }
      />

      <form method="get" className="mb-5 flex flex-wrap items-center gap-2.5">
        <select name="periode" defaultValue={periode} className={`${inputCls} w-auto`}>
          <option value="ce-mois">Ce mois-ci</option>
          <option value="mois-dernier">Mois dernier</option>
          <option value="cette-annee">Cette année</option>
          <option value="personnalise">Période personnalisée</option>
        </select>
        <input type="date" name="debut" defaultValue={debutPerso} className={`${inputCls} w-auto`} />
        <span className="text-ink-400">→</span>
        <input type="date" name="fin" defaultValue={finPerso} className={`${inputCls} w-auto`} />
        <button type="submit" className="rounded-md bg-ink-800 px-4 py-2 text-[13px] font-semibold text-paper-raised">
          Appliquer
        </button>
      </form>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total recettes" value={fmt(totalRecettes)} tone="positive" />
        <StatCard label="Total dépenses" value={fmt(totalDepenses)} tone="negative" />
        <StatCard
          label="Résultat net"
          value={(resultat >= 0 ? "+" : "") + fmt(resultat)}
          tone={resultat >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Marge" value={marge + "%"} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Dépenses par catégorie">
          <DonutChart data={depensesData} colors={DEPENSE_COLORS} />
        </Panel>
        <Panel title="Recettes par catégorie">
          <DonutChart data={recettesData} colors={RECETTE_COLORS} />
        </Panel>
      </div>

      <Panel title="Comparatif mensuel — 12 derniers mois">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr>
                <Th>Mois</Th>
                <Th right>Recettes</Th>
                <Th right>Dépenses</Th>
                <Th right>Résultat</Th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.key}>
                  <Td>{moisLabel(m.key)}</Td>
                  <Td right className="tabular-mono text-emerald-600">
                    {fmt(m.r)}
                  </Td>
                  <Td right className="tabular-mono text-brick-600">
                    {fmt(m.d)}
                  </Td>
                  <Td right className={`tabular-mono ${m.r - m.d >= 0 ? "text-emerald-600" : "text-brick-600"}`}>
                    {fmt(m.r - m.d)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
