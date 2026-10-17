import type { Metadata } from "next";
import { headers } from "next/headers";
import { PasswordForm, ProfileInfoForm, ProfilePhotoForm } from "@/components/ProfileForms";
import { DataPanel, PageHeader, StatusBadge } from "@/components/ui";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Profile · RetrospectIQ" };

export default async function ProfilePage() {
  const user = await requireUser();
  const accounts = await auth.api.listUserAccounts({ headers: await headers() });
  const providers = new Set(accounts.map((account) => account.providerId));
  const hasPassword = providers.has("credential");

  return (
    <main className="app-page">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your photo, personal details, and sign-in settings."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <DataPanel title="Profile photo" description="PNG, JPEG, or WebP, up to 2 MB.">
            <ProfilePhotoForm user={user} />
          </DataPanel>

          <DataPanel title="Personal information" description="How you appear in RetrospectIQ.">
            <ProfileInfoForm user={user} />
          </DataPanel>

          <DataPanel
            title="Password"
            description={
              hasPassword
                ? "Changing your password signs you out on other devices."
                : "You sign in with Google, so there's no RetrospectIQ password to change."
            }
          >
            {hasPassword ? (
              <PasswordForm />
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Manage your password in your Google account.
              </p>
            )}
          </DataPanel>
        </div>

        <div className="space-y-6">
          <DataPanel title="Sign-in methods" description="Ways you can sign in to this account.">
            <ul className="space-y-3">
              <SignInMethod label="Email & password" connected={hasPassword} />
              <SignInMethod label="Google" connected={providers.has("google")} />
            </ul>
          </DataPanel>

          <DataPanel
            title="Teams"
            description="Share buildings and analyses with colleagues."
            action={<StatusBadge label="Coming soon" tone="sky" />}
          >
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">Team workspaces are on the way</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                You&apos;ll be able to create a team, invite colleagues, and work on a shared building
                portfolio. For now, your buildings are private to your account.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-400"
              >
                Create or join a team
              </button>
            </div>
          </DataPanel>
        </div>
      </section>
    </main>
  );
}

function SignInMethod({ label, connected }: { label: string; connected: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      <StatusBadge label={connected ? "Connected" : "Not set up"} tone={connected ? "emerald" : "slate"} />
    </li>
  );
}
