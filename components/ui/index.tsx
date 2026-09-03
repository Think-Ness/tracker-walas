import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================================
// BUTTON
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap'

    const variants = {
      primary:
        'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]',
      secondary:
        'bg-[var(--background-tertiary)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--border)] ',
      outline:
        'bg-transparent text-[var(--foreground)] border border-[var(--border-strong)] hover:bg-[var(--background-tertiary)]',
      ghost:
        'bg-transparent text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]',
      destructive:
        'bg-[var(--danger)] text-white hover:bg-red-700 active:bg-red-800',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-5 text-sm',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ============================================================
// INPUT
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-3 text-sm rounded-[var(--radius-md)] border bg-white text-[var(--foreground)]',
            'border-[var(--border-strong)] placeholder:text-[var(--foreground-muted)]',
            'focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10',
            'disabled:bg-[var(--background-tertiary)] disabled:text-[var(--foreground-disabled)] disabled:cursor-not-allowed',
            error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/10',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ============================================================
// TEXTAREA
// ============================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border bg-white text-[var(--foreground)]',
            'border-[var(--border-strong)] placeholder:text-[var(--foreground-muted)]',
            'focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10',
            'disabled:bg-[var(--background-tertiary)] disabled:text-[var(--foreground-disabled)] disabled:cursor-not-allowed',
            'resize-y min-h-[80px]',
            error && 'border-[var(--danger)]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ============================================================
// SELECT
// ============================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full h-10 px-3 text-sm rounded-[var(--radius-md)] border bg-white text-[var(--foreground)]',
            'border-[var(--border-strong)]',
            'focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10',
            'disabled:bg-[var(--background-tertiary)] disabled:cursor-not-allowed',
            error && 'border-[var(--danger)]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ============================================================
// LABEL
// ============================================================

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium text-[var(--foreground)] mb-1', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-[var(--danger)]">*</span>}
    </label>
  )
}

// ============================================================
// FORM FIELD (Label + Input combo)
// ============================================================

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, required, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}

// ============================================================
// BADGE
// ============================================================

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] border-[var(--border)]',
    success: 'bg-[var(--success-subtle)] text-[var(--success)] border-green-200',
    warning: 'bg-[var(--warning-subtle)] text-[var(--warning)] border-amber-200',
    danger: 'bg-[var(--danger-subtle)] text-[var(--danger)] border-red-200',
    info: 'bg-[var(--primary-subtle)] text-[var(--primary)] border-blue-200',
    primary: 'bg-[var(--primary)] text-white border-[var(--primary)]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// ============================================================
// CARD
// ============================================================

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-[var(--border)] rounded-[var(--radius-lg)]',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between pb-4 border-b border-[var(--border)]', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-base font-semibold text-[var(--foreground)]', className)}>{children}</h3>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('pt-4', className)}>{children}</div>
}

// ============================================================
// SKELETON
// ============================================================

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-[var(--background-tertiary)]', className)}
    />
  )
}

// ============================================================
// STAT CARD (Dashboard KPI)
// ============================================================

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ label, value, subtitle, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-[var(--foreground-muted)] mt-0.5">{icon}</div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-3 text-[var(--foreground-muted)]">{icon}</div>
      )}
      <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[var(--foreground-muted)] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ============================================================
// SPINNER
// ============================================================

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-5 w-5 text-[var(--foreground-muted)]', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ============================================================
// DIVIDER
// ============================================================

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-[var(--border)]', className)} />
}

// ============================================================
// PAGE HEADER
// ============================================================

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  breadcrumb?: React.ReactNode
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--foreground)]">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}

// ============================================================
// RATING STARS (display only)
// ============================================================

interface RatingDisplayProps {
  rating: number
  max?: number
  showLabel?: boolean
}

export function RatingDisplay({ rating, max = 5, showLabel = false }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-[var(--foreground)]">
        {rating}/{max}
      </span>
      {showLabel && (
        <span className="text-xs text-[var(--foreground-muted)]">
          — {getRatingLabel(rating)}
        </span>
      )}
    </div>
  )
}

function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Sangat Perlu Perhatian',
    2: 'Perlu Perhatian',
    3: 'Cukup',
    4: 'Baik',
    5: 'Sangat Baik',
  }
  return labels[rating] ?? '-'
}
