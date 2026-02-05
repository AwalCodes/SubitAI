-- SUBIT.AI Database Schema
-- PostgreSQL schema for Supabase (Clerk Compatible)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'team');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('uploading', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (Synced from Clerk)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    video_filename TEXT,
    video_size BIGINT,
    video_duration INTEGER, -- in seconds
    status project_status DEFAULT 'uploading',
    export_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON COLUMN public.projects.export_url IS 'URL to the exported video with burned-in subtitles';

-- Subtitles table
CREATE TABLE IF NOT EXISTS public.subtitles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    srt_data TEXT,
    json_data JSONB,
    srt_url TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing table
CREATE TABLE IF NOT EXISTS public.billing (
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
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    energy_cost INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
 
-- Client error logs table
CREATE TABLE IF NOT EXISTS public.client_error_logs (
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

-- RLS Enablement
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING ((auth.jwt() ->> 'sub') = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING ((auth.jwt() ->> 'sub') = id);

DROP POLICY IF EXISTS "Users can register own profile" ON public.users;
CREATE POLICY "Users can register own profile" ON public.users FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub') = id);

-- 2. Projects policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING ((auth.jwt() ->> 'sub') = user_id);

-- 3. Subtitles policies
DROP POLICY IF EXISTS "Users can view own subtitles" ON public.subtitles;
CREATE POLICY "Users can view own subtitles" ON public.subtitles FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = subtitles.project_id AND projects.user_id = (auth.jwt() ->> 'sub')));

DROP POLICY IF EXISTS "Users can create subtitles for own projects" ON public.subtitles;
CREATE POLICY "Users can create subtitles for own projects" ON public.subtitles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = subtitles.project_id AND projects.user_id = (auth.jwt() ->> 'sub')));

DROP POLICY IF EXISTS "Users can update own subtitles" ON public.subtitles;
CREATE POLICY "Users can update own subtitles" ON public.subtitles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = subtitles.project_id AND projects.user_id = (auth.jwt() ->> 'sub')));

-- 4. Billing policies
DROP POLICY IF EXISTS "Users can view own billing" ON public.billing;
CREATE POLICY "Users can view own billing" ON public.billing FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can create own billing records" ON public.billing;
CREATE POLICY "Users can create own billing records" ON public.billing FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can update own billing" ON public.billing;
CREATE POLICY "Users can update own billing" ON public.billing FOR UPDATE USING ((auth.jwt() ->> 'sub') = user_id);

-- 5. Usage tracking policies
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
CREATE POLICY "Users can view own usage" ON public.usage_tracking FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "System can create usage records" ON public.usage_tracking;
CREATE POLICY "System can create usage records" ON public.usage_tracking FOR INSERT WITH CHECK (true);

-- 6. Client error logs policies
DROP POLICY IF EXISTS "Authenticated users can insert error logs" ON public.client_error_logs;
CREATE POLICY "Authenticated users can insert error logs" ON public.client_error_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read all error logs" ON public.client_error_logs;
CREATE POLICY "Service role can read all error logs" ON public.client_error_logs FOR SELECT TO service_role USING (true);

DROP POLICY IF EXISTS "Service role can insert error logs" ON public.client_error_logs;
CREATE POLICY "Service role can insert error logs" ON public.client_error_logs FOR INSERT TO service_role WITH CHECK (true);

-- Storage configuration
-- Note: RLS on storage.objects is usually enabled by default in Supabase.
-- If you need to enable it manually, please do so via the Supabase Dashboard UI.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
        DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
        CREATE POLICY "Users can upload their own videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

        DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
        CREATE POLICY "Users can view their own videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

        DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
        CREATE POLICY "Users can delete their own videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);

        DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
        CREATE POLICY "Users can update their own videos" ON storage.objects FOR UPDATE USING (bucket_id = 'videos' AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('subtitles', 'subtitles', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false) ON CONFLICT (id) DO NOTHING;

-- Functions & Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subtitles_updated_at ON public.subtitles;
CREATE TRIGGER update_subtitles_updated_at BEFORE UPDATE ON public.subtitles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_updated_at ON public.billing;
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON public.billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subtitles_project_id ON public.subtitles(project_id);
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON public.billing(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_created_at ON public.client_error_logs(created_at DESC);
