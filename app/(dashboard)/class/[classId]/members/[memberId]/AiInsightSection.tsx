'use client'

import { useState } from 'react'
import { Button, EmptyState } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import { Loader2, BrainCircuit } from 'lucide-react'
import type { MemberMonitoring, MemberInsya, AcademicPotential } from '@/lib/types'

interface Props {
  memberId: string
  memberName: string
  monitoring: MemberMonitoring[]
  insya: MemberInsya[]
  potential: AcademicPotential[]
}

interface AiResult {
  id: string
  analysis_type: string
  result: string
  edited_result: string | null
  created_at: string
  status: string
}

export default function AiInsightSection({ memberId, memberName, monitoring, insya, potential }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiResult | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const hasData = monitoring.length > 0 || insya.length > 0 || potential.length > 0

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mental_summary',
          memberId,
          memberName,
          monitoring: monitoring.slice(0, 10),
          insya: insya.slice(0, 5),
          potential: potential.slice(0, 5),
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Gagal menghubungi AI. Periksa konfigurasi API key.')
      }

      const data = await response.json()
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Analisis AI</h2>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            AI menganalisis histori monitoring, insya&apos;, dan potensi akademik.
          </p>
        </div>
        {!loading && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={!hasData}
          >
            <BrainCircuit size={14} />
            {result ? 'Analisis Ulang' : 'Analisis dengan AI'}
          </Button>
        )}
      </div>

      {!hasData && (
        <EmptyState
          title="Data belum cukup untuk dianalisis"
          description="Tambahkan minimal satu catatan monitoring, insya', atau potensi akademik terlebih dahulu."
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 size={20} className="animate-spin text-[var(--foreground-muted)]" />
          <p className="text-sm text-[var(--foreground-muted)]">AI sedang menganalisis data...</p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-[var(--radius-md)] bg-[var(--danger-subtle)] border border-red-200">
          <p className="text-sm text-[var(--danger)]">{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* AI disclosure label */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--background-secondary)] border border-[var(--border)]">
            <BrainCircuit size={14} className="text-[var(--foreground-muted)]" />
            <p className="text-xs text-[var(--foreground-muted)]">
              Hasil analisis AI — tinjau sebelum digunakan. Dibuat{' '}
              {formatDateTime(result.created_at)}
            </p>
          </div>

          {/* Result */}
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
            {editMode ? (
              <div>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full min-h-[300px] p-3 text-sm text-[var(--foreground)] border border-[var(--border-strong)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--primary)] resize-y"
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setResult({ ...result, edited_result: editedText })
                      setEditMode(false)
                    }}
                  >
                    Simpan Perubahan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="prose prose-sm max-w-none text-[var(--foreground-secondary)]"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {result.edited_result ?? result.result}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditedText(result.edited_result ?? result.result ?? '')
                      setEditMode(true)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
