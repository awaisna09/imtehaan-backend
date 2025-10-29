-- Safe script to fix daily analytics table
-- This script handles the null user_id issue properly

-- First, let's check if the table exists and what's in it
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'daily_analytics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing records with null user_id
SELECT COUNT(*) as null_user_records 
FROM public.daily_analytics 
WHERE user_id IS NULL;

-- If there are null records, delete them
DELETE FROM public.daily_analytics 
WHERE user_id IS NULL;

-- Now run the main fix script
-- (The fix-daily-analytics.sql script should be run separately)

-- Verify the table structure is correct
SELECT 
    'Table exists: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'daily_analytics' 
        AND table_schema = 'public'
    ) THEN 'YES' ELSE 'NO' END as status;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'daily_analytics';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Daily analytics table verification completed!';
    RAISE NOTICE '📊 Run the fix-daily-analytics.sql script to complete the setup.';
END $$;


















