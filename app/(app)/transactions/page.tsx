import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ViewHeader, Panel, EmptyState, Badge, Th, Td } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { TransactionForm, type EditingTransaction } from "./transaction-form";
import { deleteTransaction } from "./actions";
import { fmt, fmtDate } from "@/lib/utils";
import type { Transaction, Categorie } from "@/lib/types";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const typeFilter = typeof sp.type === "string" ? sp.type : "";
  const debut = typeof sp.debut === "string" ? sp.debut : "";
  const fin = typeof sp.fin === "string" ? sp.fin : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const editId = typeof sp.edit === "string" ? sp.edit : "";

  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("id, date, type, categorie, montant, mode_paiement, description")
    .order("date", { ascending: false });

  if (typeFilter) query = query.eq("type", typeFilter);
  if (debut) query = query.gte("date", debut);
  if (fin) query = query.lte("date", fin);
  if (q) query = query.or(`description.ilike.%${q}%,categorie.ilike.%${q}%`);

  const [{ data: transactions }, { data: categoriesData }] = await Promise.all([
    query,
    supabase.from("categories").select("nom, type").order("nom"),
  ]);

  const editing = editId
    ? ((
        await supabase
          .from("transactions")
          .select("id, date, type, categorie, montant, mode_paiement, description")
          .eq("id", editId)
          .maybeSingle()
      ).data as EditingTransaction | null)
    : null;

  const rows = (transactions || []) as Transaction[];
  const categoriesList = (categoriesData || []) as Categorie[];
  const categories = {
    recette: categoriesList.filter((c) => c.type === "recette").map((c) => c.nom),
    depense: categoriesList.filter((c) => c.type === "depense").map((c) => c.nom),
  };

  const totalRecettes = rows.filter((t) => t.type === "recette").reduce((s, t) => s + Number(t.montant), 0);
  const totalDepenses = rows.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.montant), 0);

  const params = new URLSearchParams();
  if (typeFilter) params.set("type", typeFilter);
  if (debut) params.set("debut", debut);
  if (fin) params.set("fin", fin);
  if (q) params.set("q", q);
  const returnTo = params.toString();
  const exportHref = returnTo ? `/transactions/export?${returnTo}` : "/transactions/export";
  const editHref = (id: string) => `/transactions?${returnTo ? returnTo + "&" : ""}edit=${id}`;

  return (
    <div>
      <ViewHeader
        title="Transactions"
        subtitle="Enregistrez chaque recette et chaque dépense au fil de l'eau."
        action={
          <a
            href={exportHref}
            className="rounded-md bg-ink-800 px-4 py-2.5 text-[13.5px] font-semibold text-paper-raised hover:bg-ink-900"
          >
            Exporter en CSV
          </a>
        }
      />

      <Panel title={editing ? "Modifier la transaction" : "Nouvelle transaction"}>
        <TransactionForm categories={categories} editing={editing} returnTo={returnTo} />
      </Panel>

      <Panel>
        <form method="get" className="mb-4 flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher une description ou catégorie…"
            className={`${inputCls} min-w-[220px] flex-1`}
          />
          <select name="type" defaultValue={typeFilter} className={`${inputCls} w-auto`}>
            <option value="">Tous types</option>
            <option value="recette">Recettes</option>
            <option value="depense">Dépenses</option>
          </select>
          <input type="date" name="debut" defaultValue={debut} className={`${inputCls} w-auto`} />
          <span className="text-ink-400">→</span>
          <input type="date" name="fin" defaultValue={fin} className={`${inputCls} w-auto`} />
          <button type="submit" className="rounded-md bg-ink-800 px-4 py-2 text-[13px] font-semibold text-paper-raised">
            Filtrer
          </button>
          <Link
            href="/transactions"
            className="rounded-md border border-line px-4 py-2 text-[13px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
          >
            Réinitialiser
          </Link>
        </form>

        <p className="mb-3 text-[13px] text-ink-500">
          {rows.length} opération{rows.length > 1 ? "s" : ""} — Recettes :{" "}
          <span className="tabular-mono text-emerald-600">{fmt(totalRecettes)}</span> · Dépenses :{" "}
          <span className="tabular-mono text-brick-600">{fmt(totalDepenses)}</span>
        </p>

        {rows.length === 0 ? (
          <EmptyState>Aucune transaction ne correspond à ces critères.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Type</Th>
                  <Th>Catégorie</Th>
                  <Th>Description</Th>
                  <Th>Mode</Th>
                  <Th right>Montant</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <Td>{fmtDate(t.date)}</Td>
                    <Td>
                      <Badge tone={t.type === "recette" ? "positive" : "negative"}>
                        {t.type === "recette" ? "Recette" : "Dépense"}
                      </Badge>
                    </Td>
                    <Td>{t.categorie}</Td>
                    <Td>{t.description || "—"}</Td>
                    <Td>{t.mode_paiement}</Td>
                    <Td
                      right
                      className={`tabular-mono ${t.type === "recette" ? "text-emerald-600" : "text-brick-600"}`}
                    >
                      {t.type === "recette" ? "+" : "-"}
                      {fmt(t.montant)}
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1.5 whitespace-nowrap">
                        <Link
                          href={editHref(t.id)}
                          className="rounded border border-line px-2 py-1 text-[11.5px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
                        >
                          Modifier
                        </Link>
                        <form action={deleteTransaction.bind(null, t.id)}>
                          <ConfirmSubmitButton
                            confirmMessage="Supprimer définitivement cette transaction ?"
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
    </div>
  );
}
