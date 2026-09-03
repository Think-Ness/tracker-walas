'use client'

import { useState } from 'react'
import { Dialog, DialogHeader, DialogBody, DialogFooter, ConfirmDialog } from '@/components/ui/interactive'
import { Button, Input, Label, Textarea, Select } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import type { Workspace } from '@/lib/types'

interface EditWorkspaceModalProps {
  workspace: {
    id: string
    name: string
    description?: string | null
    type: 'class' | 'student'
    is_active?: boolean
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditWorkspaceModal({
  workspace,
  open,
  onOpenChange,
  onSuccess,
}: EditWorkspaceModalProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: workspace.name,
    description: workspace.description || '',
    is_active: workspace.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('workspaces')
      .update({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      })
      .eq('id', workspace.id)

    setSaving(false)

    if (updateError) {
      error(updateError.message || 'Gagal memperbarui workspace.')
      return
    }

    success('Workspace berhasil diperbarui!')
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
      .from('workspaces')
      .delete()
      .eq('id', workspace.id)

    setDeleting(false)

    if (deleteError) {
      error(deleteError.message || 'Gagal menghapus workspace.')
      return
    }

    success('Workspace berhasil dihapus.')
    onOpenChange(false)
    router.push('/workspace')
    router.refresh()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogHeader title="Edit Workspace" onClose={() => onOpenChange(false)} />
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <div>
              <Label htmlFor="ws-name" required>
                Nama Workspace
              </Label>
              <Input
                id="ws-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Pondok Modern Gontor"
                required
              />
            </div>

            <div>
              <Label htmlFor="ws-desc">Deskripsi</Label>
              <Textarea
                id="ws-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Keterangan singkat mengenai workspace ini..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="ws-status">Status</Label>
              <Select
                id="ws-status"
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
              Hapus Workspace
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
        title="Hapus Workspace?"
        description={`PERINGATAN: Apakah Anda yakin ingin menghapus workspace "${workspace.name}"? Semua kelas, mata kuliah, mahasiswa, dan seluruh histori monitoring di dalamnya akan DIHAPUS PERMANEN.`}
        confirmLabel="Ya, Hapus Semua"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
