-- Create page_sessions table for comprehensive page activity tracking
CREATE TABLE IF NOT EXISTS public.page_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    page_name TEXT NOT NULL,
    page_category TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    activities JSONB DEFAULT '[]', -- Array of activities performed during session
    metadata JSONB DEFAULT '{}', -- Additional session metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_sessions_user_id ON public.page_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_page_sessions_date ON public.page_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_page_sessions_category ON public.page_sessions(page_category);
CREATE INDEX IF NOT EXISTS idx_page_sessions_user_date ON public.page_sessions(user_id, start_time);

-- Enable Row Level Security (RLS)
ALTER TABLE public.page_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own page sessions
CREATE POLICY "Users can view own page sessions" ON public.page_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own page sessions" ON public.page_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own page sessions" ON public.page_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_page_sessions_updated_at
    BEFORE UPDATE ON public.page_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_page_sessions_updated_at();

-- Function to get user's page session summary
CREATE OR REPLACE FUNCTION get_user_page_session_summary(
    p_user_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    page_category TEXT,
    total_sessions BIGINT,
    total_time_spent BIGINT,
    average_session_length NUMERIC,
    most_visited_page TEXT,
    total_activities BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.page_category,
        COUNT(*) as total_sessions,
        COALESCE(SUM(ps.duration), 0) as total_time_spent,
        ROUND(AVG(ps.duration), 2) as average_session_length,
        MODE() WITHIN GROUP (ORDER BY ps.page_name) as most_visited_page,
        COALESCE(SUM(jsonb_array_length(ps.activities)), 0) as total_activities
    FROM public.page_sessions ps
    WHERE ps.user_id = p_user_id
        AND ps.start_time::date BETWEEN p_start_date AND p_end_date
        AND ps.duration IS NOT NULL
    GROUP BY ps.page_category
    ORDER BY total_time_spent DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's daily page activity summary
CREATE OR REPLACE FUNCTION get_user_daily_page_activity(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    page_name TEXT,
    page_category TEXT,
    session_count BIGINT,
    total_time_spent BIGINT,
    total_activities BIGINT,
    first_visit TIMESTAMP WITH TIME ZONE,
    last_visit TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.page_name,
        ps.page_category,
        COUNT(*) as session_count,
        COALESCE(SUM(ps.duration), 0) as total_time_spent,
        COALESCE(SUM(jsonb_array_length(ps.activities)), 0) as total_activities,
        MIN(ps.start_time) as first_visit,
        MAX(ps.end_time) as last_visit
    FROM public.page_sessions ps
    WHERE ps.user_id = p_user_id
        AND ps.start_time::date = p_date
    GROUP BY ps.page_name, ps.page_category
    ORDER BY total_time_spent DESC;
END;
$$ LANGUAGE plpgsql;

-- View for easy access to page session analytics
CREATE OR REPLACE VIEW page_session_analytics AS
SELECT 
    ps.user_id,
    ps.page_category,
    ps.page_name,
    DATE(ps.start_time) as session_date,
    COUNT(*) as daily_sessions,
    COALESCE(SUM(ps.duration), 0) as daily_time_spent,
    COALESCE(SUM(jsonb_array_length(ps.activities)), 0) as daily_activities,
    AVG(ps.duration) as avg_session_length
FROM public.page_sessions ps
WHERE ps.duration IS NOT NULL
GROUP BY ps.user_id, ps.page_category, ps.page_name, DATE(ps.start_time);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.page_sessions TO authenticated;
GRANT SELECT ON public.page_session_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_page_session_summary(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_daily_page_activity(UUID, DATE) TO authenticated;











