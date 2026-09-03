'use client'

import { useState } from 'react'
import { Button, Input, Label, Card } from '@/components/ui'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { User, Save } from 'lucide-react'

interface ProfileSettingsProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export function ProfileSettingsSection({ user, profile }: ProfileSettingsProps) {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
      })
      .eq('id', user.id)

    setLoading(false)

    if (updateError) {
      error(updateError.message || 'Gagal menyimpan profil.')
      return
    }

    success('Profil berhasil diperbarui!')
    window.location.reload()
  }

  return (
    <Card className="p-4 sm:p-5 mb-6 shadow-sm">
      <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">
        Profil Pengguna (Wali Kelas / Dosen)
      </h2>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar Upload */}
        <ImageUpload
          currentUrl={avatarUrl}
          onUploadSuccess={(url) => setAvatarUrl(url)}
          folder="profiles"
          aspectRatio="square"
          label="Foto Profil (Kamera / Galeri)"
        />

        <div>
          <Label htmlFor="profile-name" required>Nama Lengkap</Label>
          <Input
            id="profile-name"
            placeholder="Nama lengkap atau gelar..."
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="profile-email">Email Terdaftar</Label>
          <Input
            id="profile-email"
            value={user.email || '-'}
            disabled
            className="bg-[var(--background-secondary)] cursor-not-allowed opacity-75"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" loading={loading}>
            <Save size={14} />
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Card>
  )
}
