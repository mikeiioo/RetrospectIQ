import { type NextRequest } from 'next/server'
import { extractPermitText } from '@/lib/extraction'
import { analyzePermit } from '@/lib/analysis'
import { computeRetrofitScore } from '@/lib/scoring'
import { getBuildingProfile } from '@/lib/building-profiles'
import { upsertPrediction } from '@/lib/predictions'
import { updatePermit } from '@/lib/permits'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const extractResult = await extractPermitText(id)

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
