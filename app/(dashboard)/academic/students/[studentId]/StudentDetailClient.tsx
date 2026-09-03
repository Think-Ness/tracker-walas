'use client'

import { useState } from 'react'
import { Card, Button, Badge, EmptyState } from '@/components/ui'
import { BrainCircuit, Loader2, BookOpen, Edit2 } from 'lucide-react'
import { formatDateTime, getStatusLabel, getStatusVariant } from '@/lib/utils'
import Link from 'next/link'
import { EditStudentModal } from './EditStudentModal'
import type { Student, MemberStatus } from '@/lib/types'

interface AssessmentScoreItem {
  assessment_id: string
  assessment_name: string
  weight: number
  max_score: number
  score: number | null
  note: string | null
}

interface CourseItem {
  courseId: string
  code: string | null
  name: string
  semester: string | null
  sks: number | null
  assessments: AssessmentScoreItem[]
  finalScore: number | null
}

interface Props {
  student: Student
  courses: CourseItem[]
  userId: string
}

export default function StudentDetailClient({ student, courses, userId }: Props) {
  const [loadingAi, setLoadingAi] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleGenerateAiSummary = async () => {
    setLoadingAi(true)
    setError(null)

    // Aggregate scores
    const allScores = courses.flatMap((c) =>
      c.assessments.map((a) => ({
        course_name: c.name,
        assessment_name: a.assessment_name,
        score: a.score,
        weight: a.weight,
      }))
    )

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'academic_summary',
          studentId: student.id,
          memberName: student.name,
          scores: allScores,
          courses: courses.map((c) => ({ name: c.name, code: c.code })),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Gagal menghubungi AI. Pastikan GEMINI_API_KEY sudah benar.')
      }

      const data = await res.json()
      const text = data.edited_result ?? data.result
      setAiResult(text)
      setEditedText(text)
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan saat analisis AI.')
    } finally {
      setLoadingAi(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Interactive Student Profile Header with 3x4 Photo & Edit Button */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* 3x4 Photo Box or Initial */}
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-[var(--radius-md)] bg-[var(--background-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
              {student.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.photo_url}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-[var(--foreground-muted)]">
                  {student.name.charAt(0)}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">{student.name}</h1>
                <Badge variant={getStatusVariant(student.status)}>{getStatusLabel(student.status)}</Badge>
              </div>
              <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-0.5">
                NIM {student.nim}
                {student.campus_class ? ` · ${student.campus_class}` : ''}
                {student.semester ? ` · Semester ${student.semester}` : ''}
              </p>
              {student.pondok && (
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Pondok / Kampus: <span className="font-medium text-[var(--foreground)]">{student.pondok}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="w-full sm:w-auto"
            >
              <Edit2 size={14} />
              Edit Data
            </Button>
          </div>
        </div>
      </div>

      {/* Course Grades Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Mata Kuliah & Nilai</h2>
        {courses.length === 0 ? (
          <EmptyState
            title="Belum terdaftar di mata kuliah manapun"
            description="Daftarkan mahasiswa ini ke kelas perkuliahan di menu Mata Kuliah."
          />
        ) : (
          <div className="space-y-4">
            {courses.map((c) => (
              <Card key={c.courseId} className="p-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3">
                  <div>
                    <Link
                      href={`/academic/courses/${c.courseId}`}
                      className="text-base font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                    >
                      {c.name}
                    </Link>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {c.code ? `${c.code} · ` : ''}Semester {c.semester ?? '-'} · {c.sks ?? 0} SKS
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[var(--foreground-muted)] block">Nilai Akhir</span>
                    <span
                      className={`text-lg font-bold ${
                        c.finalScore === null
                          ? 'text-[var(--foreground-disabled)]'
                          : c.finalScore >= 80
                          ? 'text-[var(--success)]'
                          : c.finalScore >= 60
                          ? 'text-[var(--foreground)]'
                          : 'text-[var(--danger)]'
                      }`}
                    >
                      {c.finalScore !== null ? c.finalScore.toFixed(1) : 'Belum Lengkap'}
                    </span>
                  </div>
                </div>

                {/* Assessments grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {c.assessments.map((a) => (
                    <div
                      key={a.assessment_id}
                      className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-[var(--radius-sm)] p-2 text-center"
                    >
                      <p className="text-xs font-medium text-[var(--foreground-muted)] truncate">
                        {a.assessment_name}
                      </p>
                      <p className="text-[10px] text-[var(--foreground-disabled)]">({a.weight}%)</p>
                      <p className="text-sm font-semibold text-[var(--foreground)] mt-1">
                        {a.score !== null ? a.score : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Academic Summary Section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Ringkasan Akademik AI</h2>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              Evaluasi performa akademik menyeluruh menggunakan Gemini AI.
            </p>
          </div>
          {!loadingAi && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAiSummary}
              disabled={courses.length === 0}
            >
              <BrainCircuit size={14} />
              {aiResult ? 'Analisis Ulang' : 'Analisis AI'}
            </Button>
          )}
        </div>

        {loadingAi && (
          <div className="flex items-center justify-center py-8 gap-3">
            <Loader2 size={20} className="animate-spin text-[var(--foreground-muted)]" />
            <p className="text-sm text-[var(--foreground-muted)]">Gemini AI sedang menganalisis performa akademik...</p>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-[var(--radius-md)] bg-[var(--danger-subtle)] border border-red-200">
            <p className="text-sm text-[var(--danger)]">{error}</p>
          </div>
        )}

        {aiResult && !loadingAi && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--background-secondary)] border border-[var(--border)]">
              <BrainCircuit size={14} className="text-[var(--foreground-muted)]" />
              <p className="text-xs text-[var(--foreground-muted)]">
                Hasil evaluasi AI bersifat asisten pengajar — tinjau sebelum menjadi laporan resmi.
              </p>
            </div>

            {editMode ? (
              <div className="space-y-3">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full min-h-[220px] p-3 text-sm border border-[var(--border-strong)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--primary)] resize-y"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setAiResult(editedText)
                      setEditMode(false)
                    }}
                  >
                    Simpan Catatan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="prose prose-sm max-w-none text-[var(--foreground-secondary)] whitespace-pre-wrap"
                >
                  {aiResult}
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    Edit Catatan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {showEditModal && (
        <EditStudentModal
          student={student}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
