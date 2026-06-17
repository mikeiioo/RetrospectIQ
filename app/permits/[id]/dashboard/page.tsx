import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPermit } from '@/lib/permits'
import { getBuildingProfile } from '@/lib/building-profiles'
import { getPrediction } from '@/lib/predictions'
import { AnalysisButton } from '@/components/AnalysisButton'

export const dynamic = 'force-dynamic'

export default async function PermitDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [permit, profile, prediction] = await Promise.all([
    getPermit(id),
    getBuildingProfile(id),
    getPrediction(id),
  ])
  if (!permit) notFound()

  const isScanned = permit.status === 'scanned_pdf'
  const isScored = permit.status === 'scored'
  const isTextExtracted =
    permit.status === 'text_extracted' || permit.status === 'analyzed' || isScored
  const isAnalyzed = permit.status === 'analyzed' || isScored

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/permits" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
        ← All permits
      </Link>

      <div className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">{permit.buildingName}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{permit.address}</p>
        <p className="mt-2 text-xs text-gray-500">
          Uploaded {new Date(permit.uploadedAt).toLocaleString()} · {permit.originalFilename} ·{' '}
          {formatBytes(permit.sizeBytes)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge label="Uploaded" color="green" />
        {isScanned && <Badge label="Scanned PDF" color="yellow" />}
        {isTextExtracted && <Badge label="Text Extracted" color="green" />}
        {isAnalyzed && <Badge label="AI Analyzed" color="green" />}
        {isScored && <Badge label="Scored" color="green" />}
      </div>

      {isScanned && (
        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-950">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            This PDF appears to be scanned or image-based. RetrospectIQ currently supports
            text-based permits only. OCR support is planned for a future release.
          </p>
        </div>
      )}

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

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Retrofit intelligence</h2>
        <div className="mt-4">
          <AnalysisButton
            permitId={id}
            lastAnalyzedAt={prediction ? new Date(prediction.generatedAt).toISOString() : null}
          />
        </div>
      </div>

      <div
        className={`mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-opacity ${
          isScored ? '' : 'opacity-40'
        }`}
      >
        <Card
          label="Retrofit Impact Score"
          value={isScored && prediction ? `${prediction.retrofitImpactScore}` : '—'}
          suffix={isScored ? '/ 100' : undefined}
        />
        <Card
          label="Energy Reduction"
          value={
            isScored && prediction ? `${prediction.estimatedEnergyReductionPercent}%` : '—'
          }
        />
        <Card
          label="Est. Annual Savings"
          value={
            isScored && prediction
              ? `$${prediction.estimatedAnnualSavings.toLocaleString()}`
              : '—'
          }
          suffix={isScored ? '/ year' : undefined}
        />
        <Card
          label="Carbon Reduction"
          value={
            isScored && prediction ? `${prediction.estimatedCarbonReductionTons}` : '—'
          }
          suffix={isScored ? 'tons CO₂ / year' : undefined}
        />
      </div>

      {isScored && prediction && profile ? (
        <>
          <section className="mt-8 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="text-sm font-semibold">AI Building Profile</h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <MetadataItem
                label="Year Built"
                value={profile.buildingYear?.toString() ?? 'Unknown'}
              />
              <MetadataItem label="Building Type" value={profile.buildingType ?? 'Unknown'} />
              <MetadataItem
                label="Square Footage"
                value={
                  profile.squareFootage
                    ? `${profile.squareFootage.toLocaleString()} sq ft`
                    : 'Unknown'
                }
              />
              <MetadataItem label="HVAC System" value={profile.hvacSystem ?? 'Unknown'} />
              <MetadataItem label="Lighting" value={profile.lightingType ?? 'Unknown'} />
              <MetadataItem
                label="Electrical Service"
                value={profile.electricalService ?? 'Unknown'}
              />
            </dl>
          </section>

          {profile.detectedUpgrades.length > 0 && (
            <section className="mt-6 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
              <h3 className="text-sm font-semibold">Detected upgrades</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {profile.detectedUpgrades.map((u, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span>
                      <span className="font-medium">{u.type}</span> — {u.description}
                      {u.year && <span className="ml-1 text-gray-500">({u.year})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="text-sm font-semibold">Recommendations</h3>
            <ul className="mt-3 space-y-4 text-sm">
              {prediction.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${
                      r.priority === 'High'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : r.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {r.priority}
                  </span>
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">{r.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-gray-500">
              † Prototype estimate generated from permit text. Not a certified energy audit.
            </p>
          </section>
        </>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          Recommendations: Not available until analysis runs
        </p>
      )}
    </main>
  )
}

function Badge({ label, color }: { label: string; color: 'green' | 'yellow' }) {
  const colors = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  )
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  )
}

function Card({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {suffix && <p className="mt-1 text-xs text-gray-500">{suffix}</p>}
    </div>
  )
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
