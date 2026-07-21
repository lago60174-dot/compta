import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filet de sécurité en plus de proxy.ts.
  if (!user) redirect("/login");

  const { data: entreprise } = await supabase
    .from("entreprise")
    .select("nom")
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col md:flex-row print:block">
      <Sidebar entrepriseNom={entreprise?.nom || "Mon Entreprise"} userEmail={user.email ?? ""} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8 print:p-0">{children}</main>
    </div>
  );
}
