-- Update RLS policies for business_activity_questions table
-- This will allow read access to the table

-- First, check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'business_activity_questions';

-- Enable RLS if not already enabled
ALTER TABLE public.business_activity_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to business_activity_questions" ON public.business_activity_questions;
DROP POLICY IF EXISTS "Allow all access to business_activity_questions" ON public.business_activity_questions;

-- Create a policy that allows read access for all users (including anonymous)
CREATE POLICY "Allow read access to business_activity_questions" 
ON public.business_activity_questions 
FOR SELECT 
USING (true);

-- Create a policy that allows insert/update/delete for authenticated users (optional)
-- Uncomment if you want authenticated users to be able to modify data
-- CREATE POLICY "Allow authenticated users to modify business_activity_questions" 
-- ON public.business_activity_questions 
-- FOR ALL 
-- USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'business_activity_questions';

-- Test the access by trying to select from the table
SELECT COUNT(*) FROM public.business_activity_questions;

-- Show sample data to confirm access
SELECT * FROM public.business_activity_questions LIMIT 5;
