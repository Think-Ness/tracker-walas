'use client'

import { useState } from 'react'
import { Dialog, DialogHeader, DialogBody, DialogFooter, ConfirmDialog } from '@/components/ui/interactive'
import { Button, Input, Label, Textarea, Select } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface CourseData {
  id: string
  name: string
  code: string | null
  semester: string | null
  sks: number | null
  academic_year: string | null
  description?: string | null
  is_active?: boolean
}

interface EditCourseModalProps {
  course: CourseData
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCourseModal({
  course,
  open,
  onOpenChange,
  onSuccess,
}: EditCourseModalProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: course.name,
    code: course.code || '',
    semester: course.semester || '6',
    sks: course.sks || 2,
    academic_year: course.academic_year || '2026/2027',
    description: course.description || '',
    is_active: course.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('courses')
      .update({
        name: formData.name.trim(),
        code: formData.code.trim() || null,
        semester: formData.semester.trim() || null,
        sks: Number(formData.sks) || 0,
        academic_year: formData.academic_year.trim() || null,
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      })
      .eq('id', course.id)

    setSaving(false)

    if (updateError) {
      error(updateError.message || 'Gagal memperbarui mata kuliah.')
      return
    }

    success('Mata kuliah berhasil diperbarui!')
    onOpenChange(false)
    if (onSuccess) onSuccess()
    else {
      router.refresh()
      window.location.reload()
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', course.id)

    setDeleting(false)

    if (deleteError) {
      error(deleteError.message || 'Gagal menghapus mata kuliah.')
      return
    }

    success('Mata kuliah berhasil dihapus.')
    onOpenChange(false)
    router.push('/academic/courses')
    router.refresh()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogHeader title="Edit Mata Kuliah" onClose={() => onOpenChange(false)} />
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <Label htmlFor="edit-course-name" required>
                Nama Mata Kuliah
              </Label>
              <Input
                id="edit-course-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Ushul Fiqh"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-course-code">Kode MK</Label>
                <Input
                  id="edit-course-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: USH-201"
                />
              </div>

              <div>
                <Label htmlFor="edit-course-sks">Bobot SKS</Label>
                <Input
                  id="edit-course-sks"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.sks}
                  onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-course-sem">Semester</Label>
                <Input
                  id="edit-course-sem"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="Contoh: 6 atau Ganjil"
                />
              </div>

              <div>
                <Label htmlFor="edit-course-year">Tahun Akademik</Label>
                <Input
                  id="edit-course-year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="2026/2027"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-course-desc">Deskripsi (Opsional)</Label>
              <Textarea
                id="edit-course-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Silabus atau catatan mata kuliah..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-course-status">Status</Label>
              <Select
                id="edit-course-status"
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.value === 'active' })
                }
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
            </div>
          </DialogBody>

          <DialogFooter className="justify-between">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            >
              <Trash2 size={14} />
              Hapus Mata Kuliah
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                Simpan Perubahan
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Hapus Mata Kuliah?"
        description={`Apakah Anda yakin ingin menghapus mata kuliah "${course.name}"? Semua komponen penilaian (Tugas, Kuis, UTS, UAS) dan rekapitulasi nilai mahasiswa di dalamnya akan ikut terhapus.`}
        confirmLabel="Ya, Hapus Mata Kuliah"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
