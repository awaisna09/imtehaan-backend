# Quick Setup Guide - Fix Authentication Issues

## Current Issue
You're getting a 400 Bad Request error when trying to sign up. This is likely because the Supabase database schema isn't set up yet.

## Quick Fix Steps

### 1. Set Up Database Schema (Required)
1. Go to: https://supabase.com/dashboard/project/bgenvwieabtxwzapgeee
2. Click on **SQL Editor** in the left sidebar
3. Copy and paste this SQL:

```sql
-- Create users table for storing signup data
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  curriculum TEXT CHECK (curriculum IN ('igcse', 'o-levels', 'a-levels', 'edexcel', 'ib')) DEFAULT 'igcse',
  grade TEXT,
  subjects TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, user_type, curriculum, grade)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Guest User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'curriculum', 'igcse'),
    COALESCE(NEW.raw_user_meta_data->>'grade', 'Year 10')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

4. Click **Run** to execute the SQL

### 2. Configure Authentication Settings
1. In your Supabase dashboard, go to **Authentication > Settings**
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**: `http://localhost:3000/**`
4. Set **Enable Email Confirmations** to: `false` (for testing)

### 3. Test the Authentication
1. Go to http://localhost:3000
2. Try signing up with a new account
3. Check the browser console for any errors

## What I Fixed

### ✅ **SignUpPage.tsx**
- Fixed the `signUp` function call to pass correct parameters
- Updated metadata structure to match Supabase expectations

### ✅ **AuthContext.tsx**
- Added better error handling and logging
- Improved fallback to local authentication
- Added console logs to debug issues

### ✅ **Configuration**
- Updated Supabase URL and API key
- Added proper error handling

## Current Status
- 🔄 **Supabase Connection**: Should work after schema setup
- ✅ **Local Fallback**: Available if Supabase fails
- ✅ **Error Handling**: Better logging and fallback
- ✅ **Parameter Fix**: Correct signup function call

## If Still Having Issues
1. Check browser console for detailed error messages
2. The app will automatically fall back to local authentication
3. Local auth stores users in browser localStorage (no server needed)

## Next Steps
1. Run the SQL schema in Supabase
2. Configure authentication settings
3. Test signup/login
4. The app will work with either Supabase or local auth


