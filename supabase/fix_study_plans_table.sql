-- Fix study_plans table structure
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'study_plans' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If the table doesn't exist or has wrong structure, drop and recreate it
DROP TABLE IF EXISTS public.study_plans CASCADE;

-- Create the table with the correct structure
CREATE TABLE public.study_plans (
  plan_id smallint NOT NULL,
  user_id smallint NOT NULL,
  study_date date NOT NULL,
  study_time_minutes integer NOT NULL,
  total_topics integer NOT NULL,
  topics_done integer NULL DEFAULT 0,
  topics_left integer GENERATED ALWAYS AS (total_topics - topics_done) STORED NULL,
  exam_date date NOT NULL,
  subject text NOT NULL DEFAULT 'businessStudies',
  topics_to_cover text[] DEFAULT '{}',
  plan_name text NOT NULL,
  status text CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  CONSTRAINT study_plans_pkey PRIMARY KEY (plan_id),
  CONSTRAINT study_plans_plan_id_check CHECK (
    (plan_id >= 1) AND (plan_id <= 9999)
  )
);

-- Create sequence for auto-incrementing plan_id
CREATE SEQUENCE IF NOT EXISTS study_plans_plan_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9999
    CACHE 1;

-- Set the sequence as the default for plan_id
ALTER TABLE public.study_plans ALTER COLUMN plan_id SET DEFAULT nextval('study_plans_plan_id_seq');

-- Grant necessary permissions
GRANT ALL ON public.study_plans TO authenticated;
GRANT ALL ON public.study_plans_plan_id_seq TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_subject ON public.study_plans(subject);
CREATE INDEX IF NOT EXISTS idx_study_plans_status ON public.study_plans(status);

-- Insert a test record to verify the table works
INSERT INTO public.study_plans (
  plan_id,
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
  1,
  1,
  CURRENT_DATE,
  60,
  3,
  0,
  CURRENT_DATE + INTERVAL '30 days',
  'businessStudies',
  ARRAY['Business Activity', 'Marketing', 'Finance'],
  'Test Study Plan'
) ON CONFLICT (plan_id) DO NOTHING;

-- Verify the table was created correctly
SELECT 'Study plans table fixed successfully' as status;
SELECT COUNT(*) as record_count FROM public.study_plans;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'study_plans' ORDER BY ordinal_position;



























