-- Complete Analytics Tables Setup
-- This script ensures all analytics tables exist with correct structure

-- 1. Create daily_analytics table
CREATE TABLE IF NOT EXISTS public.daily_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Activity counts
    total_activities INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    
    -- Question tracking
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    
    -- Flashcard tracking
    flashcards_reviewed INTEGER DEFAULT 0,
    flashcards_correct INTEGER DEFAULT 0,
    
    -- Lesson tracking
    lessons_started INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    
    -- Video lesson tracking
    video_lessons_watched INTEGER DEFAULT 0,
    video_lessons_completed INTEGER DEFAULT 0,
    
    -- Mock exam tracking
    mock_exams_taken INTEGER DEFAULT 0,
    average_mock_exam_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Practice session tracking
    practice_sessions_completed INTEGER DEFAULT 0,
    average_practice_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Platform usage tracking
    ai_tutor_interactions INTEGER DEFAULT 0,
    dashboard_visits INTEGER DEFAULT 0,
    topic_selections INTEGER DEFAULT 0,
    settings_changes INTEGER DEFAULT 0,
    profile_updates INTEGER DEFAULT 0,
    
    -- Progress metrics
    total_topics_studied INTEGER DEFAULT 0,
    study_streak INTEGER DEFAULT 0,
    productivity_score INTEGER DEFAULT 0,
    
    -- Time analysis
    focus_time INTEGER DEFAULT 0, -- in seconds
    break_time INTEGER DEFAULT 0, -- in seconds
    session_count INTEGER DEFAULT 0,
    average_session_length INTEGER DEFAULT 0, -- in seconds
    peak_study_hour INTEGER DEFAULT 0, -- hour of day (0-23)
    
    -- Performance analysis
    weak_areas TEXT[] DEFAULT '{}',
    strong_areas TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(date, user_id)
);

-- 2. Create learning_activities table
CREATE TABLE IF NOT EXISTS public.learning_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    topic_id INTEGER,
    subject_id INTEGER,
    topic_name VARCHAR(255),
    subject_name VARCHAR(255),
    duration INTEGER DEFAULT 0, -- in seconds
    score DECIMAL(5,2) DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    session_id VARCHAR(255),
    session_start TIMESTAMP WITH TIME ZONE,
    session_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0, -- in seconds
    topics_covered TEXT[] DEFAULT '{}',
    total_activities INTEGER DEFAULT 0,
    session_goals TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create page_sessions table
CREATE TABLE IF NOT EXISTS public.page_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    page_name VARCHAR(255) NOT NULL,
    page_category VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0, -- in seconds
    activities JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on all tables
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for daily_analytics
DROP POLICY IF EXISTS "Users can view their own daily analytics" ON public.daily_analytics;
CREATE POLICY "Users can view their own daily analytics" ON public.daily_analytics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own daily analytics" ON public.daily_analytics;
CREATE POLICY "Users can insert their own daily analytics" ON public.daily_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own daily analytics" ON public.daily_analytics;
CREATE POLICY "Users can update their own daily analytics" ON public.daily_analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create RLS policies for learning_activities
DROP POLICY IF EXISTS "Users can view their own learning activities" ON public.learning_activities;
CREATE POLICY "Users can view their own learning activities" ON public.learning_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own learning activities" ON public.learning_activities;
CREATE POLICY "Users can insert their own learning activities" ON public.learning_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Create RLS policies for study_sessions
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can view their own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can insert their own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can update their own study sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 9. Create RLS policies for page_sessions
DROP POLICY IF EXISTS "Users can view their own page sessions" ON public.page_sessions;
CREATE POLICY "Users can view their own page sessions" ON public.page_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own page sessions" ON public.page_sessions;
CREATE POLICY "Users can insert their own page sessions" ON public.page_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_date ON public.daily_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date);

CREATE INDEX IF NOT EXISTS idx_learning_activities_user_id ON public.learning_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_created_at ON public.learning_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_learning_activities_activity_type ON public.learning_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON public.study_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_page_sessions_user_id ON public.page_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_page_sessions_start_time ON public.page_sessions(start_time);

-- 11. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_daily_analytics_updated_at ON public.daily_analytics;
CREATE TRIGGER update_daily_analytics_updated_at
    BEFORE UPDATE ON public.daily_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 13. Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Analytics tables setup completed successfully!';
    RAISE NOTICE '📊 Created tables: daily_analytics, learning_activities, study_sessions, page_sessions';
    RAISE NOTICE '🔒 RLS policies and indexes created';
END $$;
