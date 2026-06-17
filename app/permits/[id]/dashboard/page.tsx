import { notFound } from "next/navigation";
import { AnalysisButton } from "@/components/AnalysisButton";
import {
  DataPanel,
  FieldValue,
  KpiCard,
  PageHeader,
  PermitStatusBadge,
  RecommendationCard,
  SecondaryLink,
  StatusBadge,
} from "@/components/ui";
import { getBuildingProfile } from "@/lib/building-profiles";
import { getPermit } from "@/lib/permits";
import { getPrediction } from "@/lib/predictions";

export const dynamic = "force-dynamic";

export default async function PermitDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [permit, profile, prediction] = await Promise.all([
    getPermit(id),
    getBuildingProfile(id),
    getPrediction(id),
  ]);
  if (!permit) notFound();

  const isScanned = permit.status === "scanned_pdf";
  const isScored = permit.status === "scored";
  const isTextExtracted =
    permit.status === "text_extracted" || permit.status === "analyzed" || isScored;
  const isAnalyzed = permit.status === "analyzed" || isScored;

  return (
    <main className="app-page">
      <PageHeader
        eyebrow="Permit Dashboard"
        title={permit.buildingName}
        description={permit.address}
        actions={
          <>
            <SecondaryLink href="/permits">All Permits</SecondaryLink>
            <SecondaryLink href={`/buildings/${permit.id}`}>Building Detail</SecondaryLink>
          </>
        }
      />

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge label="Uploaded" tone="emerald" />
        {isScanned && <StatusBadge label="Scanned PDF" tone="amber" />}
        {isTextExtracted && <StatusBadge label="Text Extracted" tone="blue" />}
        {isAnalyzed && <StatusBadge label="AI Analyzed" tone="blue" />}
        {isScored && <StatusBadge label="Scored" tone="emerald" />}
      </div>

      {isScanned && (
        <div className="mt-6 rounded-[20px] border border-amber-200 bg-amber-50 p-5 shadow-sm shadow-amber-100/70">
          <p className="text-sm font-medium leading-6 text-amber-800">
            This PDF appears to be scanned or image-based. RetrospectIQ currently supports
            text-based permits only. OCR support is planned for a future release.
          </p>
        </div>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Retrofit Impact Score"
          value={isScored && prediction ? `${prediction.retrofitImpactScore}` : "Pending"}
          detail={isScored ? "/ 100" : "Run analysis to score"}
          tone={isScored && prediction && prediction.retrofitImpactScore >= 80 ? "red" : "blue"}
        />
        <KpiCard
          label="Estimated Energy Reduction"
          value={isScored && prediction ? `${prediction.estimatedEnergyReductionPercent}%` : "Pending"}
          detail="Annual modeled reduction"
          tone="emerald"
        />
        <KpiCard
          label="Estimated Annual Savings"
          value={isScored && prediction ? formatCurrency(prediction.estimatedAnnualSavings) : "Pending"}
          detail="Utility cost estimate"
          tone="amber"
        />
        <KpiCard
          label="Estimated Carbon Reduction"
          value={isScored && prediction ? `${formatNumber(prediction.estimatedCarbonReductionTons)} t` : "Pending"}
          detail="CO₂ per year"
          tone="sky"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <DataPanel title="Permit Metadata" description="Stored source document details.">
            <dl className="grid gap-4">
              <FieldValue label="Building name" value={permit.buildingName} />
              <FieldValue label="Address" value={permit.address} />
              <FieldValue label="Original filename" value={permit.originalFilename} />
              <FieldValue label="S3 key" value={permit.s3Key} />
              <FieldValue label="Status" value={<PermitStatusBadge status={permit.status} />} />
              <FieldValue
                label="Uploaded"
                value={`${new Date(permit.uploadedAt).toLocaleString()} - ${formatBytes(
                  permit.sizeBytes,
                )}`}
              />
            </dl>
          </DataPanel>

          <DataPanel title="Retrofit Workflow" description="Current document analysis state.">
            <div className="space-y-3">
              <WorkflowStep label="Upload" complete />
              <WorkflowStep label="Text extraction" complete={isTextExtracted || isScanned} />
              <WorkflowStep label="AI profile" complete={isAnalyzed} />
              <WorkflowStep label="Prototype score" complete={isScored} />
            </div>
          </DataPanel>
        </div>

        <div className="space-y-6">
          <DataPanel
            title="Retrofit Intelligence"
            description="Run or refresh analysis for this permit."
          >
            <AnalysisButton
              permitId={id}
              lastAnalyzedAt={
                prediction ? new Date(prediction.generatedAt).toISOString() : null
              }
            />
          </DataPanel>

          {isScored && prediction && profile ? (
            <>
              <DataPanel title="AI Building Profile" description="Extracted from permit text.">
                <dl className="grid gap-4 md:grid-cols-2">
                  <FieldValue
                    label="Year built"
                    value={profile.buildingYear?.toString() ?? "Unknown"}
                  />
                  <FieldValue label="Building type" value={profile.buildingType ?? "Unknown"} />
                  <FieldValue
                    label="Square footage"
                    value={
                      profile.squareFootage
                        ? `${formatNumber(profile.squareFootage)} sq ft`
                        : "Unknown"
                    }
                  />
                  <FieldValue label="HVAC system" value={profile.hvacSystem ?? "Unknown"} />
                  <FieldValue label="Lighting" value={profile.lightingType ?? "Unknown"} />
                  <FieldValue
                    label="Electrical service"
                    value={profile.electricalService ?? "Unknown"}
                  />
                </dl>
              </DataPanel>

              <DataPanel title="Detected Upgrades" description="Permit-described improvements.">
                {profile.detectedUpgrades.length > 0 ? (
                  <ul className="space-y-3">
                    {profile.detectedUpgrades.map((upgrade, index) => (
                      <li
                        key={`${upgrade.type}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-950">{upgrade.type}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {upgrade.description}
                          {upgrade.year && (
                            <span className="ml-1 text-slate-500">({upgrade.year})</span>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    No detected upgrades were found in the permit text.
                  </p>
                )}
              </DataPanel>

              <DataPanel
                title="Recommendations"
                description="Prototype estimate generated from permit text. Not a certified energy audit."
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  {prediction.recommendations.map((recommendation, index) => (
                    <RecommendationCard
                      key={`${recommendation.name}-${index}`}
                      title={recommendation.name}
                      priority={recommendation.priority}
                      impact={`${prediction.estimatedEnergyReductionPercent}% energy`}
                      savings={formatCurrency(prediction.estimatedAnnualSavings)}
                      description={recommendation.reason}
                      buildingName={permit.buildingName}
                      href={`/buildings/${permit.id}`}
                    />
                  ))}
                </div>
              </DataPanel>
            </>
          ) : (
            <DataPanel title="Analysis Empty State" description="Retrofit intelligence is not available yet.">
              <div className="grid gap-4 opacity-50 md:grid-cols-2 xl:grid-cols-4">
                <PlaceholderMetric label="Retrofit Impact Score" />
                <PlaceholderMetric label="Estimated Energy Reduction" />
                <PlaceholderMetric label="Estimated Annual Savings" />
                <PlaceholderMetric label="Estimated Carbon Reduction" />
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500">
                Recommendations are not available until analysis runs.
              </p>
            </DataPanel>
          )}
        </div>
      </section>
    </main>
  );
}

function WorkflowStep({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <p className="font-semibold text-slate-950">{label}</p>
      <StatusBadge label={complete ? "Complete" : "Pending"} tone={complete ? "emerald" : "slate"} />
    </div>
  );
}

function PlaceholderMetric({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">-</p>
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
