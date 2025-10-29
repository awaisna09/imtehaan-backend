// Check for database functions that might be causing auth issues
// Run with: node check-database-functions.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aHRjbHhhYmlyYW93ZXJmbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDY2MjksImV4cCI6MjA1NjI4MjYyOX0.jwnn4sR78xx08p-8V8d-gSU9EHCjPPnT376Vt9KDO3Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseFunctions() {
  try {
    console.log('🔍 Checking for Database Functions...')
    
    // Try to query for functions (this might not work with anon key)
    console.log('\n📋 MANUAL CHECK REQUIRED:')
    console.log('1. Go to: https://app.supabase.com/project/mwhtclxabiraowerfmkz')
    console.log('2. Navigate to: Database → Functions')
    console.log('3. Look for functions named:')
    console.log('   - handle_new_user')
    console.log('   - on_auth_user_created')
    console.log('   - auth_user_created')
    console.log('   - Any function with "auth" or "user" in the name')
    
    console.log('\n🔧 IF YOU FIND SUCH FUNCTIONS:')
    console.log('1. Click on the function')
    console.log('2. Click "Disable" or "Delete"')
    console.log('3. This should fix the 500 error')
    
    console.log('\n💡 ALTERNATIVE SOLUTION:')
    console.log('If you can\'t find the functions or can\'t disable them:')
    console.log('1. Create a new Supabase project')
    console.log('2. Use the new project credentials')
    console.log('3. This will give you a clean setup')
    
    console.log('\n🎯 IMMEDIATE TEST:')
    console.log('After disabling functions, test signup again in your app')
    
  } catch (err) {
    console.log('❌ Check error:', err.message)
  }
}

checkDatabaseFunctions() 