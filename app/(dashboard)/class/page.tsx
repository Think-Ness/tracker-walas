import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, EmptyState, Button, Badge } from '@/components/ui'
import { Plus, Users, BarChart2, ArrowRight, AlertTriangle, CheckCircle2, GraduationCap } from 'lucide-react'
import { ClassCardItem } from './ClassCardItem'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Daftar Kelas' }

interface Props {
  searchParams?: Promise<{ workspaceId?: string }>
}

export default async function ClassListPage({ searchParams }: Props) {
  const { workspaceId } = (await searchParams) || {}
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Get class workspace
  let wsQuery = supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .eq('type', 'class')
    .eq('is_active', true)

  if (workspaceId) {
    wsQuery = wsQuery.eq('id', workspaceId)
  }

  const { data: workspace } = await wsQuery
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

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
            <ClassCardItem key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  )
}
