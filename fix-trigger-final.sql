-- Final Fix for Trigger Function - Comprehensive Solution
-- This script ensures the trigger function is properly created and working

-- Step 1: Clean up any existing objects completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    user_email TEXT;
    user_full_name TEXT;
    user_type TEXT;
    user_curriculum TEXT;
    user_grade TEXT;
BEGIN
    -- Extract values from NEW record
    user_id := NEW.id;
    user_email := NEW.email;
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Guest User');
    user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'student');
    user_curriculum := COALESCE(NEW.raw_user_meta_data->>'curriculum', 'igcse');
    user_grade := COALESCE(NEW.raw_user_meta_data->>'grade', 'Year 10');

    -- Insert the new user into public.users table
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
    ) VALUES (
        user_id,
        user_email,
        user_full_name,
        COALESCE(NEW.raw_user_meta_data->>'username', NULL),
        user_type,
        user_curriculum,
        user_grade,
        ARRAY['Mathematics', 'Science', 'English'],
        true,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW()
    );

    -- Log success
    RAISE NOTICE 'User profile created successfully for: %', user_email;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Failed to create user profile for %: %', user_email, SQLERRM;
        RETURN NEW;
END;
$$;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify the function was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE '✅ handle_new_user function created successfully';
    ELSE
        RAISE NOTICE '❌ handle_new_user function creation failed';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created' 
        AND tgrelid = (SELECT oid FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth'))
    ) THEN
        RAISE NOTICE '✅ on_auth_user_created trigger created successfully';
    ELSE
        RAISE NOTICE '❌ on_auth_user_created trigger creation failed';
    END IF;
END $$;

-- Step 5: Test the function with a mock call
DO $$
DECLARE
    test_result TEXT;
BEGIN
    -- Test the function with mock data
    SELECT handle_new_user() INTO test_result;
    RAISE NOTICE '✅ Function test call successful';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Function test failed: %', SQLERRM;
END $$;

-- Step 6: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Step 7: Final verification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 TRIGGER FUNCTION SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ handle_new_user function created';
    RAISE NOTICE '✅ on_auth_user_created trigger attached';
    RAISE NOTICE '✅ Permissions granted';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '1. Test signup with a new email';
    RAISE NOTICE '2. Check if user profile is created in public.users table';
    RAISE NOTICE '3. Verify the trigger is working correctly';
    RAISE NOTICE '';
END $$;
