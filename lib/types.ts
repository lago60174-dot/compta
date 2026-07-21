export type TypeMouvement = "recette" | "depense";
export type StatutFacture = "Brouillon" | "Envoyée" | "Payée" | "En retard";

export const MODES_PAIEMENT = [
  "Espèces",
  "Mobile Money",
  "Virement bancaire",
  "Chèque",
] as const;

export const STATUTS_FACTURE: StatutFacture[] = [
  "Brouillon",
  "Envoyée",
  "Payée",
  "En retard",
];

export interface Entreprise {
  id: string;
  nom: string;
  solde_initial: number;
  devise: string;
}

export interface Categorie {
  id: string;
  nom: string;
  type: TypeMouvement;
}

export interface Client {
  id: string;
  nom: string;
  telephone: string | null;
  adresse: string | null;
}

export interface Transaction {
  id: string;
  date: string;
  type: TypeMouvement;
  categorie: string;
  montant: number;
  mode_paiement: string;
  description: string | null;
}

export interface FactureItem {
  id: string;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  position: number;
}

export interface Facture {
  id: string;
  numero: string;
  client_id: string | null;
  date: string;
  echeance: string | null;
  statut: StatutFacture;
  notes: string | null;
  facture_items: FactureItem[];
  clients: Client | null;
}

export interface Previsionnel {
  id: string;
  date: string;
  type: TypeMouvement;
  montant: number;
  description: string | null;
}
