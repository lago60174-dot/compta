"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type TxState = { error: string | null };

function revalidateAll() {
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/rapports");
  revalidatePath("/tresorerie");
}

export async function upsertTransaction(_prev: TxState, formData: FormData): Promise<TxState> {
  const id = String(formData.get("id") || "");
  const date = String(formData.get("date") || "");
  const type = String(formData.get("type") || "");
  const categorie = String(formData.get("categorie") || "").trim();
  const montant = Number(formData.get("montant"));
  const modePaiement = String(formData.get("modePaiement") || "Espèces");
  const description = String(formData.get("description") || "").trim();
  const returnTo = String(formData.get("returnTo") || "");

  if (
    !date ||
    !categorie ||
    !Number.isFinite(montant) ||
    montant <= 0 ||
    (type !== "recette" && type !== "depense")
  ) {
    return { error: "Merci de renseigner une date, une catégorie et un montant valide." };
  }

  const supabase = await createClient();
  const payload = {
    date,
    type,
    categorie,
    montant,
    mode_paiement: modePaiement,
    description: description || null,
  };

  const { error } = id
    ? await supabase.from("transactions").update(payload).eq("id", id)
    : await supabase.from("transactions").insert(payload);

  if (error) {
    return { error: "Erreur lors de l'enregistrement : " + error.message };
  }

  revalidateAll();
  redirect(returnTo ? `/transactions?${returnTo}` : "/transactions");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id);
  revalidateAll();
}
