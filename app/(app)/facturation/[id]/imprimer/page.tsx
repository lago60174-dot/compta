import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmt, fmtDate, factureTotal } from "@/lib/utils";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

type ItemRow = { designation: string; quantite: number; prix_unitaire: number; position: number };
type ClientInfo = { nom: string; telephone: string | null; adresse: string | null };

export default async function ImprimerFacturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: facture }, { data: entreprise }] = await Promise.all([
    supabase
      .from("factures")
      .select(
        "id, numero, date, echeance, statut, notes, facture_items(designation, quantite, prix_unitaire, position), clients(nom, telephone, adresse)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("entreprise").select("nom").limit(1).maybeSingle(),
  ]);

  if (!facture) notFound();

  const items = ([...((facture.facture_items || []) as ItemRow[])]).sort((a, b) => a.position - b.position);
  const client = facture.clients as ClientInfo | null;
  const total = factureTotal({ facture_items: items });

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-ink-800 print:p-0">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="mb-8 flex items-start justify-between border-b-2 border-ink-800 pb-4">
        <div>
          <h1 className="font-display text-xl font-semibold">{entreprise?.nom || "Mon Entreprise"}</h1>
          <p className="mt-1 text-sm text-ink-500">Facture {facture.numero}</p>
        </div>
        <div className="text-right text-sm text-ink-600">
          <p>Date : {fmtDate(facture.date)}</p>
          <p>Échéance : {facture.echeance ? fmtDate(facture.echeance) : "—"}</p>
          <p>Statut : {facture.statut}</p>
        </div>
      </div>

      <div className="mb-6 text-sm">
        <p className="font-semibold text-ink-800">Facturé à :</p>
        <p>{client?.nom || "Client"}</p>
        {client?.telephone && <p>{client.telephone}</p>}
        {client?.adresse && <p>{client.adresse}</p>}
      </div>

      <table className="mb-6 w-full text-sm">
        <thead>
          <tr>
            <th className="border-b border-ink-300 py-2 text-left font-medium">Désignation</th>
            <th className="border-b border-ink-300 py-2 text-right font-medium">Qté</th>
            <th className="border-b border-ink-300 py-2 text-right font-medium">Prix unitaire</th>
            <th className="border-b border-ink-300 py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx}>
              <td className="border-b border-line-soft py-2">{i.designation}</td>
              <td className="border-b border-line-soft py-2 text-right">{i.quantite}</td>
              <td className="border-b border-line-soft py-2 text-right">{fmt(i.prix_unitaire)}</td>
              <td className="border-b border-line-soft py-2 text-right">{fmt(i.quantite * i.prix_unitaire)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="border-t-2 border-ink-800 py-2 font-semibold">
              Total
            </td>
            <td className="border-t-2 border-ink-800 py-2 text-right font-semibold">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>

      {facture.notes && <p className="text-sm text-ink-600">{facture.notes}</p>}
    </div>
  );
}
