-- Verify RLS policies are working correctly

-- 1. Check current policies (should show only 4 clean policies)
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'study_plans'
ORDER BY cmd;

-- 2. Test if we can see the policies are properly applied
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'study_plans';

-- 3. Check if there are any conflicting policies
SELECT 
    policyname,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'study_plans'
GROUP BY policyname
HAVING COUNT(*) > 1;

-- 4. Verify the policy conditions are consistent
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN qual
        WHEN cmd = 'INSERT' THEN with_check
        WHEN cmd = 'UPDATE' THEN qual
        WHEN cmd = 'DELETE' THEN qual
    END as policy_condition
FROM pg_policies 
WHERE tablename = 'study_plans'
ORDER BY cmd;
