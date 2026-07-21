import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ViewHeader, Panel } from "@/components/ui";
import { FacturationTabs } from "@/components/facturation-tabs";
import { FactureForm, type EditingFacture } from "../facture-form";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ModifierFacturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: facture }, { data: clientsData }] = await Promise.all([
    supabase
      .from("factures")
      .select("id, client_id, date, echeance, statut, notes, facture_items(designation, quantite, prix_unitaire, position)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("clients").select("id, nom, telephone, adresse").order("nom"),
  ]);

  if (!facture) notFound();

  const rawItems = (facture.facture_items || []) as {
    designation: string;
    quantite: number;
    prix_unitaire: number;
    position: number;
  }[];

  const editing: EditingFacture = {
    id: facture.id,
    client_id: facture.client_id,
    date: facture.date,
    echeance: facture.echeance,
    statut: facture.statut,
    notes: facture.notes,
    items: [...rawItems]
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ designation: i.designation, quantite: i.quantite, prixUnitaire: i.prix_unitaire })),
  };

  const clients = (clientsData || []) as Client[];

  return (
    <div>
      <ViewHeader title="Modifier la facture" />
      <FacturationTabs active="factures" />
      <Panel>
        <FactureForm clients={clients} editing={editing} />
      </Panel>
    </div>
  );
}
