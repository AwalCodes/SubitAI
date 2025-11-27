# Supabase Database Setup

## Security Fixes Applied

### RLS (Row Level Security) Enabled
- ✅ `client_error_logs` table now has RLS enabled
- ✅ Policies added for authenticated users and service role

### Performance Indexes Added
- ✅ Additional indexes on frequently queried columns
- ✅ Composite indexes for common query patterns

## How to Apply Changes

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration file: `002_enable_rls_and_fix_security.sql`
4. Verify RLS is enabled by checking **Authentication > Policies**

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual SQL Execution

Copy and paste the contents of `002_enable_rls_and_fix_security.sql` into the Supabase SQL Editor and execute.

## Verification

After applying the migration, verify:

1. **RLS Status**: Go to **Table Editor** → `client_error_logs` → Check that RLS is enabled
2. **Policies**: Go to **Authentication > Policies** → Verify policies exist for `client_error_logs`
3. **Performance**: Check **Database > Indexes** to see new indexes

## What Was Fixed

### Security Issues
- ❌ **Before**: `client_error_logs` table was public without RLS
- ✅ **After**: RLS enabled with proper policies:
  - Authenticated users can insert error logs
  - Service role can read/insert all error logs

### Performance Improvements
- Added indexes on:
  - `client_error_logs.path` (for filtering by route)
  - `client_error_logs.name` (for filtering by error type)
  - `client_error_logs(created_at DESC, name)` (composite for common queries)
  - `projects.created_at` (for sorting projects)
  - `billing.status` (for filtering subscriptions)
  - `usage_tracking.project_id` (for project-specific queries)

## Notes

- The migration uses `IF NOT EXISTS` to prevent errors if indexes already exist
- Policies allow authenticated users to log errors (needed for client-side error reporting)
- Service role has full access for admin/debugging purposes

