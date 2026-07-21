import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ViewHeader, Panel, EmptyState, Th, Td } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { FacturationTabs } from "@/components/facturation-tabs";
import { ClientForm } from "./client-form";
import { deleteClient } from "./actions";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const editId = typeof sp.edit === "string" ? sp.edit : "";

  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("id, nom, telephone, adresse").order("nom");
  const clients = (data || []) as Client[];
  const editing = editId ? clients.find((c) => c.id === editId) || null : null;

  return (
    <div>
      <ViewHeader title="Facturation" subtitle="Gérez vos clients pour la facturation." />
      <FacturationTabs active="clients" />

      <Panel title={editing ? "Modifier le client" : "Ajouter un client"}>
        <ClientForm editing={editing} />
      </Panel>

      <Panel>
        {clients.length === 0 ? (
          <EmptyState>Aucun client enregistré pour l&apos;instant.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr>
                  <Th>Nom</Th>
                  <Th>Téléphone</Th>
                  <Th>Adresse</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <Td>{c.nom}</Td>
                    <Td>{c.telephone || "—"}</Td>
                    <Td>{c.adresse || "—"}</Td>
                    <Td>
                      <div className="flex justify-end gap-1.5 whitespace-nowrap">
                        <Link
                          href={`/facturation/clients?edit=${c.id}`}
                          className="rounded border border-line px-2 py-1 text-[11.5px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
                        >
                          Modifier
                        </Link>
                        <form action={deleteClient.bind(null, c.id)}>
                          <ConfirmSubmitButton
                            confirmMessage="Supprimer ce client ? Les factures existantes resteront mais n'afficheront plus ce client."
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
