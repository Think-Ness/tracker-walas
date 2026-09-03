import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Sangat Perlu Perhatian',
    2: 'Perlu Perhatian',
    3: 'Cukup',
    4: 'Baik',
    5: 'Sangat Baik',
  }
  return labels[rating] ?? '-'
}

export function getRatingColor(rating: number): string {
  if (rating >= 5) return 'text-success'
  if (rating >= 4) return 'text-primary'
  if (rating >= 3) return 'text-warning'
  return 'text-danger'
}

export function calculateWeightedScore(
  scores: Array<{ score: number | null; weight: number; max_score: number }>
): number | null {
  const validScores = scores.filter((s) => s.score !== null)
  if (validScores.length === 0) return null

  const total = validScores.reduce((acc, s) => {
    return acc + ((s.score! / s.max_score) * s.weight)
  }, 0)

  return Math.round(total * 100) / 100
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    graduated: 'Lulus',
    archived: 'Diarsipkan',
  }
  return labels[status] ?? status
}

export function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
    inactive: 'warning',
    graduated: 'info',
    archived: 'default',
  }
  return variants[status] ?? 'default'
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
