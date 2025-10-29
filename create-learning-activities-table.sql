-- Create comprehensive learning activities table
CREATE TABLE IF NOT EXISTS public.learning_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('question', 'lesson', 'flashcard', 'mock_exam', 'practice_session', 'video_lesson')),
    topic_id SMALLINT NOT NULL REFERENCES public.topics(topic_id) ON DELETE CASCADE,
    subject_id SMALLINT REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
    topic_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    
    -- Activity-specific data
    duration INTEGER DEFAULT 0, -- in seconds
    score INTEGER DEFAULT 0, -- percentage score
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    
    -- Session tracking
    session_id UUID,
    session_start TIMESTAMP WITH TIME ZONE,
    session_end TIMESTAMP WITH TIME ZONE,
    
    -- Metadata for different activity types
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_activities_user_id ON public.learning_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_topic_id ON public.learning_activities(topic_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_activity_type ON public.learning_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_learning_activities_created_at ON public.learning_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_learning_activities_session_id ON public.learning_activities(session_id);

-- Create RLS policies
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;

-- Users can only see their own activities
CREATE POLICY "Users can view own learning activities" ON public.learning_activities
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can insert own learning activities" ON public.learning_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own activities
CREATE POLICY "Users can update own learning activities" ON public.learning_activities
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete own learning activities" ON public.learning_activities
    FOR DELETE USING (auth.uid() = user_id);

-- Create study sessions table for better session tracking
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name TEXT DEFAULT 'Study Session',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0, -- in seconds
    topics_covered TEXT[] DEFAULT '{}',
    total_activities INTEGER DEFAULT 0,
    session_goals TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for study sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON public.study_sessions(start_time);

-- Create RLS policies for study sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions" ON public.study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create a view for analytics summary
CREATE OR REPLACE VIEW public.user_analytics_summary AS
SELECT 
    la.user_id,
    la.topic_id,
    la.topic_name,
    la.subject_id,
    la.subject_name,
    
    -- Activity counts
    COUNT(CASE WHEN la.activity_type = 'question' THEN 1 END) as questions_attempted,
    COUNT(CASE WHEN la.activity_type = 'question' AND la.correct_answers > 0 THEN 1 END) as questions_correct,
    COUNT(CASE WHEN la.activity_type = 'lesson' THEN 1 END) as lessons_completed,
    COUNT(CASE WHEN la.activity_type = 'video_lesson' THEN 1 END) as video_lessons_completed,
    COUNT(CASE WHEN la.activity_type = 'flashcard' THEN 1 END) as flashcards_reviewed,
    COUNT(CASE WHEN la.activity_type = 'mock_exam' THEN 1 END) as mock_exams_taken,
    
    -- Time tracking
    SUM(la.duration) as total_time_spent,
    AVG(la.duration) as average_activity_duration,
    
    -- Performance metrics
    AVG(la.accuracy) as average_accuracy,
    MAX(la.score) as best_score,
    
    -- Last activity
    MAX(la.created_at) as last_activity,
    
    -- Session data
    COUNT(DISTINCT la.session_id) as total_sessions
    
FROM public.learning_activities la
GROUP BY la.user_id, la.topic_id, la.topic_name, la.subject_id, la.subject_name;

-- Grant permissions
GRANT SELECT ON public.user_analytics_summary TO authenticated;
GRANT ALL ON public.learning_activities TO authenticated;
GRANT ALL ON public.study_sessions TO authenticated;
