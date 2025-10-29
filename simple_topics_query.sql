-- First, let's see what columns your topics table actually has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;

-- If the table doesn't have the required columns, let's add them
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS description TEXT;

-- Now let's insert some sample Business Studies topics
INSERT INTO topics (subject, title, description, difficulty, order_index, is_active) VALUES
('businessStudies', 'Marketing', 'Understanding market research, segmentation, and the marketing mix', 'medium', 1, true),
('businessStudies', 'Finance', 'Financial statements, cash flow, and business finance', 'medium', 2, true),
('businessStudies', 'Operations Management', 'Production processes, quality control, and supply chain', 'medium', 3, true),
('businessStudies', 'Human Resources', 'Recruitment, training, and employee management', 'easy', 4, true),
('businessStudies', 'Entrepreneurship', 'Starting and managing a business venture', 'hard', 5, true),
('businessStudies', 'Business Environment', 'External factors affecting business decisions', 'medium', 6, true),
('businessStudies', 'Business Strategy', 'Strategic planning and competitive advantage', 'hard', 7, true),
('businessStudies', 'Business Ethics', 'Ethical decision making in business', 'easy', 8, true)
ON CONFLICT (title) DO NOTHING;

-- Check the final structure
SELECT * FROM topics WHERE subject = 'businessStudies' ORDER BY order_index;

































