'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, Card, Button, Input, Label, Select } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/interactive'
import { useToast } from '@/components/ui/toast'
import { Breadcrumb } from '@/components/ui/data'
import { Upload, Plus, FileSpreadsheet, BookOpen, Check } from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'
import * as XLSX from 'xlsx'

interface CourseOption {
  id: string
  name: string
  code: string | null
  semester: string | null
}

export default function NewStudentPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-8 text-center text-sm text-[var(--foreground-muted)]">Memuat formulir...</div>}>
      <NewStudentForm />
    </Suspense>
  )
}

function NewStudentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCourseId = searchParams.get('courseId') || ''
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId)

  const [formData, setFormData] = useState({
    nim: '',
    name: '',
    campus_class: 'AFI 6A',
    semester: 6,
    pondok: 'Gontor',
    status: 'active',
    photo_url: null as string | null,
  })

  // Excel import
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState<Array<{
    nim: string
    name: string
    campus_class?: string
    semester?: number
    pondok?: string
  }>>([])

  useEffect(() => {
    async function loadWorkspaceAndCourses() {
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
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (ws) {
        setWorkspaceId(ws.id)

        // Load courses for this workspace
        const { data: courseList } = await supabase
          .from('courses')
          .select('id, name, code, semester')
          .eq('workspace_id', ws.id)
          .eq('is_active', true)
          .order('name')

        if (courseList) {
          setCourses(courseList)

          if (initialCourseId) {
            const matched = courseList.find((c) => c.id === initialCourseId)
            if (matched?.semester) {
              const semNum = parseInt(matched.semester)
              if (!isNaN(semNum)) {
                setFormData((prev) => ({ ...prev, semester: semNum }))
              }
            }
          }
        }
      } else {
        error('Silakan buat workspace mahasiswa terlebih dahulu.')
        router.push('/workspace/new?type=student')
      }
    }
    loadWorkspaceAndCourses()
  }, [router, error, initialCourseId])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nim.trim() || !formData.name.trim() || !workspaceId) return

    setLoading(true)
    const supabase = createClient()

    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        workspace_id: workspaceId,
        nim: formData.nim.trim(),
        name: formData.name.trim(),
        campus_class: formData.campus_class.trim() || null,
        semester: Number(formData.semester) || 6,
        pondok: formData.pondok.trim() || null,
        status: formData.status,
        photo_url: formData.photo_url,
      })
      .select('id')
      .single()

    setLoading(false)

    if (insertError) {
      error(insertError.message || 'Gagal menambahkan mahasiswa.')
      return
    }

    // Auto-enroll if course was selected
    if (selectedCourseId && newStudent) {
      await supabase.from('course_students').upsert({
        course_id: selectedCourseId,
        student_id: newStudent.id,
      }, { onConflict: 'course_id,student_id' })
    }

    success('Mahasiswa berhasil ditambahkan' + (selectedCourseId ? ' dan didaftarkan ke mata kuliah!' : '.'))

    if (selectedCourseId) {
      router.push(`/academic/courses/${selectedCourseId}`)
    } else {
      router.push('/academic/students')
    }
    router.refresh()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]

        if (data.length < 2) {
          error('File Excel kosong atau format tidak sesuai.')
          return
        }

        const headers = (data[0] as string[]).map((h) => String(h || '').toLowerCase().trim())
        const nimIdx = headers.findIndex((h) => h.includes('nim') || h.includes('stambuk') || h.includes('no'))
        const nameIdx = headers.findIndex((h) => h.includes('nama') || h.includes('name'))
        const classIdx = headers.findIndex((h) => h.includes('kelas') || h.includes('class') || h.includes('rombel'))
        const semIdx = headers.findIndex((h) => h.includes('semester') || h.includes('sem'))
        const pondokIdx = headers.findIndex((h) => h.includes('pondok') || h.includes('kampus') || h.includes('daerah'))

        if (nimIdx === -1 || nameIdx === -1) {
          error('Kolom "NIM" dan "Nama" tidak ditemukan. Pastikan baris pertama adalah header.')
          return
        }

        const parsed = []
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          if (!row || !row[nimIdx] || !row[nameIdx]) continue

          parsed.push({
            nim: String(row[nimIdx]).trim(),
            name: String(row[nameIdx]).trim(),
            campus_class: classIdx !== -1 && row[classIdx] ? String(row[classIdx]).trim() : undefined,
            semester: semIdx !== -1 && !isNaN(Number(row[semIdx])) ? Number(row[semIdx]) : 6,
            pondok: pondokIdx !== -1 && row[pondokIdx] ? String(row[pondokIdx]).trim() : undefined,
          })
        }

        if (parsed.length === 0) {
          error('Tidak ada baris data mahasiswa yang valid dalam file.')
          return
        }

        setPreviewData(parsed)
        success(`${parsed.length} data mahasiswa berhasil dibaca. Silakan periksa preview lalu klik Impor.`)
      } catch (err: any) {
        error('Gagal membaca file Excel: ' + (err.message || 'Format tidak valid.'))
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleBatchImport = async () => {
    if (previewData.length === 0 || !workspaceId) return

    setImporting(true)
    const supabase = createClient()

    const records = previewData.map((d) => ({
      workspace_id: workspaceId,
      nim: d.nim,
      name: d.name,
      campus_class: d.campus_class || null,
      semester: d.semester || 6,
      pondok: d.pondok || null,
      status: 'active',
    }))

    const { data: inserted, error: batchError } = await supabase
      .from('students')
      .upsert(records, { onConflict: 'workspace_id,nim' })
      .select('id')

    setImporting(false)

    if (batchError) {
      error(batchError.message || 'Gagal mengimpor data mahasiswa.')
      return
    }

    if (selectedCourseId && inserted) {
      const enrollments = inserted.map((s) => ({
        course_id: selectedCourseId,
        student_id: s.id,
      }))
      await supabase.from('course_students').upsert(enrollments, { onConflict: 'course_id,student_id' })
    }

    success(`${records.length} mahasiswa berhasil diimpor!`)
    if (selectedCourseId) {
      router.push(`/academic/courses/${selectedCourseId}`)
    } else {
      router.push('/academic/students')
    }
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Breadcrumb
        items={[
          { label: 'Mahasiswa', href: '/academic/students' },
          { label: 'Tambah Mahasiswa' },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Tambah Mahasiswa Baru"
        description="Input satu per satu atau impor daftar mahasiswa dari file Excel."
      />

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">
            <Plus size={14} className="mr-1.5" />
            Input Manual
          </TabsTrigger>
          <TabsTrigger value="excel">
            <FileSpreadsheet size={14} className="mr-1.5" />
            Impor File Excel
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Input Manual */}
        <TabsContent value="manual">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Card className="p-5 space-y-4">
              {/* Auto Course Selection */}
              <div className="bg-[var(--background-secondary)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen size={16} className="text-[var(--primary)]" />
                  <Label htmlFor="student-course" className="font-semibold text-xs text-[var(--foreground)]">
                    Pilih Mata Kuliah (Otomatis Terdaftar)
                  </Label>
                </div>
                <Select
                  id="student-course"
                  value={selectedCourseId}
                  onChange={(e) => {
                    const cId = e.target.value
                    setSelectedCourseId(cId)
                    const c = courses.find((item) => item.id === cId)
                    if (c?.semester) {
                      const parsed = parseInt(c.semester)
                      if (!isNaN(parsed)) setFormData((prev) => ({ ...prev, semester: parsed }))
                    }
                  }}
                >
                  <option value="">-- Pilih Mata Kuliah (Opsional) --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.code ? `(${c.code})` : ''} {c.semester ? `· Semester ${c.semester}` : ''}
                    </option>
                  ))}
                </Select>
                {selectedCourseId ? (
                  <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                    <Check size={13} />
                    Mahasiswa akan otomatis masuk ke daftar nilai mata kuliah ini.
                  </p>
                ) : (
                  <p className="text-[11px] text-[var(--foreground-muted)] mt-1.5">
                    Pilih mata kuliah agar mahasiswa langsung masuk ke gradebook.
                  </p>
                )}
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Pas Foto Mahasiswa (3x4)</Label>
                <ImageUpload
                  currentUrl={formData.photo_url}
                  onUploadSuccess={(url) => setFormData({ ...formData, photo_url: url })}
                  folder="students"
                  aspectRatio="portrait"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nim" required>NIM</Label>
                  <Input
                    id="nim"
                    placeholder="Contoh: 410013"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="campus_class">Kelas / Rombel Kampus</Label>
                  <Input
                    id="campus_class"
                    placeholder="Contoh: AFI 6A"
                    value={formData.campus_class}
                    onChange={(e) => setFormData({ ...formData, campus_class: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="std-name" required>Nama Lengkap Mahasiswa</Label>
                <Input
                  id="std-name"
                  placeholder="Nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="std-sem">Semester</Label>
                  <Input
                    id="std-sem"
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="std-pondok">Pondok / Kampus</Label>
                  <Input
                    id="std-pondok"
                    placeholder="Contoh: Gontor"
                    value={formData.pondok}
                    onChange={(e) => setFormData({ ...formData, pondok: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="std-status">Status</Label>
                <Select
                  id="std-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                  <option value="graduated">Lulus</option>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  Simpan Mahasiswa
                </Button>
              </div>
            </Card>
          </form>
        </TabsContent>

        {/* Tab 2: Import Excel */}
        <TabsContent value="excel">
          <Card className="p-5 space-y-4">
            {/* Auto Course Selection for Import */}
            <div className="bg-[var(--background-secondary)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen size={16} className="text-[var(--primary)]" />
                <Label htmlFor="import-course" className="font-semibold text-xs text-[var(--foreground)]">
                  Daftarkan Hasil Impor ke Mata Kuliah (Opsional)
                </Label>
              </div>
              <Select
                id="import-course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">-- Tanpa Mata Kuliah (Hanya Database Mahasiswa) --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div className="border-2 border-dashed border-[var(--border-strong)] rounded-[var(--radius-md)] p-6 text-center">
              <Upload size={24} className="mx-auto text-[var(--foreground-muted)] mb-2" />
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                Pilih File Excel (.xlsx / .xls)
              </p>
              <p className="text-xs text-[var(--foreground-muted)] mb-4">
                Header kolom harus memiliki minimal: <strong>NIM</strong> dan <strong>Nama</strong>.
              </p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary)] file:text-white hover:file:bg-[var(--primary-hover)] cursor-pointer"
              />
            </div>

            {previewData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    Preview Data ({previewData.length} Mahasiswa)
                  </h3>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={importing}
                    onClick={handleBatchImport}
                  >
                    Impor Sekarang
                  </Button>
                </div>

                <div className="border border-[var(--border)] rounded-[var(--radius-md)] overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[var(--background-secondary)] text-[var(--foreground-muted)] border-b border-[var(--border)]">
                      <tr>
                        <th className="px-3 py-2">NIM</th>
                        <th className="px-3 py-2">Nama</th>
                        <th className="px-3 py-2">Kelas</th>
                        <th className="px-3 py-2">Semester</th>
                        <th className="px-3 py-2">Pondok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {previewData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-[var(--background-secondary)]">
                          <td className="px-3 py-1.5 font-mono">{row.nim}</td>
                          <td className="px-3 py-1.5 font-medium">{row.name}</td>
                          <td className="px-3 py-1.5">{row.campus_class || '-'}</td>
                          <td className="px-3 py-1.5">{row.semester || 6}</td>
                          <td className="px-3 py-1.5">{row.pondok || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 10 && (
                    <p className="p-2 text-[11px] text-center text-[var(--foreground-muted)] bg-[var(--background-secondary)]">
                      ...dan {previewData.length - 10} mahasiswa lainnya.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
