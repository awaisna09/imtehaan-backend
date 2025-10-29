-- Fix user_id column type in study_plans table to use UUID instead of smallint
-- This is needed because the authentication system uses UUID strings, not smallint IDs

-- First, check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_plans' AND table_schema = 'public';

-- Drop existing RLS policies first
DROP POLICY IF EXISTS "study_plans_select_policy" ON public.study_plans;
DROP POLICY IF EXISTS "study_plans_insert_policy" ON public.study_plans;
DROP POLICY IF EXISTS "study_plans_update_policy" ON public.study_plans;
DROP POLICY IF EXISTS "study_plans_delete_policy" ON public.study_plans;

-- Temporarily disable RLS
ALTER TABLE public.study_plans DISABLE ROW LEVEL SECURITY;

-- Change user_id column type from smallint to UUID
ALTER TABLE public.study_plans ALTER COLUMN user_id TYPE UUID USING user_id::text::UUID;

-- Re-enable RLS
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies with correct user_id type
CREATE POLICY "study_plans_select_policy" ON public.study_plans
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "study_plans_insert_policy" ON public.study_plans
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "study_plans_update_policy" ON public.study_plans
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "study_plans_delete_policy" ON public.study_plans
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_plans' AND table_schema = 'public';

-- Insert a test study plan with a UUID user_id (replace with actual user ID from your auth.users table)
-- First, let's get a real user ID from the auth.users table
SELECT id, email FROM auth.users LIMIT 1;

-- Then insert a test study plan (uncomment and modify the user_id after running the above query)
/*
INSERT INTO public.study_plans (
  user_id,
  study_date,
  study_time_minutes,
  total_topics,
  topics_done,
  exam_date,
  subject,
  topics_to_cover,
  plan_name
) VALUES (
  'REPLACE_WITH_ACTUAL_USER_ID', -- Replace with actual UUID from auth.users
  CURRENT_DATE,
  60,
  3,
  0,
  CURRENT_DATE + INTERVAL '30 days',
  'businessStudies',
  ARRAY['Business Activity', 'Marketing', 'Finance'],
  'Test Study Plan'
) ON CONFLICT (plan_id) DO NOTHING;
*/

-- Verify the table structure and data
SELECT COUNT(*) as record_count FROM public.study_plans;

























