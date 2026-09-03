'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui'
import { DataTable, SearchInput, Pagination } from '@/components/ui/data'
import { getStatusLabel, getStatusVariant } from '@/lib/utils'
import { useCallback, useState } from 'react'
import type { ClassMember } from '@/lib/types'

interface Props {
  classId: string
  members: ClassMember[]
  totalPages: number
  currentPage: number
  totalCount: number
  initialQuery: string
  initialStatus: string
}

export default function MembersClient({
  classId,
  members,
  totalPages,
  currentPage,
  totalCount,
  initialQuery,
  initialStatus,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(window.location.search)
      Object.entries(params).forEach(([k, v]) => {
        if (v) sp.set(k, v)
        else sp.delete(k)
      })
      router.push(`${pathname}?${sp.toString()}`)
    },
    [router, pathname]
  )

  const columns = [
    {
      key: 'stambuk',
      header: 'Stambuk',
      width: '120px',
    },
    {
      key: 'name',
      header: 'Nama',
      render: (m: ClassMember) => (
        <Link
          href={`/class/${classId}/members/${m.id}`}
          className="flex items-center gap-2.5 font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
        >
          <div className="h-7 w-7 rounded-full bg-[var(--background-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[var(--foreground-muted)]">
            {m.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              m.name.charAt(0)
            )}
          </div>
          <span>{m.name}</span>
        </Link>
      ),
    },
    { key: 'class_name', header: 'Kelas' },
    { key: 'daerah', header: 'Daerah', render: (m: ClassMember) => m.daerah ?? '-' },
    { key: 'rayon', header: 'Rayon', render: (m: ClassMember) => m.rayon ?? '-' },
    {
      key: 'status',
      header: 'Status',
      render: (m: ClassMember) => (
        <Badge variant={getStatusVariant(m.status)}>{getStatusLabel(m.status)}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (m: ClassMember) => (
        <Link
          href={`/class/${classId}/members/${m.id}`}
          className="text-xs text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors"
          aria-label={`Lihat profil ${m.name}`}
        >
          Detail →
        </Link>
      ),
    },
  ]

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <SearchInput
          value={initialQuery}
          onChange={(v) => updateParams({ q: v, page: '1' })}
          placeholder="Cari nama, stambuk..."
          className="max-w-xs"
        />
        <select
          value={initialStatus}
          onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
          className="h-9 px-3 text-sm rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-white text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak Aktif</option>
          <option value="archived">Diarsipkan</option>
          <option value="graduated">Lulus</option>
        </select>
        <span className="ml-auto text-xs text-[var(--foreground-muted)]">
          {totalCount} anggota
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
        <DataTable
          columns={columns}
          data={members}
          rowKey={(m) => m.id}
          emptyMessage="Tidak ada anggota yang sesuai."
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ page: String(p) })}
          />
        </div>
      )}
    </div>
  )
}
