"use client";

import { useActionState } from "react";
import Link from "next/link";
import { upsertClient, type ClientState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: ClientState = { error: null };
const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500";
const labelCls = "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500";

export interface EditingClient {
  id: string;
  nom: string;
  telephone: string | null;
  adresse: string | null;
}

export function ClientForm({ editing }: { editing?: EditingClient | null }) {
  const [state, formAction] = useActionState(upsertClient, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <input type="hidden" name="id" value={editing?.id || ""} />
      <label className={labelCls}>
        Nom / raison sociale
        <input type="text" name="nom" required defaultValue={editing?.nom || ""} className={inputCls} />
      </label>
      <label className={labelCls}>
        Téléphone
        <input type="text" name="telephone" defaultValue={editing?.telephone || ""} className={inputCls} />
      </label>
      <label className={`${labelCls} sm:col-span-2`}>
        Adresse
        <input type="text" name="adresse" defaultValue={editing?.adresse || ""} className={inputCls} />
      </label>

      {state.error && (
        <p className="rounded-md bg-brick-50 px-3 py-2 text-sm text-brick-700 sm:col-span-2">{state.error}</p>
      )}

      <div className="flex gap-2.5 sm:col-span-2">
        <SubmitButton>{editing ? "Enregistrer" : "Ajouter le client"}</SubmitButton>
        {editing && (
          <Link
            href="/facturation/clients"
            className="rounded-md border border-line px-4 py-2.5 text-[13.5px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
          >
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}
