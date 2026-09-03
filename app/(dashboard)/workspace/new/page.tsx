'use client'

import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, Card, Button, Input, Label, Textarea, Select } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { Breadcrumb } from '@/components/ui/data'

export default function NewWorkspacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = (searchParams.get('type') as 'class' | 'student') || 'class'
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: defaultType,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      error('Anda belum masuk. Silakan login kembali.')
      router.push('/login')
      return
    }

    const { data, error: insertError } = await supabase
      .from('workspaces')
      .insert({
        owner_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
      })
      .select()
      .single()

    setLoading(false)

    if (insertError) {
      error(insertError.message || 'Gagal membuat workspace.')
      return
    }

    success('Workspace berhasil dibuat.')
    if (formData.type === 'class') {
      router.push(`/class`)
    } else {
      router.push(`/academic/courses`)
    }
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto py-4">
      <Breadcrumb
        items={[
          { label: 'Pilih Workspace', href: '/workspace' },
          { label: 'Buat Workspace Baru' },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Buat Workspace Baru"
        description="Pilih tipe workspace untuk mengorganisir data kelas atau perkuliahan Anda."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ws-type" required>Tipe Workspace</Label>
            <Select
              id="ws-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'class' | 'student' })}
            >
              <option value="class">Kelas (Monitoring Wali Kelas / Asrama)</option>
              <option value="student">Mahasiswa (Akademik & Penilaian Matkul)</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="ws-name" required>Nama Workspace</Label>
            <Input
              id="ws-name"
              placeholder={formData.type === 'class' ? 'Contoh: Kelas 6 D' : 'Contoh: Program Studi AFI'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="ws-desc">Deskripsi (Opsional)</Label>
            <Textarea
              id="ws-desc"
              placeholder="Keterangan singkat mengenai workspace ini..."
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
            <Button type="submit" variant="primary" loading={loading}>
              Simpan Workspace
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
