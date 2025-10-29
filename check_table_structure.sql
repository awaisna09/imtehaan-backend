-- Check the actual structure of your topics table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;

-- Check if there are any sample rows to understand the data structure
SELECT * FROM topics LIMIT 5;

-- Check if there's a subject_id column instead of subject
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'topics' 
AND column_name LIKE '%subject%';


