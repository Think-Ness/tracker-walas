import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/data'
import type { Metadata } from 'next'
import GradebookClient from './GradebookClient'

interface Props {
  params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('courses').select('name').eq('id', courseId).single()
  return { title: data?.name ?? 'Detail Mata Kuliah' }
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('*, workspaces(owner_id, name)')
    .eq('id', courseId)
    .single()

  if (!course || (course.workspaces as any)?.owner_id !== user.id) notFound()

  // Get assessments ordered by order_index
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('order_index')

  // Get enrolled students
  const { data: enrolled } = await supabase
    .from('course_students')
    .select('*, students(*)')
    .eq('course_id', courseId)

  const students = enrolled?.map((e) => e.students as unknown as {
    id: string; nim: string; name: string; campus_class: string | null; semester: number | null; status: string
  }) ?? []

  // Get all scores for this course's assessments
  const assessmentIds = assessments?.map((a) => a.id) ?? []
  const { data: allScores } = await supabase
    .from('assessment_scores')
    .select('*')
    .in('assessment_id', assessmentIds)

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Mata Kuliah', href: '/academic/courses' },
          { label: course.name },
        ]}
        className="mb-4"
      />

      <PageHeader
        title={course.name}
        description={`${course.code ?? ''} · Semester ${course.semester ?? '-'}${course.sks ? ` · ${course.sks} SKS` : ''}`}
      />

      <GradebookClient
        courseId={courseId}
        course={course}
        assessments={assessments ?? []}
        students={students}
        scores={allScores ?? []}
        userId={user.id}
      />
    </div>
  )
}
