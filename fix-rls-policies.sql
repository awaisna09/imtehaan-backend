-- Fix RLS Policies for Users Table
-- This script resolves the "infinite recursion detected in policy" error

-- Step 1: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

-- Step 2: Create simplified, non-recursive policies
-- Users can view their own profile (simple auth.uid() check)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (simple auth.uid() check)
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (simple auth.uid() check)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 3: Create a simple admin policy without circular references
-- This policy allows users with admin role to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'service_role' 
        OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'user_type' = 'admin'
        )
    );

-- Step 4: Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed successfully!';
    RAISE NOTICE 'Infinite recursion issue resolved.';
    RAISE NOTICE 'Users can now access their own profiles without errors.';
END $$;
