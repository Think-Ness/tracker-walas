import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, Badge, Button, EmptyState } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/data'
import { formatDate, getRatingLabel } from '@/lib/utils'
import { Brain, Plus, Calendar } from 'lucide-react'
import type { Metadata } from 'next'
import QuickMonitoringClient from './QuickMonitoringClient'

interface Props {
  params: Promise<{ classId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('class_groups').select('name').eq('id', classId).single()
  return { title: `Monitoring — ${data?.name ?? 'Kelas'}` }
}

export default async function ClassMonitoringPage({ params }: Props) {
  const { classId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: classGroup } = await supabase
    .from('class_groups')
    .select('*, workspaces(owner_id)')
    .eq('id', classId)
    .single()

  if (!classGroup || (classGroup.workspaces as any)?.owner_id !== user.id) notFound()

  // Get members
  const { data: members } = await supabase
    .from('class_members')
    .select('id, stambuk, name, class_name')
    .eq('class_group_id', classId)
    .eq('status', 'active')
    .order('name')

  // Get monitoring records for this class
  const memberIds = members?.map((m) => m.id) ?? []
  const { data: records } = await supabase
    .from('member_monitoring')
    .select('*, class_members(id, name, stambuk)')
    .in('member_id', memberIds)
    .order('observed_at', { ascending: false })

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Kelas', href: '/class' },
          { label: classGroup.name, href: `/class/${classId}` },
          { label: 'Monitoring' },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Catatan Monitoring Perkembangan"
        description={`Pantau akhlak, kedisiplinan, dan karakter anggota ${classGroup.name}`}
      />

      <QuickMonitoringClient
        classId={classId}
        userId={user.id}
        members={members ?? []}
        records={records ?? []}
      />
    </div>
  )
}
