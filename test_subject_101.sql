-- Test script to check topics for subject_id 101

-- Check if subject_id 101 exists and has topics
SELECT COUNT(*) as topic_count 
FROM topics 
WHERE subject_id = 101;

-- Show all topics for subject_id 101
SELECT id, topic, subject_id 
FROM topics 
WHERE subject_id = 101 
ORDER BY id;

-- Check all unique subject_ids in the table
SELECT DISTINCT subject_id, COUNT(*) as topic_count 
FROM topics 
GROUP BY subject_id 
ORDER BY subject_id;

-- Show table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;
