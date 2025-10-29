-- Fix the trigger function to work with current metadata structure
-- Run this in your Supabase SQL Editor

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a simpler function that handles the metadata correctly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (
    id, 
    email, 
    full_name, 
    user_type, 
    curriculum, 
    grade,
    subjects,
    preferences
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Guest User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'curriculum', 'igcse'),
    COALESCE(NEW.raw_user_meta_data->>'grade', 'Year 10'),
    COALESCE(NEW.raw_user_meta_data->'subjects', '["Mathematics", "Physics", "Chemistry"]'::jsonb),
    COALESCE(NEW.raw_user_meta_data->'preferences', '{}'::jsonb)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 