'use client'

import { useState, useCallback } from 'react'
import { Button, StatCard, Input, Label, Select } from '@/components/ui'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/interactive'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Save, Plus, Settings, Edit2 } from 'lucide-react'
import type { Assessment, AssessmentScore } from '@/lib/types'
import { calculateWeightedScore } from '@/lib/utils'
import { EditCourseModal } from './EditCourseModal'

interface Student {
  id: string
  nim: string
  name: string
  campus_class: string | null
  semester: number | null
  status: string
}

interface Course {
  id: string
  name: string
  code: string | null
  semester: string | null
  sks: number | null
  academic_year: string | null
}

interface Props {
  courseId: string
  course: Course
  assessments: Assessment[]
  students: Student[]
  scores: AssessmentScore[]
  userId: string
}

type ScoreMap = Record<string, Record<string, string>> // { studentId: { assessmentId: score }}

function buildScoreMap(scores: AssessmentScore[]): ScoreMap {
  const map: ScoreMap = {}
  for (const s of scores) {
    if (!map[s.student_id]) map[s.student_id] = {}
    map[s.student_id][s.assessment_id] = s.score !== null ? String(s.score) : ''
  }
  return map
}

export default function GradebookClient({
  courseId,
  course,
  assessments,
  students,
  scores,
  userId,
}: Props) {
  const { success, error } = useToast()
  const [scoreMap, setScoreMap] = useState<ScoreMap>(buildScoreMap(scores))
  const [saving, setSaving] = useState(false)
  const [dirtyStudents, setDirtyStudents] = useState<Set<string>>(new Set())

  // Modal edit mata kuliah
  const [showEditCourseModal, setShowEditCourseModal] = useState(false)

  // Modal tambah komponen penilaian
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingAssessment, setAddingAssessment] = useState(false)
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: 'Tugas',
    weight: '10',
    max_score: '100',
  })

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAssessment.name.trim()) return

    setAddingAssessment(true)
    const supabase = createClient()

    const { error: insertErr } = await supabase
      .from('assessments')
      .insert({
        course_id: courseId,
        name: newAssessment.name.trim(),
        type: newAssessment.type,
        weight: parseFloat(newAssessment.weight) || 0,
        max_score: parseFloat(newAssessment.max_score) || 100,
        order_index: assessments.length + 1,
      })

    setAddingAssessment(false)

    if (insertErr) {
      error(insertErr.message || 'Gagal menambahkan komponen penilaian.')
      return
    }

    success('Komponen penilaian berhasil ditambahkan!')
    setShowAddModal(false)
    window.location.reload()
  }

  const totalWeight = assessments.reduce((a, ass) => a + ass.weight, 0)

  const handleScoreChange = useCallback(
    (studentId: string, assessmentId: string, value: string) => {
      setScoreMap((prev) => ({
        ...prev,
        [studentId]: { ...(prev[studentId] ?? {}), [assessmentId]: value },
      }))
      setDirtyStudents((prev) => new Set(prev).add(studentId))
    },
    []
  )

  const getStudentFinalScore = (studentId: string): number | null => {
    const scoreEntries = assessments.map((a) => ({
      score: parseFloat(scoreMap[studentId]?.[a.id] ?? '') || null,
      weight: a.weight,
      max_score: a.max_score,
    }))
    return calculateWeightedScore(scoreEntries)
  }

  const handleSaveAll = async () => {
    if (dirtyStudents.size === 0) return
    setSaving(true)

    const supabase = createClient()
    const upserts: Array<{
      assessment_id: string
      student_id: string
      score: number | null
    }> = []

    for (const studentId of dirtyStudents) {
      for (const assessment of assessments) {
        const rawScore = scoreMap[studentId]?.[assessment.id]
        const parsedScore = rawScore !== '' && rawScore !== undefined ? parseFloat(rawScore) : null
        if (!isNaN(parsedScore as number) || parsedScore === null) {
          upserts.push({
            assessment_id: assessment.id,
            student_id: studentId,
            score: parsedScore,
          })
        }
      }
    }

    const { error: err } = await supabase
      .from('assessment_scores')
      .upsert(upserts, { onConflict: 'assessment_id,student_id' })

    setSaving(false)

    if (err) {
      error('Gagal menyimpan nilai. Coba lagi.')
    } else {
      success(`Nilai berhasil disimpan (${dirtyStudents.size} mahasiswa).`)
      setDirtyStudents(new Set())
    }
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard label="Mahasiswa" value={students.length} />
        <StatCard label="Komponen Penilaian" value={assessments.length} />
        <StatCard
          label="Total Bobot"
          value={`${totalWeight}%`}
          subtitle={totalWeight !== 100 ? '⚠ Bobot belum 100%' : undefined}
        />
      </div>

      {/* Weight warning */}
      {totalWeight !== 100 && assessments.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--warning-subtle)] border border-amber-200">
          <p className="text-sm text-[var(--warning)]">
            Total bobot penilaian saat ini {totalWeight}%. Pastikan total bobot = 100% untuk nilai akhir yang akurat.
          </p>
        </div>
      )}

      {/* Gradebook toolbar */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Gradebook
        </h2>
        <div className="flex items-center gap-2">
          {dirtyStudents.size > 0 && (
            <span className="text-xs text-[var(--warning)]">
              {dirtyStudents.size} perubahan belum disimpan
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditCourseModal(true)}
          >
            <Edit2 size={14} />
            Edit Mata Kuliah
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} />
            Tambah Komponen
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAll}
            loading={saving}
            disabled={dirtyStudents.size === 0}
          >
            <Save size={14} />
            Simpan Nilai
          </Button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-8 text-center">
          <p className="text-sm text-[var(--foreground-muted)]">
            Belum ada komponen penilaian. Tambahkan komponen penilaian (Tugas, UTS, UAS, dll.) terlebih dahulu.
          </p>
          <div className="mt-4">
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} />
              Tambah Komponen Penilaian
            </Button>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-8 text-center">
          <p className="text-sm text-[var(--foreground-muted)]">
            Belum ada mahasiswa yang terdaftar di mata kuliah ini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-[var(--border)] rounded-[var(--radius-lg)]">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide sticky left-0 bg-[var(--background-secondary)] z-10 whitespace-nowrap min-w-[200px]">
                  Mahasiswa
                </th>
                {assessments.map((a) => (
                  <th
                    key={a.id}
                    className="px-3 py-2.5 text-center text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide whitespace-nowrap min-w-[80px]"
                  >
                    <div>{a.name}</div>
                    <div className="text-[10px] font-normal text-[var(--foreground-disabled)] normal-case">
                      {a.weight}%
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide whitespace-nowrap min-w-[80px]">
                  Nilai Akhir
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {students.map((student) => {
                const finalScore = getStudentFinalScore(student.id)
                const isDirty = dirtyStudents.has(student.id)

                return (
                  <tr
                    key={student.id}
                    className={isDirty ? 'bg-[var(--warning-subtle)]' : 'hover:bg-[var(--background-secondary)]'}
                  >
                    <td className="px-4 py-2 sticky left-0 bg-inherit z-10 border-r border-[var(--border)]">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{student.name}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{student.nim}</p>
                      </div>
                    </td>
                    {assessments.map((assessment) => {
                      const currentScore = scoreMap[student.id]?.[assessment.id] ?? ''
                      return (
                        <td key={assessment.id} className="px-2 py-1.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={assessment.max_score}
                            step="0.5"
                            value={currentScore}
                            onChange={(e) =>
                              handleScoreChange(student.id, assessment.id, e.target.value)
                            }
                            placeholder="—"
                            aria-label={`Nilai ${student.name} - ${assessment.name}`}
                            className="w-16 h-8 text-center text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-white focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                          />
                        </td>
                      )
                    })}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          finalScore === null
                            ? 'text-[var(--foreground-disabled)]'
                            : finalScore >= 80
                            ? 'text-[var(--success)]'
                            : finalScore >= 60
                            ? 'text-[var(--foreground)]'
                            : 'text-[var(--danger)]'
                        }`}
                      >
                        {finalScore !== null ? finalScore.toFixed(1) : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah Komponen Penilaian */}
      {showAddModal && (
        <Dialog open onOpenChange={setShowAddModal}>
          <DialogHeader title="Tambah Komponen Penilaian" onClose={() => setShowAddModal(false)} />
          <form onSubmit={handleAddAssessment}>
            <DialogBody className="space-y-4">
              <div>
                <Label htmlFor="as-name" required>Nama Komponen</Label>
                <Input
                  id="as-name"
                  placeholder="Contoh: Tugas 2, Quiz 1, Project"
                  value={newAssessment.name}
                  onChange={(e) => setNewAssessment({ ...newAssessment, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="as-type" required>Tipe</Label>
                  <Select
                    id="as-type"
                    value={newAssessment.type}
                    onChange={(e) => setNewAssessment({ ...newAssessment, type: e.target.value })}
                  >
                    <option value="Tugas">Tugas</option>
                    <option value="Presentasi">Presentasi</option>
                    <option value="PPT">PPT</option>
                    <option value="Quiz">Quiz</option>
                    <option value="UTS">UTS</option>
                    <option value="UAS">UAS</option>
                    <option value="Project">Project</option>
                    <option value="Lainnya">Lainnya</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="as-weight" required>Bobot (%)</Label>
                  <Input
                    id="as-weight"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={newAssessment.weight}
                    onChange={(e) => setNewAssessment({ ...newAssessment, weight: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="as-max">Skor Maksimal</Label>
                <Input
                  id="as-max"
                  type="number"
                  min="1"
                  value={newAssessment.max_score}
                  onChange={(e) => setNewAssessment({ ...newAssessment, max_score: e.target.value })}
                  required
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" loading={addingAssessment}>
                Simpan Komponen
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}

      {showEditCourseModal && (
        <EditCourseModal
          course={course}
          open={showEditCourseModal}
          onOpenChange={setShowEditCourseModal}
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
