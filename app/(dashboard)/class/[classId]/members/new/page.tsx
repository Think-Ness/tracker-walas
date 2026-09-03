'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, Card, Button, Input, Label, Select } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/interactive'
import { useToast } from '@/components/ui/toast'
import { Breadcrumb } from '@/components/ui/data'
import { Upload, Plus, FileSpreadsheet } from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'
import * as XLSX from 'xlsx'

interface Props {
  params: Promise<{ classId: string }>
}

export default function NewMemberPage({ params }: Props) {
  const { classId } = use(params)
  const router = useRouter()
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    stambuk: '',
    name: '',
    class_name: '6 D',
    daerah: '',
    rayon: '',
    status: 'active',
    photo_url: null as string | null,
  })

  // Excel import state
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState<Array<{
    stambuk: string
    name: string
    class_name: string
    daerah?: string
    rayon?: string
  }>>([])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.stambuk.trim() || !formData.name.trim()) return

    setLoading(true)
    const supabase = createClient()

    const { error: insertError } = await supabase
      .from('class_members')
      .insert({
        class_group_id: classId,
        stambuk: formData.stambuk.trim(),
        name: formData.name.trim(),
        class_name: formData.class_name.trim(),
        daerah: formData.daerah.trim() || null,
        rayon: formData.rayon.trim() || null,
        status: formData.status,
        photo_url: formData.photo_url,
      })

    setLoading(false)

    if (insertError) {
      error(insertError.message || 'Gagal menambahkan anggota.')
      return
    }

    success('Anggota berhasil ditambahkan.')
    router.push(`/class/${classId}/members`)
    router.refresh()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json<any>(ws)

        // Map column variations (stambuk/nis/nomor, nama/name, kelas/class, daerah/asal, rayon/kamar)
        const parsed = data.map((row) => ({
          stambuk: String(row.stambuk || row.Stambuk || row.NIS || row.nis || row.No || Math.floor(Math.random() * 900000 + 100000)),
          name: String(row.nama || row.Nama || row.name || row.Name || 'Tanpa Nama'),
          class_name: String(row.kelas || row.Kelas || row.class_name || '6 D'),
          daerah: row.daerah || row.Daerah || row.asal || row.Asal || null,
          rayon: row.rayon || row.Rayon || row.kamar || row.Kamar || null,
        }))

        setPreviewData(parsed)
        success(`${parsed.length} baris data berhasil dibaca dari file.`)
      } catch (err) {
        error('Gagal membaca file Excel. Pastikan format file benar.')
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleBatchImport = async () => {
    if (previewData.length === 0) return

    setImporting(true)
    const supabase = createClient()

    const records = previewData.map((d) => ({
      class_group_id: classId,
      stambuk: d.stambuk,
      name: d.name,
      class_name: d.class_name,
      daerah: d.daerah || null,
      rayon: d.rayon || null,
      status: 'active',
    }))

    const { error: batchError } = await supabase
      .from('class_members')
      .upsert(records, { onConflict: 'class_group_id,stambuk' })

    setImporting(false)

    if (batchError) {
      error(batchError.message || 'Gagal mengimpor data anggota.')
      return
    }

    success(`${records.length} anggota berhasil diimpor!`)
    router.push(`/class/${classId}/members`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Breadcrumb
        items={[
          { label: 'Kelas', href: '/class' },
          { label: 'Detail Kelas', href: `/class/${classId}` },
          { label: 'Anggota', href: `/class/${classId}/members` },
          { label: 'Tambah Anggota' },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Tambah Anggota Kelas"
        description="Tambahkan satu per satu secara manual atau unggah file Excel/CSV."
      />

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">
            <Plus size={14} className="mr-1.5" />
            Input Manual
          </TabsTrigger>
          <TabsTrigger value="excel">
            <FileSpreadsheet size={14} className="mr-1.5" />
            Impor Excel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Photo Upload */}
              <ImageUpload
                currentUrl={formData.photo_url}
                onUploadSuccess={(url) => setFormData({ ...formData, photo_url: url })}
                folder="members"
                label="Foto Santri (Kamera / Galeri)"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stambuk" required>No. Stambuk / NIS</Label>
                  <Input
                    id="stambuk"
                    placeholder="Contoh: 612011"
                    value={formData.stambuk}
                    onChange={(e) => setFormData({ ...formData, stambuk: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="class_name" required>Kelas</Label>
                  <Input
                    id="class_name"
                    placeholder="Contoh: 6 D"
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name" required>Nama Lengkap Anggota</Label>
                <Input
                  id="name"
                  placeholder="Nama santri / siswa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="daerah">Daerah / Asal</Label>
                  <Input
                    id="daerah"
                    placeholder="Contoh: Surabaya, Jakarta"
                    value={formData.daerah}
                    onChange={(e) => setFormData({ ...formData, daerah: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="rayon">Rayon / Konsulat</Label>
                  <Input
                    id="rayon"
                    placeholder="Contoh: Al-Azhar, Darussalam"
                    value={formData.rayon}
                    onChange={(e) => setFormData({ ...formData, rayon: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="archived">Diarsipkan</option>
                  <option value="graduated">Lulus</option>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  Simpan Anggota
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="excel">
          <Card className="space-y-4">
            <div className="border-2 border-dashed border-[var(--border-strong)] rounded-[var(--radius-lg)] p-8 text-center bg-[var(--background-secondary)]">
              <Upload size={32} className="mx-auto text-[var(--foreground-muted)] mb-2" />
              <p className="text-sm font-medium text-[var(--foreground)]">Pilih File Excel (.xlsx, .xls, .csv)</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Kolom yang didukung: stambuk, nama, kelas, daerah, rayon
              </p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="mt-4 block mx-auto text-xs text-[var(--foreground-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-xs file:font-medium file:bg-[var(--primary)] file:text-white hover:file:bg-[var(--primary-hover)] cursor-pointer"
              />
            </div>

            {previewData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Pratinjau Data ({previewData.length} calon anggota)
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleBatchImport}
                    loading={importing}
                  >
                    Impor Sekarang
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-[var(--border)] rounded-[var(--radius-md)]">
                  <table className="w-full text-xs">
                    <thead className="bg-[var(--background-secondary)] border-b border-[var(--border)]">
                      <tr>
                        <th className="p-2 text-left">Stambuk</th>
                        <th className="p-2 text-left">Nama</th>
                        <th className="p-2 text-left">Kelas</th>
                        <th className="p-2 text-left">Daerah</th>
                        <th className="p-2 text-left">Rayon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-white">
                      {previewData.slice(0, 20).map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-mono">{row.stambuk}</td>
                          <td className="p-2 font-medium">{row.name}</td>
                          <td className="p-2">{row.class_name}</td>
                          <td className="p-2">{row.daerah || '-'}</td>
                          <td className="p-2">{row.rayon || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 20 && (
                    <p className="p-2 text-center text-xs text-[var(--foreground-muted)] bg-[var(--background-secondary)]">
                      ...dan {previewData.length - 20} data lainnya
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
