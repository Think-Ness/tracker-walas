-- ============================================================
-- Class & Student Monitoring System
-- Migration: 005_fix_workspaces_rls_and_profile_trigger.sql
-- Fix workspaces RLS policies & automatic profile creation trigger
-- ============================================================

-- 1. Automatic trigger to create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Backfill profiles for all existing users who do not have a profile yet
INSERT INTO public.profiles (id, full_name, email)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email, 'Pengguna'), email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Fix Workspaces RLS Policies (Direct check, avoids recursive evaluation)
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON workspaces;

CREATE POLICY "workspaces_select" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "workspaces_insert" ON workspaces
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (owner_id = auth.uid() OR owner_id IS NULL)
  );

CREATE POLICY "workspaces_update" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());
