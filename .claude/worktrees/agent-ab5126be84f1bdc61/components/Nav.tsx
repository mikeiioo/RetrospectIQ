import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          RetrospectIQ
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/upload" className="hover:text-gray-600 dark:hover:text-gray-300">
            Upload
          </Link>
          <Link href="/permits" className="hover:text-gray-600 dark:hover:text-gray-300">
            Permits
          </Link>
        </nav>
      </div>
    </header>
  );
}
