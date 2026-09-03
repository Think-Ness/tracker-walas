import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, EmptyState, Badge, Button } from '@/components/ui'
import { Plus, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mata Kuliah' }

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .eq('type', 'student')
    .eq('is_active', true)
    .single()

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
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)]">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/academic/courses/${course.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-[var(--background-secondary)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--primary-subtle)] flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{course.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    {course.code ? `${course.code} · ` : ''}
                    Semester {course.semester ?? '-'}
                    {course.sks ? ` · ${course.sks} SKS` : ''}
                    {course.academic_year ? ` · ${course.academic_year}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--foreground-muted)]">
                  {(course.course_students as any)?.[0]?.count ?? 0} mahasiswa
                </span>
                <span className="text-[var(--foreground-muted)] text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
