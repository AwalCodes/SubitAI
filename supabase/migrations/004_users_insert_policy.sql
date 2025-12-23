-- Migration: Allow Clerk-authenticated users to insert their own profile row
-- Description: Adds an INSERT RLS policy for public.users based on Clerk JWT 'sub'

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users should be able to create their own profile row
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;

CREATE POLICY "Users can create own profile" ON public.users
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'sub') = id);
