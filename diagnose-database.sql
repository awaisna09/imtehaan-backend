-- Database Diagnostic Script
-- This will show us exactly what's in your database right now

-- Check 1: What tables exist in public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check 2: What functions exist in public schema
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- Check 3: What triggers exist on auth.users table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Check 4: Check the structure of public.users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check 5: Check RLS policies on public.users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- Check 6: Count of users in both tables
SELECT 
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM auth.users
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as user_count
FROM public.users;

-- Check 7: Test if we can insert into public.users manually
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    insert_result TEXT;
BEGIN
    BEGIN
        INSERT INTO public.users (
            id, email, full_name, user_type, curriculum, grade, subjects, is_active, is_verified
        ) VALUES (
            test_id, 'test@example.com', 'Test User', 'student', 'igcse', 'Year 10', 
            ARRAY['Mathematics'], true, false
        );
        insert_result := 'SUCCESS';
        DELETE FROM public.users WHERE id = test_id;
    EXCEPTION
        WHEN OTHERS THEN
            insert_result := 'FAILED: ' || SQLERRM;
    END;
    
    RAISE NOTICE 'Manual insert test result: %', insert_result;
END $$;
