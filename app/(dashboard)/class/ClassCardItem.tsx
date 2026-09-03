'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge, Button } from '@/components/ui'
import { ArrowRight, Users, BarChart2, Edit2, AlertTriangle } from 'lucide-react'
import { EditClassModal } from './[classId]/EditClassModal'

interface ClassCardProps {
  cls: {
    id: string
    name: string
    academic_year: string | null
    level: string | null
    description: string | null
    totalMembers: number
    uniqueMonitored: number
    needsAttentionCount: number
    percentage: number
  }
}

export function ClassCardItem({ cls }: ClassCardProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <>
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between hover:border-[var(--primary)] hover:shadow-md transition-all group">
        <div>
          {/* Header Card */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                {cls.name}
              </h2>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                {cls.level ? `${cls.level} · ` : ''}Tahun Ajaran {cls.academic_year ?? '-'}
              </p>
            </div>
            <Badge variant="primary" className="text-[11px]">
              {cls.totalMembers} Santri
            </Badge>
          </div>

          {cls.description && (
            <p className="text-xs text-[var(--foreground-secondary)] line-clamp-2 mb-4">
              {cls.description}
            </p>
          )}

          {/* Progress bar keterpantauan bulan ini */}
          <div className="my-4 bg-[var(--background-secondary)] p-3 rounded-[var(--radius-md)] border border-[var(--border)]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[var(--foreground-muted)] font-medium">Monitoring Bulan Ini</span>
              <span className="font-semibold text-[var(--foreground)]">
                {cls.uniqueMonitored}/{cls.totalMembers} ({cls.percentage}%)
              </span>
            </div>
            <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  cls.percentage >= 80
                    ? 'bg-[var(--success)]'
                    : cls.percentage >= 50
                    ? 'bg-[var(--primary)]'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, cls.percentage)}%` }}
              />
            </div>

            {cls.needsAttentionCount > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
                <AlertTriangle size={12} className="flex-shrink-0" />
                <span>{cls.needsAttentionCount} santri butuh perhatian/bimbingan</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
          <Link href={`/class/${cls.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full justify-center text-xs">
              Buka Kelas
              <ArrowRight size={13} />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
            title="Edit / Hapus Kelas"
            className="text-xs"
          >
            <Edit2 size={13} />
          </Button>
          <Link href={`/class/${cls.id}/members`}>
            <Button variant="outline" size="sm" title="Kelola Anggota" className="text-xs">
              <Users size={13} />
            </Button>
          </Link>
          <Link href={`/class/${cls.id}/monitoring`}>
            <Button variant="outline" size="sm" title="Monitoring" className="text-xs">
              <BarChart2 size={13} />
            </Button>
          </Link>
        </div>
      </div>

      {showEditModal && (
        <EditClassModal
          classGroup={cls}
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
