'use client'

import { useState } from 'react'
import { Dialog, DialogHeader, DialogBody, DialogFooter, ConfirmDialog } from '@/components/ui/interactive'
import { Button, Input, Label, Select } from '@/components/ui'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import type { ClassMember, MemberStatus } from '@/lib/types'

interface EditMemberModalProps {
  member: ClassMember
  classId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditMemberModal({
  member,
  classId,
  open,
  onOpenChange,
  onSuccess,
}: EditMemberModalProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: member.name,
    stambuk: member.stambuk,
    class_name: member.class_name,
    daerah: member.daerah || '',
    rayon: member.rayon || '',
    status: member.status,
    photo_url: member.photo_url || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.stambuk.trim()) return

    setSaving(true)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('class_members')
      .update({
        name: formData.name.trim(),
        stambuk: formData.stambuk.trim(),
        class_name: formData.class_name.trim(),
        daerah: formData.daerah.trim() || null,
        rayon: formData.rayon.trim() || null,
        status: formData.status as MemberStatus,
        photo_url: formData.photo_url,
      })
      .eq('id', member.id)

    setSaving(false)

    if (updateError) {
      error(updateError.message || 'Gagal memperbarui data anggota.')
      return
    }

    success('Data anggota berhasil diperbarui!')
    onOpenChange(false)
    onSuccess()
  }

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('class_members')
      .delete()
      .eq('id', member.id)

    setDeleting(false)

    if (deleteError) {
      error(deleteError.message || 'Gagal menghapus anggota.')
      return
    }

    success('Anggota berhasil dihapus.')
    router.push(`/class/${classId}/members`)
    router.refresh()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogHeader title="Edit Data Anggota" onClose={() => onOpenChange(false)} />
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Foto Profile Upload */}
            <ImageUpload
              currentUrl={formData.photo_url}
              onUploadSuccess={(url) => setFormData({ ...formData, photo_url: url })}
              folder="members"
              label="Foto Santri (Kamera / Galeri)"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-stambuk" required>No. Stambuk</Label>
                <Input
                  id="edit-stambuk"
                  value={formData.stambuk}
                  onChange={(e) => setFormData({ ...formData, stambuk: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-class" required>Kelas</Label>
                <Input
                  id="edit-class"
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-name" required>Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-daerah">Daerah / Asal</Label>
                <Input
                  id="edit-daerah"
                  value={formData.daerah}
                  onChange={(e) => setFormData({ ...formData, daerah: e.target.value })}
                  placeholder="Contoh: Surabaya"
                />
              </div>

              <div>
                <Label htmlFor="edit-rayon">Rayon / Konsulat</Label>
                <Input
                  id="edit-rayon"
                  value={formData.rayon}
                  onChange={(e) => setFormData({ ...formData, rayon: e.target.value })}
                  placeholder="Contoh: Darussalam"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-status">Status Anggota</Label>
              <Select
                id="edit-status"
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
        title="Hapus Anggota Kelas?"
        description={`Apakah Anda yakin ingin menghapus data "${member.name}"? Semua histori monitoring dan insya' anggota ini akan ikut terhapus.`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
