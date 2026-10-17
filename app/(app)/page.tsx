import { requireUser } from "@/lib/session";
import Link from "next/link";
import {
  listBuildingRecords,
  listRecommendationRecords,
  readinessScore,
} from "@/lib/dashboard-data";
import {
  DataPanel,
  EmptyState,
  KpiCard,
  PageHeader,
  PermitStatusBadge,
  PrimaryLink,
  ScoreBar,
  SecondaryLink,
  StatusBadge,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const records = await listBuildingRecords(user.id);
  const recommendations = listRecommendationRecords(records);
  const scoredRecords = records.filter((record) => record.prediction);
  const processedPermits = records.filter((record) => record.permit.textExtraction).length;
  const estimatedCarbonReduction = scoredRecords.reduce(
    (total, record) => total + (record.prediction?.estimatedCarbonReductionTons ?? 0),
    0,
  );
  const priorityRecords = [...records]
    .filter((record) => readinessScore(record) !== null)
    .sort((a, b) => (readinessScore(b) ?? 0) - (readinessScore(a) ?? 0))
    .slice(0, 5);

  return (
    <main className="app-page">
      <PageHeader
        eyebrow="Dashboard"
        title="RetrospectIQ"
        description="AI-powered permit intelligence for sustainable building retrofits"
        actions={
          <>
            <PrimaryLink href="/upload">Upload Documents</PrimaryLink>
            <SecondaryLink href="/buildings">View Buildings</SecondaryLink>
          </>
        }
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Buildings Analyzed"
          value={formatNumber(scoredRecords.length)}
          detail={`${records.length} total building records`}
          tone="blue"
        />
        <KpiCard
          label="Historical Permits Processed"
          value={formatNumber(processedPermits)}
          detail={`${records.length} permits in MongoDB`}
          tone="sky"
        />
        <KpiCard
          label="Retrofit Opportunities"
          value={formatNumber(recommendations.length)}
          detail="Prioritized recommendations"
          tone="amber"
        />
        <KpiCard
          label="Estimated CO₂ Reduction"
          value={`${formatNumber(estimatedCarbonReduction)} t`}
          detail="Annual portfolio estimate"
          tone="emerald"
        />
      </section>

      {records.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No permit records yet"
            description="Seed the demo portfolio or upload a text-based permit to populate the dashboard."
            action={<PrimaryLink href="/upload">Upload Documents</PrimaryLink>}
          />
        </div>
      ) : (
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <DataPanel
            title="Portfolio Overview"
            description="Live permit records joined with AI profiles and prototype retrofit scores."
            action={<SecondaryLink href="/permits">Open Permits</SecondaryLink>}
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[720px] border-collapse bg-white text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Building</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Readiness</th>
                    <th className="px-4 py-3 font-semibold">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.slice(0, 7).map((record) => (
                    <tr key={record.permit.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/buildings/${record.permit.id}`}
                          className="font-semibold text-slate-950 hover:text-blue-700"
                        >
                          {record.permit.buildingName}
                        </Link>
                        <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                          {record.permit.address}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {record.profile?.buildingType ?? "Unknown"}
                      </td>
                      <td className="px-4 py-4">
                        <PermitStatusBadge status={record.permit.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-36">
                          <ScoreBar score={readinessScore(record)} />
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-950">
                        {record.prediction
                          ? formatCurrency(record.prediction.estimatedAnnualSavings)
                          : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>

          <div className="space-y-6">
            <DataPanel title="Retrofit Priority Queue" description="Highest readiness scores.">
              <div className="space-y-4">
                {priorityRecords.map((record) => (
                  <Link
                    key={record.permit.id}
                    href={`/buildings/${record.permit.id}`}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {record.permit.buildingName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {record.prediction?.priority ?? "Pending"}
                        </p>
                      </div>
                      <StatusBadge
                        label={`${readinessScore(record) ?? 0}/100`}
                        tone={(readinessScore(record) ?? 0) >= 80 ? "red" : "amber"}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </DataPanel>

            <DataPanel title="System Coverage" description="Current analysis states.">
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Scored" value={scoredRecords.length} />
                <MiniStat
                  label="Scanned PDFs"
                  value={records.filter((record) => record.permit.status === "scanned_pdf").length}
                />
                <MiniStat label="Profiles" value={records.filter((record) => record.profile).length} />
                <MiniStat label="Uploads" value={records.length} />
              </div>
            </DataPanel>
          </div>
        </section>
      )}
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{formatNumber(value)}</p>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
