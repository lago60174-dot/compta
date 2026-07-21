import { createClient } from "@/lib/supabase/server";
import { fmtDate, periodeRange, type Periode } from "@/lib/utils";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const periode = (searchParams.get("periode") || "ce-mois") as Periode;
  const debutPerso = searchParams.get("debut") || "";
  const finPerso = searchParams.get("fin") || "";
  const { debut, fin } = periodeRange(periode, debutPerso, finPerso);

  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("date, type, categorie, montant, mode_paiement, description")
    .gte("date", debut)
    .lte("date", fin)
    .order("date", { ascending: false });

  const rows = (data || []) as {
    date: string;
    type: string;
    categorie: string;
    montant: number;
    mode_paiement: string;
    description: string | null;
  }[];

  const header = ["Date", "Type", "Catégorie", "Description", "Mode de paiement", "Montant (FCFA)"];
  const lines = [
    header,
    ...rows.map((t) => [
      fmtDate(t.date),
      t.type === "recette" ? "Recette" : "Dépense",
      t.categorie,
      t.description || "",
      t.mode_paiement,
      String(t.montant),
    ]),
  ];
  const csv = lines.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rapport-financier.csv"',
    },
  });
}
