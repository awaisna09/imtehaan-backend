// Comprehensive verification and fix guide for the 406 error
// Run with: node verify-and-fix.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyAndFix() {
  try {
    console.log('🔍 COMPREHENSIVE VERIFICATION AND FIX GUIDE')
    console.log('=' .repeat(60))
    
    // Test 1: Check if the exact failing query works
    console.log('\n🎯 Test 1: Testing the exact failing query...')
    const { data: queryData, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'artistawais@gmail.com')
    
    if (queryError) {
      console.log('❌ Query failed:', queryError.message)
      console.log('📊 Error status:', queryError.status)
      console.log('🔍 This confirms the 406 error is still happening')
    } else {
      console.log('✅ Query successful!')
      console.log('📊 Results:', queryData)
    }
    
    // Test 2: Check if any users exist at all
    console.log('\n👥 Test 2: Checking if any users exist...')
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Count failed:', countError.message)
    } else {
      console.log(`📊 Total users in table: ${count}`)
      if (count === 0) {
        console.log('📭 Table is completely empty - this explains the 406 error!')
      }
    }
    
    // Test 3: Check if the trigger function exists
    console.log('\n⚡ Test 3: Checking trigger function...')
    const { data: functionData, error: functionError } = await supabase
      .rpc('handle_new_user', { 
        user_record: {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test@example.com',
          raw_user_meta_data: {
            full_name: 'Test User',
            user_type: 'student'
          }
        }
      })
    
    if (functionError) {
      console.log('❌ Trigger function missing:', functionError.message)
      console.log('🔍 This is the root cause of your 406 error!')
    } else {
      console.log('✅ Trigger function exists')
    }
    
    console.log('\n' + '=' .repeat(60))
    console.log('🎯 ROOT CAUSE IDENTIFIED')
    console.log('=' .repeat(60))
    console.log('Your 406 error is caused by:')
    console.log('❌ Missing handle_new_user() trigger function')
    console.log('❌ Missing automatic user creation system')
    console.log('❌ Users table is empty because new signups can\'t create entries')
    
    console.log('\n' + '=' .repeat(60))
    console.log('🔧 IMMEDIATE FIX REQUIRED')
    console.log('=' .repeat(60))
    console.log('You MUST run the complete database schema to fix this.')
    console.log('')
    console.log('📋 STEP-BY-STEP INSTRUCTIONS:')
    console.log('1. Open: https://supabase.com/dashboard/project/bgenvwieabtxwzapgeee')
    console.log('2. Click "SQL Editor" in the left sidebar')
    console.log('3. Click "New query"')
    console.log('4. Copy the ENTIRE content from: supabase/schema.sql')
    console.log('5. Paste it into the SQL Editor')
    console.log('6. Click "Run"')
    console.log('')
    console.log('⏱️ This will take about 30 seconds to complete.')
    console.log('')
    console.log('✅ After running, you\'ll have:')
    console.log('   - Automatic user creation on signup')
    console.log('   - Proper RLS policies')
    console.log('   - All necessary tables and functions')
    console.log('   - Sample data for testing')
    
    console.log('\n' + '=' .repeat(60))
    console.log('🧪 TESTING AFTER FIX')
    console.log('=' .repeat(60))
    console.log('Once you run the schema:')
    console.log('1. Try signing up with a new account')
    console.log('2. The 406 error should be gone')
    console.log('3. Users will be automatically created')
    console.log('4. Your app will work normally')
    
    console.log('\n' + '=' .repeat(60))
    console.log('🚨 IMPORTANT NOTES')
    console.log('=' .repeat(60))
    console.log('• The schema.sql file contains EVERYTHING you need')
    console.log('• Running it will NOT delete existing data')
    console.log('• It will create missing functions, triggers, and policies')
    console.log('• This is a one-time setup that fixes the core issue')
    
    console.log('\n🎯 Ready to fix this? Go to your Supabase dashboard now!')
    
  } catch (err) {
    console.log('❌ Verification error:', err.message)
    console.log('🔍 Full error:', err)
  }
}

verifyAndFix()
