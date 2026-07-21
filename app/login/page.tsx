import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-600 font-display text-lg font-bold text-ink-900">
            GL
          </div>
          <h1 className="font-display text-2xl font-semibold text-paper-raised">Grand Livre</h1>
          <p className="mt-1 text-sm text-ink-300">Gestion financière de l&apos;entreprise</p>
        </div>
        <div className="rounded-xl border border-ink-700 bg-paper-raised p-6 shadow-xl">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
