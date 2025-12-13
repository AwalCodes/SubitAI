-- Migration: Add export_url column to projects table
-- Date: 2025-01-22
-- Description: Add export_url field to store exported video URLs

-- Add export_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'export_url'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN export_url TEXT;
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.projects.export_url IS 'URL to the exported video with burned-in subtitles';
