import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/interactive'
import { Badge, PageHeader } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/data'
import { formatDate, getStatusLabel, getStatusVariant, getRatingLabel } from '@/lib/utils'
import type { Metadata } from 'next'
import MemberProfileClient from './MemberProfileClient'

interface Props {
  params: Promise<{ classId: string; memberId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { memberId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('class_members').select('name').eq('id', memberId).single()
  return { title: data?.name ?? 'Profil Anggota' }
}

export default async function MemberDetailPage({ params }: Props) {
  const { classId, memberId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('class_members')
    .select('*, class_groups(name, workspaces(owner_id))')
    .eq('id', memberId)
    .single()

  if (!member || (member.class_groups as any)?.workspaces?.owner_id !== user.id) notFound()

  const classGroup = member.class_groups as any

  // Fetch all related data
  const [monitoringRes, insyaRes, potentialRes] = await Promise.all([
    supabase
      .from('member_monitoring')
      .select('*')
      .eq('member_id', memberId)
      .order('observed_at', { ascending: false }),
    supabase
      .from('member_insya')
      .select('*')
      .eq('member_id', memberId)
      .order('note_date', { ascending: false }),
    supabase
      .from('academic_potential')
      .select('*')
      .eq('member_id', memberId)
      .order('assessed_at', { ascending: false }),
  ])

  const monitoring = monitoringRes.data ?? []
  const insya = insyaRes.data ?? []
  const potential = potentialRes.data ?? []

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Kelas', href: '/class' },
          { label: classGroup.name, href: `/class/${classId}` },
          { label: 'Anggota', href: `/class/${classId}/members` },
          { label: member.name },
        ]}
        className="mb-4"
      />

      <MemberProfileClient
        member={member}
        classId={classId}
        memberId={memberId}
        monitoring={monitoring}
        insya={insya}
        potential={potential}
        userId={user.id}
      />
    </div>
  )
}
