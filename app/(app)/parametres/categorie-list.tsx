import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { addCategorie, deleteCategorie } from "./actions";

export function CategorieList({
  type,
  categories,
}: {
  type: "recette" | "depense";
  categories: { id: string; nom: string }[];
}) {
  return (
    <div>
      <ul className="mb-3.5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-2 rounded-full border border-line-soft bg-paper py-1 pl-3.5 pr-1.5 text-[13px]"
          >
            {c.nom}
            <form action={deleteCategorie.bind(null, c.id)}>
              <ConfirmSubmitButton
                confirmMessage={`Supprimer la catégorie « ${c.nom} » ?`}
                className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] text-ink-500 hover:bg-brick-50 hover:text-brick-600"
              >
                ✕
              </ConfirmSubmitButton>
            </form>
          </li>
        ))}
        {categories.length === 0 && <li className="text-sm italic text-ink-400">Aucune catégorie.</li>}
      </ul>
      <form action={addCategorie} className="flex gap-2">
        <input type="hidden" name="type" value={type} />
        <input
          type="text"
          name="nom"
          required
          placeholder="Nouvelle catégorie…"
          className="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500"
        />
        <button
          type="submit"
          className="rounded-md border border-line px-3.5 py-2 text-[13px] text-ink-500 hover:border-ink-800 hover:text-ink-800"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
