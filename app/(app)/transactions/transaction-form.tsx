"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { upsertTransaction, type TxState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { MODES_PAIEMENT } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const initialState: TxState = { error: null };

const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500";
const labelCls = "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500";

export interface EditingTransaction {
  id: string;
  date: string;
  type: "recette" | "depense";
  categorie: string;
  montant: number;
  mode_paiement: string;
  description: string | null;
}

export function TransactionForm({
  categories,
  editing,
  returnTo,
}: {
  categories: { recette: string[]; depense: string[] };
  editing?: EditingTransaction | null;
  returnTo: string;
}) {
  const [type, setType] = useState<"recette" | "depense">(editing?.type || "recette");
  const [state, formAction] = useActionState(upsertTransaction, initialState);
  const catOptions = categories[type];

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <input type="hidden" name="id" value={editing?.id || ""} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <label className={labelCls}>
        Date
        <input type="date" name="date" required defaultValue={editing?.date || todayISO()} className={inputCls} />
      </label>

      <label className={labelCls}>
        Type
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as "recette" | "depense")}
          className={inputCls}
        >
          <option value="recette">Recette</option>
          <option value="depense">Dépense</option>
        </select>
      </label>

      <label className={labelCls}>
        Catégorie
        {catOptions.length === 0 ? (
          <p className="rounded-md bg-gold-50 px-3 py-2 text-xs text-gold-700">
            Aucune catégorie {type === "recette" ? "de recette" : "de dépense"}. Ajoutez-en une dans Paramètres.
          </p>
        ) : (
          <select key={type} name="categorie" required defaultValue={editing?.categorie} className={inputCls}>
            {catOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </label>

      <label className={labelCls}>
        Montant (FCFA)
        <input
          type="number"
          name="montant"
          min="0"
          step="1"
          required
          defaultValue={editing?.montant ?? ""}
          className={inputCls}
        />
      </label>

      <label className={labelCls}>
        Mode de paiement
        <select name="modePaiement" defaultValue={editing?.mode_paiement || MODES_PAIEMENT[0]} className={inputCls}>
          {MODES_PAIEMENT.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>

      <label className={`${labelCls} sm:col-span-2 lg:col-span-1`}>
        Description
        <input
          type="text"
          name="description"
          placeholder="Détail de l'opération"
          defaultValue={editing?.description || ""}
          className={inputCls}
        />
      </label>

      {state.error && (
        <p className="col-span-full rounded-md bg-brick-50 px-3 py-2 text-sm text-brick-700">{state.error}</p>
      )}

      <div className="col-span-full flex gap-2.5 pt-1">
        <SubmitButton pendingLabel={editing ? "Enregistrement…" : "Ajout…"}>
          {editing ? "Enregistrer les modifications" : "Ajouter la transaction"}
        </SubmitButton>
        {editing && (
          <Link
            href={returnTo ? `/transactions?${returnTo}` : "/transactions"}
            className="rounded-md border border-line px-4 py-2.5 text-[13.5px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
          >
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}
