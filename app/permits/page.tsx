import Link from "next/link";
import { listPermits } from "@/lib/permits";

export const dynamic = "force-dynamic";

export default async function PermitsPage() {
  const permits = await listPermits();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Permits</h1>
        <Link
          href="/upload"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Upload permit
        </Link>
      </div>

      {permits.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">No permits uploaded yet.</p>
          <Link
            href="/upload"
            className="mt-4 inline-block text-sm font-medium underline"
          >
            Upload your first permit
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {permits.map((p) => (
            <li key={p.id}>
              <Link
                href={`/permits/${p.id}/dashboard`}
                className="block px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.buildingName}</p>
                    <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-400">
                      {p.address}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(p.uploadedAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-400">{p.originalFilename}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
