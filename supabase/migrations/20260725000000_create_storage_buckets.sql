-- Migration: Create Storage Buckets and RLS Security Policies for Avatars and Reports
-- Description: Initializes 'avatars' and 'reports' storage buckets and sets up Row Level Security (RLS).

-- 1. Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create 'reports' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policies for 'avatars' bucket
-- Public read access to avatars
CREATE POLICY "Public Read Avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload avatar images to their own folder or file name
CREATE POLICY "Users Can Upload Own Avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE auth.uid()::text || '%'
    )
  );

-- Users can update their own avatar file
CREATE POLICY "Users Can Update Own Avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE auth.uid()::text || '%'
    )
  );

-- Users can delete their own avatar file
CREATE POLICY "Users Can Delete Own Avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE auth.uid()::text || '%'
    )
  );

-- 4. RLS Policies for 'reports' bucket
-- Public or authenticated read access for report files
CREATE POLICY "Public Read Reports"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'reports');

-- Authenticated users or admins can upload report files
CREATE POLICY "Authenticated Users Can Upload Reports"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'reports'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users or admins can delete report files
CREATE POLICY "Authenticated Users Can Delete Reports"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'reports'
    AND auth.role() = 'authenticated'
  );
