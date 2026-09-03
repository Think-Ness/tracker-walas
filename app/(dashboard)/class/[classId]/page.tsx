import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, Badge, Button, EmptyState } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/data'
import { formatDate, getRatingLabel } from '@/lib/utils'
import {
  Users,
  BarChart2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Star,
  FileText,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { ClassDetailHeader } from './ClassDetailHeader'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ classId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('class_groups').select('name').eq('id', classId).single()
  return { title: data?.name ?? 'Detail Kelas' }
}

export default async function ClassDetailPage({ params }: Props) {
  const { classId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: classGroup } = await supabase
    .from('class_groups')
    .select('*, workspaces(name, owner_id)')
    .eq('id', classId)
    .single()

  if (!classGroup || (classGroup.workspaces as any)?.owner_id !== user.id) {
    notFound()
  }

  // 1. Total & Active Members
  const { count: totalMembers } = await supabase
    .from('class_members')
    .select('id', { count: 'exact', head: true })
    .eq('class_group_id', classId)
    .eq('status', 'active')

  // 2. Monitoring this month
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const monthStartStr = thisMonth.toISOString().split('T')[0]

  const { data: monthlyMonitoring } = await supabase
    .from('member_monitoring')
    .select('member_id, rating, category, observed_at, note, class_members!inner(id, name, stambuk, photo_url, class_group_id)')
    .eq('class_members.class_group_id', classId)
    .gte('observed_at', monthStartStr)

  const monitoredMemberIds = new Set(monthlyMonitoring?.map((m) => m.member_id) || [])
  const uniqueMonitored = monitoredMemberIds.size
  const total = totalMembers || 0
  const monitoredPercentage = total > 0 ? Math.round((uniqueMonitored / total) * 100) : 0

  // 3. Average Rating
  const allRatings = monthlyMonitoring?.map((m) => m.rating) || []
  const avgRating =
    allRatings.length > 0
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : '-'

  // 4. Students Needing Attention (Rating 1 or 2 in recent observations)
  const { data: attentionRecords } = await supabase
    .from('member_monitoring')
    .select('id, member_id, rating, category, note, observed_at, class_members!inner(id, name, stambuk, photo_url, class_group_id)')
    .eq('class_members.class_group_id', classId)
    .lte('rating', 2)
    .order('observed_at', { ascending: false })
    .limit(6)

  // 5. Recent Monitoring Activity Feed
  const { data: recentMonitoring } = await supabase
    .from('member_monitoring')
    .select('id, member_id, rating, category, note, observed_at, class_members!inner(id, name, stambuk, photo_url, class_group_id)')
    .eq('class_members.class_group_id', classId)
    .order('observed_at', { ascending: false })
    .limit(7)

  const ratingColors: Record<number, { bg: string; text: string; border: string }> = {
    1: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    2: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    3: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    4: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    5: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Daftar Kelas', href: '/class' },
          { label: classGroup.name },
        ]}
      />

      {/* Class Header */}
      <ClassDetailHeader classGroup={classGroup} />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Members */}
        <Link href={`/class/${classId}/members`} className="block">
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm hover:border-[var(--primary)] transition-all">
            <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Total Santri</span>
              <Users size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{total}</p>
            <p className="text-[11px] text-[var(--primary)] mt-0.5 flex items-center gap-1 font-medium">
              Lihat semua anggota <ArrowRight size={12} />
            </p>
          </div>
        </Link>

        {/* Monthly Monitoring Coverage */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Keterpantauan</span>
            <CheckCircle2 size={16} className="text-[var(--success)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[var(--foreground)]">{monitoredPercentage}%</p>
            <span className="text-xs text-[var(--foreground-muted)]">
              ({uniqueMonitored}/{total} santri)
            </span>
          </div>
          <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${
                monitoredPercentage >= 80
                  ? 'bg-[var(--success)]'
                  : monitoredPercentage >= 50
                  ? 'bg-[var(--primary)]'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, monitoredPercentage)}%` }}
            />
          </div>
        </div>

        {/* Needing Attention */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Perlu Perhatian</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {attentionRecords ? new Set(attentionRecords.map((r: any) => r.member_id)).size : 0}
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Skor observasi rendah (≤ 2)</p>
        </div>

        {/* Average Character Score */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Rata-rata Skor</span>
            <Star size={16} className="text-yellow-500 fill-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {avgRating} <span className="text-xs font-normal text-[var(--foreground-muted)]">/ 5.0</span>
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Observasi bulan ini</p>
        </div>
      </div>

      {/* Main Two-Column Analysis Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Santri Perlu Perhatian Khusus */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-50 text-amber-600">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">
                    Santri Perlu Perhatian Khusus
                  </h2>
                  <p className="text-[11px] text-[var(--foreground-muted)]">
                    Santri yang mendapatkan penilaian rendah pada observasi terakhir
                  </p>
                </div>
              </div>
            </div>

            {!attentionRecords || attentionRecords.length === 0 ? (
              <div className="py-8 text-center bg-[var(--background-secondary)] rounded-[var(--radius-md)] border border-dashed border-[var(--border)]">
                <CheckCircle2 size={32} className="mx-auto text-[var(--success)] mb-2" />
                <p className="text-sm font-medium text-[var(--foreground)]">Kondisi Kelas Sangat Baik!</p>
                <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                  Tidak ada santri dengan skor observasi rendah (1 atau 2).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attentionRecords.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50/40 flex items-start gap-3"
                  >
                    {/* 3x4 Photo Thumbnail */}
                    <div className="w-10 h-13 rounded bg-white border border-amber-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                      {r.class_members?.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.class_members.photo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-amber-800">
                          {r.class_members?.name?.charAt(0) ?? 'S'}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/class/${classId}/members/${r.member_id}`}
                          className="text-xs sm:text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate"
                        >
                          {r.class_members?.name}
                        </Link>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex-shrink-0">
                          Skor {r.rating} / 5
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--foreground-muted)]">
                        <span className="font-medium text-amber-900 bg-amber-100/70 px-1.5 py-0.2 rounded">
                          {r.category}
                        </span>
                        <span>· {formatDate(r.observed_at)}</span>
                      </div>
                      {r.note && (
                        <p className="text-xs text-[var(--foreground-secondary)] mt-1.5 bg-white p-2 rounded border border-amber-100 line-clamp-2">
                          &quot;{r.note}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--border)]">
            <Link
              href={`/class/${classId}/monitoring`}
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center justify-center gap-1"
            >
              Lihat Semua Analisis Monitoring <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Column 2: Aktivitas Monitoring & Observasi Terkini */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-50 text-blue-600">
                  <BarChart2 size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">
                    Aktivitas Monitoring Terkini
                  </h2>
                  <p className="text-[11px] text-[var(--foreground-muted)]">
                    Histori catatan akhlak & kedisiplinan terbaru
                  </p>
                </div>
              </div>

              <Link
                href={`/class/${classId}/monitoring`}
                className="text-xs text-[var(--primary)] font-medium hover:underline"
              >
                Lihat semua
              </Link>
            </div>

            {!recentMonitoring || recentMonitoring.length === 0 ? (
              <div className="py-8 text-center bg-[var(--background-secondary)] rounded-[var(--radius-md)] border border-dashed border-[var(--border)]">
                <BarChart2 size={32} className="mx-auto text-[var(--foreground-muted)] mb-2 opacity-50" />
                <p className="text-sm font-medium text-[var(--foreground)]">Belum Ada Catatan Monitoring</p>
                <p className="text-xs text-[var(--foreground-muted)] mt-0.5 mb-3">
                  Mulai catat perkembangan santri kelas Anda hari ini.
                </p>
                <Link href={`/class/${classId}/monitoring`}>
                  <Button variant="primary" size="sm">
                    <Plus size={14} />
                    Catat Observasi Pertama
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recentMonitoring.map((m: any) => {
                  const style = ratingColors[m.rating] || ratingColors[3]
                  return (
                    <div key={m.id} className="py-3 flex items-start gap-3">
                      {/* Rating visual circle */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 mt-0.5 ${style.bg} ${style.text} ${style.border}`}
                      >
                        {m.rating}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/class/${classId}/members/${m.member_id}`}
                            className="text-xs sm:text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate"
                          >
                            {m.class_members?.name}
                          </Link>
                          <span className="text-[11px] text-[var(--foreground-muted)] flex-shrink-0">
                            {formatDate(m.observed_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                          <span className="font-medium text-[var(--foreground)]">{m.category}</span> ·{' '}
                          {getRatingLabel(m.rating)}
                        </p>
                        {m.note && (
                          <p className="text-xs text-[var(--foreground-secondary)] mt-1 line-clamp-1">
                            {m.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-xs text-[var(--foreground-muted)]">
              {recentMonitoring?.length ?? 0} catatan ditampilkan
            </span>
            <Link href={`/class/${classId}/members`}>
              <Button variant="outline" size="sm">
                <Users size={14} />
                Daftar Santri ({total})
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
