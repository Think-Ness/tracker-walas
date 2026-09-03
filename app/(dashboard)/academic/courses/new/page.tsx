'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, Card, Button, Input, Label, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { Breadcrumb } from '@/components/ui/data'
import { Plus, Trash2 } from 'lucide-react'

interface AssessmentItem {
  name: string
  type: string
  weight: number
  max_score: number
}

const DEFAULT_ASSESSMENTS: AssessmentItem[] = [
  { name: 'Tugas 1', type: 'Tugas', weight: 10, max_score: 100 },
  { name: 'Presentasi', type: 'Presentasi', weight: 15, max_score: 100 },
  { name: 'Quiz', type: 'Quiz', weight: 15, max_score: 100 },
  { name: 'UTS', type: 'UTS', weight: 30, max_score: 100 },
  { name: 'UAS', type: 'UAS', weight: 30, max_score: 100 },
]

export default function NewCoursePage() {
  const router = useRouter()
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [courseData, setCourseData] = useState({
    code: 'AFI601',
    name: '',
    semester: '6',
    academic_year: '2026/2027',
    sks: 3,
    description: '',
  })

  const [assessments, setAssessments] = useState<AssessmentItem[]>(DEFAULT_ASSESSMENTS)

  useEffect(() => {
    async function loadWorkspace() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: ws } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .eq('type', 'student')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (ws) {
        setWorkspaceId(ws.id)
      } else {
        error('Silakan buat workspace mahasiswa terlebih dahulu.')
        router.push('/workspace/new?type=student')
      }
    }
    loadWorkspace()
  }, [router, error])

  const addAssessmentRow = () => {
    setAssessments([
      ...assessments,
      { name: `Tugas ${assessments.length + 1}`, type: 'Tugas', weight: 0, max_score: 100 },
    ])
  }

  const removeAssessmentRow = (index: number) => {
    setAssessments(assessments.filter((_, i) => i !== index))
  }

  const updateAssessment = (index: number, field: keyof AssessmentItem, value: any) => {
    const updated = [...assessments]
    updated[index] = { ...updated[index], [field]: value }
    setAssessments(updated)
  }

  const totalWeight = assessments.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseData.name.trim() || !workspaceId) return

    setLoading(true)
    const supabase = createClient()

    // 1. Insert Course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        workspace_id: workspaceId,
        code: courseData.code.trim() || null,
        name: courseData.name.trim(),
        semester: courseData.semester.trim() || null,
        academic_year: courseData.academic_year.trim() || null,
        sks: Number(courseData.sks) || 3,
        description: courseData.description.trim() || null,
      })
      .select()
      .single()

    if (courseError) {
      setLoading(false)
      error(courseError.message || 'Gagal membuat mata kuliah.')
      return
    }

    // 2. Insert Assessments if any
    if (assessments.length > 0) {
      const assessmentRecords = assessments.map((a, idx) => ({
        course_id: course.id,
        name: a.name.trim(),
        type: a.type,
        weight: Number(a.weight) || 0,
        max_score: Number(a.max_score) || 100,
        order_index: idx + 1,
      }))

      await supabase.from('assessments').insert(assessmentRecords)
    }

    setLoading(false)
    success('Mata kuliah dan komponen penilaian berhasil disimpan!')
    router.push(`/academic/courses/${course.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Breadcrumb
        items={[
          { label: 'Mata Kuliah', href: '/academic/courses' },
          { label: 'Tambah Mata Kuliah' },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Tambah Mata Kuliah Baru"
        description="Lengkapi informasi mata kuliah beserta rincian bobot penilaian."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Informasi Mata Kuliah</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Kode Mata Kuliah</Label>
                <Input
                  id="code"
                  placeholder="Contoh: AFI601"
                  value={courseData.code}
                  onChange={(e) => setCourseData({ ...courseData, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="name" required>Nama Mata Kuliah</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Metodologi Penelitian"
                  value={courseData.name}
                  onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  placeholder="6"
                  value={courseData.semester}
                  onChange={(e) => setCourseData({ ...courseData, semester: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sks">SKS</Label>
                <Input
                  id="sks"
                  type="number"
                  placeholder="3"
                  value={courseData.sks}
                  onChange={(e) => setCourseData({ ...courseData, sks: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="academic_year">Tahun Akademik</Label>
                <Input
                  id="academic_year"
                  placeholder="2026/2027"
                  value={courseData.academic_year}
                  onChange={(e) => setCourseData({ ...courseData, academic_year: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="desc">Deskripsi</Label>
              <Textarea
                id="desc"
                placeholder="Rincian silabus atau keterangan mata kuliah..."
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Assessment Component Builder */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Komponen Penilaian & Bobot</h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                Total Bobot: <strong className={totalWeight === 100 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}>{totalWeight}%</strong> {totalWeight !== 100 && '(Sebaiknya 100%)'}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addAssessmentRow}>
              <Plus size={14} />
              Tambah Komponen
            </Button>
          </div>

          <div className="space-y-3">
            {assessments.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Nama (contoh: Tugas 1)"
                  value={item.name}
                  onChange={(e) => updateAssessment(index, 'name', e.target.value)}
                  className="flex-1"
                  required
                />
                <select
                  value={item.type}
                  onChange={(e) => updateAssessment(index, 'type', e.target.value)}
                  className="h-10 px-2 text-sm rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-white"
                >
                  <option value="Tugas">Tugas</option>
                  <option value="Presentasi">Presentasi</option>
                  <option value="PPT">PPT</option>
                  <option value="Quiz">Quiz</option>
                  <option value="UTS">UTS</option>
                  <option value="UAS">UAS</option>
                  <option value="Project">Project</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <div className="flex items-center gap-1 w-24">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.weight}
                    onChange={(e) => updateAssessment(index, 'weight', Number(e.target.value))}
                    className="w-16 text-center"
                    required
                  />
                  <span className="text-xs text-[var(--foreground-muted)]">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAssessmentRow(index)}
                  className="p-2 text-[var(--foreground-muted)] hover:text-[var(--danger)] transition-colors"
                  aria-label="Hapus komponen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!workspaceId}>
            Simpan Mata Kuliah
          </Button>
        </div>
      </form>
    </div>
  )
}
