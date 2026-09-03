import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import { ProfileSettingsSection } from './ProfileSettingsSection'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pengaturan' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at')

  return (
    <div className="max-w-2xl">
      <PageHeader title="Pengaturan" description="Kelola profil dan konfigurasi workspace." />

      {/* Profile Section */}
      <ProfileSettingsSection
        user={{ id: user.id, email: user.email }}
        profile={profile}
      />

      {/* Workspaces Section */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Workspace</h2>
        {!workspaces || workspaces.length === 0 ? (
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
            <p className="text-sm text-[var(--foreground-muted)]">Belum ada workspace. Buat workspace dari halaman Pilih Workspace.</p>
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)]">
            {workspaces.map((ws) => (
              <div key={ws.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{ws.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                      {ws.type === 'class' ? 'Workspace Kelas' : 'Workspace Mahasiswa'}
                      {ws.description ? ` — ${ws.description}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ws.is_active ? 'bg-[var(--success-subtle)] text-[var(--success)]' : 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)]'}`}>
                    {ws.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Config Section */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Konfigurasi AI</h2>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <p className="text-sm text-[var(--foreground-secondary)]">
            Fitur analisis AI menggunakan Google Gemini. Pastikan Anda telah mengkonfigurasi{' '}
            <code className="px-1 py-0.5 bg-[var(--background-tertiary)] rounded text-xs font-mono">GEMINI_API_KEY</code>{' '}
            di file <code className="px-1 py-0.5 bg-[var(--background-tertiary)] rounded text-xs font-mono">.env.local</code>.
          </p>
          <p className="mt-2 text-xs text-[var(--foreground-muted)]">
            Dapatkan API key gratis di{' '}
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              aistudio.google.com
            </a>
          </p>
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Tentang</h2>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <p className="text-sm text-[var(--foreground-secondary)]">
            Class & Student Monitoring System — Sistem administrasi akademik untuk wali kelas dan dosen.
          </p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">Versi 1.0.0</p>
        </div>
      </section>
    </div>
  )
}
