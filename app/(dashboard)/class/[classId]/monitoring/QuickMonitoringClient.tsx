'use client'

import { useState } from 'react'
import { Button, Input, Select, Textarea, Label, EmptyState } from '@/components/ui'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/interactive'
import { formatDate, getRatingLabel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Plus, Filter } from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: string
  stambuk: string
  name: string
  class_name: string
}

interface MonitoringRecord {
  id: string
  member_id: string
  category: string
  rating: number
  note: string | null
  observed_at: string
  class_members: {
    id: string
    name: string
    stambuk: string
  } | null
}

interface Props {
  classId: string
  userId: string
  members: Member[]
  records: MonitoringRecord[]
}

const CATEGORIES = [
  'Akhlak', 'Kedisiplinan', 'Tanggung Jawab', 'Kepemimpinan',
  'Kemandirian', 'Kepedulian', 'Kerja Sama', 'Komunikasi',
  'Keaktifan', 'Sikap', 'Ibadah', 'Lainnya',
]

export default function QuickMonitoringClient({ classId, userId, members, records }: Props) {
  const { success, error } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    member_id: members[0]?.id || '',
    category: CATEGORIES[0],
    rating: '4',
    note: '',
    observed_at: new Date().toISOString().split('T')[0],
  })

  const filteredRecords = selectedCategory
    ? records.filter((r) => r.category === selectedCategory)
    : records

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.member_id) return

    setSubmitting(true)
    const supabase = createClient()

    const { error: insertError } = await supabase
      .from('member_monitoring')
      .insert({
        member_id: form.member_id,
        observed_by: userId,
        category: form.category,
        rating: parseInt(form.rating),
        note: form.note || null,
        observed_at: form.observed_at,
      })

    setSubmitting(false)

    if (insertError) {
      error(insertError.message || 'Gagal menyimpan monitoring.')
      return
    }

    success('Catatan monitoring berhasil disimpan!')
    setShowAddModal(false)
    window.location.reload()
  }

  const ratingColors: Record<number, string> = {
    1: 'bg-[var(--danger-subtle)] text-[var(--danger)] border-red-200',
    2: 'bg-orange-50 text-orange-600 border-orange-200',
    3: 'bg-[var(--warning-subtle)] text-[var(--warning)] border-amber-200',
    4: 'bg-[var(--primary-subtle)] text-[var(--primary)] border-blue-200',
    5: 'bg-[var(--success-subtle)] text-[var(--success)] border-green-200',
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--foreground-muted)]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-sm rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-white text-[var(--foreground)]"
          >
            <option value="">Semua Kategori ({records.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          disabled={members.length === 0}
        >
          <Plus size={16} />
          Catat Observasi
        </Button>
      </div>

      {/* Monitoring Records Feed */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          title="Belum ada catatan monitoring"
          description={selectedCategory ? `Belum ada catatan untuk kategori "${selectedCategory}".` : 'Mulai catat perkembangan dan akhlak santri/anggota kelas.'}
          action={
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} />
              Catat Observasi Pertama
            </Button>
          }
        />
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)]">
          {filteredRecords.map((r) => (
            <div key={r.id} className="p-4 flex items-start gap-4 hover:bg-[var(--background-secondary)] transition-colors">
              <span
                className={`inline-flex h-9 w-9 items-center justify-center text-sm font-bold rounded-full border flex-shrink-0 ${ratingColors[r.rating] ?? ''}`}
              >
                {r.rating}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/class/${classId}/members/${r.member_id}`}
                    className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                  >
                    {r.class_members?.name ?? 'Anggota'}
                  </Link>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {formatDate(r.observed_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium text-[var(--foreground-secondary)] bg-[var(--background-tertiary)] px-2 py-0.5 rounded">
                    {r.category}
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {getRatingLabel(r.rating)}
                  </span>
                </div>
                {r.note && (
                  <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                    {r.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Quick Observation */}
      {showAddModal && (
        <Dialog open onOpenChange={setShowAddModal}>
          <DialogHeader title="Catat Observasi Monitoring" onClose={() => setShowAddModal(false)} />
          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              <div>
                <Label htmlFor="obs-member" required>Pilih Anggota</Label>
                <Select
                  id="obs-member"
                  value={form.member_id}
                  onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                  required
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.stambuk})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="obs-category" required>Kategori</Label>
                  <Select
                    id="obs-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="obs-rating" required>Rating (1–5)</Label>
                  <Select
                    id="obs-rating"
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
              </div>

              <div>
                <Label htmlFor="obs-date" required>Tanggal Observasi</Label>
                <Input
                  id="obs-date"
                  type="date"
                  value={form.observed_at}
                  onChange={(e) => setForm({ ...form, observed_at: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="obs-note">Catatan Tambahan</Label>
                <Textarea
                  id="obs-note"
                  placeholder="Catatan perilaku, kejadian khusus, atau evaluasi..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={3}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </div>
  )
}
