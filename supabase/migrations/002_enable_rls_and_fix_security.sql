-- Enable RLS on client_error_logs table
ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert error logs (for client-side error reporting)
CREATE POLICY "Authenticated users can insert error logs" ON public.client_error_logs
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow service role to read all error logs (for admin/debugging)
CREATE POLICY "Service role can read all error logs" ON public.client_error_logs
    FOR SELECT 
    TO service_role
    USING (true);

-- Policy: Allow service role to insert error logs (for server-side error reporting)
CREATE POLICY "Service role can insert error logs" ON public.client_error_logs
    FOR INSERT 
    TO service_role
    WITH CHECK (true);

-- Add index on user_id if we add it later, or add index on path for filtering
CREATE INDEX IF NOT EXISTS idx_client_error_logs_path ON public.client_error_logs(path);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_name ON public.client_error_logs(name);

-- Performance: Add composite index for common queries (date + name filtering)
CREATE INDEX IF NOT EXISTS idx_client_error_logs_created_name ON public.client_error_logs(created_at DESC, name);

