-- Insert sample learning activities for testing analytics
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users

-- Sample learning activities for Business Studies topics
INSERT INTO public.learning_activities (
    user_id,
    activity_type,
    topic_id,
    subject_id,
    topic_name,
    subject_name,
    duration,
    score,
    correct_answers,
    total_questions,
    accuracy,
    metadata
) VALUES 
-- Sample question attempts for Business Activity (topic_id: 10)
('2f9df413-87b7-4987-af37-fb05391df4c8', 'question', 10, 9, 'Business Activity', 'Business Studies', 120, 100, 1, 1, 100.00, '{"questionId": "q1", "difficulty": "easy", "marks": 1}'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'question', 10, 9, 'Business Activity', 'Business Studies', 180, 0, 0, 1, 0.00, '{"questionId": "q2", "difficulty": "medium", "marks": 2}'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'question', 10, 9, 'Business Activity', 'Business Studies', 150, 100, 1, 1, 100.00, '{"questionId": "q3", "difficulty": "easy", "marks": 1}'),

-- Sample question attempts for Business Ownership (topic_id: 11)
('2f9df413-87b7-4987-af37-fb05391df4c8', 'question', 11, 9, 'Business Ownership', 'Business Studies', 200, 100, 1, 1, 100.00, '{"questionId": "q4", "difficulty": "medium", "marks": 2}'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'question', 11, 9, 'Business Ownership', 'Business Studies', 160, 0, 0, 1, 0.00, '{"questionId": "q5", "difficulty": "hard", "marks": 3}'),

-- Sample flashcard reviews
('2f9df413-87b7-4987-af37-fb05391df4c8', 'flashcard', 10, 9, 'Business Activity', 'Business Studies', 30, 100, 1, 1, 100.00, '{"flashcardId": "fc1", "masteryLevel": "easy"}'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'flashcard', 10, 9, 'Business Activity', 'Business Studies', 45, 0, 0, 1, 0.00, '{"flashcardId": "fc2", "masteryLevel": "medium"}'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'flashcard', 11, 9, 'Business Ownership', 'Business Studies', 35, 100, 1, 1, 100.00, '{"flashcardId": "fc3", "masteryLevel": "easy"}'),

-- Sample lesson completions
('2f9df413-87b7-4987-af37-fb05391df4c8', 'lesson', 10, 9, 'Business Activity', 'Business Studies', 900, 100, 1, 1, 100.00, '{"lessonId": "l1", "lessonType": "reading", "completionStatus": "completed"}'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'lesson', 11, 9, 'Business Ownership', 'Business Studies', 1200, 100, 1, 1, 100.00, '{"lessonId": "l2", "lessonType": "reading", "completionStatus": "completed"}'),

-- Sample video lesson completions
('2f9df413-87b7-4987-af37-fb05391df4c8', 'video_lesson', 10, 9, 'Business Activity', 'Business Studies', 600, 100, 1, 1, 100.00, '{"videoId": "v1", "lessonType": "video", "completionStatus": "completed"}'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'video_lesson', 11, 9, 'Business Ownership', 'Business Studies', 480, 100, 1, 1, 100.00, '{"videoId": "v2", "lessonType": "video", "completionStatus": "completed"}'),

-- Sample mock exam
('2f9df413-87b7-4987-af37-fb05391df4c8', 'mock_exam', 10, 9, 'Business Activity', 'Business Studies', 5400, 80, 16, 20, 80.00, '{"examId": "exam1", "examType": "mock", "difficulty": "medium"}'),

-- Sample practice session
('2f9df413-87b7-4987-af37-fb05391df4c8', 'practice_session', 10, 9, 'Business Activity', 'Business Studies', 1800, 70, 7, 10, 70.00, '{"sessionId": "ps1", "sessionType": "practice", "questionsAnswered": 10, "correctAnswers": 7}');

-- Sample study sessions
INSERT INTO public.study_sessions (
    user_id,
    session_name,
    start_time,
    end_time,
    duration,
    topics_covered,
    total_activities,
    session_goals,
    notes
) VALUES 
('2f9df413-87b7-4987-af37-fb05391df4c8', 'Business Activity Study Session', '2025-01-13 09:00:00+00', '2025-01-13 10:30:00+00', 5400, ARRAY['Business Activity'], 8, ARRAY['Master Business Activity', 'Improve accuracy'], 'Great session, covered all key concepts'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'Business Ownership Review', '2025-01-13 14:00:00+00', '2025-01-13 15:00:00+00', 3600, ARRAY['Business Ownership'], 5, ARRAY['Review Business Ownership', 'Practice questions'], 'Good review session'),
('2f9df413-87b7-4987-af37-fb05391df4c8', 'Mixed Topics Practice', '2025-01-14 10:00:00+00', '2025-01-14 11:30:00+00', 5400, ARRAY['Business Activity', 'Business Ownership'], 12, ARRAY['Mixed practice', 'Build confidence'], 'Excellent mixed practice session');

-- Update learning activities with session IDs
UPDATE public.learning_activities 
SET session_id = '2f9df413-87b7-4987-af37-fb05391df4c8-001'
WHERE user_id = '2f9df413-87b7-4987-af37-fb05391df4c8' AND topic_id = 10;

UPDATE public.learning_activities 
SET session_id = '2f9df413-87b7-4987-af37-fb05391df4c8-002'
WHERE user_id = '2f9df413-87b7-4987-af37-fb05391df4c8' AND topic_id = 11;

-- Note: Replace '2f9df413-87b7-4987-af37-fb05391df4c8' with your actual user ID
-- You can find your user ID by running: SELECT id FROM auth.users WHERE email = 'your-email@example.com';
