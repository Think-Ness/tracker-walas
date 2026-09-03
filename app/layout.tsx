import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: {
    default: 'Class Monitor — Sistem Monitoring Kelas & Mahasiswa',
    template: '%s | Class Monitor',
  },
  description:
    'Sistem administrasi akademik profesional untuk wali kelas dan dosen. Monitoring anggota kelas, perkembangan mental, insya\', potensi akademik, dan penilaian mahasiswa.',
  keywords: ['monitoring kelas', 'penilaian mahasiswa', 'administrasi akademik', 'wali kelas'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
