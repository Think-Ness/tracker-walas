'use client'

import { useState } from 'react'
import { Dialog, DialogHeader, DialogBody, DialogFooter, ConfirmDialog } from '@/components/ui/interactive'
import { Button, Input, Label, Textarea } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface ClassData {
  id: string
  name: string
  academic_year: string | null
  level: string | null
  description: string | null
}

interface EditClassModalProps {
  classGroup: ClassData
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditClassModal({
  classGroup,
  open,
  onOpenChange,
  onSuccess,
}: EditClassModalProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: classGroup.name,
    academic_year: classGroup.academic_year || '2026/2027',
    level: classGroup.level || 'Kelas 6',
    description: classGroup.description || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('class_groups')
      .update({
        name: formData.name.trim(),
        academic_year: formData.academic_year.trim() || null,
        level: formData.level.trim() || null,
        description: formData.description.trim() || null,
      })
      .eq('id', classGroup.id)

    setSaving(false)

    if (updateError) {
      error(updateError.message || 'Gagal memperbarui kelas.')
      return
    }

    success('Data kelas berhasil diperbarui!')
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
      .from('class_groups')
      .delete()
      .eq('id', classGroup.id)

    setDeleting(false)

    if (deleteError) {
      error(deleteError.message || 'Gagal menghapus kelas.')
      return
    }

    success('Kelas berhasil dihapus.')
    onOpenChange(false)
    router.push('/class')
    router.refresh()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogHeader title="Edit Data Kelas" onClose={() => onOpenChange(false)} />
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <Label htmlFor="edit-class-name" required>
                Nama Kelas / Rombel
              </Label>
              <Input
                id="edit-class-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Kelas 6 D"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-class-year">Tahun Ajaran</Label>
                <Input
                  id="edit-class-year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="2026/2027"
                />
              </div>

              <div>
                <Label htmlFor="edit-class-level">Tingkat / Marhalah</Label>
                <Input
                  id="edit-class-level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Contoh: Kelas 6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-class-desc">Deskripsi / Catatan Rombel</Label>
              <Textarea
                id="edit-class-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Keterangan wali kelas, catatan khusus rombel..."
                rows={3}
              />
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
              Hapus Kelas
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
        title="Hapus Kelas?"
        description={`Apakah Anda yakin ingin menghapus kelas "${classGroup.name}"? Semua data santri, riwayat monitoring harian, dan catatan insya' di dalam kelas ini akan DIHAPUS PERMANEN.`}
        confirmLabel="Ya, Hapus Kelas"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
