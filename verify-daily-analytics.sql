-- Verify Daily Analytics Table Structure and Data
-- Run this script to check if the daily_analytics table is properly set up

-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_analytics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if there are any records
SELECT COUNT(*) as total_records 
FROM public.daily_analytics;

-- 3. Check for any records with null user_id (should be 0)
SELECT COUNT(*) as null_user_records 
FROM public.daily_analytics 
WHERE user_id IS NULL;

-- 4. Check today's records
SELECT 
    user_id,
    date,
    session_count,
    total_time_spent,
    average_session_length,
    total_activities,
    dashboard_visits,
    ai_tutor_interactions,
    lessons_completed,
    questions_attempted,
    questions_correct
FROM public.daily_analytics 
WHERE date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check for any records with session_count > 0
SELECT 
    COUNT(*) as records_with_sessions,
    AVG(session_count) as avg_session_count,
    MAX(session_count) as max_session_count
FROM public.daily_analytics 
WHERE session_count > 0;

-- 6. Check for any records with total_time_spent > 0
SELECT 
    COUNT(*) as records_with_time,
    AVG(total_time_spent) as avg_time_spent,
    MAX(total_time_spent) as max_time_spent
FROM public.daily_analytics 
WHERE total_time_spent > 0;

-- 7. Verify session count calculation consistency
SELECT 
    user_id,
    date,
    session_count,
    total_time_spent,
    average_session_length,
    CASE 
        WHEN session_count > 0 AND total_time_spent > 0 
        THEN ROUND(total_time_spent::numeric / session_count::numeric, 0)
        ELSE 0 
    END as calculated_avg_session
FROM public.daily_analytics 
WHERE session_count > 0 
AND total_time_spent > 0
LIMIT 5;

-- 8. Check RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'daily_analytics'
AND schemaname = 'public';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Daily analytics table verification completed!';
    RAISE NOTICE '📊 Check the results above to identify any issues.';
    RAISE NOTICE '🔧 If session_count is always 0, the auto-activity-tracker needs to be triggered.';
    RAISE NOTICE '🎯 Try navigating pages and using the platform to generate activities.';
END $$;
