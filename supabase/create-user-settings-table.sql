-- Create comprehensive user settings table
-- This will store all user preferences, account settings, and study configurations

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Theme & Appearance
  theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'light',
  language TEXT CHECK (language IN ('en', 'ar')) DEFAULT 'en',
  
  -- Study Preferences
  auto_play_flashcards BOOLEAN DEFAULT false,
  show_hints BOOLEAN DEFAULT true,
  sound_effects BOOLEAN DEFAULT true,
  vibration BOOLEAN DEFAULT true,
  study_reminders BOOLEAN DEFAULT true,
  daily_goal_minutes INTEGER CHECK (daily_goal_minutes >= 10 AND daily_goal_minutes <= 180) DEFAULT 30,
  session_duration_minutes INTEGER CHECK (session_duration_minutes >= 5 AND session_duration_minutes <= 60) DEFAULT 25,
  
  -- Notifications
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  
  -- Privacy & Security
  data_sharing BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,
  profile_visibility TEXT CHECK (profile_visibility IN ('public', 'private')) DEFAULT 'private',
  
  -- Accessibility
  font_size TEXT CHECK (font_size IN ('small', 'medium', 'large')) DEFAULT 'medium',
  high_contrast BOOLEAN DEFAULT false,
  reduced_motion BOOLEAN DEFAULT false,
  
  -- Account Settings
  email_preferences JSONB DEFAULT '{"marketing": false, "updates": true, "achievements": true}',
  two_factor_enabled BOOLEAN DEFAULT false,
  last_password_change TIMESTAMP WITH TIME ZONE,
  
  -- Study Plan Preferences
  preferred_study_times JSONB DEFAULT '{"morning": true, "afternoon": true, "evening": true, "night": false}',
  study_plan_template TEXT DEFAULT 'balanced',
  auto_schedule_breaks BOOLEAN DEFAULT true,
  break_duration_minutes INTEGER DEFAULT 5,
  
  -- Data Management
  auto_backup_enabled BOOLEAN DEFAULT true,
  backup_frequency TEXT CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'weekly',
  data_retention_days INTEGER DEFAULT 365,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on user_id
ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_user_id_unique UNIQUE (user_id);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_theme ON public.user_settings(theme);
CREATE INDEX IF NOT EXISTS idx_user_settings_language ON public.user_settings(language);

-- Grant permissions
GRANT ALL ON public.user_settings TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Insert default settings for existing users (if any)
-- This will be handled by the application when users first access settings

-- Verify table creation
SELECT 'User settings table created successfully' as status;
SELECT COUNT(*) as existing_settings FROM public.user_settings;

























