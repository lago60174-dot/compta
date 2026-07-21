import Link from "next/link";
import { Icon } from "@/components/icons";
import LedgerPreview from "@/components/landing/ledger-preview";

const MODULES = [
  {
    key: "dashboard",
    title: "Tableau de bord",
    desc: "Le solde, les recettes et les dépenses du mois, et les factures en attente, en un coup d'œil.",
    border: "border-t-ink-800",
    icon: "dashboard",
  },
  {
    key: "transactions",
    title: "Transactions",
    desc: "Chaque recette et dépense enregistrée, filtrée, et exportée en CSV en un clic.",
    border: "border-t-emerald-600",
    icon: "transactions",
  },
  {
    key: "facturation",
    title: "Facturation",
    desc: "Factures numérotées automatiquement, clients suivis, paiements marqués sans ressaisie.",
    border: "border-t-gold-600",
    icon: "facturation",
  },
  {
    key: "tresorerie",
    title: "Trésorerie",
    desc: "Le solde par mode de paiement, les mouvements à venir, et leur effet sur le solde projeté.",
    border: "border-t-steel-600",
    icon: "tresorerie",
  },
  {
    key: "rapports",
    title: "Rapports",
    desc: "Les mois comparés, les dépenses réparties par catégorie, le tout exportable.",
    border: "border-t-brick-600",
    icon: "rapports",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Créer l'espace",
    desc: "Un projet Supabase gratuit et le script fourni suffisent : tables, sécurité et numérotation des factures sont prêts en quelques minutes.",
  },
  {
    n: "02",
    title: "Inviter l'équipe",
    desc: "Chaque membre crée son compte. Les données sont partagées — pas de cloisonnement, c'est un outil d'équipe.",
  },
  {
    n: "03",
    title: "Piloter les finances",
    desc: "Recettes, factures, trésorerie et rapports à jour, accessibles depuis n'importe où une fois déployé.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* HERO */}
      <header className="bg-ink-900 text-paper-raised">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-600 font-display text-sm font-bold text-ink-900">
              GL
            </span>
            <span className="font-display text-[15px] font-semibold">Grand Livre</span>
          </div>
          <Link href="/login" className="text-sm text-white/70 transition-colors hover:text-white">
            Se connecter →
          </Link>
        </nav>

        <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-6 md:grid-cols-[1fr_360px] md:items-center md:gap-10 md:px-10 md:pb-28 md:pt-10">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-white/50">
              Outil interne de gestion financière
            </p>
            <h1 className="max-w-lg text-balance font-display text-[2.3rem] font-semibold leading-[1.12] md:text-[3rem]">
              Le grand livre de l&apos;entreprise, <em className="text-gold-500">à jour, chaque jour</em>.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">
              Recettes, dépenses, facturation et trésorerie réunies dans un seul outil, partagé par toute
              l&apos;équipe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login?vue=creer"
                className="rounded-md bg-gold-600 px-5 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-gold-500"
              >
                Créer un compte
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
              >
                Se connecter
              </Link>
            </div>
          </div>

          <div className="md:pr-8">
            <LedgerPreview />
          </div>
        </div>
      </header>

      {/* MODULES */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-400">
          Cinq modules, un seul registre
        </p>
        <h2 className="mb-10 max-w-xl font-display text-2xl font-semibold text-ink-800 md:text-[28px]">
          Tout ce qu&apos;il faut pour tenir les comptes, rien de superflu.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map((m) => (
            <div
              key={m.key}
              className={`rounded-card border border-line-soft border-t-[3px] ${m.border} bg-paper-raised p-5`}
            >
              <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-ink-700">
                <Icon name={m.icon} />
              </span>
              <h3 className="mb-1.5 font-display text-[15px] font-semibold text-ink-800">{m.title}</h3>
              <p className="text-[13px] leading-relaxed text-ink-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISE EN ROUTE */}
      <section className="border-y border-line-soft bg-paper-raised px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-400">Mise en route</p>
          <h2 className="mb-10 max-w-xl font-display text-2xl font-semibold text-ink-800 md:text-[28px]">
            Trois étapes, et l&apos;équipe travaille sur les mêmes chiffres.
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="font-display text-3xl font-semibold text-gold-600">{s.n}</span>
                <h3 className="mb-1.5 mt-3 font-display text-[16px] font-semibold text-ink-800">{s.title}</h3>
                <p className="text-[13px] leading-relaxed text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="bg-ink-900 px-6 py-20 text-center text-paper-raised md:px-10">
        <h2 className="mx-auto max-w-lg text-balance font-display text-[1.75rem] font-semibold md:text-[2.1rem]">
          Prêt à tenir vos comptes à jour ?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-white/60">
          Créez un compte pour votre équipe, ou connectez-vous si vous en avez déjà un.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/login?vue=creer"
            className="rounded-md bg-gold-600 px-5 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-gold-500"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-ink-400 md:flex-row">
          <span className="font-display text-ink-600">Grand Livre</span>
          <span className="font-mono">Gestion financière d&apos;équipe · Next.js &amp; Supabase</span>
        </div>
      </footer>
    </div>
  );
}
