'use client'

import { useState } from 'react'
import { Dialog, DialogHeader, DialogBody, DialogFooter, ConfirmDialog } from '@/components/ui/interactive'
import { Button, Input, Label, Select } from '@/components/ui'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import type { Student, MemberStatus } from '@/lib/types'

interface EditStudentModalProps {
  student: Student
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditStudentModal({
  student,
  open,
  onOpenChange,
  onSuccess,
}: EditStudentModalProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: student.name,
    nim: student.nim,
    campus_class: student.campus_class || '',
    semester: student.semester || 6,
    pondok: student.pondok || '',
    status: student.status,
    photo_url: student.photo_url || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.nim.trim()) return

    setSaving(true)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('students')
      .update({
        name: formData.name.trim(),
        nim: formData.nim.trim(),
        campus_class: formData.campus_class.trim() || null,
        semester: Number(formData.semester) || null,
        pondok: formData.pondok.trim() || null,
        status: formData.status as MemberStatus,
        photo_url: formData.photo_url,
      })
      .eq('id', student.id)

    setSaving(false)

    if (updateError) {
      error(updateError.message || 'Gagal memperbarui data mahasiswa.')
      return
    }

    success('Data mahasiswa berhasil diperbarui!')
    onOpenChange(false)
    onSuccess()
  }

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', student.id)

    setDeleting(false)

    if (deleteError) {
      error(deleteError.message || 'Gagal menghapus mahasiswa.')
      return
    }

    success('Mahasiswa berhasil dihapus.')
    router.push('/academic/students')
    router.refresh()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogHeader title="Edit Data Mahasiswa" onClose={() => onOpenChange(false)} />
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Foto Profile Upload */}
            <ImageUpload
              currentUrl={formData.photo_url}
              onUploadSuccess={(url) => setFormData({ ...formData, photo_url: url })}
              folder="students"
              label="Foto Mahasiswa (Kamera / Galeri)"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-nim" required>NIM</Label>
                <Input
                  id="edit-nim"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-campus-class">Kelas / Rombel Kampus</Label>
                <Input
                  id="edit-campus-class"
                  value={formData.campus_class}
                  onChange={(e) => setFormData({ ...formData, campus_class: e.target.value })}
                  placeholder="Contoh: AFI 6A"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-std-name" required>Nama Lengkap</Label>
              <Input
                id="edit-std-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-sem">Semester</Label>
                <Input
                  id="edit-sem"
                  type="number"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="edit-pondok">Pondok / Kampus</Label>
                <Input
                  id="edit-pondok"
                  value={formData.pondok}
                  onChange={(e) => setFormData({ ...formData, pondok: e.target.value })}
                  placeholder="Contoh: Gontor"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-std-status">Status Mahasiswa</Label>
              <Select
                id="edit-std-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="graduated">Lulus</option>
                <option value="archived">Diarsipkan</option>
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
              Hapus
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
        title="Hapus Mahasiswa?"
        description={`Apakah Anda yakin ingin menghapus data "${student.name}"? Semua data nilai mata kuliah mahasiswa ini akan ikut terhapus.`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
