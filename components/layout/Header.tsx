'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, Menu } from 'lucide-react'
import * as React from 'react'
import Link from 'next/link'

interface HeaderProps {
  userEmail?: string
  userName?: string
  avatarUrl?: string | null
  onToggleMobileMenu?: () => void
}

export function Header({ userEmail, userName, avatarUrl, onToggleMobileMenu }: HeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="header h-14 sm:h-12 border-b border-[var(--border)] bg-white flex items-center justify-between px-3 sm:px-5 flex-shrink-0">
      {/* Mobile Hamburger & Brand */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Buka menu navigasi"
          className="p-2 -ml-1 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-[var(--radius-md)]"
        >
          <Menu size={20} />
        </button>
        <Link href="/workspace" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-[var(--radius-sm)] bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">CM</span>
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">Class Monitor</span>
        </Link>
      </div>

      <div className="hidden md:block" />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 p-1.5 sm:px-2 sm:py-1.5 rounded-[var(--radius-md)] text-sm text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)] transition-colors"
          aria-label="User menu"
        >
          <div className="h-7 w-7 sm:h-6 sm:w-6 rounded-full bg-[var(--background-tertiary)] border border-[var(--border)] overflow-hidden flex items-center justify-center flex-shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-[var(--foreground-muted)]" />
            )}
          </div>
          <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
            {userName ?? userEmail ?? 'Akun'}
          </span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] z-20">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                  {userName ?? 'Pengguna'}
                </p>
                <p className="text-xs text-[var(--foreground-muted)] mt-0.5 truncate">
                  {userEmail}
                </p>
              </div>
              <div className="p-1">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-[var(--foreground-secondary)] rounded-[var(--radius-md)] hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <User size={14} />
                  Profil & Pengaturan
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-[var(--danger)] rounded-[var(--radius-md)] hover:bg-[var(--danger-subtle)] transition-colors"
                >
                  <LogOut size={14} />
                  Keluar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
