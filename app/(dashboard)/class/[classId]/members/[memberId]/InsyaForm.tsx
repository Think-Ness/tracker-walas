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

export default function InsyaForm({ memberId, userId, onClose, onSuccess }: Props) {
  const { error } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    score: '',
    kategori: '',
    note_date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title && !form.content) {
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.from('member_insya').insert({
      member_id: memberId,
      created_by: userId,
      title: form.title || null,
      content: form.content || null,
      score: form.score ? parseFloat(form.score) : null,
      kategori: form.kategori || null,
      note_date: form.note_date,
    })

    setLoading(false)
    if (err) {
      error("Gagal menyimpan catatan insya'. Coba lagi.")
      return
    }
    onSuccess()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogHeader title="Tambah Catatan Insya'" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          <div>
            <Label htmlFor="insya_date" required>Tanggal</Label>
            <Input
              id="insya_date"
              type="date"
              value={form.note_date}
              onChange={(e) => setForm({ ...form, note_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="insya_title">Judul / Tema</Label>
            <Input
              id="insya_title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul atau tema insya'..."
            />
          </div>

          <div>
            <Label htmlFor="insya_kategori">Kategori</Label>
            <Select
              id="insya_kategori"
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            >
              <option value="">— Pilih kategori —</option>
              <option value="Karangan Bebas">Karangan Bebas</option>
              <option value="Karangan Pengalaman">Karangan Pengalaman</option>
              <option value="Esai Akademik">Esai Akademik</option>
              <option value="Esai Argumentatif">Esai Argumentatif</option>
              <option value="Lainnya">Lainnya</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="insya_score">Nilai (opsional)</Label>
            <Input
              id="insya_score"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              placeholder="0–100"
            />
          </div>

          <div>
            <Label htmlFor="insya_content">Catatan / Evaluasi</Label>
            <Textarea
              id="insya_content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Evaluasi tulisan, perkembangan, catatan wali kelas..."
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
