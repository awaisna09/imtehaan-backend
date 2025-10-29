-- Fix RLS to allow public access for testing
-- Run this in Supabase SQL Editor

-- 1. Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Topics are viewable by all users" ON topics;
DROP POLICY IF EXISTS "Topics are viewable by authenticated users" ON topics;

-- 3. Create policy for public read access (for testing)
CREATE POLICY "Topics are viewable by everyone" ON topics
FOR SELECT USING (true);

-- 4. Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'topics';

-- 5. Test the access
SELECT COUNT(*) as total_topics FROM topics;
SELECT COUNT(*) as topics_for_101 FROM topics WHERE subject_id = 101;
SELECT topic FROM topics WHERE subject_id = 101 LIMIT 3;
































