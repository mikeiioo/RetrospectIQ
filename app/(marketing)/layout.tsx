import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { getSessionUser } from "@/lib/session";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <>
      <TopBar user={user} showDashboardLink />
      <div className="pt-16">{children}</div>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} RetrospectIQ. Prototype estimates, not a certified energy audit.</p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link href="/" className="hover:text-slate-950">Home</Link>
            <Link href="/learn" className="hover:text-slate-950">Learn</Link>
            <Link href={user ? "/dashboard" : "/sign-in"} className="hover:text-slate-950">
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
