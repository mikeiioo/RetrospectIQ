"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-page">
      <div className="rounded-[20px] border border-red-200 bg-white p-10 text-center shadow-sm shadow-slate-200/70">
        <p className="text-sm font-semibold text-red-600">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">This page could not load</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          A temporary problem prevented this page from loading. Try again, and if it keeps
          happening, check the server logs.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
