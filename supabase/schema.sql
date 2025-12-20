-- SUBIT.AI Database Schema
-- PostgreSQL schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'team');
CREATE TYPE project_status AS ENUM ('uploading', 'processing', 'completed', 'failed');
CREATE TYPE billing_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');

-- Users table (Manually synced from Clerk or created on first upload)
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    video_filename TEXT,
    video_size BIGINT,
    video_duration INTEGER, -- in seconds
    status project_status DEFAULT 'uploading',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtitles table
CREATE TABLE public.subtitles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    srt_data TEXT, -- Raw SRT content
    json_data JSONB, -- Structured subtitle data
    srt_url TEXT, -- URL to downloadable SRT file
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing table
CREATE TABLE public.billing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT,
    plan subscription_tier NOT NULL,
    status billing_status DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE public.usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'upload', 'transcribe', 'export'
    energy_cost INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
 
-- Client error logs table
CREATE TABLE public.client_error_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT,
    message TEXT,
    stack TEXT,
    context JSONB,
    url TEXT,
    user_agent TEXT,
    path TEXT,
    source TEXT
);

-- Storage policies for Supabase Storage
-- Note: These policies require the storage.objects table to exist and RLS to be enabled
-- If storage.objects doesn't exist, these will fail - that's expected for Supabase Storage

-- Enable RLS on storage.objects if not already enabled
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload their own videos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" ON storage.objects
    FOR DELETE USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING ((auth.jwt() ->> 'sub') = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING ((auth.jwt() ->> 'sub') = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
    FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING ((auth.jwt() ->> 'sub') = user_id);

-- Subtitles policies
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

-- Billing policies
CREATE POLICY "Users can view own billing" ON public.billing
    FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can create own billing records" ON public.billing
    FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own billing" ON public.billing
    FOR UPDATE USING ((auth.jwt() ->> 'sub') = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "System can create usage records" ON public.usage_tracking
    FOR INSERT WITH CHECK (true);

-- Client error logs policies
CREATE POLICY "Authenticated users can insert error logs" ON public.client_error_logs
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service role can read all error logs" ON public.client_error_logs
    FOR SELECT 
    TO service_role
    USING (true);

CREATE POLICY "Service role can insert error logs" ON public.client_error_logs
    FOR INSERT 
    TO service_role
    WITH CHECK (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtitles_updated_at BEFORE UPDATE ON public.subtitles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON public.billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets (only if they don't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('subtitles', 'subtitles', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subtitles_project_id ON public.subtitles(project_id);
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON public.billing(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON public.billing(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON public.usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_project_id ON public.usage_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_created_at ON public.client_error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_path ON public.client_error_logs(path);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_name ON public.client_error_logs(name);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_created_name ON public.client_error_logs(created_at DESC, name);
