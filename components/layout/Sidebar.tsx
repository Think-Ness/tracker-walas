'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BarChart2,
  Settings,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import * as React from 'react'

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  children?: NavItem[]
}

const classNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/class',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Anggota',
    href: '/class/members',
    icon: <Users size={16} />,
  },
  {
    label: 'Monitoring',
    href: '/class/monitoring',
    icon: <BarChart2 size={16} />,
  },
]

const academicNavItems: NavItem[] = [
  {
    label: 'Mata Kuliah',
    href: '/academic/courses',
    icon: <BookOpen size={16} />,
  },
  {
    label: 'Mahasiswa',
    href: '/academic/students',
    icon: <GraduationCap size={16} />,
  },
]

interface SidebarProps {
  workspaceType?: 'class' | 'student' | null
  workspaceName?: string
  onCloseMobile?: () => void
}

export function Sidebar({ workspaceType, workspaceName, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav
      className="sidebar flex-shrink-0 w-full md:w-[var(--sidebar-width)] border-r border-[var(--border)] bg-white h-full flex flex-col"
      aria-label="Main navigation"
    >
      {/* Logo / App Name & Mobile Close */}
      <div className="px-4 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <Link
          href="/workspace"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5"
        >
          <div className="h-7 w-7 rounded-[var(--radius-sm)] bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">CM</span>
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">Class Monitor</span>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            aria-label="Tutup menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Workspace name if in a workspace */}
      {workspaceName && (
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]">
          <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide font-medium mb-0.5">
            Workspace
          </p>
          <p className="text-sm font-medium text-[var(--foreground)] truncate">{workspaceName}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3">
        {/* Workspace Selector */}
        <div className="px-3 mb-1">
          <NavLink
            href="/workspace"
            icon={<LayoutDashboard size={16} />}
            label="Pilih Workspace"
            active={pathname === '/workspace'}
            onClick={onCloseMobile}
          />
        </div>

        {/* Class workspace nav */}
        {(workspaceType === 'class' || pathname.startsWith('/class')) && (
          <div className="mt-2">
            <p className="px-4 mb-1 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">
              Kelas
            </p>
            <div className="px-3 space-y-0.5">
              {classNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  href={item.href!}
                  icon={item.icon}
                  label={item.label}
                  onClick={onCloseMobile}
                  active={
                    item.href === '/class'
                      ? pathname === '/class'
                      : pathname.startsWith(item.href!)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Academic workspace nav */}
        {(workspaceType === 'student' || pathname.startsWith('/academic')) && (
          <div className="mt-2">
            <p className="px-4 mb-1 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">
              Mahasiswa
            </p>
            <div className="px-3 space-y-0.5">
              {academicNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  href={item.href!}
                  icon={item.icon}
                  label={item.label}
                  onClick={onCloseMobile}
                  active={pathname.startsWith(item.href!)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Settings */}
      <div className="border-t border-[var(--border)] px-3 py-3">
        <NavLink
          href="/settings"
          icon={<Settings size={16} />}
          label="Pengaturan"
          onClick={onCloseMobile}
          active={pathname.startsWith('/settings')}
        />
      </div>
    </nav>
  )
}

function NavLink({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-colors',
        active
          ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-medium'
          : 'text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]'
      )}
    >
      <span className={cn('flex-shrink-0', active ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]')}>
        {icon}
      </span>
      {label}
    </Link>
  )
}
