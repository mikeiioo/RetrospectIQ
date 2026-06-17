import Link from "next/link";
import { notFound } from "next/navigation";
import { getPermit } from "@/lib/permits";
import { makeRetrofitIntelligence } from "@/lib/retrofit";

export const dynamic = "force-dynamic";

export default async function PermitDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const permit = await getPermit(id);
  if (!permit) notFound();

  const intel = makeRetrofitIntelligence(permit.id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/permits" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
        ← All permits
      </Link>

      <div className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">{permit.buildingName}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{permit.address}</p>
        <p className="mt-2 text-xs text-gray-500">
          Uploaded {new Date(permit.uploadedAt).toLocaleString()} · {permit.originalFilename} ·{" "}
          {formatBytes(permit.sizeBytes)}
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="text-sm font-semibold">Permit metadata</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <MetadataItem label="Building name" value={permit.buildingName} />
          <MetadataItem label="Address" value={permit.address} />
          <MetadataItem label="Original filename" value={permit.originalFilename} />
          <MetadataItem label="S3 key" value={permit.s3Key} />
          <MetadataItem label="Status" value={permit.status} />
        </dl>
      </section>

      <div className="mt-10 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Retrofit intelligence</h2>
        <p className="text-xs text-gray-500">Placeholder values — derived from permit id.</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Retrofit Impact Score" value={`${intel.impactScore}`} suffix="/ 100" />
        <Card
          label="Energy Reduction"
          value={`${intel.energyReductionPctLow}–${intel.energyReductionPctHigh}%`}
        />
        <Card
          label="Estimated Savings"
          value={`$${intel.estimatedAnnualSavingsUsd.toLocaleString()}`}
          suffix="/ year"
        />
        <Card
          label="Carbon Reduction"
          value={`${intel.carbonReductionTonsPerYear}`}
          suffix="tons CO₂ / year"
        />
      </div>

      <section className="mt-8 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="text-sm font-semibold">Recommended upgrades</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {intel.recommendedUpgrades.map((u) => (
            <li key={u} className="flex items-start gap-3">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
              <span>{u}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}

function Card({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {suffix && <p className="mt-1 text-xs text-gray-500">{suffix}</p>}
    </div>
  );
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
