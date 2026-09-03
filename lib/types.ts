// ============================================================
// Database Types — Class & Student Monitoring System
// ============================================================

export type WorkspaceType = 'class' | 'student'
export type WorkspaceRole = 'owner' | 'admin' | 'member'
export type MemberStatus = 'active' | 'inactive' | 'graduated' | 'archived'
export type AiStatus = 'pending' | 'completed' | 'failed' | 'reviewed'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  owner_id: string
  name: string
  description: string | null
  type: WorkspaceType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkspaceSetting {
  id: string
  workspace_id: string
  setting_key: string
  setting_value: unknown
  created_at: string
  updated_at: string
}

export interface ClassGroup {
  id: string
  workspace_id: string
  name: string
  academic_year: string | null
  level: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClassMember {
  id: string
  class_group_id: string
  stambuk: string
  name: string
  class_name: string
  daerah: string | null
  rayon: string | null
  status: MemberStatus
  photo_url?: string | null
  created_at: string
  updated_at: string
}

export interface MemberMonitoring {
  id: string
  member_id: string
  observed_by: string
  observed_at: string
  category: string
  rating: number
  note: string | null
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface MemberInsya {
  id: string
  member_id: string
  created_by: string
  note_date: string
  title: string | null
  content: string | null
  score: number | null
  kategori: string | null
  created_at: string
  updated_at: string
}

export interface AcademicPotential {
  id: string
  member_id: string
  assessed_by: string
  assessed_at: string
  bidang: string | null
  strength: string | null
  potential: string | null
  weakness: string | null
  recommendation: string | null
  rating: number | null
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  workspace_id: string
  nim: string
  name: string
  campus_class: string | null
  semester: number | null
  pondok: string | null
  status: MemberStatus
  photo_url?: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  workspace_id: string
  code: string | null
  name: string
  semester: string | null
  academic_year: string | null
  sks: number | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CourseStudent {
  id: string
  course_id: string
  student_id: string
  enrolled_at: string
  created_at: string
}

export interface Assessment {
  id: string
  course_id: string
  name: string
  type: string
  max_score: number
  weight: number
  order_index: number
  assessment_date: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AssessmentScore {
  id: string
  assessment_id: string
  student_id: string
  score: number | null
  note: string | null
  feedback: string | null
  created_at: string
  updated_at: string
}

export interface AiAnalysis {
  id: string
  workspace_id: string
  member_id: string | null
  student_id: string | null
  status: AiStatus
  analysis_type: string
  input_summary: string | null
  result: string | null
  edited_result: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// API / Query Types
// ============================================================

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SearchParams {
  query?: string
}

export interface ClassMemberFilters {
  status?: MemberStatus
  daerah?: string
  rayon?: string
}

export interface StudentFilters {
  status?: MemberStatus
  campus_class?: string
  pondok?: string
  semester?: number
}

// ============================================================
// Dashboard Stats
// ============================================================

export interface ClassDashboardStats {
  totalMembers: number
  monitoredMembers: number
  unmonitoredMembers: number
  averageMonitoringRating: number | null
  recentActivity: TimelineItem[]
}

export interface CourseDashboardStats {
  totalStudents: number
  averageScore: number | null
  highestScore: number | null
  lowestScore: number | null
  assessmentProgress: AssessmentProgress[]
}

export interface AssessmentProgress {
  assessment: Assessment
  enteredCount: number
  totalCount: number
}

// ============================================================
// Timeline
// ============================================================

export type TimelineItemType = 'monitoring' | 'insya' | 'potential' | 'assessment'

export interface TimelineItem {
  id: string
  type: TimelineItemType
  date: string
  title: string
  subtitle: string | null
  rating?: number | null
  score?: number | null
}
