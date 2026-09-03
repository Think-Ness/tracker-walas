'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button, Input, Label } from '@/components/ui'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!email || !password) {
      setFormError('Email dan password wajib diisi.')
      return
    }

    if (isSignUp && !fullName.trim()) {
      setFormError('Nama lengkap wajib diisi untuk pendaftaran.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      setLoading(false)

      if (error) {
        setFormError(error.message || 'Gagal mendaftar. Silakan coba lagi.')
        return
      }

      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim() || email.split('@')[0] || 'Pengguna',
          email: data.user.email || email,
        }, { onConflict: 'id' })
      }

      // If Supabase has email confirmation enabled
      if (data?.user && !data.session) {
        setFormSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi, atau hubungi admin Supabase untuk mematikan konfirmasi email.')
        return
      }

      showSuccess('Akun berhasil dibuat!')
      router.push('/workspace')
      router.refresh()
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      setLoading(false)

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setFormError('Email atau password salah, atau akun belum terdaftar.')
        } else {
          setFormError(error.message)
        }
        return
      }

      showSuccess('Berhasil masuk!')
      router.push('/workspace')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">CM</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-[var(--foreground)]">Class Monitor</h1>
            <p className="text-xs text-[var(--foreground-muted)]">Sistem Monitoring Akademik</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {isSignUp ? 'Buat Akun Baru' : 'Masuk ke Akun'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setFormError(null)
                setFormSuccess(null)
              }}
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum ada akun? Daftar'}
            </button>
          </div>

          <p className="text-sm text-[var(--foreground-muted)] mb-5">
            {isSignUp
              ? 'Daftarkan akun wali kelas / pengajar Anda.'
              : 'Masukkan email dan password terdaftar Anda.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="full_name" required>
                  Nama Lengkap
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ust. Suharto"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password minimal 6 karakter"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
            </div>

            {formError && (
              <div className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--danger-subtle)] border border-red-200">
                <p className="text-xs text-[var(--danger)]">{formError}</p>
              </div>
            )}

            {formSuccess && (
              <div className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--success-subtle)] border border-green-200">
                <p className="text-xs text-[var(--success)]">{formSuccess}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
            >
              {loading
                ? 'Memproses...'
                : isSignUp
                ? 'Daftar Sekarang'
                : 'Masuk'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--foreground-muted)]">
          Class & Student Monitoring System v1.0
        </p>
      </div>
    </div>
  )
}
