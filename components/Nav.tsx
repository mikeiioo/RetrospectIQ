import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/buildings", label: "Buildings" },
  { href: "/permits", label: "Permits" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/upload", label: "Upload Documents" },
];

export default function Nav() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-slate-950 px-5 py-6 text-white lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-1">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500 text-base font-semibold shadow-lg shadow-blue-950/30">
            RQ
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
          <p className="text-sm font-semibold text-white">Demo Analyst</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Atlanta retrofit portfolio
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm shadow-slate-200/60 backdrop-blur lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-2 py-1">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                RQ
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
          </nav>
        </details>
      </header>
    </>
  );
}
