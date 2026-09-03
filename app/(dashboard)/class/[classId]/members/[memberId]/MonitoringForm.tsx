'use client'

import { useState } from 'react'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/interactive'
import { Button, Input, Label, Select, Textarea } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

interface Props {
  memberId: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

const DEFAULT_CATEGORIES = [
  'Akhlak', 'Kedisiplinan', 'Tanggung Jawab', 'Kepemimpinan',
  'Kemandirian', 'Kepedulian', 'Kerja Sama', 'Komunikasi',
  'Keaktifan', 'Sikap', 'Ibadah', 'Lainnya',
]

export default function MonitoringForm({ memberId, userId, onClose, onSuccess }: Props) {
  const { error } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category: DEFAULT_CATEGORIES[0],
    rating: '4',
    note: '',
    observed_at: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.from('member_monitoring').insert({
      member_id: memberId,
      observed_by: userId,
      category: form.category,
      rating: parseInt(form.rating),
      note: form.note || null,
      observed_at: form.observed_at,
    })

    setLoading(false)
    if (err) {
      error('Gagal menyimpan monitoring. Coba lagi.')
      return
    }
    onSuccess()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogHeader title="Tambah Monitoring" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          <div>
            <Label htmlFor="category" required>Kategori</Label>
            <Select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="rating" required>Rating (1–5)</Label>
            <Select
              id="rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            >
              <option value="1">1 — Sangat Perlu Perhatian</option>
              <option value="2">2 — Perlu Perhatian</option>
              <option value="3">3 — Cukup</option>
              <option value="4">4 — Baik</option>
              <option value="5">5 — Sangat Baik</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="observed_at" required>Tanggal</Label>
            <Input
              id="observed_at"
              type="date"
              value={form.observed_at}
              onChange={(e) => setForm({ ...form, observed_at: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="note">Catatan</Label>
            <Textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Tuliskan observasi atau catatan..."
              rows={4}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary" loading={loading}>Simpan</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
