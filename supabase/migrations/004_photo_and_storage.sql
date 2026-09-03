-- ============================================================
-- Class & Student Monitoring System
-- Migration: 004_photo_and_storage.sql
-- Add photo_url columns and Supabase Storage bucket setup
-- ============================================================

-- 1. Add photo_url to class_members and students
ALTER TABLE class_members ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Create storage bucket for photos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies: Allow public read, authenticated upload
CREATE POLICY "Public Read Photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated Upload Photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated Update Photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated Delete Photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND auth.role() = 'authenticated'
  );
