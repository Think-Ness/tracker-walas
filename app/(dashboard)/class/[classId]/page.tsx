import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, StatCard, Badge, Button } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/data'
import { formatDate, getStatusLabel, getStatusVariant } from '@/lib/utils'
import { Users, BarChart2, Plus } from 'lucide-react'
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

  const { count: totalMembers } = await supabase
    .from('class_members')
    .select('id', { count: 'exact', head: true })
    .eq('class_group_id', classId)

  const { count: activeMembers } = await supabase
    .from('class_members')
    .select('id', { count: 'exact', head: true })
    .eq('class_group_id', classId)
    .eq('status', 'active')

  const thisMonth = new Date()
  thisMonth.setDate(1)
  const { data: monitoredIds } = await supabase
    .from('member_monitoring')
    .select('member_id')
    .gte('observed_at', thisMonth.toISOString().split('T')[0])

  const uniqueMonitored = new Set(monitoredIds?.map((m) => m.member_id) ?? []).size

  const { data: recentMembers } = await supabase
    .from('class_members')
    .select('*')
    .eq('class_group_id', classId)
    .order('name')
    .limit(5)

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Kelas', href: '/class' },
          { label: classGroup.name },
        ]}
        className="mb-4"
      />

      <PageHeader
        title={classGroup.name}
        description={`Tahun Ajaran ${classGroup.academic_year ?? '-'}`}
        action={
          <Link href={`/class/${classId}/members`}>
            <Button variant="primary">
              <Users size={16} />
              Lihat Semua Anggota
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Anggota" value={totalMembers ?? 0} />
        <StatCard label="Aktif" value={activeMembers ?? 0} />
        <StatCard label="Terpantau Bulan Ini" value={uniqueMonitored} />
        <StatCard
          label="Belum Terpantau"
          value={Math.max(0, (activeMembers ?? 0) - uniqueMonitored)}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <Link
          href={`/class/${classId}/members`}
          className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3 hover:bg-[var(--background-secondary)] transition-colors"
        >
          <Users size={18} className="text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">Anggota</span>
        </Link>
        <Link
          href={`/class/${classId}/monitoring`}
          className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3 hover:bg-[var(--background-secondary)] transition-colors"
        >
          <BarChart2 size={18} className="text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">Monitoring</span>
        </Link>
        <Link
          href={`/class/${classId}/members/new`}
          className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3 hover:bg-[var(--background-secondary)] transition-colors"
        >
          <Plus size={18} className="text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">Tambah Anggota</span>
        </Link>
      </div>

      {/* Recent Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Anggota Terbaru</h2>
          <Link href={`/class/${classId}/members`} className="text-xs text-[var(--primary)] hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)]">
          {recentMembers?.map((member) => (
            <Link
              key={member.id}
              href={`/class/${classId}/members/${member.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-[var(--background-secondary)] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{member.name}</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {member.stambuk} · {member.daerah ?? '-'}
                </p>
              </div>
              <Badge variant={getStatusVariant(member.status)}>{getStatusLabel(member.status)}</Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
