"use client";

import { useActionState } from "react";
import { updateEntreprise, type EntrepriseState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import type { Entreprise } from "@/lib/types";

const initialState: EntrepriseState = { error: null };
const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500";
const labelCls = "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500";

export function EntrepriseForm({ entreprise }: { entreprise: Entreprise | null }) {
  const [state, formAction] = useActionState(updateEntreprise, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <input type="hidden" name="id" value={entreprise?.id || ""} />
      <label className={labelCls}>
        Nom de l&apos;entreprise
        <input type="text" name="nom" required defaultValue={entreprise?.nom || ""} className={inputCls} />
      </label>
      <label className={labelCls}>
        Solde de départ (FCFA)
        <input
          type="number"
          name="soldeInitial"
          step="1"
          defaultValue={entreprise?.solde_initial ?? 0}
          className={inputCls}
        />
      </label>

      {state.error && (
        <p className="rounded-md bg-brick-50 px-3 py-2 text-sm text-brick-700 sm:col-span-2">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
          Informations enregistrées.
        </p>
      )}

      <div className="sm:col-span-2">
        <SubmitButton>Enregistrer</SubmitButton>
      </div>
    </form>
  );
}
