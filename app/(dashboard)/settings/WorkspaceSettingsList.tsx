'use client'

import { useState } from 'react'
import { Button, Card } from '@/components/ui'
import { Edit2, Plus, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { EditWorkspaceModal } from '@/components/workspace/EditWorkspaceModal'

interface WorkspaceItem {
  id: string
  name: string
  description: string | null
  type: 'class' | 'student'
  is_active: boolean
}

export function WorkspaceSettingsList({ workspaces }: { workspaces: WorkspaceItem[] }) {
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceItem | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Workspace</h2>
        <Link href="/workspace/new">
          <Button variant="outline" size="sm">
            <Plus size={14} />
            Tambah Workspace
          </Button>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 text-center">
          <p className="text-sm text-[var(--foreground-muted)] mb-3">
            Belum ada workspace yang dibuat.
          </p>
          <Link href="/workspace/new">
            <Button variant="primary" size="sm">
              <Plus size={14} />
              Buat Workspace Sekarang
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)] shadow-sm">
          {workspaces.map((ws) => (
            <div key={ws.id} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-[var(--radius-md)] bg-[var(--background-secondary)] text-[var(--primary)] mt-0.5 flex-shrink-0">
                  {ws.type === 'class' ? <Users size={18} /> : <BookOpen size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{ws.name}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        ws.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ws.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    {ws.type === 'class' ? 'Workspace Kelas (Wali Kelas)' : 'Workspace Mahasiswa (Perkuliahan)'}
                    {ws.description ? ` — ${ws.description}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingWorkspace(ws)}
                  className="text-xs"
                >
                  <Edit2 size={13} />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
