-- Fix plan_id column issue in study_plans table
-- The plan_id column needs to be auto-incrementing or have a default value

-- Step 1: Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    is_identity,
    identity_generation
FROM information_schema.columns 
WHERE table_name = 'study_plans' 
AND column_name = 'plan_id';

-- Step 2: Check current constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'study_plans' 
AND ccu.column_name = 'plan_id';

-- Step 3: Fix the plan_id column to be auto-incrementing
-- First, drop any existing sequence if it exists
DROP SEQUENCE IF EXISTS study_plans_plan_id_seq;

-- Create a new sequence
CREATE SEQUENCE study_plans_plan_id_seq;

-- Set the sequence to start from 1
ALTER SEQUENCE study_plans_plan_id_seq RESTART WITH 1;

-- Alter the plan_id column to use the sequence
ALTER TABLE study_plans 
ALTER COLUMN plan_id SET DEFAULT nextval('study_plans_plan_id_seq');

-- Make the column use the sequence for new values
ALTER TABLE study_plans 
ALTER COLUMN plan_id SET DEFAULT nextval('study_plans_plan_id_seq');

-- Step 4: Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    is_identity,
    identity_generation
FROM information_schema.columns 
WHERE table_name = 'study_plans' 
AND column_name = 'plan_id';

-- Step 5: Test the auto-increment
-- This should work now without needing to specify plan_id
-- INSERT INTO study_plans (user_id, study_date, study_time_minutes, total_topics, topics_done, exam_date)
-- VALUES ('2f9df413-87b7-4987-af37-fb05391df4c8', '2025-08-13', 60, 1, 0, '2025-12-31');
