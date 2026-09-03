import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Users, Settings } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pilih Workspace',
}

export default async function WorkspacePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const classWorkspace = workspaces?.find((w) => w.type === 'class')
  const studentWorkspace = workspaces?.find((w) => w.type === 'student')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Selamat Datang{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Pilih workspace yang ingin Anda gunakan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Class Workspace */}
        <WorkspaceCard
          title="Kelas"
          description="Monitoring anggota kelas"
          detail={classWorkspace?.name}
          href={classWorkspace ? `/class` : `/workspace/new?type=class`}
          icon={<Users size={24} className="text-[var(--primary)]" />}
          hasWorkspace={!!classWorkspace}
          ctaLabel={classWorkspace ? 'Masuk' : 'Buat Workspace Kelas'}
        />

        {/* Student Workspace */}
        <WorkspaceCard
          title="Mahasiswa"
          description="Mata kuliah dan penilaian"
          detail={studentWorkspace?.name}
          href={studentWorkspace ? `/academic/courses` : `/workspace/new?type=student`}
          icon={<BookOpen size={24} className="text-[var(--primary)]" />}
          hasWorkspace={!!studentWorkspace}
          ctaLabel={studentWorkspace ? 'Masuk' : 'Buat Workspace Mahasiswa'}
        />
      </div>

      {/* Settings link */}
      <div className="mt-6 pt-6 border-t border-[var(--border)]">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <Settings size={14} />
          Pengaturan
        </Link>
      </div>
    </div>
  )
}

function WorkspaceCard({
  title,
  description,
  detail,
  href,
  icon,
  hasWorkspace,
  ctaLabel,
}: {
  title: string
  description: string
  detail?: string
  href: string
  icon: React.ReactNode
  hasWorkspace: boolean
  ctaLabel: string
}) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 flex flex-col">
      <div className="mb-4">{icon}</div>
      <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
      {detail && (
        <p className="mt-2 text-xs font-medium text-[var(--foreground-secondary)] bg-[var(--background-secondary)] px-2 py-1 rounded-[var(--radius-sm)] w-fit">
          {detail}
        </p>
      )}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          {ctaLabel}
          <span>→</span>
        </Link>
      </div>
    </div>
  )
}
