import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, EmptyState, Badge, Button } from '@/components/ui'
import { getStatusLabel, getStatusVariant } from '@/lib/utils'
import { Plus, GraduationCap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mahasiswa' }

export default async function StudentsPage() {
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
      <EmptyState
        title="Belum ada workspace mahasiswa"
        description="Buat workspace mahasiswa terlebih dahulu."
        action={
          <Link
            href="/workspace/new?type=student"
            className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-[var(--primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors"
          >
            Buat Workspace Mahasiswa
          </Link>
        }
      />
    )
  }

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('name')

  return (
    <div>
      <PageHeader
        title="Mahasiswa"
        description={`Daftar mahasiswa — ${workspace.name}`}
        action={
          <Link href="/academic/students/new">
            <Button variant="primary">
              <Plus size={16} />
              Tambah Mahasiswa
            </Button>
          </Link>
        }
      />

      {!students || students.length === 0 ? (
        <EmptyState
          title="Belum ada mahasiswa"
          description="Tambahkan mahasiswa atau impor dari Excel."
          icon={<GraduationCap size={32} className="opacity-40" />}
          action={
            <Link href="/academic/students/new">
              <button className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-[var(--primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors">
                <Plus size={16} />
                Tambah Mahasiswa
              </button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)]">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/academic/students/${student.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--background-secondary)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--background-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center flex-shrink-0">
                  {student.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-[var(--foreground-muted)]">
                      {student.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{student.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {student.nim}
                    {student.campus_class ? ` · ${student.campus_class}` : ''}
                    {student.semester ? ` · Semester ${student.semester}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusVariant(student.status)}>{getStatusLabel(student.status)}</Badge>
                <span className="text-xs text-[var(--foreground-muted)]">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
