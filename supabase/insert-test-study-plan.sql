-- Insert a test study plan for the current authenticated user
-- This script should be run after the user has signed in and we know their UUID

-- First, let's check if the study_plans table exists and its structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_plans' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing study plans
SELECT COUNT(*) as existing_plans FROM public.study_plans;

-- Check the current user's ID (this will be empty if not authenticated)
SELECT auth.uid() as current_user_id;

-- Insert a test study plan for the current user (only if authenticated)
-- Note: Replace 'CURRENT_USER_UUID' with the actual UUID from auth.uid() above
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
  auth.uid(), -- This will use the current authenticated user's ID
  CURRENT_DATE,
  60,
  5,
  0,
  CURRENT_DATE + INTERVAL '30 days',
  'businessStudies',
  ARRAY['Business Activity', 'Marketing', 'Finance', 'Operations', 'Human Resources'],
  'My First Study Plan'
) ON CONFLICT (plan_id) DO NOTHING;

-- Verify the insertion
SELECT 
  plan_id,
  user_id,
  plan_name,
  study_date,
  total_topics,
  topics_done,
  status
FROM public.study_plans 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

























