"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { cn } from "@/components/ui";
import {
  BuildingIcon,
  CloseIcon,
  DashboardIcon,
  LightbulbIcon,
  MenuIcon,
  PermitIcon,
  SidebarIcon,
  UploadIcon,
} from "@/components/icons";
import { UserMenu } from "@/components/UserMenu";
import type { SessionUser } from "@/lib/session";

export const SIDEBAR_COOKIE = "sidebar";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/buildings", label: "Buildings", icon: BuildingIcon },
  { href: "/permits", label: "Permits", icon: PermitIcon },
  { href: "/recommendations", label: "Recommendations", icon: LightbulbIcon },
  { href: "/upload", label: "Upload Documents", icon: UploadIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function breadcrumb(pathname: string): string[] {
  const section = navItems.find((item) => item.href !== "/" && isActive(pathname, item.href));
  if (!section) return ["Dashboard"];
  if (pathname === section.href) return [section.label];
  if (section.href === "/buildings") return [section.label, "Building detail"];
  if (section.href === "/permits") return [section.label, "Permit dashboard"];
  return [section.label];
}

export function AppShell({
  user,
  initialCollapsed,
  children,
}: {
  user: SessionUser;
  initialCollapsed: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  // The mobile drawer is open only for the path it was opened on, so navigating closes it.
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawerOpen = drawerPath === pathname;

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  function toggleSidebar() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const next = !collapsed;
      setCollapsed(next);
      document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
    } else {
      setDrawerPath(drawerOpen ? null : pathname);
    }
  }

  const crumbs = breadcrumb(pathname);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:px-4">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={drawerOpen ? "Close navigation" : "Toggle navigation"}
          aria-expanded={drawerOpen || !collapsed}
          aria-controls="app-sidebar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          {drawerOpen ? (
            <CloseIcon />
          ) : (
            <>
              <MenuIcon className="lg:hidden" />
              <SidebarIcon className="hidden lg:block" />
            </>
          )}
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-xl pr-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            <Image
              src="/logo.png"
              alt=""
              width={28}
              height={32}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="hidden font-semibold text-slate-950 sm:block">RetrospectIQ</span>
        </Link>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm md:flex">
          {crumbs.map((crumb, index) => (
            <span key={crumb} className="flex min-w-0 items-center gap-2">
              <span className="text-slate-300">/</span>
              <span
                className={cn(
                  "truncate",
                  index === crumbs.length - 1 ? "font-semibold text-slate-950" : "text-slate-500",
                )}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        <div className="ml-auto">
          <UserMenu user={user} />
        </div>
      </header>

      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setDrawerPath(null)}
          className="fixed inset-0 top-16 z-30 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={cn(
          "fixed bottom-0 left-0 top-16 z-30 flex w-72 flex-col bg-slate-950 px-3 py-5 text-white transition-[transform,width] duration-200 ease-out",
          drawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          "lg:translate-x-0 lg:shadow-none",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
        )}
      >
        <nav aria-label="Main" className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white",
                  collapsed && "lg:justify-center lg:px-0",
                )}
              >
                {active && (
                  <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-blue-500" />
                )}
                <Icon className={cn("shrink-0", active ? "text-blue-400" : "")} />
                <span className={cn("truncate", collapsed && "lg:sr-only")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4",
            collapsed && "lg:hidden",
          )}
        >
          <p className="text-xs font-semibold text-slate-300">Prototype scoring</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Estimates are rule-based and not a certified energy audit.
          </p>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-screen pt-16 transition-[padding] duration-200 ease-out",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64",
        )}
      >
        {children}
      </div>
    </>
  );
}
