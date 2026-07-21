import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/utils";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("date, type, categorie, montant, mode_paiement, description")
    .order("date", { ascending: false });

  const type = searchParams.get("type");
  const debut = searchParams.get("debut");
  const fin = searchParams.get("fin");
  const q = searchParams.get("q");

  if (type) query = query.eq("type", type);
  if (debut) query = query.gte("date", debut);
  if (fin) query = query.lte("date", fin);
  if (q) query = query.or(`description.ilike.%${q}%,categorie.ilike.%${q}%`);

  const { data } = await query;
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
      "Content-Disposition": 'attachment; filename="transactions.csv"',
    },
  });
}
