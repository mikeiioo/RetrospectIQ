import { type NextRequest } from 'next/server'
import { analyzePermit } from '@/lib/analysis'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const result = await analyzePermit(id)
    return Response.json(result)
  } catch (err) {
    console.error('[analyze]', err)
    return Response.json(
      { outcome: 'failed', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
