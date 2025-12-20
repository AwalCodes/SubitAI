-- SUBIT.AI Clerk Migration (Fixed)
-- This script migrates the Supabase schema to work with Clerk authentication.
-- It follows a strict order: drop dependencies -> alter types -> recreate dependencies.

-- 1. Drop ALL dependent RLS policies first
-- Users Table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Projects Table
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- Subtitles Table
DROP POLICY IF EXISTS "Users can view own subtitles" ON public.subtitles;
DROP POLICY IF EXISTS "Users can create subtitles for own projects" ON public.subtitles;
DROP POLICY IF EXISTS "Users can update own subtitles" ON public.subtitles;

-- Billing Table
DROP POLICY IF EXISTS "Users can view own billing" ON public.billing;
DROP POLICY IF EXISTS "Users can create own billing records" ON public.billing;
DROP POLICY IF EXISTS "Users can update own billing" ON public.billing;

-- Usage Tracking Table
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "System can create usage records" ON public.usage_tracking;

-- Storage Policies (Need to drop these if they reference auth.uid())
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;

-- 2. Drop existing foreign key constraints
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE public.billing DROP CONSTRAINT IF EXISTS billing_user_id_fkey;
ALTER TABLE public.usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_user_id_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Change column types to TEXT for User IDs
ALTER TABLE public.users ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.projects ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.billing ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.usage_tracking ALTER COLUMN user_id TYPE TEXT;

-- 4. Re-enable foreign key constraints
ALTER TABLE public.projects ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.billing ADD CONSTRAINT billing_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.usage_tracking ADD CONSTRAINT usage_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 5. Create NEW RLS Policies using Clerk JWT ('sub' claim)
-- Users Table
CREATE POLICY "Users can view own profile" ON public.users 
    FOR SELECT USING (((auth.jwt() ->> 'sub') = id));

CREATE POLICY "Users can update own profile" ON public.users 
    FOR UPDATE USING (((auth.jwt() ->> 'sub') = id));

-- Projects Table
CREATE POLICY "Users can view own projects" ON public.projects 
    FOR SELECT USING (((auth.jwt() ->> 'sub') = user_id));

CREATE POLICY "Users can create own projects" ON public.projects 
    FOR INSERT WITH CHECK (((auth.jwt() ->> 'sub') = user_id));

CREATE POLICY "Users can update own projects" ON public.projects 
    FOR UPDATE USING (((auth.jwt() ->> 'sub') = user_id));

CREATE POLICY "Users can delete own projects" ON public.projects 
    FOR DELETE USING (((auth.jwt() ->> 'sub') = user_id));

-- Subtitles Table
CREATE POLICY "Users can view own subtitles" ON public.subtitles 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = subtitles.project_id 
            AND projects.user_id = (auth.jwt() ->> 'sub')
        )
    );

CREATE POLICY "Users can create subtitles for own projects" ON public.subtitles 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = subtitles.project_id 
            AND projects.user_id = (auth.jwt() ->> 'sub')
        )
    );

CREATE POLICY "Users can update own subtitles" ON public.subtitles 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = subtitles.project_id 
            AND projects.user_id = (auth.jwt() ->> 'sub')
        )
    );

-- Billing Table
CREATE POLICY "Users can view own billing" ON public.billing 
    FOR SELECT USING (((auth.jwt() ->> 'sub') = user_id));

CREATE POLICY "Users can create own billing records" ON public.billing 
    FOR INSERT WITH CHECK (((auth.jwt() ->> 'sub') = user_id));

CREATE POLICY "Users can update own billing" ON public.billing 
    FOR UPDATE USING (((auth.jwt() ->> 'sub') = user_id));

-- Usage Tracking Table
CREATE POLICY "Users can view own usage" ON public.usage_tracking 
    FOR SELECT USING (((auth.jwt() ->> 'sub') = user_id));

CREATE POLICY "System can create usage records" ON public.usage_tracking
    FOR INSERT WITH CHECK (true);

-- 6. Re-create Storage policies with Clerk support
CREATE POLICY "Users can upload their own videos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" ON storage.objects
    FOR DELETE USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

-- 7. Clean up legacy auth triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
