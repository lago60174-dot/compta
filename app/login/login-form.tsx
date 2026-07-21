"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "./actions";

const initialState: AuthState = { error: null, message: null };

export default function LoginForm() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signup, initialState);

  const tabBtn = (active: boolean) =>
    `flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
      active ? "bg-ink-800 text-paper-raised" : "text-ink-500 hover:text-ink-800"
    }`;

  const inputCls =
    "w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500";

  return (
    <div>
      <div className="flex gap-1 rounded-lg bg-ink-50 p-1 mb-6">
        <button type="button" onClick={() => setTab("login")} className={tabBtn(tab === "login")}>
          Se connecter
        </button>
        <button type="button" onClick={() => setTab("signup")} className={tabBtn(tab === "signup")}>
          Créer un compte
        </button>
      </div>

      {tab === "login" ? (
        <form action={loginAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Email
            </label>
            <input name="email" type="email" required autoComplete="email" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
          {loginState.error && (
            <p className="rounded-md bg-brick-50 px-3 py-2 text-sm text-brick-700">{loginState.error}</p>
          )}
          <button
            type="submit"
            disabled={loginPending}
            className="w-full rounded-md bg-ink-800 py-2.5 text-sm font-semibold text-paper-raised hover:bg-ink-900 disabled:opacity-60"
          >
            {loginPending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      ) : (
        <form action={signupAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Email
            </label>
            <input name="email" type="email" required autoComplete="email" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-ink-400">6 caractères minimum.</p>
          </div>
          {signupState.error && (
            <p className="rounded-md bg-brick-50 px-3 py-2 text-sm text-brick-700">{signupState.error}</p>
          )}
          {signupState.message && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {signupState.message}
            </p>
          )}
          <button
            type="submit"
            disabled={signupPending}
            className="w-full rounded-md bg-ink-800 py-2.5 text-sm font-semibold text-paper-raised hover:bg-ink-900 disabled:opacity-60"
          >
            {signupPending ? "Création…" : "Créer le compte"}
          </button>
        </form>
      )}
    </div>
  );
}
