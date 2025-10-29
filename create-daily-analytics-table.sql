-- Create daily analytics table for comprehensive daily progress tracking
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
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique daily entry per user
    UNIQUE(date, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_id ON public.daily_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_date ON public.daily_analytics(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own daily analytics
CREATE POLICY "Users can view own daily analytics" ON public.daily_analytics
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own daily analytics
CREATE POLICY "Users can insert own daily analytics" ON public.daily_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own daily analytics
CREATE POLICY "Users can update own daily analytics" ON public.daily_analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own daily analytics
CREATE POLICY "Users can delete own daily analytics" ON public.daily_analytics
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.daily_analytics TO authenticated;

-- Create function to automatically create daily analytics entry
CREATE OR REPLACE FUNCTION create_daily_analytics_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert daily analytics entry if it doesn't exist for today
    INSERT INTO public.daily_analytics (date, user_id)
    VALUES (CURRENT_DATE, NEW.user_id)
    ON CONFLICT (date, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create daily analytics entry when user logs in
CREATE OR REPLACE TRIGGER trigger_create_daily_analytics
    AFTER INSERT ON public.learning_activities
    FOR EACH ROW
    EXECUTE FUNCTION create_daily_analytics_entry();

-- Create function to reset daily analytics at midnight
CREATE OR REPLACE FUNCTION reset_daily_analytics()
RETURNS void AS $$
BEGIN
    -- Archive yesterday's analytics (optional - you can create an archive table)
    -- For now, we'll just update the date to today for existing entries
    
    -- This function can be called by a cron job or scheduled task
    -- to reset daily analytics at midnight
    
    -- Example: Move yesterday's data to archive table
    -- INSERT INTO daily_analytics_archive SELECT * FROM daily_analytics WHERE date = CURRENT_DATE - INTERVAL '1 day';
    
    -- For now, we'll just log that reset was called
    RAISE NOTICE 'Daily analytics reset called at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for daily progress summary
CREATE OR REPLACE VIEW public.daily_progress_summary AS
SELECT 
    da.date,
    da.user_id,
    u.email,
    u.full_name,
    
    -- Daily totals
    da.total_activities,
    da.total_time_spent,
    
    -- Progress metrics
    CASE 
        WHEN da.questions_attempted > 0 
        THEN ROUND((da.questions_correct::DECIMAL / da.questions_attempted) * 100, 2)
        ELSE 0 
    END as daily_accuracy,
    
    da.study_streak,
    da.productivity_score,
    
    -- Time analysis
    ROUND(da.total_time_spent / 60.0, 2) as study_time_minutes,
    da.session_count,
    ROUND(da.average_session_length / 60.0, 2) as avg_session_minutes,
    
    -- Activity breakdown
    da.questions_attempted,
    da.lessons_completed,
    da.video_lessons_completed,
    da.flashcards_reviewed,
    da.mock_exams_taken,
    
    -- Platform usage
    da.dashboard_visits,
    da.ai_tutor_interactions,
    da.topic_selections
    
FROM public.daily_analytics da
JOIN public.users u ON da.user_id = u.id
ORDER BY da.date DESC, da.total_activities DESC;

-- Grant permissions on the view
GRANT SELECT ON public.daily_progress_summary TO authenticated;

-- Create function to get user's daily progress
CREATE OR REPLACE FUNCTION get_user_daily_progress(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    date DATE,
    total_activities INTEGER,
    total_time_spent INTEGER,
    questions_attempted INTEGER,
    questions_correct INTEGER,
    daily_accuracy DECIMAL(5,2),
    study_streak INTEGER,
    productivity_score INTEGER,
    study_time_minutes DECIMAL(8,2),
    session_count INTEGER,
    avg_session_minutes DECIMAL(8,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.date,
        da.total_activities,
        da.total_time_spent,
        da.questions_attempted,
        da.questions_correct,
        CASE 
            WHEN da.questions_attempted > 0 
            THEN ROUND((da.questions_correct::DECIMAL / da.questions_attempted) * 100, 2)
            ELSE 0 
        END as daily_accuracy,
        da.study_streak,
        da.productivity_score,
        ROUND(da.total_time_spent / 60.0, 2) as study_time_minutes,
        da.session_count,
        ROUND(da.average_session_length / 60.0, 2) as avg_session_minutes
    FROM public.daily_analytics da
    WHERE da.user_id = user_uuid 
    AND da.date = target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_daily_progress(UUID, DATE) TO authenticated;


















