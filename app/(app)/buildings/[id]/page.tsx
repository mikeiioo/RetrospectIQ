import { requireUser } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisButton } from "@/components/AnalysisButton";
import { BuildingMap } from "@/components/BuildingMap";
import {
  DataPanel,
  FieldValue,
  KpiCard,
  PageHeader,
  PermitStatusBadge,
  PrimaryLink,
  RecommendationCard,
  ScoreBar,
  SecondaryLink,
  StatusBadge,
} from "@/components/ui";
import { getBuildingRecord, readinessScore } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const record = await getBuildingRecord(id, user.id);
  if (!record) notFound();

  const { permit, profile, prediction } = record;
  const score = readinessScore(record);

  return (
    <main className="app-page">
      <PageHeader
        eyebrow="Building Detail"
        title={permit.buildingName}
        description={permit.address}
        actions={
          <>
            <PrimaryLink href={`/permits/${permit.id}/dashboard`}>
              Permit Dashboard
            </PrimaryLink>
            <SecondaryLink href="/buildings">All Buildings</SecondaryLink>
          </>
        }
      />

      <div className="mt-5 flex flex-wrap gap-2">
        <PermitStatusBadge status={permit.status} />
        {prediction && <StatusBadge label={prediction.priority} tone={priorityTone(prediction.priority)} />}
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Retrofit Readiness"
          value={score === null ? "Pending" : `${score}/100`}
          detail="Prototype impact score"
          tone={score !== null && score >= 80 ? "red" : "blue"}
        />
        <KpiCard
          label="Energy Reduction"
          value={prediction ? `${prediction.estimatedEnergyReductionPercent}%` : "Pending"}
          detail="Estimated annual reduction"
          tone="emerald"
        />
        <KpiCard
          label="Annual Savings"
          value={prediction ? formatCurrency(prediction.estimatedAnnualSavings) : "Pending"}
          detail="Modeled utility impact"
          tone="amber"
        />
        <KpiCard
          label="CO₂ Reduction"
          value={prediction ? `${formatNumber(prediction.estimatedCarbonReductionTons)} t` : "Pending"}
          detail="Estimated per year"
          tone="sky"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <InspectionSection title="Building Overview" defaultOpen>
            <dl className="grid gap-4 md:grid-cols-2">
              <FieldValue label="Building name" value={permit.buildingName} />
              <FieldValue label="Address" value={permit.address} />
              <FieldValue
                label="Year built"
                value={profile?.buildingYear?.toString() ?? "Unknown"}
              />
              <FieldValue label="Building type" value={profile?.buildingType ?? "Unknown"} />
              <FieldValue
                label="Square footage"
                value={
                  profile?.squareFootage
                    ? `${formatNumber(profile.squareFootage)} sq ft`
                    : "Unknown"
                }
              />
              <FieldValue label="Current status" value={<PermitStatusBadge status={permit.status} />} />
            </dl>
          </InspectionSection>

          <InspectionSection title="Permit History" defaultOpen>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{permit.originalFilename}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Uploaded {new Date(permit.uploadedAt).toLocaleString()}
                  </p>
                  <p className="mt-2 break-all text-xs text-slate-400">{permit.s3Key}</p>
                </div>
                <Link
                  href={`/permits/${permit.id}/dashboard`}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Open permit dashboard
                </Link>
              </div>
            </div>
          </InspectionSection>

          <InspectionSection title="Existing Systems" defaultOpen>
            <dl className="grid gap-4 md:grid-cols-3">
              <FieldValue label="HVAC" value={profile?.hvacSystem ?? "Unknown"} />
              <FieldValue label="Lighting" value={profile?.lightingType ?? "Unknown"} />
              <FieldValue
                label="Electrical service"
                value={profile?.electricalService ?? "Unknown"}
              />
            </dl>
          </InspectionSection>
        </div>

        <div className="space-y-6">
          <DataPanel title="Readiness Indicator" description="Visual retrofit priority score.">
            <ScoreBar score={score} />
          </DataPanel>

          <InspectionSection title="AI Analysis" defaultOpen>
            <AnalysisButton
              permitId={permit.id}
              lastAnalyzedAt={
                prediction ? new Date(prediction.generatedAt).toISOString() : null
              }
            />
            {permit.status === "scanned_pdf" && (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                This permit appears to be scanned or image-based. OCR is not enabled in this prototype.
              </p>
            )}
            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold text-slate-950">Detected upgrades</p>
              {profile?.detectedUpgrades.length ? (
                <ul className="space-y-3">
                  {profile.detectedUpgrades.map((upgrade, index) => (
                    <li key={`${upgrade.type}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">{upgrade.type}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {upgrade.description}
                        {upgrade.year ? ` (${upgrade.year})` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  No detected upgrades are available yet.
                </p>
              )}
            </div>
          </InspectionSection>

          <DataPanel title="Location" description="Click the map to open it in Google Maps.">
            <BuildingMap name={permit.buildingName} address={permit.address} />
          </DataPanel>
        </div>
      </section>

      <section className="mt-6">
        <InspectionSection title="Retrofit Recommendations" defaultOpen>
          {prediction?.recommendations.length ? (
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
                  href={`/permits/${permit.id}/dashboard`}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Recommendations are not available until analysis and scoring complete.
            </p>
          )}
        </InspectionSection>
      </section>
    </main>
  );
}

function InspectionSection({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-slate-950">
        {title}
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 group-open:bg-blue-50 group-open:text-blue-700">
          <span className="group-open:hidden">Expand</span>
          <span className="hidden group-open:inline">Collapse</span>
        </span>
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}

function priorityTone(priority: string) {
  if (priority === "Critical" || priority === "High") return "red";
  if (priority === "Moderate") return "amber";
  return "emerald";
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
