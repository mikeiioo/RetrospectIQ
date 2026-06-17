import {
  listBuildingRecords,
  readinessScore,
} from "@/lib/dashboard-data";
import {
  BuildingCard,
  EmptyState,
  KpiCard,
  PageHeader,
  PrimaryLink,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const records = await listBuildingRecords();
  const scored = records.filter((record) => record.prediction).length;
  const averageScore =
    scored === 0
      ? 0
      : Math.round(
          records.reduce((total, record) => total + (readinessScore(record) ?? 0), 0) /
            scored,
        );
  const critical = records.filter(
    (record) => (readinessScore(record) ?? 0) >= 80,
  ).length;

  return (
    <main className="app-page">
      <PageHeader
        eyebrow="Buildings"
        title="Building Portfolio"
        description="Inspection-ready building cards synthesized from uploaded permits, AI profiles, and prototype retrofit scores."
        actions={<PrimaryLink href="/upload">Upload Documents</PrimaryLink>}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <KpiCard label="Total Buildings" value={formatNumber(records.length)} tone="blue" />
        <KpiCard label="Average Readiness" value={`${averageScore}/100`} tone="emerald" />
        <KpiCard label="Critical Opportunities" value={formatNumber(critical)} tone="red" />
      </section>

      {records.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No buildings available"
            description="Upload a permit or run the demo seed to populate the building portfolio."
            action={<PrimaryLink href="/upload">Upload Documents</PrimaryLink>}
          />
        </div>
      ) : (
        <section className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {records.map((record) => (
            <BuildingCard
              key={record.permit.id}
              href={`/buildings/${record.permit.id}`}
              name={record.permit.buildingName}
              address={record.permit.address}
              year={record.profile?.buildingYear?.toString() ?? "Unknown"}
              type={record.profile?.buildingType ?? "Unknown"}
              score={readinessScore(record)}
              status={record.permit.status}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
