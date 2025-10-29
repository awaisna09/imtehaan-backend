-- Clean up duplicate and conflicting RLS policies for study_plans table

-- First, let's see what we have
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'study_plans'
ORDER BY policyname, cmd;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON study_plans;
DROP POLICY IF EXISTS "Allow users to view their own plans" ON study_plans;
DROP POLICY IF EXISTS "Allow users to update their own plans" ON study_plans;
DROP POLICY IF EXISTS "Allow users to delete their own plans" ON study_plans;
DROP POLICY IF EXISTS "Users can view own study plans" ON study_plans;
DROP POLICY IF EXISTS "Users can insert own study plans" ON study_plans;
DROP POLICY IF EXISTS "Users can update own study plans" ON study_plans;
DROP POLICY IF EXISTS "Users can delete own study plans" ON study_plans;

-- Ensure RLS is enabled
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

-- Create clean, single policies for each operation
CREATE POLICY "study_plans_select_policy" ON study_plans 
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "study_plans_insert_policy" ON study_plans 
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "study_plans_update_policy" ON study_plans 
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "study_plans_delete_policy" ON study_plans 
FOR DELETE USING (auth.uid()::text = user_id::text);

-- Verify the new policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'study_plans'
ORDER BY policyname, cmd;

