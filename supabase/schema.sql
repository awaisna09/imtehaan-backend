-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  curriculum TEXT CHECK (curriculum IN ('igcse', 'o-levels', 'a-levels', 'edexcel', 'ib')) DEFAULT 'igcse',
  grade TEXT,
  subjects TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  password_hash TEXT, -- Add password hash field for local authentication
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  questions_data JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  topics_to_cover TEXT[] DEFAULT '{}',
  topics_completed TEXT[] DEFAULT '{}',
  exam_date DATE,
  daily_study_time INTEGER DEFAULT 60, -- in minutes
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  front_content TEXT NOT NULL,
  back_content TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_subject_topic ON questions(subject, topic);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON study_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Questions are public (read-only for all authenticated users)
CREATE POLICY "Questions are viewable by all users" ON questions FOR SELECT USING (auth.role() = 'authenticated');

-- Study sessions
CREATE POLICY "Users can view own study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study plans
CREATE POLICY "Users can view own study plans" ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study plans" ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study plans" ON study_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study plans" ON study_plans FOR DELETE USING (auth.uid() = user_id);

-- Flashcards
CREATE POLICY "Users can view own flashcards" ON flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcards" ON flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcards" ON flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcards" ON flashcards FOR DELETE USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Topics (public read access for all authenticated users)
CREATE POLICY "Topics are viewable by all users" ON topics FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, user_type, curriculum, grade)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Guest User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'curriculum', 'igcse'),
    COALESCE(NEW.raw_user_meta_data->>'grade', 'Year 10')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample topics for Business Studies
INSERT INTO topics (subject, title, description, difficulty, order_index) VALUES
('businessStudies', 'Marketing', 'Understanding market research, segmentation, and the marketing mix', 'medium', 1),
('businessStudies', 'Finance', 'Financial statements, cash flow, and business finance', 'medium', 2),
('businessStudies', 'Operations Management', 'Production processes, quality control, and supply chain', 'medium', 3),
('businessStudies', 'Human Resources', 'Recruitment, training, and employee management', 'easy', 4),
('businessStudies', 'Entrepreneurship', 'Starting and managing a business venture', 'hard', 5),
('businessStudies', 'Business Environment', 'External factors affecting business decisions', 'medium', 6),
('businessStudies', 'Business Strategy', 'Strategic planning and competitive advantage', 'hard', 7),
('businessStudies', 'Business Ethics', 'Ethical decision making in business', 'easy', 8)
ON CONFLICT DO NOTHING;

-- Insert sample questions for testing
INSERT INTO questions (subject, topic, question, options, correct_answer, difficulty, explanation) VALUES
-- Mathematics - Algebra
('mathematics', 'algebra', 'Solve for x: 2x + 5 = 17', ARRAY['x = 6', 'x = 11', 'x = 5', 'x = 8'], 'x = 6', 'easy', 'To solve 2x + 5 = 17, subtract 5 from both sides: 2x = 12, then divide by 2: x = 6'),
('mathematics', 'algebra', 'Simplify: 3(2x - 4) + 2x', ARRAY['8x - 12', '6x - 12', '8x - 4', '5x - 12'], '8x - 12', 'medium', '3(2x - 4) + 2x = 6x - 12 + 2x = 8x - 12'),

-- Mathematics - Geometry
('mathematics', 'geometry', 'What is the area of a circle with radius 4 cm?', ARRAY['16π cm²', '8π cm²', '12π cm²', '4π cm²'], '16π cm²', 'medium', 'Area of circle = πr². With r = 4, Area = π × 4² = 16π cm²'),
('mathematics', 'geometry', 'A triangle has angles 60°, 70°. What is the third angle?', ARRAY['50°', '60°', '40°', '30°'], '50°', 'easy', 'Sum of angles in a triangle = 180°. Third angle = 180° - 60° - 70° = 50°'),

-- Business Studies - Marketing
('businessStudies', 'marketing', 'What is the primary purpose of market segmentation?', ARRAY['To reduce production costs', 'To target specific customer groups effectively', 'To increase product prices', 'To eliminate competition'], 'To target specific customer groups effectively', 'medium', 'Market segmentation helps businesses identify and target specific customer groups with tailored marketing strategies.'),
('businessStudies', 'marketing', 'Which of the following is NOT one of the 4 Ps of marketing?', ARRAY['Product', 'Price', 'Place', 'Profit'], 'Profit', 'easy', 'The 4 Ps of marketing are Product, Price, Place, and Promotion. Profit is not one of them.'),

-- Business Studies - Finance
('businessStudies', 'finance', 'What is the main purpose of a cash flow statement?', ARRAY['To show company profits', 'To track cash inflows and outflows', 'To calculate taxes', 'To attract investors'], 'To track cash inflows and outflows', 'medium', 'A cash flow statement tracks the movement of cash in and out of a business over a specific period.')
ON CONFLICT DO NOTHING;

-- Create video_lessons table
CREATE TABLE IF NOT EXISTS public.video_lessons (
  video_id text NOT NULL,
  video_num smallint NULL,
  subject_id smallint NULL,
  topic_id smallint NULL,
  title text NOT NULL,
  description text NULL,
  duration_seconds integer NULL,
  source text NULL,
  tags text[] NULL,
  language text NULL DEFAULT 'en'::text,
  CONSTRAINT video_lessons_pkey PRIMARY KEY (video_id),
  CONSTRAINT video_lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects (subject_id) ON DELETE CASCADE,
  CONSTRAINT video_lessons_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES topics (topic_id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.video_lessons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access
CREATE POLICY "Allow read access to video_lessons" ON public.video_lessons
FOR SELECT USING (true);

-- Insert sample data for Business Studies
INSERT INTO public.video_lessons (video_id, video_num, subject_id, topic_id, title, description, duration_seconds, source, tags, language) VALUES
('BS001', 1, 1, 1, 'Understanding Business Activity', 'Learn the fundamentals of business activity and its importance in the economy', 1125, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ARRAY['business', 'activity', 'basics'], 'en'),
('BS002', 2, 1, 1, 'Types of Business Organizations', 'Explore different forms of business ownership and their characteristics', 1350, 'https://vimeo.com/148751763', ARRAY['organizations', 'ownership', 'business'], 'en'),
('BS003', 3, 1, 2, 'Marketing Mix and Strategy', 'Master the 4Ps of marketing and develop effective marketing strategies', 1515, 'https://www.youtube.com/watch?v=HBlDrHvnBx8', ARRAY['marketing', 'strategy', '4Ps'], 'en'),
('BS004', 4, 1, 3, 'Financial Planning and Budgeting', 'Learn essential financial planning techniques and budgeting skills', 1245, 'https://www.youtube.com/watch?v=GvL6OoHq4NM', ARRAY['finance', 'planning', 'budgeting'], 'en'),
('BS005', 5, 1, 4, 'Human Resource Management', 'Understand HR functions and employee management strategies', 1380, 'https://vimeo.com/148751763', ARRAY['hr', 'management', 'employees'], 'en'),
('BS006', 6, 1, 5, 'Operations Management', 'Learn about production processes and operational efficiency', 1620, 'https://www.youtube.com/watch?v=HBlDrHvnBx8', ARRAY['operations', 'production', 'efficiency'], 'en'); 

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  subject_id smallint NOT NULL,
  subject_name text NOT NULL,
  description text NULL,
  CONSTRAINT subjects_pkey PRIMARY KEY (subject_id)
);

-- Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
  topic_id smallint NOT NULL,
  subject_id smallint NULL,
  title text NOT NULL,
  description text NULL,
  CONSTRAINT topics_pkey PRIMARY KEY (topic_id),
  CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects (subject_id) ON DELETE CASCADE
);

-- Insert sample subjects and topics
INSERT INTO public.subjects (subject_id, subject_name, description) VALUES
(1, 'Business Studies', 'Comprehensive business education covering all aspects of business operations')
ON CONFLICT DO NOTHING;

INSERT INTO public.topics (topic_id, subject_id, title, description) VALUES
(1, 1, 'Business Activity', 'Understanding the nature and purpose of business activity'),
(2, 1, 'Marketing', 'Marketing concepts and strategies'),
(3, 1, 'Finance', 'Financial management and planning'),
(4, 1, 'Human Resources', 'Managing people in organizations'),
(5, 1, 'Operations', 'Production and operations management')
ON CONFLICT DO NOTHING; 

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  lessons_id smallint NOT NULL,
  topic_id smallint NULL,
  title text NOT NULL,
  content text NOT NULL,
  media_type text NULL DEFAULT 'text'::text,
  reading_time_minutes integer NULL,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT lessons_pkey PRIMARY KEY (lessons_id),
  CONSTRAINT lessons_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES topics (topic_id) ON DELETE CASCADE,
  CONSTRAINT lessons_lessons_id_check CHECK (
    (
      (lessons_id >= 1)
      AND (lessons_id <= 99)
    )
  )
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access
CREATE POLICY "Allow read access to lessons" ON public.lessons
FOR SELECT USING (true);

-- Insert sample data for Business Studies topics
INSERT INTO public.lessons (lessons_id, topic_id, title, content, media_type, reading_time_minutes) VALUES
(1, 1, 'Introduction to Business Activity', 'Business activity refers to all the activities that are performed to earn profit. It includes the production of goods and services, their distribution, and the provision of various services to customers. Business activity is essential for the economic development of any country as it creates employment opportunities, generates income, and contributes to the GDP.

Key aspects of business activity include:
• Production of goods and services
• Marketing and distribution
• Financial management
• Human resource management
• Customer service and support

Business activity can be classified into different types such as manufacturing, trading, and service businesses. Each type has its own characteristics and requirements.', 'text', 15),
(2, 1, 'Types of Business Organizations', 'Business organizations can be classified into different types based on their ownership structure, liability, and management. The main types include:

1. Sole Proprietorship: A business owned and managed by a single person. The owner has unlimited liability and full control over the business.

2. Partnership: A business owned by two or more people who share profits, losses, and management responsibilities.

3. Private Limited Company: A company with limited liability where shares are not publicly traded. It has a separate legal identity from its owners.

4. Public Limited Company: A company whose shares are publicly traded on stock exchanges. It has limited liability and can raise capital from the public.

5. Cooperative: A business owned and operated by a group of individuals for their mutual benefit.', 'text', 20),
(3, 2, 'Marketing Fundamentals', 'Marketing is the process of identifying, anticipating, and satisfying customer needs profitably. It involves understanding customer requirements, developing products that meet those needs, and promoting them effectively.

The marketing mix consists of four key elements:
• Product: What is being sold
• Price: How much it costs
• Place: Where it is sold
• Promotion: How it is advertised

Marketing strategies help businesses reach their target audience and achieve their sales objectives. Effective marketing requires market research, customer analysis, and continuous adaptation to changing market conditions.', 'text', 18),
(4, 3, 'Financial Planning Basics', 'Financial planning is the process of managing money to achieve personal or business goals. It involves creating a budget, setting financial goals, and making informed decisions about spending, saving, and investing.

Key components of financial planning include:
• Budgeting and expense tracking
• Saving and emergency funds
• Investment planning
• Risk management and insurance
• Retirement planning

Good financial planning helps individuals and businesses make the most of their financial resources and achieve long-term financial security.', 'text', 25),
(5, 4, 'Human Resource Management', 'Human Resource Management (HRM) is the strategic approach to managing people in an organization. It involves recruiting, training, developing, and retaining employees to achieve organizational goals.

HRM functions include:
• Recruitment and selection
• Training and development
• Performance management
• Compensation and benefits
• Employee relations
• Health and safety

Effective HRM practices contribute to employee satisfaction, productivity, and organizational success.', 'text', 22),
(6, 5, 'Operations Management Overview', 'Operations management is the administration of business practices to create the highest level of efficiency possible within an organization. It involves managing the process of converting inputs into outputs.

Key areas of operations management include:
• Production planning and control
• Quality management
• Inventory management
• Supply chain management
• Process improvement

Operations management ensures that business processes are efficient, cost-effective, and meet customer requirements.', 'text', 20)
ON CONFLICT DO NOTHING; 

-- P1 Mock Exam table
create table public.p1_mock_exam (
  question_id serial not null,
  part character(1) not null,
  case_study text not null,
  question text not null,
  solution text not null,
  hint text null,
  topic_name text not null,
  marks integer not null,
  image text null,
  "Set" text null,
  constraint p1_mock_exam_pkey primary key (question_id)
) TABLESPACE pg_default;

-- Sample data for p1_mock_exam
INSERT INTO public.p1_mock_exam (part, case_study, question, solution, hint, topic_name, marks, image, "Set") VALUES
('A', 'ABC Ltd is a manufacturing company that produces electronic components. The company has been experiencing declining profits due to increased competition and rising costs. The management team is considering several strategies to improve profitability, including cost-cutting measures, product diversification, and market expansion.', 'Analyze the current situation of ABC Ltd and identify the main challenges facing the company.', 'The main challenges include: 1) Declining profits due to increased competition, 2) Rising costs affecting margins, 3) Need for strategic repositioning in the market. The company must balance cost-cutting with investment in growth strategies.', 'Consider both internal factors (costs, operations) and external factors (competition, market conditions).', 'Business Strategy', 15, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'Set1'),
('B', 'ABC Ltd is a manufacturing company that produces electronic components. The company has been experiencing declining profits due to increased competition and rising costs. The management team is considering several strategies to improve profitability, including cost-cutting measures, product diversification, and market expansion.', 'Evaluate the effectiveness of cost-cutting measures as a strategy for ABC Ltd.', 'Cost-cutting measures can provide short-term relief but may harm long-term competitiveness. The company should focus on strategic cost reduction that maintains quality and innovation while improving efficiency.', 'Consider the difference between strategic cost reduction and simple cost-cutting that might harm the business.', 'Cost Management', 12, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'Set1'),
('C', 'ABC Ltd is a manufacturing company that produces electronic components. The company has been experiencing declining profits due to increased competition and rising costs. The management team is considering several strategies to improve profitability, including cost-cutting measures, product diversification, and market expansion.', 'Recommend a comprehensive strategy for ABC Ltd to improve its market position.', 'A comprehensive strategy should include: 1) Market research to identify growth opportunities, 2) Product innovation and diversification, 3) Strategic partnerships, 4) Operational efficiency improvements, 5) Customer relationship enhancement.', 'Think about both defensive (cost-cutting) and offensive (growth) strategies that can work together.', 'Strategic Planning', 18, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'Set1'),
('A', 'XYZ Corporation operates in the retail sector with 50 stores across the country. The company has been struggling with inventory management issues, leading to stockouts of popular items and overstock of slow-moving products. This has resulted in lost sales and increased holding costs.', 'Identify the key inventory management challenges faced by XYZ Corporation.', 'Key challenges include: 1) Poor demand forecasting leading to stockouts, 2) Inefficient inventory tracking systems, 3) Lack of coordination between stores, 4) Inadequate supplier management, 5) High holding costs due to overstock.', 'Consider the impact of poor inventory management on both sales and costs.', 'Inventory Management', 14, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'Set2'),
('B', 'XYZ Corporation operates in the retail sector with 50 stores across the country. The company has been struggling with inventory management issues, leading to stockouts of popular items and overstock of slow-moving products. This has resulted in lost sales and increased holding costs.', 'Propose solutions to improve XYZ Corporation''s inventory management system.', 'Solutions include: 1) Implement advanced demand forecasting software, 2) Establish centralized inventory control, 3) Develop supplier partnerships with better lead times, 4) Regular inventory audits and ABC analysis, 5) Staff training on inventory best practices.', 'Focus on both technological and process improvements.', 'Operations Management', 16, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'Set2'),
('A', 'Global Tech Solutions is a software development company that has been growing rapidly over the past three years. The company now employs 200 developers across different time zones and is facing challenges in project coordination, quality assurance, and maintaining company culture.', 'Analyze the organizational challenges faced by Global Tech Solutions due to rapid growth.', 'Challenges include: 1) Communication barriers across time zones, 2) Difficulty maintaining consistent quality standards, 3) Cultural integration of new employees, 4) Project coordination complexity, 5) Scalability of management processes.', 'Consider how rapid growth affects different aspects of organizational management.', 'Organizational Behavior', 13, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'Set3'),
('B', 'Global Tech Solutions is a software development company that has been growing rapidly over the past three years. The company now employs 200 developers across different time zones and is facing challenges in project coordination, quality assurance, and maintaining company culture.', 'Suggest strategies to address the communication and coordination challenges.', 'Strategies include: 1) Implement unified communication platforms, 2) Establish clear project management frameworks, 3) Create overlapping work hours for key team members, 4) Regular virtual team building activities, 5) Standardized documentation and processes.', 'Focus on both technology solutions and human factors.', 'Communication Management', 11, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'Set3');

-- Enable RLS
ALTER TABLE public.p1_mock_exam ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access
CREATE POLICY "Allow read access to p1_mock_exam" ON public.p1_mock_exam
FOR SELECT USING (true); 