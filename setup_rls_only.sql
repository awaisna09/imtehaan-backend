-- Setup RLS policies for topics table (no data insertion)

-- Enable RLS on topics table
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read topics
CREATE POLICY "Topics are viewable by all users" ON topics 
FOR SELECT USING (auth.role() = 'authenticated');

-- Alternative: Allow public read access (for testing)
-- CREATE POLICY "Topics are viewable by all users" ON topics 
-- FOR SELECT USING (true);

-- Check if policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'topics';
































