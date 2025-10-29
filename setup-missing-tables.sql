-- Setup missing tables for analytics system
-- Run this in your Supabase SQL editor

-- 1. Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  duration INTEGER DEFAULT 0, -- in minutes
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  session_type TEXT DEFAULT 'practice', -- 'practice', 'mock_exam', 'flashcard'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  type TEXT DEFAULT 'completion', -- 'streak', 'score', 'time', 'completion'
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB, -- For multiple choice questions
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  marks INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  last_reviewed TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on all tables
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for study_sessions
CREATE POLICY "Users can view their own study sessions" ON study_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON study_sessions
FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS policies for achievements
CREATE POLICY "Users can view their own achievements" ON achievements
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON achievements
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON achievements
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements" ON achievements
FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS policies for questions (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view questions" ON questions
FOR SELECT USING (auth.role() = 'authenticated');

-- 9. Create RLS policies for flashcards
CREATE POLICY "Users can view their own flashcards" ON flashcards
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards" ON flashcards
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" ON flashcards
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" ON flashcards
FOR DELETE USING (auth.uid() = user_id);

-- 10. Insert some sample data for testing
INSERT INTO questions (subject, topic, question_text, correct_answer, difficulty, marks) VALUES
('businessStudies', 'business_activity', 'What is the primary purpose of a business?', 'To make a profit', 'easy', 1),
('businessStudies', 'business_activity', 'Which of the following is NOT a factor of production?', 'Profit', 'medium', 2),
('businessStudies', 'business_activity', 'What is the difference between goods and services?', 'Goods are tangible, services are intangible', 'medium', 2);

-- 11. Insert sample achievements
INSERT INTO achievements (user_id, title, description, type) VALUES
('2f9df413-87b7-4987-af37-fb05391df4c8', 'First Practice Session', 'Completed your first practice session', 'completion'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'Flashcard Master', 'Reviewed 10 flashcards', 'completion');

-- 12. Insert sample study session
INSERT INTO study_sessions (user_id, subject, topic, duration, questions_answered, correct_answers) VALUES
('2f9df413-87b7-4987-af37-fb05391df4c8', 'businessStudies', 'business_activity', 15, 5, 4);

-- 13. Insert sample flashcards
INSERT INTO flashcards (user_id, subject, topic, front, back, difficulty) VALUES
('2f9df413-87b7-4987-af37-fb05391df4c8', 'businessStudies', 'business_activity', 'What is a business?', 'An organization that provides goods or services to customers', 'easy'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'businessStudies', 'business_activity', 'What are the factors of production?', 'Land, Labour, Capital, and Enterprise', 'medium');

-- Note: Replace '2f9df413-87b7-4987-af37-fb05391df4c8' with your actual user ID if different
