-- Comprehensive Debug Script for Topics Table
-- Run this in Supabase SQL Editor

-- 1. Check if topics table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'topics'
) as table_exists;

-- 2. Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'topics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check total number of rows
SELECT COUNT(*) as total_rows FROM topics;

-- 4. Check all unique subject_ids
SELECT DISTINCT subject_id, COUNT(*) as topic_count 
FROM topics 
GROUP BY subject_id 
ORDER BY subject_id;

-- 5. Check specifically for subject_id 101
SELECT COUNT(*) as topics_for_101 
FROM topics 
WHERE subject_id = 101;

-- 6. Show all topics for subject_id 101
SELECT id, topic, subject_id 
FROM topics 
WHERE subject_id = 101 
ORDER BY id;

-- 7. Show first 10 rows of all data
SELECT * FROM topics LIMIT 10;

-- 8. Check for any NULL values in key columns
SELECT 
  COUNT(*) as total_rows,
  COUNT(subject_id) as non_null_subject_ids,
  COUNT(topic) as non_null_topics
FROM topics;

-- 9. Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'topics';

-- 10. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'topics';

-- 11. Test direct query (should work if RLS is not blocking)
SELECT topic FROM topics WHERE subject_id = 101 LIMIT 5;
































