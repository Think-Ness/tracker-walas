import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, EmptyState, Button, Badge } from '@/components/ui'
import { Plus, Users, BarChart2, ArrowRight, AlertTriangle, CheckCircle2, GraduationCap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Daftar Kelas' }

export default async function ClassListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Get class workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .eq('type', 'class')
    .eq('is_active', true)
    .single()

  if (!workspace) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <EmptyState
          title="Belum ada workspace kelas"
          description="Buat workspace kelas untuk mulai mengelola kelas dan memonitor perkembangan santri."
          action={
            <Link href="/workspace/new?type=class">
              <Button variant="primary">
                <Plus size={16} />
                Buat Workspace Kelas
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  // 2. Get all class groups
  const { data: classGroups } = await supabase
    .from('class_groups')
    .select('*')
    .eq('workspace_id', workspace.id)
    .eq('is_active', true)
    .order('name')

  // Calculate stats for each class
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const monthStartStr = thisMonth.toISOString().split('T')[0]

  const classesWithStats = await Promise.all(
    (classGroups || []).map(async (cls) => {
      // Members count
      const { count: totalMembers } = await supabase
        .from('class_members')
        .select('id', { count: 'exact', head: true })
        .eq('class_group_id', cls.id)
        .eq('status', 'active')

      // Monitored members this month
      const { data: monitored } = await supabase
        .from('member_monitoring')
        .select('member_id, rating, class_members!inner(class_group_id)')
        .eq('class_members.class_group_id', cls.id)
        .gte('observed_at', monthStartStr)

      const monitoredSet = new Set(monitored?.map((m) => m.member_id) || [])
      const uniqueMonitored = monitoredSet.size

      // Needing attention count (rating 1 or 2)
      const needsAttentionCount = new Set(
        monitored?.filter((m) => m.rating <= 2).map((m) => m.member_id) || []
      ).size

      const total = totalMembers || 0
      const percentage = total > 0 ? Math.round((uniqueMonitored / total) * 100) : 0

      return {
        ...cls,
        totalMembers: total,
        uniqueMonitored,
        needsAttentionCount,
        percentage,
      }
    })
  )

  const overallTotalMembers = classesWithStats.reduce((acc, c) => acc + c.totalMembers, 0)
  const overallMonitored = classesWithStats.reduce((acc, c) => acc + c.uniqueMonitored, 0)
  const overallNeedsAttention = classesWithStats.reduce((acc, c) => acc + c.needsAttentionCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Daftar Kelas (Wali Kelas)"
        description={`${workspace.name} — Kelola rombel kelas, santri, dan monitoring perkembangan.`}
        action={
          <Link href="/class/new">
            <Button variant="primary">
              <Plus size={16} />
              Tambah Kelas Baru
            </Button>
          </Link>
        }
      />

      {/* Summary KPI Cards across all classes */}
      {classesWithStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
            <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Total Kelas</span>
              <GraduationCap size={16} className="text-[var(--primary)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{classesWithStats.length}</p>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Rombongan belajar aktif</p>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
            <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Total Santri</span>
              <Users size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{overallTotalMembers}</p>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Seluruh santri aktif</p>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
            <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Terpantau Bulan Ini</span>
              <CheckCircle2 size={16} className="text-[var(--success)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {overallMonitored}
              <span className="text-xs font-normal text-[var(--foreground-muted)] ml-1">
                ({overallTotalMembers > 0 ? Math.round((overallMonitored / overallTotalMembers) * 100) : 0}%)
              </span>
            </p>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Sudah diobservasi</p>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm">
            <div className="flex items-center justify-between text-[var(--foreground-muted)] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Perlu Perhatian</span>
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{overallNeedsAttention}</p>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">Skor observasi ≤ 2</p>
          </div>
        </div>
      )}

      {/* Class List Cards Grid */}
      {classesWithStats.length === 0 ? (
        <EmptyState
          title="Belum ada kelas yang dibuat"
          description="Buat kelas pertama Anda (contoh: Kelas 6 D) untuk mulai menginput data anggota santri dan melakukan monitoring harian."
          icon={<GraduationCap size={36} className="opacity-40" />}
          action={
            <Link href="/class/new">
              <Button variant="primary">
                <Plus size={16} />
                Tambah Kelas Sekarang
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesWithStats.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between hover:border-[var(--primary)] hover:shadow-md transition-all group"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h2 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {cls.name}
                    </h2>
                    <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                      {cls.level ? `${cls.level} · ` : ''}Tahun Ajaran {cls.academic_year ?? '-'}
                    </p>
                  </div>
                  <Badge variant="primary" className="text-[11px]">
                    {cls.totalMembers} Santri
                  </Badge>
                </div>

                {cls.description && (
                  <p className="text-xs text-[var(--foreground-secondary)] line-clamp-2 mb-4">
                    {cls.description}
                  </p>
                )}

                {/* Progress bar keterpantauan bulan ini */}
                <div className="my-4 bg-[var(--background-secondary)] p-3 rounded-[var(--radius-md)] border border-[var(--border)]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[var(--foreground-muted)] font-medium">Monitoring Bulan Ini</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {cls.uniqueMonitored}/{cls.totalMembers} ({cls.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cls.percentage >= 80
                          ? 'bg-[var(--success)]'
                          : cls.percentage >= 50
                          ? 'bg-[var(--primary)]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, cls.percentage)}%` }}
                    />
                  </div>

                  {cls.needsAttentionCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
                      <AlertTriangle size={12} className="flex-shrink-0" />
                      <span>{cls.needsAttentionCount} santri butuh perhatian/bimbingan</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
                <Link href={`/class/${cls.id}`} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    Buka Kelas
                    <ArrowRight size={14} />
                  </Button>
                </Link>
                <Link href={`/class/${cls.id}/members`}>
                  <Button variant="outline" size="sm" title="Kelola Anggota">
                    <Users size={14} />
                  </Button>
                </Link>
                <Link href={`/class/${cls.id}/monitoring`}>
                  <Button variant="outline" size="sm" title="Monitoring">
                    <BarChart2 size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
