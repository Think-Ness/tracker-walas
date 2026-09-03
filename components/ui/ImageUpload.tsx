'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Image as ImageIcon, Loader2, X, User } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

interface ImageUploadProps {
  currentUrl?: string | null
  onUploadSuccess: (url: string | null) => void
  folder?: 'members' | 'students' | 'profiles'
  aspectRatio?: 'portrait' | 'square'
  label?: string
}

export function ImageUpload({
  currentUrl,
  onUploadSuccess,
  folder = 'members',
  aspectRatio = 'portrait',
  label = 'Foto 3x4 / Pas Foto',
}: ImageUploadProps) {
  const { error: showError, success: showSuccess } = useToast()
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)

  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Compress image before uploading to keep sizes around ~150KB
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        const maxDim = 800
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width
          width = maxDim
        } else if (height > maxDim) {
          width = (width * maxDim) / height
          height = maxDim
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else resolve(file)
          },
          'image/jpeg',
          0.82
        )
      }

      img.onerror = () => reject(new Error('Gagal memproses gambar'))
      reader.readAsDataURL(file)
    })
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const compressedBlob = await compressImage(file)
      const supabase = createClient()
      const ext = 'jpg'
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      // Upload to 'photos' bucket
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      const url = publicData.publicUrl
      setPreview(url)
      onUploadSuccess(url)
      showSuccess('Foto berhasil diunggah!')
    } catch (err: any) {
      console.error('Upload error:', err)
      showError(err.message || 'Gagal mengunggah foto. Pastikan bucket "photos" sudah dibuat di Supabase.')
    } finally {
      setUploading(false)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUploadSuccess(null)
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">{label}</p>}

      <div className="flex items-center gap-4">
        {/* Preview box */}
        <div
          className={`relative border-2 border-dashed border-[var(--border-strong)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--background-secondary)] flex items-center justify-center flex-shrink-0 ${
            aspectRatio === 'portrait' ? 'w-24 h-32' : 'w-24 h-24'
          }`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Foto"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Hapus foto"
                className="absolute top-1 right-1 h-5 w-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="text-center p-2">
              <User size={28} className="mx-auto text-[var(--foreground-disabled)] mb-1" />
              <span className="text-[10px] text-[var(--foreground-muted)] block">Belum ada foto</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[10px] gap-1">
              <Loader2 size={16} className="animate-spin" />
              <span>Mengunggah...</span>
            </div>
          )}
        </div>

        {/* Buttons for Mobile: Camera vs Gallery */}
        <div className="flex flex-col gap-2">
          {/* Gallery Input */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />

          {/* Camera Input (capture="environment" for phone rear camera or "user" for selfie) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[var(--primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] active:scale-95 transition-all shadow-sm"
          >
            <Camera size={14} />
            Ambil Foto (Kamera)
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-white border border-[var(--border-strong)] text-[var(--foreground)] rounded-[var(--radius-md)] hover:bg-[var(--background-secondary)] active:scale-95 transition-all shadow-sm"
          >
            <ImageIcon size={14} />
            Pilih dari Galeri
          </button>
        </div>
      </div>
    </div>
  )
}
