'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/components/ui'

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
    <div className="space-y-3">
      {hasRun && (
        <p className="text-sm font-medium text-slate-500">
          Last analyzed: {new Date(lastAnalyzedAt).toLocaleString()}
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={pending}
        className={cn(
          'inline-flex min-h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-700',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {pending ? 'Analyzing…' : hasRun ? 'Re-Run Analysis' : 'Run AI Retrofit Analysis'}
      </button>
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
