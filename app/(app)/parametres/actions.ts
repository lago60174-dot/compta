"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type EntrepriseState = { error: string | null; success?: boolean };

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export async function updateEntreprise(_prev: EntrepriseState, formData: FormData): Promise<EntrepriseState> {
  const id = String(formData.get("id") || "");
  const nom = String(formData.get("nom") || "").trim() || "Mon Entreprise";
  const soldeInitial = Number(formData.get("soldeInitial")) || 0;

  if (!id) return { error: "Configuration introuvable. Rechargez la page." };

  const supabase = await createClient();
  const { error } = await supabase.from("entreprise").update({ nom, solde_initial: soldeInitial }).eq("id", id);

  if (error) return { error: "Erreur : " + error.message };

  revalidatePath("/parametres");
  revalidatePath("/dashboard");
  revalidatePath("/tresorerie");
  return { error: null, success: true };
}

export async function addCategorie(formData: FormData) {
  const nom = String(formData.get("nom") || "").trim();
  const type = String(formData.get("type") || "");
  if (!nom || (type !== "recette" && type !== "depense")) return;

  const supabase = await createClient();
  await supabase.from("categories").upsert({ nom, type }, { onConflict: "nom,type", ignoreDuplicates: true });

  revalidatePath("/parametres");
  revalidatePath("/transactions");
}

export async function deleteCategorie(id: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/parametres");
  revalidatePath("/transactions");
}

export async function resetDonnees() {
  const supabase = await createClient();
  await supabase.from("factures").delete().neq("id", NIL_UUID);
  await supabase.from("transactions").delete().neq("id", NIL_UUID);
  await supabase.from("previsionnel").delete().neq("id", NIL_UUID);
  await supabase.from("clients").delete().neq("id", NIL_UUID);
  await supabase.from("facture_compteur").update({ valeur: 0 }).eq("id", 1);

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/facturation");
  revalidatePath("/facturation/clients");
  revalidatePath("/tresorerie");
  revalidatePath("/rapports");
  revalidatePath("/parametres");
}
