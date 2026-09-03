import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge, PageHeader, EmptyState, Button } from '@/components/ui'
import { Breadcrumb, SearchInput } from '@/components/ui/data'
import { getStatusLabel, getStatusVariant } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import MembersClient from './MembersClient'

interface Props {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('class_groups').select('name').eq('id', classId).single()
  return { title: `Anggota — ${data?.name ?? 'Kelas'}` }
}

export default async function MembersPage({ params, searchParams }: Props) {
  const { classId } = await params
  const sp = await searchParams
  const q = sp.q ?? ''
  const status = sp.status ?? ''
  const page = parseInt(sp.page ?? '1')
  const pageSize = 20

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: classGroup } = await supabase
    .from('class_groups')
    .select('*, workspaces(name, owner_id)')
    .eq('id', classId)
    .single()

  if (!classGroup || (classGroup.workspaces as any)?.owner_id !== user.id) notFound()

  let query = supabase
    .from('class_members')
    .select('*', { count: 'exact' })
    .eq('class_group_id', classId)
    .order('name')
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (q) query = query.or(`name.ilike.%${q}%,stambuk.ilike.%${q}%`)
  if (status) query = query.eq('status', status)

  const { data: members, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Kelas', href: '/class' },
          { label: classGroup.name, href: `/class/${classId}` },
          { label: 'Anggota' },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Anggota"
        description={`Daftar anggota ${classGroup.name}`}
        action={
          <Link href={`/class/${classId}/members/new`}>
            <Button variant="primary">
              <Plus size={16} />
              Tambah Anggota
            </Button>
          </Link>
        }
      />

      <MembersClient
        classId={classId}
        members={members ?? []}
        totalPages={totalPages}
        currentPage={page}
        totalCount={count ?? 0}
        initialQuery={q}
        initialStatus={status}
      />
    </div>
  )
}
