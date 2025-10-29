-- Test script to check topics table

-- 1. Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'topics';

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'topics';

-- 4. Check existing data
SELECT * FROM topics WHERE subject = 'businessStudies' ORDER BY order_index;

-- 5. Count total topics
SELECT COUNT(*) as total_topics FROM topics;

-- 6. Check topics by subject
SELECT subject, COUNT(*) as topic_count 
FROM topics 
GROUP BY subject;

































