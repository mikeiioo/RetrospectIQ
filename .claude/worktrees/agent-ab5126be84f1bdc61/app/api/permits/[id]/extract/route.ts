import { type NextRequest } from 'next/server'
import { extractPermitText } from '@/lib/extraction'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const result = await extractPermitText(id)
    return Response.json(result)
  } catch (err) {
    console.error('[extract]', err)
    return Response.json(
      { outcome: 'failed', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
