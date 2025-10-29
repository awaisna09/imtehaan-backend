-- Add Business Studies topics to your existing topics table
-- This script only uses the 'title' column

INSERT INTO topics (title) VALUES
('Marketing'),
('Finance'),
('Operations Management'),
('Human Resources'),
('Entrepreneurship'),
('Business Environment'),
('Business Strategy'),
('Business Ethics')
ON CONFLICT (title) DO NOTHING;

-- Check the results
SELECT * FROM topics ORDER BY title;


