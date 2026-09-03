-- ============================================================
-- Class & Student Monitoring System
-- Migration: 003_rls.sql
-- Row Level Security Policies
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_insya ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_potential ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: check if user owns workspace
-- ============================================================

CREATE OR REPLACE FUNCTION is_workspace_owner(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = ws_id
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_workspace_member_or_owner(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = ws_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Users can only read/update their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- WORKSPACES POLICIES
-- ============================================================

CREATE POLICY "workspaces_select" ON workspaces
  FOR SELECT USING (is_workspace_member_or_owner(id));

CREATE POLICY "workspaces_insert" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- WORKSPACE MEMBERS POLICIES
-- ============================================================

CREATE POLICY "workspace_members_select" ON workspace_members
  FOR SELECT USING (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "workspace_members_insert" ON workspace_members
  FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "workspace_members_delete" ON workspace_members
  FOR DELETE USING (is_workspace_owner(workspace_id));

-- ============================================================
-- WORKSPACE SETTINGS POLICIES
-- ============================================================

CREATE POLICY "workspace_settings_select" ON workspace_settings
  FOR SELECT USING (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "workspace_settings_insert" ON workspace_settings
  FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "workspace_settings_update" ON workspace_settings
  FOR UPDATE USING (is_workspace_owner(workspace_id));

CREATE POLICY "workspace_settings_delete" ON workspace_settings
  FOR DELETE USING (is_workspace_owner(workspace_id));

-- ============================================================
-- CLASS GROUPS POLICIES
-- ============================================================

CREATE POLICY "class_groups_select" ON class_groups
  FOR SELECT USING (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "class_groups_insert" ON class_groups
  FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "class_groups_update" ON class_groups
  FOR UPDATE USING (is_workspace_owner(workspace_id));

CREATE POLICY "class_groups_delete" ON class_groups
  FOR DELETE USING (is_workspace_owner(workspace_id));

-- ============================================================
-- CLASS MEMBERS POLICIES
-- ============================================================

CREATE POLICY "class_members_select" ON class_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_groups cg
      WHERE cg.id = class_members.class_group_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "class_members_insert" ON class_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM class_groups cg
      WHERE cg.id = class_members.class_group_id
      AND is_workspace_owner(cg.workspace_id)
    )
  );

CREATE POLICY "class_members_update" ON class_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM class_groups cg
      WHERE cg.id = class_members.class_group_id
      AND is_workspace_owner(cg.workspace_id)
    )
  );

CREATE POLICY "class_members_delete" ON class_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM class_groups cg
      WHERE cg.id = class_members.class_group_id
      AND is_workspace_owner(cg.workspace_id)
    )
  );

-- ============================================================
-- MEMBER MONITORING POLICIES
-- ============================================================

CREATE POLICY "member_monitoring_select" ON member_monitoring
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = member_monitoring.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "member_monitoring_insert" ON member_monitoring
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = member_monitoring.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "member_monitoring_update" ON member_monitoring
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = member_monitoring.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "member_monitoring_delete" ON member_monitoring
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = member_monitoring.member_id
      AND is_workspace_owner(cg.workspace_id)
    )
  );

-- ============================================================
-- MEMBER INSYA' POLICIES
-- ============================================================

CREATE POLICY "member_insya_select" ON member_insya
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = member_insya.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "member_insya_insert" ON member_insya
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = member_insya.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "member_insya_update" ON member_insya
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = member_insya.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "member_insya_delete" ON member_insya
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = member_insya.member_id
      AND is_workspace_owner(cg.workspace_id)
    )
  );

-- ============================================================
-- ACADEMIC POTENTIAL POLICIES
-- ============================================================

CREATE POLICY "academic_potential_select" ON academic_potential
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = academic_potential.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "academic_potential_insert" ON academic_potential
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = academic_potential.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "academic_potential_update" ON academic_potential
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = academic_potential.member_id
      AND is_workspace_member_or_owner(cg.workspace_id)
    )
  );

CREATE POLICY "academic_potential_delete" ON academic_potential
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      JOIN class_groups cg ON cg.id = cm.class_group_id
      WHERE cm.id = academic_potential.member_id
      AND is_workspace_owner(cg.workspace_id)
    )
  );

-- ============================================================
-- STUDENTS POLICIES
-- ============================================================

CREATE POLICY "students_select" ON students
  FOR SELECT USING (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "students_insert" ON students
  FOR INSERT WITH CHECK (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "students_update" ON students
  FOR UPDATE USING (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "students_delete" ON students
  FOR DELETE USING (is_workspace_owner(workspace_id));

-- ============================================================
-- COURSES POLICIES
-- ============================================================

CREATE POLICY "courses_select" ON courses
  FOR SELECT USING (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "courses_insert" ON courses
  FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "courses_update" ON courses
  FOR UPDATE USING (is_workspace_owner(workspace_id));

CREATE POLICY "courses_delete" ON courses
  FOR DELETE USING (is_workspace_owner(workspace_id));

-- ============================================================
-- COURSE STUDENTS POLICIES
-- ============================================================

CREATE POLICY "course_students_select" ON course_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_students.course_id
      AND is_workspace_member_or_owner(c.workspace_id)
    )
  );

CREATE POLICY "course_students_insert" ON course_students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_students.course_id
      AND is_workspace_member_or_owner(c.workspace_id)
    )
  );

CREATE POLICY "course_students_delete" ON course_students
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_students.course_id
      AND is_workspace_owner(c.workspace_id)
    )
  );

-- ============================================================
-- ASSESSMENTS POLICIES
-- ============================================================

CREATE POLICY "assessments_select" ON assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = assessments.course_id
      AND is_workspace_member_or_owner(c.workspace_id)
    )
  );

CREATE POLICY "assessments_insert" ON assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = assessments.course_id
      AND is_workspace_owner(c.workspace_id)
    )
  );

CREATE POLICY "assessments_update" ON assessments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = assessments.course_id
      AND is_workspace_owner(c.workspace_id)
    )
  );

CREATE POLICY "assessments_delete" ON assessments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = assessments.course_id
      AND is_workspace_owner(c.workspace_id)
    )
  );

-- ============================================================
-- ASSESSMENT SCORES POLICIES
-- ============================================================

CREATE POLICY "assessment_scores_select" ON assessment_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = assessment_scores.assessment_id
      AND is_workspace_member_or_owner(c.workspace_id)
    )
  );

CREATE POLICY "assessment_scores_insert" ON assessment_scores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = assessment_scores.assessment_id
      AND is_workspace_member_or_owner(c.workspace_id)
    )
  );

CREATE POLICY "assessment_scores_update" ON assessment_scores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = assessment_scores.assessment_id
      AND is_workspace_member_or_owner(c.workspace_id)
    )
  );

CREATE POLICY "assessment_scores_delete" ON assessment_scores
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = assessment_scores.assessment_id
      AND is_workspace_owner(c.workspace_id)
    )
  );

-- ============================================================
-- AI ANALYSES POLICIES
-- ============================================================

CREATE POLICY "ai_analyses_select" ON ai_analyses
  FOR SELECT USING (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "ai_analyses_insert" ON ai_analyses
  FOR INSERT WITH CHECK (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "ai_analyses_update" ON ai_analyses
  FOR UPDATE USING (is_workspace_member_or_owner(workspace_id));

CREATE POLICY "ai_analyses_delete" ON ai_analyses
  FOR DELETE USING (is_workspace_owner(workspace_id));
