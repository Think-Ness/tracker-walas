'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, Card, Button, Input, Label, Select } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/interactive'
import { useToast } from '@/components/ui/toast'
import { Breadcrumb } from '@/components/ui/data'
import { Upload, Plus, FileSpreadsheet } from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'
import * as XLSX from 'xlsx'

export default function NewStudentPage() {
  const router = useRouter()
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nim: '',
    name: '',
    campus_class: 'AFI 6A',
    semester: 6,
    pondok: 'Gontor',
    status: 'active',
    photo_url: null as string | null,
  })

  // Excel import
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState<Array<{
    nim: string
    name: string
    campus_class?: string
    semester?: number
    pondok?: string
  }>>([])

  useEffect(() => {
    async function loadWorkspace() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: ws } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .eq('type', 'student')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (ws) {
        setWorkspaceId(ws.id)
      } else {
        error('Silakan buat workspace mahasiswa terlebih dahulu.')
        router.push('/workspace/new?type=student')
      }
    }
    loadWorkspace()
  }, [router, error])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nim.trim() || !formData.name.trim() || !workspaceId) return

    setLoading(true)
    const supabase = createClient()

    const { error: insertError } = await supabase
      .from('students')
      .insert({
        workspace_id: workspaceId,
        nim: formData.nim.trim(),
        name: formData.name.trim(),
        campus_class: formData.campus_class.trim() || null,
        semester: Number(formData.semester) || 6,
        pondok: formData.pondok.trim() || null,
        status: formData.status,
        photo_url: formData.photo_url,
      })

    setLoading(false)

    if (insertError) {
      error(insertError.message || 'Gagal menambahkan mahasiswa.')
      return
    }

    success('Mahasiswa berhasil ditambahkan.')
    router.push('/academic/students')
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

        const parsed = data.map((row) => ({
          nim: String(row.nim || row.NIM || row.stambuk || row.No || Math.floor(Math.random() * 900000 + 400000)),
          name: String(row.nama || row.Nama || row.name || 'Tanpa Nama'),
          campus_class: row.kelas || row.Kelas || row.prodi || 'AFI 6A',
          semester: Number(row.semester || row.Semester) || 6,
          pondok: row.pondok || row.Pondok || 'Gontor',
        }))

        setPreviewData(parsed)
        success(`${parsed.length} data mahasiswa berhasil dimuat dari file.`)
      } catch (err) {
        error('Gagal membaca file Excel. Pastikan format file sesuai.')
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleBatchImport = async () => {
    if (previewData.length === 0 || !workspaceId) return

    setImporting(true)
    const supabase = createClient()

    const records = previewData.map((d) => ({
      workspace_id: workspaceId,
      nim: d.nim,
      name: d.name,
      campus_class: d.campus_class || null,
      semester: d.semester || 6,
      pondok: d.pondok || null,
      status: 'active',
    }))

    const { error: batchError } = await supabase
      .from('students')
      .upsert(records, { onConflict: 'workspace_id,nim' })

    setImporting(false)

    if (batchError) {
      error(batchError.message || 'Gagal mengimpor data mahasiswa.')
      return
    }

    success(`${records.length} mahasiswa berhasil diimpor!`)
    router.push('/academic/students')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Breadcrumb
        items={[
          { label: 'Mahasiswa', href: '/academic/students' },
          { label: 'Tambah Mahasiswa' },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Tambah Mahasiswa Baru"
        description="Input satu per satu atau impor daftar mahasiswa dari file Excel."
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
                folder="students"
                label="Foto Mahasiswa (Kamera / Galeri)"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nim" required>NIM</Label>
                  <Input
                    id="nim"
                    placeholder="Contoh: 410013"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="campus_class">Kelas / Rombel Kampus</Label>
                  <Input
                    id="campus_class"
                    placeholder="Contoh: AFI 6A"
                    value={formData.campus_class}
                    onChange={(e) => setFormData({ ...formData, campus_class: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="std-name" required>Nama Lengkap Mahasiswa</Label>
                <Input
                  id="std-name"
                  placeholder="Nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="std-sem">Semester</Label>
                  <Input
                    id="std-sem"
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="std-pondok">Pondok / Kampus</Label>
                  <Input
                    id="std-pondok"
                    placeholder="Contoh: Gontor"
                    value={formData.pondok}
                    onChange={(e) => setFormData({ ...formData, pondok: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="std-status">Status</Label>
                <Select
                  id="std-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="graduated">Lulus</option>
                  <option value="archived">Diarsipkan</option>
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
                <Button type="submit" variant="primary" loading={loading} disabled={!workspaceId}>
                  Simpan Mahasiswa
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="excel">
          <Card className="space-y-4">
            <div className="border-2 border-dashed border-[var(--border-strong)] rounded-[var(--radius-lg)] p-8 text-center bg-[var(--background-secondary)]">
              <Upload size={32} className="mx-auto text-[var(--foreground-muted)] mb-2" />
              <p className="text-sm font-medium text-[var(--foreground)]">Unggah Berkas Excel Mahasiswa</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Format kolom yang didukung: NIM, Nama, Kelas, Semester, Pondok
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
                    Pratinjau ({previewData.length} calon mahasiswa)
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
                        <th className="p-2 text-left">NIM</th>
                        <th className="p-2 text-left">Nama</th>
                        <th className="p-2 text-left">Kelas</th>
                        <th className="p-2 text-left">Semester</th>
                        <th className="p-2 text-left">Pondok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-white">
                      {previewData.slice(0, 20).map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-mono">{row.nim}</td>
                          <td className="p-2 font-medium">{row.name}</td>
                          <td className="p-2">{row.campus_class || '-'}</td>
                          <td className="p-2">{row.semester || 6}</td>
                          <td className="p-2">{row.pondok || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
