import { createClient } from "@/lib/supabase/server";
import { ViewHeader, Panel } from "@/components/ui";
import { FacturationTabs } from "@/components/facturation-tabs";
import { FactureForm } from "../facture-form";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NouvelleFacturePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("id, nom, telephone, adresse").order("nom");
  const clients = (data || []) as Client[];

  return (
    <div>
      <ViewHeader title="Nouvelle facture" />
      <FacturationTabs active="factures" />
      <Panel>
        <FactureForm clients={clients} />
      </Panel>
    </div>
  );
}
