import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { enabledSocialProviders } from "@/lib/auth";
import { getSessionUser, safeRedirectPath } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in · RetrospectIQ" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = safeRedirectPath((await searchParams).next);
  if (await getSessionUser()) redirect(next);

  return <AuthForm mode="sign-in" next={next} providers={enabledSocialProviders()} />;
}
