import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatCard, EmptyState, Button, PageHeader } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { Users, AlertCircle, Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard Kelas' }

export default async function ClassPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get class workspace
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
          description="Buat workspace kelas untuk mulai melakukan monitoring anggota."
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

  // Get class groups
  const { data: classGroups } = await supabase
    .from('class_groups')
    .select('*')
    .eq('workspace_id', workspace.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (!classGroups || classGroups.length === 0) {
    return (
      <div>
        <PageHeader
          title="Kelas"
          description={workspace.name}
          action={
            <Link href="/class/new">
              <Button variant="primary">
                <Plus size={16} />
                Buat Kelas
              </Button>
            </Link>
          }
        />
        <EmptyState
          title="Belum ada kelas"
          description="Buat kelas pertama untuk mulai memasukkan anggota dan melakukan monitoring."
          action={
            <Link href="/class/new">
              <Button variant="primary">
                <Plus size={16} />
                Buat Kelas
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  // If there's only one class, show its dashboard directly
  const primaryClass = classGroups[0]

  // Stats
  const { count: totalMembers } = await supabase
    .from('class_members')
    .select('id', { count: 'exact', head: true })
    .eq('class_group_id', primaryClass.id)
    .eq('status', 'active')

  // Members monitored this month
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const { data: monitoredIds } = await supabase
    .from('member_monitoring')
    .select('member_id')
    .gte('observed_at', thisMonth.toISOString().split('T')[0])

  const uniqueMonitored = new Set(monitoredIds?.map((m) => m.member_id) ?? []).size
  const unmonitored = (totalMembers ?? 0) - uniqueMonitored

  // Recent monitoring activity
  const { data: recentMonitoring } = await supabase
    .from('member_monitoring')
    .select('*, class_members(name)')
    .order('observed_at', { ascending: false })
    .limit(8)

  return (
    <div>
      <PageHeader
        title={primaryClass.name}
        description={`Tahun Ajaran ${primaryClass.academic_year ?? '-'}`}
        action={
          <Link href={`/class/${primaryClass.id}/members`}>
            <Button variant="primary">
              <Users size={16} />
              Lihat Anggota
            </Button>
          </Link>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Anggota"
          value={totalMembers ?? 0}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Terpantau Bulan Ini"
          value={uniqueMonitored}
        />
        <StatCard
          label="Belum Terpantau"
          value={unmonitored}
          subtitle={unmonitored > 0 ? 'Perlu perhatian' : undefined}
        />
        <Link href={`/class/${primaryClass.id}`} className="block">
          <StatCard
            label="Detail Kelas"
            value="→"
            subtitle="Lihat profil lengkap"
          />
        </Link>
      </div>

      {/* Alert if unmonitored */}
      {unmonitored > 0 && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--warning-subtle)] border border-amber-200">
          <AlertCircle size={16} className="text-[var(--warning)] flex-shrink-0" />
          <p className="text-sm text-[var(--foreground-secondary)]">
            <span className="font-medium">{unmonitored} anggota</span> belum dimonitor bulan ini.
          </p>
          <Link
            href={`/class/${primaryClass.id}/monitoring`}
            className="ml-auto text-sm font-medium text-[var(--warning)] hover:underline flex-shrink-0"
          >
            Mulai monitoring
          </Link>
        </div>
      )}

      {/* Multiple classes list */}
      {classGroups.length > 1 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Semua Kelas</h2>
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)]">
            {classGroups.map((cls) => (
              <Link
                key={cls.id}
                href={`/class/${cls.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--background-secondary)] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{cls.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Tahun Ajaran {cls.academic_year ?? '-'}
                  </p>
                </div>
                <span className="text-[var(--foreground-muted)] text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Aktivitas Monitoring Terbaru</h2>
          <Link
            href={`/class/${primaryClass.id}/monitoring`}
            className="text-xs text-[var(--primary)] hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {!recentMonitoring || recentMonitoring.length === 0 ? (
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-8 text-center">
            <p className="text-sm text-[var(--foreground-muted)]">Belum ada aktivitas monitoring.</p>
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)]">
            {recentMonitoring.map((m: any) => (
              <div key={m.id} className="px-5 py-3 flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="h-7 w-7 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center">
                    <span className="text-xs font-semibold text-[var(--primary)]">
                      {m.rating}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {m.class_members?.name ?? '-'}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {m.category} · {formatDate(m.observed_at)}
                  </p>
                  {m.note && (
                    <p className="mt-0.5 text-xs text-[var(--foreground-secondary)] line-clamp-1">
                      {m.note}
                    </p>
                  )}
                </div>
                <span className="text-xs text-[var(--foreground-muted)] flex-shrink-0">
                  {m.rating}/5
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
