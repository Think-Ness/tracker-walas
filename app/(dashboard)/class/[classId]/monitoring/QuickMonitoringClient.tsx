'use client'

import { useState, useMemo } from 'react'
import { Button, Input, Select, Textarea, Label, EmptyState, Badge } from '@/components/ui'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/interactive'
import { formatDate, getRatingLabel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import {
  Plus,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle2,
  Star,
  Calendar,
  Sparkles,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: string
  stambuk: string
  name: string
  class_name: string
  photo_url?: string | null
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
    photo_url?: string | null
  } | null
}

interface Props {
  classId: string
  userId: string
  members: Member[]
  records: MonitoringRecord[]
}

const CATEGORIES = [
  'Akhlak',
  'Kedisiplinan',
  'Ibadah',
  'Tanggung Jawab',
  'Kepemimpinan',
  'Kemandirian',
  'Kepedulian',
  'Kerja Sama',
  'Keaktifan',
  'Komunikasi',
  'Sikap',
  'Lainnya',
]

const RATING_DEFINITIONS: Record<
  number,
  { label: string; desc: string; color: string; activeBg: string; border: string; text: string }
> = {
  1: {
    label: '1 — Sangat Perlu Perhatian',
    desc: 'Pelanggaran berat / butuh penanganan khusus',
    color: 'bg-red-50 text-red-700 border-red-200',
    activeBg: 'bg-red-600 text-white border-red-600',
    border: 'border-red-300',
    text: 'text-red-700',
  },
  2: {
    label: '2 — Perlu Perhatian',
    desc: 'Perlu bimbingan / pengingat',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    activeBg: 'bg-orange-600 text-white border-orange-600',
    border: 'border-orange-300',
    text: 'text-orange-700',
  },
  3: {
    label: '3 — Cukup / Standar',
    desc: 'Sesuai ekspektasi harian biasa',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    activeBg: 'bg-amber-500 text-white border-amber-500',
    border: 'border-amber-300',
    text: 'text-amber-700',
  },
  4: {
    label: '4 — Baik',
    desc: 'Disiplin dan aktif berkembang',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeBg: 'bg-blue-600 text-white border-blue-600',
    border: 'border-blue-300',
    text: 'text-blue-700',
  },
  5: {
    label: '5 — Sangat Baik / Teladan',
    desc: 'Menjadi teladan bagi santri lain',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBg: 'bg-emerald-600 text-white border-emerald-600',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
  },
}

export default function QuickMonitoringClient({ classId, userId, members, records }: Props) {
  const { success, error } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    member_id: members[0]?.id || '',
    category: CATEGORIES[0],
    rating: 4,
    note: '',
    observed_at: new Date().toISOString().split('T')[0],
  })

  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const total = records.length
    if (total === 0) {
      return { total: 0, avg: 0, high: 0, mid: 0, low: 0 }
    }
    const sum = records.reduce((acc, r) => acc + r.rating, 0)
    const avg = (sum / total).toFixed(1)
    const high = records.filter((r) => r.rating >= 4).length
    const mid = records.filter((r) => r.rating === 3).length
    const low = records.filter((r) => r.rating <= 2).length
    return { total, avg, high, mid, low }
  }, [records])

  // --- FILTERING ---
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Category filter
      if (selectedCategory && r.category !== selectedCategory) return false

      // Rating filter
      if (selectedRatingFilter === 'low' && r.rating > 2) return false
      if (selectedRatingFilter === 'high' && r.rating < 4) return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const name = r.class_members?.name?.toLowerCase() || ''
        const stambuk = r.class_members?.stambuk?.toLowerCase() || ''
        const note = r.note?.toLowerCase() || ''
        if (!name.includes(query) && !stambuk.includes(query) && !note.includes(query)) {
          return false
        }
      }
      return true
    })
  }, [records, selectedCategory, selectedRatingFilter, searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.member_id) return

    setSubmitting(true)
    const supabase = createClient()

    const { error: insertError } = await supabase.from('member_monitoring').insert({
      member_id: form.member_id,
      observed_by: userId,
      category: form.category,
      rating: form.rating,
      note: form.note.trim() || null,
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

  return (
    <div className="space-y-6">
      {/* 1. Monitoring Insights & Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Catatan</span>
            <BarChart3 size={16} className="text-[var(--primary)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</p>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Observasi tersimpan</p>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Rata-rata Skor</span>
            <Star size={16} className="text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {stats.avg} <span className="text-xs font-normal text-[var(--foreground-muted)]">/ 5.0</span>
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Skor performa umum</p>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Karakter Baik (4–5)</span>
            <CheckCircle2 size={16} className="text-[var(--success)]" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {stats.high}
            <span className="text-xs font-normal text-[var(--foreground-muted)] ml-1">
              ({stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0}%)
            </span>
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Perilaku teladan/positif</p>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Perlu Perhatian (1–2)</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {stats.low}
            <span className="text-xs font-normal text-[var(--foreground-muted)] ml-1">
              ({stats.total > 0 ? Math.round((stats.low / stats.total) * 100) : 0}%)
            </span>
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Perlu pendampingan</p>
        </div>
      </div>

      {/* 2. Toolbar: Search, Filters, and New Observation Button */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
            />
            <input
              type="text"
              placeholder="Cari nama santri, stambuk, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-white text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            disabled={members.length === 0}
            className="flex-shrink-0"
          >
            <Plus size={16} />
            Catat Observasi Santri
          </Button>
        </div>

        {/* Filter Badges & Dropdown */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]">
          <span className="text-xs font-medium text-[var(--foreground-muted)] flex items-center gap-1 mr-1">
            <Filter size={13} /> Filter:
          </span>

          {/* Quick Filter buttons */}
          <button
            type="button"
            onClick={() => setSelectedRatingFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
              selectedRatingFilter === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
            }`}
          >
            Semua Skor
          </button>

          <button
            type="button"
            onClick={() => setSelectedRatingFilter('low')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all flex items-center gap-1 ${
              selectedRatingFilter === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle size={12} />
            Perlu Perhatian (1–2)
          </button>

          <button
            type="button"
            onClick={() => setSelectedRatingFilter('high')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all flex items-center gap-1 ${
              selectedRatingFilter === 'high'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 size={12} />
            Sangat Baik (4–5)
          </button>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-7 text-xs px-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white text-[var(--foreground)] ml-auto"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Observasi Feed List */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          title="Tidak ada catatan monitoring yang cocok"
          description={
            searchQuery || selectedCategory || selectedRatingFilter !== 'all'
              ? 'Coba atur ulang filter pencarian Anda untuk melihat hasil lainnya.'
              : 'Belum ada catatan observasi untuk kelas ini. Klik tombol "Catat Observasi Santri" di atas untuk mulai memantau.'
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
                setSelectedRatingFilter('all')
              }}
            >
              Reset Filter
            </Button>
          }
        />
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)] shadow-sm overflow-hidden">
          {filteredRecords.map((r) => {
            const def = RATING_DEFINITIONS[r.rating] || RATING_DEFINITIONS[3]

            return (
              <div
                key={r.id}
                className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-[var(--background-secondary)] transition-colors"
              >
                {/* 3x4 Photo Thumbnail or Initial */}
                <div className="w-11 h-14 rounded bg-[var(--background-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                  {r.class_members?.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.class_members.photo_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[var(--foreground-muted)]">
                      {r.class_members?.name?.charAt(0) ?? 'S'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/class/${classId}/members/${r.member_id}`}
                        className="text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                      >
                        {r.class_members?.name ?? 'Anggota'}
                      </Link>
                      <span className="text-xs text-[var(--foreground-muted)]">
                        (Stambuk {r.class_members?.stambuk})
                      </span>
                    </div>

                    <span className="text-xs text-[var(--foreground-muted)] flex-shrink-0">
                      {formatDate(r.observed_at)}
                    </span>
                  </div>

                  {/* Badges: Category & Rating */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] font-semibold bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] px-2 py-0.5 rounded">
                      {r.category}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${def.color}`}
                    >
                      <Star size={11} className="fill-current" />
                      {def.label}
                    </span>
                  </div>

                  {/* Observation Note */}
                  {r.note && (
                    <p className="mt-2 text-xs sm:text-sm text-[var(--foreground-secondary)] bg-[var(--background-secondary)] p-2.5 rounded-[var(--radius-md)] border border-[var(--border)] leading-relaxed">
                      {r.note}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. Modal Quick Observation with Interactive Visual Rating Selector */}
      {showAddModal && (
        <Dialog open onOpenChange={setShowAddModal}>
          <DialogHeader title="Catat Observasi Santri" onClose={() => setShowAddModal(false)} />
          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Member Selector */}
              <div>
                <Label htmlFor="obs-member" required>
                  Pilih Santri
                </Label>
                <Select
                  id="obs-member"
                  value={form.member_id}
                  onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                  required
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — Stambuk {m.stambuk}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="obs-category" required>
                  Kategori Aspek Observasi
                </Label>
                <Select
                  id="obs-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Interactive Visual Rating Selector (1 to 5) */}
              <div>
                <Label required>Tingkat Penilaian / Skor Karakter</Label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = form.rating === num
                    const def = RATING_DEFINITIONS[num]
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setForm({ ...form, rating: num })}
                        className={`py-2 px-1 text-center rounded-[var(--radius-md)] border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? def.activeBg + ' shadow-sm scale-105'
                            : 'bg-white border-[var(--border-strong)] text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]'
                        }`}
                      >
                        <span className="text-base sm:text-lg">{num}</span>
                        <span className="text-[10px] font-normal leading-tight hidden sm:block">
                          {num === 1
                            ? 'Sangat Kurang'
                            : num === 2
                            ? 'Perlu Perhatian'
                            : num === 3
                            ? 'Cukup'
                            : num === 4
                            ? 'Baik'
                            : 'Teladan'}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {/* Description helper of currently selected score */}
                <p className="text-[11px] text-[var(--foreground-muted)] mt-1.5 font-medium">
                  Keterangan: <span className="text-[var(--foreground)]">{RATING_DEFINITIONS[form.rating]?.desc}</span>
                </p>
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="obs-date" required>
                  Tanggal Observasi
                </Label>
                <Input
                  id="obs-date"
                  type="date"
                  value={form.observed_at}
                  onChange={(e) => setForm({ ...form, observed_at: e.target.value })}
                  required
                />
              </div>

              {/* Note */}
              <div>
                <Label htmlFor="obs-note">Catatan Kejadian / Tindakan Wali Kelas</Label>
                <Textarea
                  id="obs-note"
                  placeholder="Ceritakan kejadian, perilaku, atau arahan bimbingan yang diberikan kepada santri..."
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
                Simpan Observasi
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </div>
  )
}
