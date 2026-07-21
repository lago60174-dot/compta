"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FactureState = { error: string | null };

interface ItemInput {
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

function revalidateAll() {
  revalidatePath("/facturation");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/tresorerie");
  revalidatePath("/rapports");
}

export async function upsertFacture(_prev: FactureState, formData: FormData): Promise<FactureState> {
  const id = String(formData.get("id") || "") || null;
  const clientId = String(formData.get("clientId") || "") || null;
  const date = String(formData.get("date") || "");
  const echeance = String(formData.get("echeance") || "") || null;
  const statut = String(formData.get("statut") || "Brouillon");
  const notes = String(formData.get("notes") || "").trim() || null;

  let rawItems: ItemInput[] = [];
  try {
    rawItems = JSON.parse(String(formData.get("itemsJson") || "[]"));
  } catch {
    rawItems = [];
  }

  const items = rawItems
    .map((i) => ({
      designation: String(i.designation || "").trim(),
      quantite: Number(i.quantite) || 0,
      prixUnitaire: Number(i.prixUnitaire) || 0,
    }))
    .filter((i) => i.designation !== "");

  if (!clientId) return { error: "Sélectionnez un client." };
  if (!date) return { error: "La date est requise." };
  if (items.length === 0) return { error: "Ajoutez au moins une ligne avec une désignation." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("upsert_facture_with_items", {
    p_id: id,
    p_client_id: clientId,
    p_date: date,
    p_echeance: echeance,
    p_statut: statut,
    p_notes: notes,
    p_items: items,
  });

  if (error) {
    return { error: "Erreur lors de l'enregistrement : " + error.message };
  }

  revalidateAll();
  redirect("/facturation");
}

export async function deleteFacture(id: string) {
  const supabase = await createClient();
  await supabase.from("factures").delete().eq("id", id);
  revalidateAll();
}

export async function marquerPayee(id: string) {
  const supabase = await createClient();
  await supabase.rpc("marquer_facture_payee", { p_facture_id: id, p_mode_paiement: "Virement bancaire" });
  revalidateAll();
}
