-- Create study_plans table with the specified structure
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
) TABLESPACE pg_default;

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

-- Insert sample Business Studies topics for reference
-- These topics are based on your existing database structure
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
) VALUES 
(
  1,
  1,
  CURRENT_DATE,
  60,
  8,
  0,
  CURRENT_DATE + INTERVAL '30 days',
  'businessStudies',
  ARRAY['Business Activity', 'Marketing', 'Finance', 'Human Resources', 'Operations Management', 'Business Strategy', 'International Business', 'Entrepreneurship'],
  'IGCSE Business Studies Complete Prep'
),
(
  2,
  1,
  CURRENT_DATE,
  45,
  4,
  0,
  CURRENT_DATE + INTERVAL '14 days',
  'businessStudies',
  ARRAY['Marketing', 'Finance', 'Human Resources', 'Operations Management'],
  'Business Studies Core Topics Review'
);

-- Create index for better performance
CREATE INDEX idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX idx_study_plans_subject ON public.study_plans(subject);
CREATE INDEX idx_study_plans_status ON public.study_plans(status);

-- Add comments for documentation
COMMENT ON TABLE public.study_plans IS 'Stores user study plans with topics and progress tracking';
COMMENT ON COLUMN public.study_plans.plan_id IS 'Unique identifier for each study plan (1-9999)';
COMMENT ON COLUMN public.study_plans.user_id IS 'Reference to the user who created the plan';
COMMENT ON COLUMN public.study_plans.study_date IS 'Date when the study plan was created/started';
COMMENT ON COLUMN public.study_plans.study_time_minutes IS 'Daily study time allocation in minutes';
COMMENT ON COLUMN public.study_plans.total_topics IS 'Total number of topics to cover in the plan';
COMMENT ON COLUMN public.study_plans.topics_done IS 'Number of topics completed (defaults to 0)';
COMMENT ON COLUMN public.study_plans.topics_left IS 'Automatically calculated remaining topics';
COMMENT ON COLUMN public.study_plans.exam_date IS 'Target exam date for the study plan';
COMMENT ON COLUMN public.study_plans.subject IS 'Subject of study (defaults to businessStudies)';
COMMENT ON COLUMN public.study_plans.topics_to_cover IS 'Array of specific topics to study';
COMMENT ON COLUMN public.study_plans.plan_name IS 'Descriptive name for the study plan';
COMMENT ON COLUMN public.study_plans.status IS 'Current status of the study plan';



























