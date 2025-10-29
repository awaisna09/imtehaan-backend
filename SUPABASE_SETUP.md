# Supabase Setup Guide

## Current Configuration
Your Supabase project is now configured with:
- **Project URL**: `https://bgenvwieabtxwzapgeee.supabase.co`
- **Project ID**: `bgenvwieabtxwzapgeee`

## Setup Steps

### 1. Database Schema Setup
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/bgenvwieabtxwzapgeee
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql` into the editor
4. Click **Run** to create all the necessary tables and functions

### 2. Authentication Setup
1. Go to **Authentication > Settings** in your Supabase dashboard
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: `http://localhost:3000/**`
   - **Enable Email Confirmations**: Optional (set to false for testing)

### 3. Row Level Security (RLS)
The schema includes RLS policies. Make sure to enable RLS on all tables:
1. Go to **Authentication > Policies**
2. Enable RLS on all tables
3. The policies are already defined in the schema

### 4. Environment Variables (Optional)
For production, you can set environment variables:
```env
VITE_SUPABASE_URL=https://bgenvwieabtxwzapgeee.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Testing Authentication

### Local Fallback
If Supabase is not configured, the app will use local authentication:
- Users are stored in browser localStorage
- No server-side persistence
- Perfect for development and testing

### Supabase Authentication
Once configured, the app will use Supabase for:
- User registration and login
- Data persistence
- Real-time features
- Row-level security

## Current Status
✅ **Project URL**: Configured  
✅ **Public Anon Key**: Configured  
⏳ **Database Schema**: Needs to be run  
⏳ **Authentication Settings**: Needs to be configured  

## Next Steps
1. Run the database schema in Supabase SQL Editor
2. Configure authentication settings
3. Test the signup/login functionality
4. The app will automatically use Supabase once properly configured 