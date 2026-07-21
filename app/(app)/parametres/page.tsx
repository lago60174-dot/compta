import { createClient } from "@/lib/supabase/server";
import { ViewHeader, Panel } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { EntrepriseForm } from "./entreprise-form";
import { CategorieList } from "./categorie-list";
import { resetDonnees } from "./actions";
import type { Categorie, Entreprise } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const supabase = await createClient();
  const [{ data: entreprise }, { data: categoriesData }] = await Promise.all([
    supabase.from("entreprise").select("id, nom, solde_initial, devise").limit(1).maybeSingle(),
    supabase.from("categories").select("id, nom, type").order("nom"),
  ]);

  const categories = (categoriesData || []) as (Categorie & { id: string })[];

  return (
    <div>
      <ViewHeader title="Paramètres" subtitle="Informations de l'entreprise, catégories et données." />

      <Panel title="Entreprise">
        <EntrepriseForm entreprise={entreprise as Entreprise | null} />
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Catégories de recettes">
          <CategorieList type="recette" categories={categories.filter((c) => c.type === "recette")} />
        </Panel>
        <Panel title="Catégories de dépenses">
          <CategorieList type="depense" categories={categories.filter((c) => c.type === "depense")} />
        </Panel>
      </div>

      <Panel title="Zone de gestion des données">
        <p className="mb-3 text-sm text-ink-500">
          Ces données sont partagées avec toutes les personnes ayant accès à cet outil. La réinitialisation supprime
          définitivement les transactions, factures, clients et mouvements prévisionnels (les catégories et le nom
          de l&apos;entreprise sont conservés).
        </p>
        <form action={resetDonnees}>
          <ConfirmSubmitButton
            confirmMessage="Cette action supprimera DÉFINITIVEMENT toutes les transactions, factures, clients et mouvements prévisionnels. Continuer ?"
            className="rounded-md border border-brick-600 px-4 py-2.5 text-[13.5px] font-semibold text-brick-600 hover:bg-brick-600 hover:text-white"
          >
            Réinitialiser toutes les données
          </ConfirmSubmitButton>
        </form>
      </Panel>
    </div>
  );
}
