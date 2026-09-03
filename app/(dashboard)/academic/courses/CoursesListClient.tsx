'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { BookOpen, Edit2, ArrowRight } from 'lucide-react'
import { EditCourseModal } from './[courseId]/EditCourseModal'

interface CourseItem {
  id: string
  name: string
  code: string | null
  semester: string | null
  sks: number | null
  academic_year: string | null
  description: string | null
  is_active: boolean
  course_students?: Array<{ count: number }> | any
}

export function CoursesListClient({ courses }: { courses: CourseItem[] }) {
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null)

  return (
    <div className="space-y-3">
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] divide-y divide-[var(--border)] shadow-sm">
        {courses.map((course) => {
          const studentCount = (course.course_students as any)?.[0]?.count ?? 0

          return (
            <div
              key={course.id}
              className="flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-[var(--background-secondary)] transition-colors gap-3"
            >
              <Link
                href={`/academic/courses/${course.id}`}
                className="flex items-center gap-3.5 flex-1 min-w-0"
              >
                <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--primary-subtle)] flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {course.name}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    {course.code ? `${course.code} · ` : ''}
                    Semester {course.semester ?? '-'}
                    {course.sks ? ` · ${course.sks} SKS` : ''}
                    {course.academic_year ? ` · ${course.academic_year}` : ''}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-[var(--foreground-muted)] hidden sm:inline mr-2">
                  {studentCount} mahasiswa
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCourse(course)}
                  className="h-8 px-2.5 text-xs"
                >
                  <Edit2 size={13} />
                  <span className="hidden sm:inline">Edit</span>
                </Button>

                <Link href={`/academic/courses/${course.id}`}>
                  <Button variant="primary" size="sm" className="h-8 px-3 text-xs">
                    Gradebook
                    <ArrowRight size={13} />
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          open={!!editingCourse}
          onOpenChange={(open) => !open && setEditingCourse(null)}
          onSuccess={() => {
            setEditingCourse(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
