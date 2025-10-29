-- Enable RLS on topics table
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read topics
CREATE POLICY "Topics are viewable by all users" ON topics 
FOR SELECT USING (auth.role() = 'authenticated');

-- If you want to allow anonymous access (for testing), use this instead:
-- CREATE POLICY "Topics are viewable by all users" ON topics 
-- FOR SELECT USING (true);

-- Insert sample Business Studies topics if they don't exist
INSERT INTO topics (subject, title, description, difficulty, order_index, is_active) VALUES
('businessStudies', 'Marketing', 'Understanding market research, segmentation, and the marketing mix', 'medium', 1, true),
('businessStudies', 'Finance', 'Financial statements, cash flow, and business finance', 'medium', 2, true),
('businessStudies', 'Operations Management', 'Production processes, quality control, and supply chain', 'medium', 3, true),
('businessStudies', 'Human Resources', 'Recruitment, training, and employee management', 'easy', 4, true),
('businessStudies', 'Entrepreneurship', 'Starting and managing a business venture', 'hard', 5, true),
('businessStudies', 'Business Environment', 'External factors affecting business decisions', 'medium', 6, true),
('businessStudies', 'Business Strategy', 'Strategic planning and competitive advantage', 'hard', 7, true),
('businessStudies', 'Business Ethics', 'Ethical decision making in business', 'easy', 8, true)
ON CONFLICT (title, subject) DO NOTHING;

































