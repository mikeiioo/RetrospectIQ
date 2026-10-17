import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex flex-col items-center rounded-2xl text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <Image src="/logo.png" alt="" width={40} height={46} className="h-full w-full object-contain" priority />
          </span>
          <span className="mt-4 text-lg font-semibold text-slate-950">RetrospectIQ</span>
          <span className="mt-1 text-sm text-slate-500">Permit intelligence for building retrofits</span>
        </Link>
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
