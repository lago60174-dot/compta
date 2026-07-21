"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { todayISO } from "@/lib/utils";

export type PrevisionnelState = { error: string | null; successId?: number };

export async function addPrevisionnel(
  prev: PrevisionnelState,
  formData: FormData
): Promise<PrevisionnelState> {
  const date = String(formData.get("date") || "");
  const type = String(formData.get("type") || "");
  const montant = Number(formData.get("montant"));
  const description = String(formData.get("description") || "").trim() || null;

  if (!date || !Number.isFinite(montant) || montant <= 0 || (type !== "recette" && type !== "depense")) {
    return { error: "Merci de renseigner une date et un montant valide.", successId: prev.successId };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("previsionnel").insert({ date, type, montant, description });

  if (error) {
    return { error: "Erreur lors de l'enregistrement : " + error.message, successId: prev.successId };
  }

  revalidatePath("/tresorerie");
  return { error: null, successId: Date.now() };
}

export async function deletePrevisionnel(id: string) {
  const supabase = await createClient();
  await supabase.from("previsionnel").delete().eq("id", id);
  revalidatePath("/tresorerie");
}

export async function realizePrevisionnel(id: string) {
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("previsionnel")
    .select("type, montant, description")
    .eq("id", id)
    .maybeSingle();

  if (p) {
    await supabase.from("transactions").insert({
      date: todayISO(),
      type: p.type,
      categorie: p.type === "recette" ? "Autres recettes" : "Autres dépenses",
      montant: p.montant,
      mode_paiement: "Espèces",
      description: p.description || "Mouvement prévisionnel réalisé",
    });
    await supabase.from("previsionnel").delete().eq("id", id);
  }

  revalidatePath("/tresorerie");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/rapports");
}
