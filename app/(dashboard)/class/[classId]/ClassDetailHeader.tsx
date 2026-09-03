'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge, Button } from '@/components/ui'
import { Plus, BarChart2, Edit2 } from 'lucide-react'
import { EditClassModal } from './EditClassModal'

interface ClassData {
  id: string
  name: string
  academic_year: string | null
  level: string | null
  description: string | null
}

export function ClassDetailHeader({ classGroup }: { classGroup: ClassData }) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <>
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{classGroup.name}</h1>
              <Badge variant="primary">
                {classGroup.academic_year ? `TA ${classGroup.academic_year}` : 'Aktif'}
              </Badge>
              {classGroup.level && (
                <span className="text-xs bg-[var(--background-secondary)] px-2.5 py-1 rounded-[var(--radius-sm)] text-[var(--foreground-secondary)] font-medium">
                  {classGroup.level}
                </span>
              )}
            </div>
            {classGroup.description && (
              <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1 max-w-2xl">
                {classGroup.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="text-xs"
            >
              <Edit2 size={13} />
              Edit Kelas
            </Button>

            <Link href={`/class/${classGroup.id}/members/new`}>
              <Button variant="outline" size="sm" className="text-xs">
                <Plus size={13} />
                Tambah Santri
              </Button>
            </Link>

            <Link href={`/class/${classGroup.id}/monitoring`}>
              <Button variant="primary" size="sm" className="text-xs">
                <BarChart2 size={13} />
                Catat Monitoring
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditClassModal
          classGroup={classGroup}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={() => {
            setShowEditModal(false)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
