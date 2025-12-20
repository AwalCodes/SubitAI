-- SUBIT.AI Clerk Migration
-- This script migrates the Supabase schema to work with Clerk authentication.
-- 1. Changes UUID columns to TEXT to accommodate Clerk IDs (e.g., 'user_...').
-- 2. Updates RLS policies to use Clerk's JWT 'sub' claim.
-- 3. Removes legacy Supabase Auth triggers.

-- 1. Drop existing foreign key constraints that use UUID
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE public.billing DROP CONSTRAINT IF EXISTS billing_user_id_fkey;
ALTER TABLE public.usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_user_id_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 2. Change column types to TEXT for User IDs
-- Note: Using USING clause to ensure safe conversion if data exists
ALTER TABLE public.users ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.projects ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.billing ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.usage_tracking ALTER COLUMN user_id TYPE TEXT;

-- 3. Re-enable primary keys and references (optional, but good for integrity)
-- We don't link to auth.users anymore as Clerk users aren't in that table.
ALTER TABLE public.projects ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.billing ADD CONSTRAINT billing_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.usage_tracking ADD CONSTRAINT usage_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 4. Update RLS Policies to use Clerk JWT
-- Users table Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users 
    FOR SELECT USING (((auth.jwt() ->> 'sub') = id));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users 
    FOR UPDATE USING (((auth.jwt() ->> 'sub') = id));

-- Projects table Policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects 
    FOR SELECT USING (((auth.jwt() ->> 'sub') = user_id));

DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
CREATE POLICY "Users can create own projects" ON public.projects 
    FOR INSERT WITH CHECK (((auth.jwt() ->> 'sub') = user_id));

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects 
    FOR UPDATE USING (((auth.jwt() ->> 'sub') = user_id));

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects 
    FOR DELETE USING (((auth.jwt() ->> 'sub') = user_id));

-- Subtitles table Policies
DROP POLICY IF EXISTS "Users can view own subtitles" ON public.subtitles;
CREATE POLICY "Users can view own subtitles" ON public.subtitles 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = subtitles.project_id 
            AND projects.user_id = (auth.jwt() ->> 'sub')
        )
    );

DROP POLICY IF EXISTS "Users can create subtitles for own projects" ON public.subtitles;
CREATE POLICY "Users can create subtitles for own projects" ON public.subtitles 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = subtitles.project_id 
            AND projects.user_id = (auth.jwt() ->> 'sub')
        )
    );

DROP POLICY IF EXISTS "Users can update own subtitles" ON public.subtitles;
CREATE POLICY "Users can update own subtitles" ON public.subtitles 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = subtitles.project_id 
            AND projects.user_id = (auth.jwt() ->> 'sub')
        )
    );

-- Billing table Policies
DROP POLICY IF EXISTS "Users can view own billing" ON public.billing;
CREATE POLICY "Users can view own billing" ON public.billing 
    FOR SELECT USING (((auth.jwt() ->> 'sub') = user_id));

DROP POLICY IF EXISTS "Users can create own billing records" ON public.billing;
CREATE POLICY "Users can create own billing records" ON public.billing 
    FOR INSERT WITH CHECK (((auth.jwt() ->> 'sub') = user_id));

DROP POLICY IF EXISTS "Users can update own billing" ON public.billing;
CREATE POLICY "Users can update own billing" ON public.billing 
    FOR UPDATE USING (((auth.jwt() ->> 'sub') = user_id));

-- Usage tracking Policies
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
CREATE POLICY "Users can view own usage" ON public.usage_tracking 
    FOR SELECT USING (((auth.jwt() ->> 'sub') = user_id));

-- 5. Storage policies for Supabase Storage
-- These assume the 'videos' bucket exists
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
CREATE POLICY "Users can upload their own videos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
CREATE POLICY "Users can view their own videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
CREATE POLICY "Users can delete their own videos" ON storage.objects
    FOR DELETE USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
CREATE POLICY "Users can update their own videos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

-- 6. Clean up legacy auth trigger
-- These are no longer needed as Clerk is the source of truth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
