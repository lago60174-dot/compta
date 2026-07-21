

export function fmt(n: number | null | undefined): string {
  const rounded = Math.round(Number(n) || 0);
  return rounded.toLocaleString("fr-FR") + " FCFA";
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fmtDateCourt(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

// Construit une date locale "YYYY-MM-DD" sans décalage de fuseau horaire
// (évite le piège classique de toISOString() qui convertit en UTC).
export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function moisLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return capitalize(d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));
}

export function moisLabelCourt(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return capitalize(d.toLocaleDateString("fr-FR", { month: "short" }));
}

export function last6MonthsKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export function last12MonthsKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export type Periode = "ce-mois" | "mois-dernier" | "cette-annee" | "personnalise";

export function periodeRange(
  periode: Periode,
  debutPerso?: string,
  finPerso?: string
): { debut: string; fin: string; label: string } {
  const now = new Date();

  if (periode === "ce-mois") {
    const debut = toISO(new Date(now.getFullYear(), now.getMonth(), 1));
    const fin = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    const label =
      "Ce mois-ci — " +
      capitalize(now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));
    return { debut, fin, label };
  }

  if (periode === "mois-dernier") {
    const debut = toISO(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const fin = toISO(new Date(now.getFullYear(), now.getMonth(), 0));
    const refDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const label =
      "Mois dernier — " +
      capitalize(refDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));
    return { debut, fin, label };
  }

  if (periode === "cette-annee") {
    const debut = toISO(new Date(now.getFullYear(), 0, 1));
    const fin = toISO(new Date(now.getFullYear(), 11, 31));
    return { debut, fin, label: "Année " + now.getFullYear() };
  }

  return {
    debut: debutPerso || todayISO(),
    fin: finPerso || todayISO(),
    label: "Période personnalisée",
  };
}

export function factureTotal(facture: {
  facture_items: { quantite: number; prix_unitaire: number }[];
}): number {
  return facture.facture_items.reduce(
    (s, i) => s + Number(i.quantite) * Number(i.prix_unitaire),
    0
  );
}

export function statutBadgeClass(statut: string): string {
  if (statut === "Payée") return "bg-emerald-50 text-emerald-700";
  if (statut === "En retard") return "bg-brick-50 text-brick-700";
  if (statut === "Envoyée") return "bg-steel-50 text-steel-700";
  return "bg-ink-100 text-ink-500";
}
