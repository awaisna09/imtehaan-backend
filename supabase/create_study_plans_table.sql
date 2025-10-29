-- Create study_plans table for storing study planner data
CREATE TABLE IF NOT EXISTS public.study_plans (
  plan_id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan Information
  plan_name TEXT,
  subject TEXT DEFAULT 'businessStudies',
  
  -- Topics Information
  topics_to_cover TEXT[] DEFAULT '{}',
  total_topics INTEGER NOT NULL DEFAULT 0,
  topics_done INTEGER NOT NULL DEFAULT 0,
  topics_left INTEGER GENERATED ALWAYS AS (total_topics - topics_done) STORED,
  
  -- Date and Time Information
  study_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exam_date DATE NOT NULL,
  
  -- Calculated Daily Study Time (in minutes)
  study_time_minutes INTEGER NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);

-- Create index on exam_date for scheduling queries
CREATE INDEX IF NOT EXISTS idx_study_plans_exam_date ON public.study_plans(exam_date);

-- Create index on status for filtering active plans
CREATE INDEX IF NOT EXISTS idx_study_plans_status ON public.study_plans(status);

-- Add comments for documentation
COMMENT ON TABLE public.study_plans IS 'Stores user study plans with calculated daily study times';
COMMENT ON COLUMN public.study_plans.study_time_minutes IS 'Daily study time in minutes calculated using formula: ((topics_left * 4.5) / days_till_exam) * 1.1';
COMMENT ON COLUMN public.study_plans.topics_left IS 'Auto-calculated as total_topics - topics_done';
COMMENT ON COLUMN public.study_plans.topics_to_cover IS 'Array of topic names to be covered in this study plan';

-- Enable Row Level Security (RLS)
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own study plans
CREATE POLICY "Users can view their own study plans"
  ON public.study_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own study plans
CREATE POLICY "Users can insert their own study plans"
  ON public.study_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own study plans
CREATE POLICY "Users can update their own study plans"
  ON public.study_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own study plans
CREATE POLICY "Users can delete their own study plans"
  ON public.study_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_study_plans_updated_at
    BEFORE UPDATE ON public.study_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
