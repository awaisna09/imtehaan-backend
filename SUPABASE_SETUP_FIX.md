# 🔧 Supabase Setup Fix Guide

## 🚨 **CURRENT ISSUES IDENTIFIED**

### 1. **URL Mismatch Error (406 Status)**
- **Problem**: Your app is trying to connect to `bgenvwieabtxwzapgeee.supabase.co` but the working configuration uses `mwhtclxabiraowerfmkz.supabase.co`
- **Solution**: ✅ **FIXED** - Updated `utils/supabase/info.tsx` to use correct project

### 2. **Message Channel Closure Error**
- **Problem**: Asynchronous operations being interrupted, likely due to browser extensions or service workers
- **Solution**: This should resolve once the Supabase connection is fixed

## 🎯 **IMMEDIATE ACTIONS REQUIRED**

### Step 1: Verify Supabase Project Access
1. Go to: https://supabase.com/dashboard/project/mwhtclxabiraowerfmkz
2. Ensure you have access to this project
3. If not, contact your project administrator

### Step 2: Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables and functions

### Step 3: Configure Authentication
1. Go to **Authentication → Settings**
2. Set **Site URL**: `http://localhost:5173` (or your dev port)
3. Add **Redirect URLs**:
   - `http://localhost:5173/**`
   - `http://localhost:3000/**` (if using different port)

### Step 4: Enable Row Level Security (RLS)
1. Go to **Authentication → Policies**
2. Ensure RLS is enabled on all tables
3. The policies are already defined in the schema

## 🧪 **TESTING THE FIX**

### Test 1: Database Connection
```bash
node check-schema-setup.js
```
**Expected Result**: All tables should be accessible

### Test 2: Authentication
```bash
node test-users-table-auth.js
```
**Expected Result**: User creation and authentication should work

### Test 3: Application
1. Start your app: `npm run dev`
2. Try to sign up with a new account
3. Try to sign in with existing account
4. Check browser console for errors

## 🔍 **TROUBLESHOOTING**

### If 406 Error Persists:
1. Check browser Network tab for exact request URL
2. Verify `utils/supabase/info.tsx` has correct values
3. Clear browser cache and restart app

### If Message Channel Error Persists:
1. Disable browser extensions temporarily
2. Check if you have any service workers registered
3. Try in incognito/private browsing mode

### If Tables Don't Exist:
1. Run the schema SQL script again
2. Check Supabase dashboard → Table Editor
3. Verify you're in the correct project

## 📋 **VERIFICATION CHECKLIST**

- [ ] Supabase project URL matches `mwhtclxabiraowerfmkz.supabase.co`
- [ ] Database schema is created (check Table Editor)
- [ ] Authentication settings are configured
- [ ] RLS policies are enabled
- [ ] App can connect to Supabase (no 406 errors)
- [ ] User registration works
- [ ] User login works
- [ ] No message channel errors in console

## 🚀 **NEXT STEPS AFTER FIX**

1. **Test Complete User Flow**:
   - Sign up → Email verification → Login → Dashboard
   
2. **Verify Data Persistence**:
   - Check users table in Supabase dashboard
   - Verify user profiles are created correctly
   
3. **Test Additional Features**:
   - Study sessions
   - Chat messages
   - Flashcards
   - Practice questions

## 📞 **GETTING HELP**

If issues persist after following this guide:
1. Check Supabase project logs
2. Verify project permissions
3. Check browser console for specific error messages
4. Ensure all environment variables are set correctly

---

**Last Updated**: Current session
**Status**: Configuration fixed, schema setup required
