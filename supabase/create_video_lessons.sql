-- Create video_lessons table
CREATE TABLE public.video_lessons (
  video_id text NOT NULL,
  video_num smallint NULL,
  subject_id smallint NULL,
  topic_id smallint NULL,
  title text NOT NULL,
  description text NULL,
  duration_seconds integer NULL,
  source text NULL,
  tags text[] NULL,
  language text NULL DEFAULT 'en'::text,
  CONSTRAINT video_lessons_pkey PRIMARY KEY (video_id),
  CONSTRAINT video_lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects (subject_id) ON DELETE CASCADE,
  CONSTRAINT video_lessons_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES topics (topic_id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.video_lessons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access
CREATE POLICY "Allow read access to video_lessons" ON public.video_lessons
FOR SELECT USING (true);

-- Insert sample data for Business Studies
INSERT INTO public.video_lessons (video_id, video_num, subject_id, topic_id, title, description, duration_seconds, source, tags, language) VALUES
('BS001', 1, 1, 1, 'Understanding Business Activity', 'Learn the fundamentals of business activity and its importance in the economy', 1125, 'youtube', ARRAY['business', 'activity', 'basics'], 'en'),
('BS002', 2, 1, 1, 'Types of Business Organizations', 'Explore different forms of business ownership and their characteristics', 1350, 'youtube', ARRAY['organizations', 'ownership', 'business'], 'en'),
('BS003', 3, 1, 2, 'Marketing Mix and Strategy', 'Master the 4Ps of marketing and develop effective marketing strategies', 1515, 'youtube', ARRAY['marketing', 'strategy', '4Ps'], 'en'),
('BS004', 4, 1, 3, 'Financial Planning and Budgeting', 'Learn essential financial planning techniques and budgeting skills', 1245, 'youtube', ARRAY['finance', 'planning', 'budgeting'], 'en'),
('BS005', 5, 1, 4, 'Human Resource Management', 'Understand HR functions and employee management strategies', 1380, 'youtube', ARRAY['hr', 'management', 'employees'], 'en'),
('BS006', 6, 1, 5, 'Operations Management', 'Learn about production processes and operational efficiency', 1620, 'youtube', ARRAY['operations', 'production', 'efficiency'], 'en');
