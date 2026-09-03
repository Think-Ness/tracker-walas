import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Badge, PageHeader, Card, EmptyState } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/data'
import { getStatusLabel, getStatusVariant, calculateWeightedScore } from '@/lib/utils'
import type { Metadata } from 'next'
import StudentDetailClient from './StudentDetailClient'

interface Props {
  params: Promise<{ studentId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { studentId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('students').select('name').eq('id', studentId).single()
  return { title: data?.name ?? 'Profil Mahasiswa' }
}

export default async function StudentDetailPage({ params }: Props) {
  const { studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('*, workspaces(owner_id)')
    .eq('id', studentId)
    .single()

  if (!student || (student.workspaces as any)?.owner_id !== user.id) notFound()

  // Get enrolled courses
  const { data: enrolledCourses } = await supabase
    .from('course_students')
    .select(`
      course_id,
      courses (
        id,
        code,
        name,
        semester,
        sks,
        academic_year,
        assessments (
          id,
          name,
          type,
          weight,
          max_score,
          order_index
        )
      )
    `)
    .eq('student_id', studentId)

  // Get student's scores
  const { data: studentScores } = await supabase
    .from('assessment_scores')
    .select('*')
    .eq('student_id', studentId)

  // Format courses data with calculated final scores
  const coursesData = (enrolledCourses ?? []).map((ec) => {
    const course = ec.courses as any
    const assessments = (course?.assessments ?? []).sort((a: any, b: any) => a.order_index - b.order_index)

    const scoresList = assessments.map((a: any) => {
      const found = studentScores?.find((s) => s.assessment_id === a.id)
      return {
        assessment_id: a.id,
        assessment_name: a.name,
        weight: a.weight,
        max_score: a.max_score,
        score: found?.score ?? null,
        note: found?.note ?? null,
      }
    })

    const finalScore = calculateWeightedScore(scoresList)

    return {
      courseId: course?.id,
      code: course?.code,
      name: course?.name,
      semester: course?.semester,
      sks: course?.sks,
      assessments: scoresList,
      finalScore,
    }
  })

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Mahasiswa', href: '/academic/students' },
          { label: student.name },
        ]}
        className="mb-4"
      />

      <StudentDetailClient
        student={student}
        courses={coursesData}
        userId={user.id}
      />
    </div>
  )
}
