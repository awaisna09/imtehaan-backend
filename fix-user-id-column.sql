-- Fix user_id column type mismatch in study_plans table
-- The user_id column is currently smallint but Supabase uses UUID strings

-- Step 1: Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'study_plans' 
AND column_name = 'user_id';

-- Step 2: Check for existing data
SELECT COUNT(*) as existing_records FROM study_plans;

-- Step 3: Drop existing RLS policies (required before changing column type)
DROP POLICY IF EXISTS "study_plans_select_policy" ON study_plans;
DROP POLICY IF EXISTS "study_plans_insert_policy" ON study_plans;
DROP POLICY IF EXISTS "study_plans_update_policy" ON study_plans;
DROP POLICY IF EXISTS "study_plans_delete_policy" ON study_plans;

-- Step 4: Change the column type from smallint to UUID
ALTER TABLE study_plans 
ALTER COLUMN user_id TYPE UUID USING user_id::text::UUID;

-- Step 5: Recreate the RLS policies with the new UUID column type
CREATE POLICY "study_plans_select_policy" ON study_plans 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "study_plans_insert_policy" ON study_plans 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_plans_update_policy" ON study_plans 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "study_plans_delete_policy" ON study_plans 
FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'study_plans' 
AND column_name = 'user_id';

-- Step 7: Verify policies are recreated
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'study_plans'
ORDER BY cmd;
