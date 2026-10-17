"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/components/ui";
import { UserMenu } from "@/components/UserMenu";
import type { SessionUser } from "@/lib/session";

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
];

export function TopBar({
  user,
  leading,
  crumbs,
  showDashboardLink,
}: {
  user: SessionUser | null;
  /** Optional control left of the logo (the sidebar toggle in the app). */
  leading?: ReactNode;
  crumbs?: string[];
  showDashboardLink?: boolean;
}) {
  const pathname = usePathname();
  const links = showDashboardLink && user
    ? [...siteLinks, { href: "/dashboard", label: "Dashboard" }]
    : siteLinks;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-navy-950 px-3 text-white shadow-lg shadow-navy-950/20 sm:px-4">
      {leading}

      <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-xl pr-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white p-1 shadow-sm">
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={32}
            className="h-full w-full object-contain"
            priority
          />
        </span>
        <span className="hidden font-semibold sm:block">RetrospectIQ</span>
      </Link>

      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm md:flex">
          {crumbs.map((crumb, index) => (
            <span key={crumb} className="flex min-w-0 items-center gap-2">
              <span className="text-slate-500">/</span>
              <span
                className={cn(
                  "truncate",
                  index === crumbs.length - 1 ? "font-semibold text-white" : "text-slate-400",
                )}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <nav aria-label="Site" className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition",
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {user ? (
          <UserMenu user={user} />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
