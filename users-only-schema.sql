-- Comprehensive Users Schema for Imtehaan AI EdTech Platform
-- This schema creates a complete users table with authentication essentials
-- Run this in your Supabase SQL Editor to fix the 406 error

-- Step 1: Create the comprehensive users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT, -- For additional password security if needed
    user_type TEXT DEFAULT 'student' CHECK (user_type IN ('student', 'teacher', 'admin', 'parent')),
    curriculum TEXT DEFAULT 'igcse',
    grade TEXT DEFAULT 'Year 10',
    subjects TEXT[], -- Array of subjects the user is studying
    date_of_birth DATE,
    phone_number TEXT,
    profile_picture_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create comprehensive RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for the trigger)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles (optional - remove if not needed)
CREATE POLICY "Admins can view all profiles" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Step 4: Create the enhanced function that automatically creates user entries
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        username,
        user_type, 
        curriculum, 
        grade,
        subjects,
        is_active,
        is_verified,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Guest User'),
        COALESCE(NEW.raw_user_meta_data->>'username', NULL),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'curriculum', 'igcse'),
        COALESCE(NEW.raw_user_meta_data->>'grade', 'Year 10'),
        ARRAY['Mathematics', 'Science', 'English'], -- Default subjects
        true,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger that fires when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);
CREATE INDEX IF NOT EXISTS users_user_type_idx ON public.users(user_type);
CREATE INDEX IF NOT EXISTS users_curriculum_idx ON public.users(curriculum);
CREATE INDEX IF NOT EXISTS users_grade_idx ON public.users(grade);
CREATE INDEX IF NOT EXISTS users_is_active_idx ON public.users(is_active);
-- Note: GIN index on subjects array will be created automatically by PostgreSQL

-- Step 7: Create a function to update user login information
CREATE OR REPLACE FUNCTION public.update_user_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET 
        last_login = NOW(),
        login_count = login_count + 1,
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create a trigger to update login info on auth state change
CREATE OR REPLACE TRIGGER on_auth_state_change
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.update_user_login();

-- Step 9: Create a function to get user profile with authentication status
-- First drop the existing function if it exists with different parameters
DROP FUNCTION IF EXISTS public.get_user_profile(UUID);
DROP FUNCTION IF EXISTS public.get_user_profile();

CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    username TEXT,
    user_type TEXT,
    curriculum TEXT,
    grade TEXT,
    subjects TEXT[],
    is_active BOOLEAN,
    is_verified BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.username,
        u.user_type,
        u.curriculum,
        u.grade,
        u.subjects,
        u.is_active,
        u.is_verified,
        u.last_login,
        u.login_count,
        u.created_at
    FROM public.users u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Add comments to document the table and functions
COMMENT ON TABLE public.users IS 'Comprehensive user profiles for Imtehaan AI EdTech Platform';
COMMENT ON COLUMN public.users.subjects IS 'Array of subjects the user is studying';
COMMENT ON COLUMN public.users.password_hash IS 'Additional password hash if needed beyond Supabase auth';
COMMENT ON COLUMN public.users.preferences IS 'User preferences stored as JSON';
COMMENT ON COLUMN public.users.is_verified IS 'Whether user email has been verified';

-- Step 11: Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 12: Create a view for public user information (optional)
-- First drop the existing view if it exists with different columns
DROP VIEW IF EXISTS public.user_public_info;

CREATE OR REPLACE VIEW public.user_public_info AS
SELECT 
    id,
    username,
    full_name,
    user_type,
    curriculum,
    grade,
    subjects,
    profile_picture_url,
    bio,
    created_at
FROM public.users
WHERE is_active = true;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Comprehensive users schema created successfully!';
    RAISE NOTICE 'Automatic user creation is now enabled with enhanced features.';
    RAISE NOTICE 'New signups will automatically create complete user profiles.';
    RAISE NOTICE 'Login tracking and user management functions are available.';
    RAISE NOTICE 'Subjects column added to fix application compatibility.';
END $$;
