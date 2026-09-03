import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, EmptyState, Badge, Button } from '@/components/ui'
import { Plus, BookOpen } from 'lucide-react'
import { CoursesListClient } from './CoursesListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mata Kuliah' }

interface Props {
  searchParams?: Promise<{ workspaceId?: string }>
}

export default async function CoursesPage({ searchParams }: Props) {
  const { workspaceId } = (await searchParams) || {}
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let wsQuery = supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .eq('type', 'student')
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
          title="Belum ada workspace mahasiswa"
          description="Buat workspace mahasiswa untuk mulai mengelola mata kuliah dan penilaian."
          action={
            <Link href="/workspace/new?type=student">
              <Button variant="primary">
                <Plus size={16} />
                Buat Workspace Mahasiswa
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      course_students(count)
    `)
    .eq('workspace_id', workspace.id)
    .eq('is_active', true)
    .order('name')

  return (
    <div>
      <PageHeader
        title="Mata Kuliah"
        description={workspace.name}
        action={
          <Link href="/academic/courses/new">
            <Button variant="primary">
              <Plus size={16} />
              Tambah Mata Kuliah
            </Button>
          </Link>
        }
      />

      {!courses || courses.length === 0 ? (
        <EmptyState
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah untuk mulai mengelola penilaian mahasiswa."
          icon={<BookOpen size={32} className="opacity-40" />}
          action={
            <Link href="/academic/courses/new">
              <Button variant="primary">
                <Plus size={16} />
                Tambah Mata Kuliah
              </Button>
            </Link>
          }
        />
      ) : (
        <CoursesListClient courses={(courses as any) ?? []} />
      )}
    </div>
  )
}
