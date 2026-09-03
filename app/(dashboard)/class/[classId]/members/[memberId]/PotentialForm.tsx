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

const BIDANG_OPTIONS = [
  'Bahasa Arab', 'Bahasa Inggris', 'Matematika', 'Sains',
  'Sosial', 'Kepemimpinan', 'Menulis / Insya\'', 'Public Speaking',
  'Akademik Umum', 'Lainnya',
]

export default function PotentialForm({ memberId, userId, onClose, onSuccess }: Props) {
  const { error } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    bidang: '',
    strength: '',
    potential: '',
    weakness: '',
    recommendation: '',
    rating: '',
    assessed_at: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.from('academic_potential').insert({
      member_id: memberId,
      assessed_by: userId,
      bidang: form.bidang || null,
      strength: form.strength || null,
      potential: form.potential || null,
      weakness: form.weakness || null,
      recommendation: form.recommendation || null,
      rating: form.rating ? parseInt(form.rating) : null,
      assessed_at: form.assessed_at,
    })

    setLoading(false)
    if (err) {
      error('Gagal menyimpan catatan potensi. Coba lagi.')
      return
    }
    onSuccess()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogHeader title="Tambah Catatan Potensi Akademik" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          <div>
            <Label htmlFor="potential_date" required>Tanggal</Label>
            <Input
              id="potential_date"
              type="date"
              value={form.assessed_at}
              onChange={(e) => setForm({ ...form, assessed_at: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="bidang">Bidang Potensi</Label>
            <Select
              id="bidang"
              value={form.bidang}
              onChange={(e) => setForm({ ...form, bidang: e.target.value })}
            >
              <option value="">— Pilih bidang —</option>
              {BIDANG_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="pot_rating">Rating (opsional)</Label>
            <Select
              id="pot_rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            >
              <option value="">— Tidak dinilai —</option>
              <option value="1">1 — Sangat Perlu Perhatian</option>
              <option value="2">2 — Perlu Perhatian</option>
              <option value="3">3 — Cukup</option>
              <option value="4">4 — Baik</option>
              <option value="5">5 — Sangat Baik</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="strength">Kekuatan</Label>
            <Textarea
              id="strength"
              value={form.strength}
              onChange={(e) => setForm({ ...form, strength: e.target.value })}
              placeholder="Kekuatan yang terlihat..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="potential_desc">Potensi</Label>
            <Textarea
              id="potential_desc"
              value={form.potential}
              onChange={(e) => setForm({ ...form, potential: e.target.value })}
              placeholder="Potensi yang dapat dikembangkan..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="weakness">Area untuk Ditingkatkan</Label>
            <Textarea
              id="weakness"
              value={form.weakness}
              onChange={(e) => setForm({ ...form, weakness: e.target.value })}
              placeholder="Area yang perlu ditingkatkan..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="recommendation">Rekomendasi</Label>
            <Textarea
              id="recommendation"
              value={form.recommendation}
              onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
              placeholder="Rekomendasi untuk guru/wali kelas..."
              rows={2}
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
