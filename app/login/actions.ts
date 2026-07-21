"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthState = { error: string | null; message: string | null };

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Merci de renseigner votre email et votre mot de passe.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error: "Identifiants incorrects. Vérifiez votre email et votre mot de passe.",
      message: null,
    };
  }

  redirect("/dashboard");
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Merci de renseigner un email et un mot de passe.", message: null };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message, message: null };
  }

  return {
    error: null,
    message:
      "Compte créé. Si la confirmation par email est activée sur votre projet Supabase, vérifiez votre boîte mail avant de vous connecter. Sinon, vous pouvez vous connecter directement.",
  };
}
