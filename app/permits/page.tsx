import Link from "next/link";
import { listPermits } from "@/lib/permits";
import {
  DataPanel,
  EmptyState,
  PageHeader,
  PermitStatusBadge,
  PrimaryLink,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PermitsPage() {
  const permits = await listPermits();

  return (
    <main className="app-page">
      <PageHeader
        eyebrow="Permits"
        title="Historical Permit Records"
        description="Uploaded documents, extraction status, storage keys, and analysis readiness in one inspection queue."
        actions={<PrimaryLink href="/upload">Upload Documents</PrimaryLink>}
      />

      <div className="mt-8">
        {permits.length === 0 ? (
          <EmptyState
            title="No permits uploaded"
            description="Upload a permit PDF to create a building dashboard and start the analysis workflow."
            action={<PrimaryLink href="/upload">Upload Documents</PrimaryLink>}
          />
        ) : (
          <DataPanel
            title="Permit Inventory"
            description={`${permits.length} records sorted by most recent upload.`}
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[820px] border-collapse bg-white text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Building</th>
                    <th className="px-4 py-3 font-semibold">Uploaded</th>
                    <th className="px-4 py-3 font-semibold">Filename</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Dashboard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {permits.map((permit) => (
                    <tr key={permit.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-950">{permit.buildingName}</p>
                        <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                          {permit.address}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {new Date(permit.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <p className="max-w-xs truncate font-medium text-slate-700">
                          {permit.originalFilename}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {permit.s3Key}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <PermitStatusBadge status={permit.status} />
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/permits/${permit.id}/dashboard`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Open analysis
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>
        )}
      </div>
    </main>
  );
}
