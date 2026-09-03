'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/interactive'
import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { UserPlus, Search, Check, Plus } from 'lucide-react'
import Link from 'next/link'

interface StudentItem {
  id: string
  nim: string
  name: string
  campus_class: string | null
  semester: number | null
}

interface Props {
  courseId: string
  courseName: string
  enrolledStudentIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddStudentToCourseModal({
  courseId,
  courseName,
  enrolledStudentIds,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [allStudents, setAllStudents] = useState<StudentItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open) return

    async function loadWorkspaceStudents() {
      setLoading(true)
      const supabase = createClient()

      // 1. Get course workspace_id
      const { data: course } = await supabase
        .from('courses')
        .select('workspace_id')
        .eq('id', courseId)
        .single()

      if (!course) {
        setLoading(false)
        return
      }

      // 2. Get all students in this workspace
      const { data: students } = await supabase
        .from('students')
        .select('id, nim, name, campus_class, semester')
        .eq('workspace_id', course.workspace_id)
        .order('name')

      setAllStudents(students || [])
      setSelectedIds(new Set())
      setLoading(false)
    }

    loadWorkspaceStudents()
  }, [open, courseId])

  const enrolledSet = new Set(enrolledStudentIds)
  const availableStudents = allStudents.filter((s) => !enrolledSet.has(s.id))

  const filteredStudents = availableStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleEnrollSelected = async () => {
    if (selectedIds.size === 0) return

    setEnrolling(true)
    const supabase = createClient()

    const inserts = Array.from(selectedIds).map((studentId) => ({
      course_id: courseId,
      student_id: studentId,
    }))

    const { error: insertErr } = await supabase
      .from('course_students')
      .insert(inserts)

    setEnrolling(false)

    if (insertErr) {
      error(insertErr.message || 'Gagal mendaftarkan mahasiswa.')
      return
    }

    success(`${selectedIds.size} mahasiswa berhasil didaftarkan ke ${courseName}!`)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader
        title={`Tambah Mahasiswa ke ${courseName}`}
        onClose={() => onOpenChange(false)}
      />
      <DialogBody className="space-y-4">
        {/* Quick action: Buat Mahasiswa Baru */}
        <div className="bg-[var(--primary-subtle)] border border-blue-200 rounded-[var(--radius-md)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-[var(--foreground)]">
              Ingin input data mahasiswa baru?
            </p>
            <p className="text-[11px] text-[var(--foreground-muted)]">
              Input NIM, Nama & Foto yang akan otomatis masuk ke mata kuliah ini.
            </p>
          </div>
          <Link
            href={`/academic/students/new?courseId=${courseId}`}
            onClick={() => onOpenChange(false)}
          >
            <Button variant="primary" size="sm" className="h-8 text-xs whitespace-nowrap">
              <UserPlus size={13} />
              + Buat Mahasiswa Baru
            </Button>
          </Link>
        </div>

        {/* Existing Students Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
              Atau Pilih dari Database Mahasiswa
            </h3>
            <span className="text-xs text-[var(--foreground-muted)]">
              {availableStudents.length} belum terdaftar
            </span>
          </div>

          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NIM..."
              className="pl-9 h-8 text-xs"
            />
          </div>

          <div className="border border-[var(--border)] rounded-[var(--radius-md)] max-h-56 overflow-y-auto divide-y divide-[var(--border)]">
            {loading ? (
              <p className="p-4 text-xs text-center text-[var(--foreground-muted)]">
                Memuat daftar mahasiswa...
              </p>
            ) : filteredStudents.length === 0 ? (
              <p className="p-4 text-xs text-center text-[var(--foreground-muted)]">
                {availableStudents.length === 0
                  ? 'Semua mahasiswa di database sudah terdaftar di mata kuliah ini.'
                  : 'Tidak ada mahasiswa yang cocok dengan pencarian.'}
              </p>
            ) : (
              filteredStudents.map((s) => {
                const isSelected = selectedIds.has(s.id)
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-[var(--primary)] font-medium'
                        : 'hover:bg-[var(--background-secondary)]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-[11px] text-[var(--foreground-muted)]">
                        {s.nim} {s.campus_class ? `· ${s.campus_class}` : ''}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'border-[var(--border-strong)]'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="justify-between">
        <span className="text-xs text-[var(--foreground-muted)]">
          {selectedIds.size > 0 ? `${selectedIds.size} mahasiswa dipilih` : 'Pilih mahasiswa'}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={selectedIds.size === 0}
            loading={enrolling}
            onClick={handleEnrollSelected}
          >
            Daftarkan ({selectedIds.size})
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
