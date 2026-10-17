import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import type { SessionUser } from "@/lib/session";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/buildings", label: "Buildings" },
  { href: "/permits", label: "Permits" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/upload", label: "Upload Documents" },
];

export default function Nav({ user }: { user: SessionUser }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-slate-950 px-5 py-6 text-white lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-1">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white p-1.5 shadow-lg shadow-blue-950/30">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={46}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span>
            <span className="block text-base font-semibold">RetrospectIQ</span>
            <span className="block text-xs text-slate-400">Permit intelligence</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-[20px] border border-slate-800 bg-slate-900 p-4">
          <p className="truncate text-sm font-semibold text-white">{user.name || "Account"}</p>
          <p className="mt-1 truncate text-xs leading-5 text-slate-400">{user.email}</p>
          <SignOutButton className="mt-3 w-full rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white" />
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm shadow-slate-200/60 backdrop-blur lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-2 py-1">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
                <Image
                  src="/logo.png"
                  alt=""
                  width={32}
                  height={37}
                  className="h-full w-full object-contain"
                  priority
                />
              </span>
              <span className="font-semibold text-slate-950">RetrospectIQ</span>
            </Link>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
              Menu
            </span>
          </summary>
          <nav className="mt-3 grid gap-2 rounded-[20px] border border-slate-200 bg-slate-50 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="min-w-0 truncate text-sm text-slate-500">{user.email}</p>
              <SignOutButton className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-800" />
            </div>
          </nav>
        </details>
      </header>
    </>
  );
}
