'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================================
// TOAST / NOTIFICATION SYSTEM
// ============================================================

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const addToast = React.useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const contextValue = React.useMemo(
    () => ({
      addToast,
      success: (m: string) => addToast(m, 'success'),
      error: (m: string) => addToast(m, 'error'),
      warning: (m: string) => addToast(m, 'warning'),
      info: (m: string) => addToast(m, 'info'),
    }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({
  message,
  variant,
  onDismiss,
}: {
  message: string
  variant: ToastVariant
  onDismiss: () => void
}) {
  const variantStyles: Record<ToastVariant, string> = {
    success: 'border-l-4 border-l-[var(--success)] bg-white',
    error: 'border-l-4 border-l-[var(--danger)] bg-white',
    warning: 'border-l-4 border-l-[var(--warning)] bg-white',
    info: 'border-l-4 border-l-[var(--primary)] bg-white',
  }

  const variantIcons: Record<ToastVariant, string> = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  }

  const iconColors: Record<ToastVariant, string> = {
    success: 'text-[var(--success)]',
    error: 'text-[var(--danger)]',
    warning: 'text-[var(--warning)]',
    info: 'text-[var(--primary)]',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)]',
        variantStyles[variant]
      )}
    >
      <span className={cn('text-sm font-bold flex-shrink-0 mt-0.5', iconColors[variant])}>
        {variantIcons[variant]}
      </span>
      <p className="flex-1 text-sm text-[var(--foreground)]">{message}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        aria-label="Tutup"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
