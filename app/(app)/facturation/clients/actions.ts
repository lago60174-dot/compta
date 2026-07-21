"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ClientState = { error: string | null };

export async function upsertClient(_prev: ClientState, formData: FormData): Promise<ClientState> {
  const id = String(formData.get("id") || "") || null;
  const nom = String(formData.get("nom") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim() || null;
  const adresse = String(formData.get("adresse") || "").trim() || null;

  if (!nom) return { error: "Le nom du client est requis." };

  const supabase = await createClient();
  const payload = { nom, telephone, adresse };

  const { error } = id
    ? await supabase.from("clients").update(payload).eq("id", id)
    : await supabase.from("clients").insert(payload);

  if (error) return { error: "Erreur lors de l'enregistrement : " + error.message };

  revalidatePath("/facturation/clients");
  revalidatePath("/facturation");
  redirect("/facturation/clients");
}

export async function deleteClient(id: string) {
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", id);
  revalidatePath("/facturation/clients");
  revalidatePath("/facturation");
}
