"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import type { SocialProviderId } from "@/lib/auth";

const providerLabels: Record<SocialProviderId, string> = {
  google: "Continue with Google",
};

export function AuthForm({
  mode,
  next,
  providers,
}: {
  mode: "sign-in" | "sign-up";
  next: string;
  providers: SocialProviderId[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"email" | SocialProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isSignUp = mode === "sign-up";
  const nextQuery = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending("email");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const { error } = isSignUp
      ? await authClient.signUp.email({
          name: String(form.get("name") ?? "").trim(),
          email,
          password,
        })
      : await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      setPending(null);
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function onSocial(provider: SocialProviderId) {
    setError(null);
    setPending(provider);
    const { error } = await authClient.signIn.social({ provider, callbackURL: next });
    if (error) {
      setError(error.message ?? "Could not start sign-in. Please try again.");
      setPending(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-950">
        {isSignUp ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {isSignUp
          ? "Start turning permits into retrofit intelligence."
          : "Welcome back. Sign in to your portfolio."}
      </p>

      {providers.length > 0 && (
        <>
          <div className="mt-6 grid gap-3">
            {providers.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => onSocial(provider)}
                disabled={pending !== null}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending === provider ? "Redirecting…" : providerLabels[provider]}
              </button>
            ))}
          </div>
          <div className="my-6 flex items-center gap-3 text-xs font-medium text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or with email
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className={providers.length > 0 ? "space-y-4" : "mt-6 space-y-4"}>
        {isSignUp && (
          <Field label="Name" name="name" type="text" autoComplete="name" />
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={isSignUp ? 8 : undefined}
          hint={isSignUp ? "At least 8 characters." : undefined}
        />

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending !== null}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "email"
            ? isSignUp
              ? "Creating account…"
              : "Signing in…"
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {isSignUp ? "Already have an account? " : "New to RetrospectIQ? "}
        <Link
          href={`${isSignUp ? "/sign-in" : "/sign-up"}${nextQuery}`}
          className="font-semibold text-blue-600 hover:text-blue-800"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  minLength,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  minLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="mt-2 block min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 shadow-sm shadow-slate-200/70 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
