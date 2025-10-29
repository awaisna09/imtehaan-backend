-- Debug script to check your topics table

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

-- 4. Check your existing data (first 10 rows)
SELECT * FROM topics LIMIT 10;

-- 5. Count total topics
SELECT COUNT(*) as total_topics FROM topics;

-- 6. Check if there are any topics with title column
SELECT title FROM topics LIMIT 5;
































