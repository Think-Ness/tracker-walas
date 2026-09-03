-- ============================================================
-- Class & Student Monitoring System
-- Migration: 002_indexes.sql
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Workspaces
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_type ON workspaces(type);

-- Workspace Members
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- Workspace Settings
CREATE INDEX idx_workspace_settings_workspace ON workspace_settings(workspace_id);

-- Class Groups
CREATE INDEX idx_class_groups_workspace ON class_groups(workspace_id);

-- Class Members
CREATE INDEX idx_class_members_class_group ON class_members(class_group_id);
CREATE INDEX idx_class_members_stambuk ON class_members(stambuk);
CREATE INDEX idx_class_members_name ON class_members(name);
CREATE INDEX idx_class_members_status ON class_members(status);

-- Member Monitoring
CREATE INDEX idx_monitoring_member ON member_monitoring(member_id);
CREATE INDEX idx_monitoring_date ON member_monitoring(observed_at DESC);
CREATE INDEX idx_monitoring_category ON member_monitoring(category);

-- Member Insya
CREATE INDEX idx_insya_member ON member_insya(member_id);
CREATE INDEX idx_insya_date ON member_insya(note_date DESC);

-- Academic Potential
CREATE INDEX idx_potential_member ON academic_potential(member_id);
CREATE INDEX idx_potential_date ON academic_potential(assessed_at DESC);

-- Students
CREATE INDEX idx_students_workspace ON students(workspace_id);
CREATE INDEX idx_students_nim ON students(nim);
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_students_status ON students(status);

-- Courses
CREATE INDEX idx_courses_workspace ON courses(workspace_id);
CREATE INDEX idx_courses_academic_year ON courses(academic_year);

-- Course Students
CREATE INDEX idx_course_students_course ON course_students(course_id);
CREATE INDEX idx_course_students_student ON course_students(student_id);

-- Assessments
CREATE INDEX idx_assessments_course ON assessments(course_id);
CREATE INDEX idx_assessments_order ON assessments(course_id, order_index);

-- Assessment Scores
CREATE INDEX idx_scores_assessment ON assessment_scores(assessment_id);
CREATE INDEX idx_scores_student ON assessment_scores(student_id);

-- AI Analyses
CREATE INDEX idx_ai_analyses_workspace ON ai_analyses(workspace_id);
CREATE INDEX idx_ai_analyses_member ON ai_analyses(member_id);
CREATE INDEX idx_ai_analyses_student ON ai_analyses(student_id);
CREATE INDEX idx_ai_analyses_status ON ai_analyses(status);
CREATE INDEX idx_ai_analyses_type ON ai_analyses(analysis_type);
