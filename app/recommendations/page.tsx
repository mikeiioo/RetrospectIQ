import {
  listBuildingRecords,
  listRecommendationRecords,
} from "@/lib/dashboard-data";
import {
  DataPanel,
  EmptyState,
  KpiCard,
  PageHeader,
  PrimaryLink,
  RecommendationCard,
  StatusBadge,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const records = await listBuildingRecords();
  const recommendations = listRecommendationRecords(records).sort((a, b) => {
    const rank = { High: 3, Medium: 2, Low: 1 };
    return rank[b.recommendation.priority] - rank[a.recommendation.priority];
  });

  const highPriority = recommendations.filter(
    (record) => record.recommendation.priority === "High",
  ).length;
  const scoredRecords = records.filter((record) => record.prediction);
  const annualSavings = scoredRecords.reduce(
    (total, record) => total + (record.prediction?.estimatedAnnualSavings ?? 0),
    0,
  );
  const annualCarbon = scoredRecords.reduce(
    (total, record) => total + (record.prediction?.estimatedCarbonReductionTons ?? 0),
    0,
  );

  return (
    <main className="app-page">
      <PageHeader
        eyebrow="Recommendations"
        title="Retrofit Opportunity Queue"
        description="Prioritized retrofit actions generated from permit-derived building profiles and prototype scoring."
        actions={<PrimaryLink href="/buildings">Review Buildings</PrimaryLink>}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Recommendations"
          value={formatNumber(recommendations.length)}
          detail={`${highPriority} high priority`}
          tone="blue"
        />
        <KpiCard
          label="Estimated Savings"
          value={formatCurrency(annualSavings)}
          detail="Portfolio annual total"
          tone="amber"
        />
        <KpiCard
          label="Estimated CO₂ Reduction"
          value={`${formatNumber(annualCarbon)} t`}
          detail="Portfolio annual total"
          tone="emerald"
        />
      </section>

      <div className="mt-8">
        {recommendations.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="Run AI retrofit analysis on a text-based permit to generate recommendation cards."
            action={<PrimaryLink href="/permits">Open Permits</PrimaryLink>}
          />
        ) : (
          <DataPanel
            title="Active Recommendations"
            description="Cards are grouped by priority and linked back to each permit dashboard."
            action={<StatusBadge label={`${highPriority} High priority`} tone="red" />}
          >
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {recommendations.map((record, index) => (
                <RecommendationCard
                  key={`${record.permit.id}-${record.recommendation.name}-${index}`}
                  title={record.recommendation.name}
                  priority={record.recommendation.priority}
                  impact={`${record.prediction.estimatedEnergyReductionPercent}% energy, ${formatNumber(
                    record.prediction.estimatedCarbonReductionTons,
                  )} t CO₂`}
                  savings={formatCurrency(record.prediction.estimatedAnnualSavings)}
                  description={record.recommendation.reason}
                  buildingName={record.permit.buildingName}
                  href={`/buildings/${record.permit.id}`}
                />
              ))}
            </div>
          </DataPanel>
        )}
      </div>
    </main>
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
