import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    // Verify user auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, memberId, studentId, memberName, monitoring, insya, potential, scores, courses } = body

    // Verify API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key') {
      return NextResponse.json(
        { error: 'Gemini API key belum dikonfigurasi. Tambahkan GEMINI_API_KEY ke .env.local Anda.' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

    // Build prompt based on analysis type
    let prompt = ''

    if (type === 'mental_summary' && memberId) {
      prompt = buildMentalSummaryPrompt(memberName, monitoring, insya, potential)
    } else if (type === 'academic_summary' && studentId) {
      prompt = buildAcademicSummaryPrompt(memberName, scores, courses)
    } else {
      return NextResponse.json({ error: 'Tipe analisis tidak dikenali.' }, { status: 400 })
    }

    // Call Gemini
    const geminiResult = await model.generateContent(prompt)
    const aiText = geminiResult.response.text()

    // Save to database
    const insertData: Record<string, unknown> = {
      workspace_id: body.workspaceId,
      status: 'completed',
      analysis_type: type,
      input_summary: `${monitoring?.length ?? 0} monitoring, ${insya?.length ?? 0} insya', ${potential?.length ?? 0} potensi`,
      result: aiText,
    }

    if (memberId) insertData.member_id = memberId
    if (studentId) insertData.student_id = studentId

    // Try to get workspace_id from member/student
    if (memberId && !body.workspaceId) {
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class_groups(workspace_id)')
        .eq('id', memberId)
        .single()
      if (memberData) {
        insertData.workspace_id = (memberData.class_groups as any)?.workspace_id
      }
    }

    if (insertData.workspace_id) {
      const { data: savedAnalysis } = await supabase
        .from('ai_analyses')
        .insert(insertData)
        .select()
        .single()

      return NextResponse.json(savedAnalysis)
    }

    // Return without saving if no workspace_id
    return NextResponse.json({
      id: 'temp-' + Date.now(),
      analysis_type: type,
      result: aiText,
      edited_result: null,
      status: 'completed',
      created_at: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('AI Analysis error:', error)
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function buildMentalSummaryPrompt(
  name: string,
  monitoring: unknown[],
  insya: unknown[],
  potential: unknown[]
): string {
  const monitoringText = (monitoring as Array<{category: string; rating: number; note?: string; observed_at: string}>)
    .map((m) => `- ${m.observed_at}: ${m.category} (${m.rating}/5) — ${m.note ?? 'tanpa catatan'}`)
    .join('\n')

  const insyaText = (insya as Array<{title?: string; note_date: string; score?: number; content?: string}>)
    .map((i) => `- ${i.note_date}: ${i.title ?? 'Tanpa judul'} (Nilai: ${i.score ?? '-'}) — ${i.content ?? ''}`)
    .join('\n')

  const potentialText = (potential as Array<{bidang?: string; rating?: number; strength?: string; potential?: string}>)
    .map((p) => `- ${p.bidang ?? 'Umum'} (${p.rating ?? '-'}/5): Kekuatan: ${p.strength ?? '-'} | Potensi: ${p.potential ?? '-'}`)
    .join('\n')

  return `Kamu adalah asisten wali kelas yang membantu membuat ringkasan perkembangan anggota kelas secara profesional dan objektif.

Buat analisis singkat dalam format terstruktur untuk:
Nama: ${name}

DATA MONITORING:
${monitoringText || 'Tidak ada data monitoring'}

DATA INSYA':
${insyaText || 'Tidak ada data insya\''}

DATA POTENSI AKADEMIK:
${potentialText || 'Tidak ada data potensi'}

Format output:
## Ringkasan Perkembangan
[2-3 kalimat ringkasan keseluruhan]

## Kekuatan
[Bullet points kekuatan yang terlihat dari data]

## Area yang Perlu Perhatian
[Bullet points area yang perlu ditingkatkan]

## Draft Narasi Raport Mental
[Paragraf 3-5 kalimat yang dapat digunakan sebagai bahan narasi raport, ditulis dalam bahasa formal Bahasa Indonesia]

PENTING: 
- Gunakan bahasa Indonesia yang formal dan profesional
- Berdasarkan data yang ada saja, jangan mengarang
- Jika data terbatas, sebutkan bahwa analisis terbatas
- Ini adalah DRAFT untuk ditinjau dan diedit oleh wali kelas`
}

function buildAcademicSummaryPrompt(
  name: string,
  scores: unknown[],
  courses: unknown[]
): string {
  const scoresText = (scores as Array<{assessment_name: string; score?: number; weight: number}>)
    .map((s) => `- ${s.assessment_name}: ${s.score ?? 'belum ada nilai'} (bobot ${s.weight}%)`)
    .join('\n')

  return `Kamu adalah asisten dosen yang membantu membuat ringkasan performa akademik mahasiswa.

Buat analisis performa untuk:
Nama: ${name}

DATA NILAI:
${scoresText || 'Tidak ada data nilai'}

Format output:
## Ringkasan Performa
[Deskripsi singkat performa keseluruhan]

## Kekuatan
[Komponen penilaian yang unggul]

## Area untuk Ditingkatkan
[Komponen yang perlu perhatian]

## Rekomendasi
[Saran spesifik untuk mahasiswa]

PENTING:
- Gunakan bahasa Indonesia formal
- Berdasarkan data nilai yang ada
- Ini adalah DRAFT untuk ditinjau oleh dosen`
}
