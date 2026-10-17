import { type NextRequest } from 'next/server'
import { extractPermitText } from '@/lib/extraction'
import { getPermit } from '@/lib/permits'
import { consumeRateLimit, limits, rateLimitResponse } from '@/lib/rate-limit'
import { requireApiUser } from '@/lib/session'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireApiUser()
  if (response) return response

  const { id } = await params
  try {
    if (!(await getPermit(id, user.id))) {
      return Response.json({ outcome: 'failed', error: 'Permit not found' }, { status: 404 })
    }

    const rate = await consumeRateLimit(
      `analysis:${user.id}`,
      limits.analysis.limit,
      limits.analysis.windowMs
    )
    if (!rate.ok) return rateLimitResponse(rate)

    const result = await extractPermitText(id)
    return Response.json(result, { status: result.outcome === 'failed' ? 500 : 200 })
  } catch (err) {
    console.error('[extract]', err)
    return Response.json(
      { outcome: 'failed', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
