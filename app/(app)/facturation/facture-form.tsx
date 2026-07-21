"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { upsertFacture, type FactureState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { STATUTS_FACTURE } from "@/lib/types";
import type { Client } from "@/lib/types";
import { fmt, todayISO } from "@/lib/utils";

const initialState: FactureState = { error: null };

const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500";
const labelCls = "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500";

interface ItemDraft {
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

export interface EditingFacture {
  id: string;
  client_id: string | null;
  date: string;
  echeance: string | null;
  statut: string;
  notes: string | null;
  items: ItemDraft[];
}

export function FactureForm({
  clients,
  editing,
}: {
  clients: Client[];
  editing?: EditingFacture | null;
}) {
  const [items, setItems] = useState<ItemDraft[]>(
    editing?.items?.length ? editing.items : [{ designation: "", quantite: 1, prixUnitaire: 0 }]
  );
  const [state, formAction] = useActionState(upsertFacture, initialState);

  const total = items.reduce((s, i) => s + (Number(i.quantite) || 0) * (Number(i.prixUnitaire) || 0), 0);

  function updateItem(index: number, field: keyof ItemDraft, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: field === "designation" ? value : Number(value) };
      return next;
    });
  }
  function addItem() {
    setItems((prev) => [...prev, { designation: "", quantite: 1, prixUnitaire: 0 }]);
  }
  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={editing?.id || ""} />
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <label className={labelCls}>
          Client
          <select name="clientId" required defaultValue={editing?.client_id || ""} className={inputCls}>
            <option value="">— Sélectionner —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Date
          <input type="date" name="date" required defaultValue={editing?.date || todayISO()} className={inputCls} />
        </label>
        <label className={labelCls}>
          Échéance
          <input type="date" name="echeance" defaultValue={editing?.echeance || ""} className={inputCls} />
        </label>
        <label className={labelCls}>
          Statut
          <select name="statut" defaultValue={editing?.statut || "Brouillon"} className={inputCls}>
            {STATUTS_FACTURE.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {clients.length === 0 && (
        <p className="rounded-md bg-gold-50 px-3 py-2 text-sm text-gold-700">
          Aucun client enregistré.{" "}
          <Link href="/facturation/clients" className="underline">
            Ajoutez-en un d&apos;abord →
          </Link>
        </p>
      )}

      <div>
        <h3 className="mb-2 font-display text-sm font-semibold text-ink-800">Lignes de facturation</h3>
        <div className="mb-1 hidden grid-cols-[2.4fr_0.7fr_1fr_1fr_32px] gap-2 px-1 text-[11px] uppercase tracking-wide text-ink-500 sm:grid">
          <span>Désignation</span>
          <span>Qté</span>
          <span>Prix unitaire</span>
          <span>Total</span>
          <span />
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 rounded-md bg-paper p-2.5 sm:grid-cols-[2.4fr_0.7fr_1fr_1fr_32px] sm:items-center sm:bg-transparent sm:p-0"
            >
              <input
                type="text"
                value={item.designation}
                onChange={(e) => updateItem(index, "designation", e.target.value)}
                placeholder="Ex. Prestation de conseil"
                className={inputCls}
              />
              <input
                type="number"
                min="0"
                step="1"
                value={item.quantite}
                onChange={(e) => updateItem(index, "quantite", e.target.value)}
                className={inputCls}
              />
              <input
                type="number"
                min="0"
                step="1"
                value={item.prixUnitaire}
                onChange={(e) => updateItem(index, "prixUnitaire", e.target.value)}
                className={inputCls}
              />
              <span className="tabular-mono flex items-center px-1 text-sm text-ink-700">
                {fmt((Number(item.quantite) || 0) * (Number(item.prixUnitaire) || 0))}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label="Supprimer la ligne"
                className="flex h-9 w-9 items-center justify-center justify-self-start rounded-md border border-line text-ink-500 hover:border-brick-600 hover:text-brick-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2.5 rounded-md border border-line px-3.5 py-2 text-[13px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
        >
          + Ajouter une ligne
        </button>
      </div>

      <div className="flex items-baseline justify-end gap-3 border-t-2 border-ink-800 pt-3.5">
        <span className="text-base font-semibold text-ink-800">Total</span>
        <span className="tabular-mono text-xl font-semibold text-ink-800">{fmt(total)}</span>
      </div>

      <label className={labelCls}>
        Notes (optionnel)
        <textarea name="notes" rows={2} defaultValue={editing?.notes || ""} className={inputCls} />
      </label>

      {state.error && <p className="rounded-md bg-brick-50 px-3 py-2 text-sm text-brick-700">{state.error}</p>}

      <div className="flex gap-2.5">
        <SubmitButton>{editing ? "Enregistrer la facture" : "Créer la facture"}</SubmitButton>
        <Link
          href="/facturation"
          className="rounded-md border border-line px-4 py-2.5 text-[13.5px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
