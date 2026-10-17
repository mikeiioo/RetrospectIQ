import { type NextRequest } from 'next/server'
import { extractPermitText } from '@/lib/extraction'
import { analyzePermit } from '@/lib/analysis'
import { computeRetrofitScore } from '@/lib/scoring'
import { getBuildingProfile } from '@/lib/building-profiles'
import { upsertPrediction } from '@/lib/predictions'
import { getPermit, updatePermit } from '@/lib/permits'
import { consumeRateLimit, limits, rateLimitResponse } from '@/lib/rate-limit'
import { requireApiUser } from '@/lib/session'

// Extraction + OpenAI analysis can exceed the platform's default function timeout.
export const maxDuration = 60

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireApiUser()
  if (response) return response

  const { id } = await params
  try {
    const permit = await getPermit(id, user.id)
    if (!permit) {
      return Response.json({ status: 'failed', error: 'Permit not found' }, { status: 404 })
    }

    const rate = await consumeRateLimit(
      `analysis:${user.id}`,
      limits.analysis.limit,
      limits.analysis.windowMs
    )
    if (!rate.ok) return rateLimitResponse(rate)

    // Re-runs reuse previously extracted text instead of re-downloading the PDF.
    const alreadyExtracted =
      permit.textExtraction?.status === 'completed' && Boolean(permit.rawText)

    const extractResult = alreadyExtracted
      ? ({ outcome: 'completed' } as const)
      : await extractPermitText(id)

    if (extractResult.outcome === 'scanned_pdf') {
      return Response.json({ status: 'scanned_pdf' })
    }

    if (extractResult.outcome === 'failed') {
      return Response.json({ status: 'failed', error: extractResult.error }, { status: 500 })
    }

    const analyzeResult = await analyzePermit(id)

    if (analyzeResult.outcome === 'skipped') {
      return Response.json(
        { status: 'failed', error: 'Permit text has not been extracted.' },
        { status: 400 }
      )
    }

    if (analyzeResult.outcome === 'failed') {
      return Response.json({ status: 'failed', error: analyzeResult.error }, { status: 500 })
    }

    const profile = await getBuildingProfile(id)
    if (!profile) throw new Error('Building profile not found after analysis')

    const scored = computeRetrofitScore(profile)
    await upsertPrediction({ permitId: id, generatedAt: new Date(), ...scored })
    await updatePermit(id, { status: 'scored' })

    return Response.json({ status: 'scored' })
  } catch (err) {
    console.error('[process]', err)
    return Response.json(
      { status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
