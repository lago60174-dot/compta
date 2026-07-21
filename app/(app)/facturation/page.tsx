import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ViewHeader, Panel, EmptyState, Th, Td } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { FacturationTabs } from "@/components/facturation-tabs";
import { deleteFacture, marquerPayee } from "./actions";
import { fmt, fmtDate, factureTotal, statutBadgeClass } from "@/lib/utils";

export const dynamic = "force-dynamic";

type FactureRow = {
  id: string;
  numero: string;
  date: string;
  echeance: string | null;
  statut: string;
  facture_items: { quantite: number; prix_unitaire: number }[];
  clients: { nom: string } | null;
};

export default async function FacturationPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("factures")
    .select("id, numero, date, echeance, statut, facture_items(quantite, prix_unitaire), clients(nom)")
    .order("date", { ascending: false });

  const factures = (data || []) as unknown as FactureRow[];

  return (
    <div>
      <ViewHeader
        title="Facturation"
        subtitle="Devis, factures et suivi des paiements clients."
        action={
          <Link
            href="/facturation/nouvelle"
            className="rounded-md bg-ink-800 px-4 py-2.5 text-[13.5px] font-semibold text-paper-raised hover:bg-ink-900"
          >
            + Nouvelle facture
          </Link>
        }
      />
      <FacturationTabs active="factures" />

      <Panel>
        {factures.length === 0 ? (
          <EmptyState>
            Aucune facture pour l&apos;instant. Cliquez sur « + Nouvelle facture » pour créer la première.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr>
                  <Th>N°</Th>
                  <Th>Client</Th>
                  <Th>Date</Th>
                  <Th>Échéance</Th>
                  <Th>Statut</Th>
                  <Th right>Montant</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {factures.map((f) => (
                  <tr key={f.id}>
                    <Td className="tabular-mono">{f.numero}</Td>
                    <Td>{f.clients?.nom || "—"}</Td>
                    <Td>{fmtDate(f.date)}</Td>
                    <Td>{f.echeance ? fmtDate(f.echeance) : "—"}</Td>
                    <Td>
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${statutBadgeClass(
                          f.statut
                        )}`}
                      >
                        {f.statut}
                      </span>
                    </Td>
                    <Td right className="tabular-mono">
                      {fmt(factureTotal(f))}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {f.statut !== "Payée" && (
                          <form action={marquerPayee.bind(null, f.id)}>
                            <ConfirmSubmitButton
                              confirmMessage="Confirmez-vous le paiement de cette facture ? Une recette sera automatiquement ajoutée aux transactions."
                              className="whitespace-nowrap rounded border border-emerald-600 px-2 py-1 text-[11.5px] text-emerald-700 hover:bg-emerald-600 hover:text-white"
                            >
                              Marquer payée
                            </ConfirmSubmitButton>
                          </form>
                        )}
                        <Link
                          href={`/facturation/${f.id}`}
                          className="whitespace-nowrap rounded border border-line px-2 py-1 text-[11.5px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
                        >
                          Modifier
                        </Link>
                        <Link
                          href={`/facturation/${f.id}/imprimer`}
                          target="_blank"
                          className="whitespace-nowrap rounded border border-line px-2 py-1 text-[11.5px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
                        >
                          Imprimer
                        </Link>
                        <form action={deleteFacture.bind(null, f.id)}>
                          <ConfirmSubmitButton
                            confirmMessage="Supprimer définitivement cette facture ?"
                            className="whitespace-nowrap rounded border border-line px-2 py-1 text-[11.5px] text-ink-500 hover:border-brick-600 hover:text-brick-600"
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
