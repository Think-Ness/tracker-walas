'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Badge } from '@/components/ui'
import { Users, BookOpen, Edit2, Plus, ArrowRight, Settings } from 'lucide-react'
import { EditWorkspaceModal } from '@/components/workspace/EditWorkspaceModal'

interface WorkspaceItem {
  id: string
  name: string
  description: string | null
  type: 'class' | 'student'
  is_active: boolean
  created_at: string
}

interface Props {
  workspaces: WorkspaceItem[]
  userName?: string | null
}

export function WorkspaceSelectorClient({ workspaces, userName }: Props) {
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceItem | null>(null)

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
            Selamat Datang{userName ? `, ${userName}` : ''} 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Pilih workspace yang ingin Anda gunakan atau kelola.
          </p>
        </div>

        <Link href="/workspace/new">
          <Button variant="primary" size="sm">
            <Plus size={15} />
            Tambah Workspace Baru
          </Button>
        </Link>
      </div>

      {/* Grid of ALL Workspaces */}
      {workspaces.length === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-8 text-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center mx-auto mb-3">
            <Plus size={24} />
          </div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Belum ada workspace</h2>
          <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1 mb-4 max-w-sm mx-auto">
            Buat workspace pertama Anda untuk mulai mengelola kelas santri atau mata kuliah mahasiswa.
          </p>
          <Link href="/workspace/new">
            <Button variant="primary">
              <Plus size={16} />
              Buat Workspace Sekarang
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            const isClass = ws.type === 'class'
            const targetHref = isClass ? `/class?workspaceId=${ws.id}` : `/academic/courses?workspaceId=${ws.id}`

            return (
              <div
                key={ws.id}
                className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between hover:border-[var(--primary)] hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--background-secondary)] text-[var(--primary)] group-hover:bg-[var(--primary-subtle)] transition-colors">
                      {isClass ? <Users size={22} /> : <BookOpen size={22} />}
                    </div>
                    <Badge variant={isClass ? 'primary' : 'success'} className="text-[10px]">
                      {isClass ? 'Kelas (Wali Kelas)' : 'Mahasiswa (Kuliah)'}
                    </Badge>
                  </div>

                  <h2 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                    {ws.name}
                  </h2>

                  <p className="mt-1 text-xs text-[var(--foreground-secondary)] line-clamp-2 min-h-[32px]">
                    {ws.description || (isClass ? 'Monitoring dan akhlak santri' : 'Mata kuliah dan penilaian mahasiswa')}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2">
                  <Link href={targetHref} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full justify-center text-xs">
                      Buka Workspace
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingWorkspace(ws)}
                    title="Edit / Hapus Workspace"
                    className="text-xs px-2.5"
                  >
                    <Edit2 size={13} />
                  </Button>
                </div>
              </div>
            )
          })}

          {/* New Workspace Card Shortcut */}
          <Link
            href="/workspace/new"
            className="border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--primary)] rounded-[var(--radius-lg)] p-5 flex flex-col items-center justify-center text-center hover:bg-white/50 transition-all group min-h-[170px]"
          >
            <div className="h-10 w-10 rounded-full bg-[var(--background-secondary)] group-hover:bg-[var(--primary-subtle)] group-hover:text-[var(--primary)] text-[var(--foreground-muted)] flex items-center justify-center mb-2 transition-colors">
              <Plus size={20} />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              Tambah Workspace
            </p>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              Kelas baru atau perkuliahan
            </p>
          </Link>
        </div>
      )}

      {/* Footer Settings Link */}
      <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--foreground-muted)]">
        <span>{workspaces.length} workspace terdaftar</span>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors"
        >
          <Settings size={14} />
          Pengaturan Akun & Profil
        </Link>
      </div>

      {editingWorkspace && (
        <EditWorkspaceModal
          workspace={editingWorkspace}
          open={!!editingWorkspace}
          onOpenChange={(open) => !open && setEditingWorkspace(null)}
          onSuccess={() => {
            setEditingWorkspace(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
