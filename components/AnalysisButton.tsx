'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  permitId: string
  lastAnalyzedAt: string | null
}

export function AnalysisButton({ permitId, lastAnalyzedAt }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasRun = lastAnalyzedAt !== null

  async function handleClick() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/permits/${permitId}/process`, { method: 'POST' })
      const data = (await res.json()) as { status: string; error?: string }
      if (!res.ok || data.status === 'failed') {
        setError(data.error ?? 'Analysis failed. Please try again.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-2">
      {hasRun && (
        <p className="text-xs text-gray-500">
          Last analyzed: {new Date(lastAnalyzedAt).toLocaleString()}
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Analyzing…' : hasRun ? 'Re-Run Analysis' : 'Run AI Retrofit Analysis'}
      </button>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
