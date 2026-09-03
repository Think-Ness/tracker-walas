'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, Card, Button, Input, Label, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { Breadcrumb } from '@/components/ui/data'

export default function NewClassPage() {
  const router = useRouter()
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    academic_year: '2026/2027',
    level: 'Kelas 6',
    description: '',
  })

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
        .eq('type', 'class')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (ws) {
        setWorkspaceId(ws.id)
      } else {
        error('Silakan buat workspace kelas terlebih dahulu.')
        router.push('/workspace/new?type=class')
      }
    }
    loadWorkspace()
  }, [router, error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !workspaceId) return

    setLoading(true)
    const supabase = createClient()

    const { data, error: insertError } = await supabase
      .from('class_groups')
      .insert({
        workspace_id: workspaceId,
        name: formData.name.trim(),
        academic_year: formData.academic_year.trim() || null,
        level: formData.level.trim() || null,
        description: formData.description.trim() || null,
      })
      .select()
      .single()

    setLoading(false)

    if (insertError) {
      error(insertError.message || 'Gagal membuat kelas.')
      return
    }

    success('Kelas berhasil dibuat.')
    router.push(`/class/${data.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto py-4">
      <Breadcrumb
        items={[
          { label: 'Kelas', href: '/class' },
          { label: 'Tambah Kelas Baru' },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Tambah Kelas Baru"
        description="Buat rombongan belajar atau kelompok kelas untuk memonitor anggotanya."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="class-name" required>Nama Kelas</Label>
            <Input
              id="class-name"
              placeholder="Contoh: Kelas 6 D"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academic-year">Tahun Ajaran</Label>
              <Input
                id="academic-year"
                placeholder="2026/2027"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="class-level">Tingkat / Level</Label>
              <Input
                id="class-level"
                placeholder="Contoh: Kelas 6"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="class-desc">Keterangan (Opsional)</Label>
            <Textarea
              id="class-desc"
              placeholder="Keterangan wali kelas, catatan khusus rombel..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={!workspaceId}>
              Simpan Kelas
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
