"use client";

import { useActionState } from "react";
import { addPrevisionnel, type PrevisionnelState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { todayISO } from "@/lib/utils";

const initialState: PrevisionnelState = { error: null };
const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500";
const labelCls = "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500";

export function PrevisionnelForm() {
  const [state, formAction] = useActionState(addPrevisionnel, initialState);

  return (
    <form
      key={state.successId ?? "initial"}
      action={formAction}
      className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className={labelCls}>
        Date prévue
        <input type="date" name="date" required defaultValue={todayISO()} className={inputCls} />
      </label>
      <label className={labelCls}>
        Type
        <select name="type" defaultValue="recette" className={inputCls}>
          <option value="recette">Entrée attendue</option>
          <option value="depense">Sortie attendue</option>
        </select>
      </label>
      <label className={labelCls}>
        Montant (FCFA)
        <input type="number" name="montant" min="0" step="1" required className={inputCls} />
      </label>
      <label className={labelCls}>
        Description
        <input
          type="text"
          name="description"
          placeholder="Ex. paiement client attendu…"
          className={inputCls}
        />
      </label>

      {state.error && (
        <p className="col-span-full rounded-md bg-brick-50 px-3 py-2 text-sm text-brick-700">{state.error}</p>
      )}

      <div className="col-span-full">
        <SubmitButton>Ajouter</SubmitButton>
      </div>
    </form>
  );
}
