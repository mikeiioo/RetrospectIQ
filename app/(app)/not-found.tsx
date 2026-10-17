import { PrimaryLink, SecondaryLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="app-page">
      <div className="rounded-[20px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm shadow-slate-200/70">
        <p className="text-sm font-semibold text-blue-600">Not found</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">We couldn&apos;t find that record</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          It may have been removed, or it belongs to a different account.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <PrimaryLink href="/buildings">View buildings</PrimaryLink>
          <SecondaryLink href="/permits">View permits</SecondaryLink>
        </div>
      </div>
    </main>
  );
}
