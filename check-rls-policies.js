// Check RLS policies on the users table
// Run with: node check-rls-policies.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRLSPolicies() {
  try {
    console.log('🔒 Checking RLS Policies on Users Table...')
    
    // Check 1: See if we can query the table at all
    console.log('\n📊 Check 1: Testing basic table access...')
    const { data: basicData, error: basicError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (basicError) {
      console.log('❌ Basic access failed:', basicError.message)
      console.log('🔍 This suggests RLS is blocking all access')
    } else {
      console.log('✅ Basic access works')
    }
    
    // Check 2: Try to see table structure
    console.log('\n🏗️ Check 2: Testing table structure access...')
    const { data: structureData, error: structureError } = await supabase
      .from('users')
      .select('*')
      .limit(0)
    
    if (structureError) {
      console.log('❌ Structure access failed:', structureError.message)
    } else {
      console.log('✅ Structure access works')
    }
    
    // Check 3: Test with different RLS bypass approaches
    console.log('\n🔓 Check 3: Testing RLS bypass approaches...')
    
    // Try with service role key (if available)
    console.log('  Testing with current key...')
    const { data: currentKeyData, error: currentKeyError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (currentKeyError) {
      console.log('    ❌ Current key failed:', currentKeyError.message)
    } else {
      console.log('    ✅ Current key works')
    }
    
    console.log('\n🎯 ANALYSIS:')
    console.log('The RLS error suggests your users table has security policies that are too restrictive.')
    console.log('This is preventing new users from being created.')
    
    console.log('\n📋 RECOMMENDED ACTIONS:')
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/bgenvwieabtxwzapgeee')
    console.log('2. Navigate to Authentication → Policies')
    console.log('3. Check the RLS policies on the users table')
    console.log('4. Ensure there are policies that allow:')
    console.log('   - INSERT for new user registration')
    console.log('   - SELECT for user lookup (with proper conditions)')
    console.log('   - UPDATE for user profile updates')
    
    console.log('\n🔧 ALTERNATIVE:')
    console.log('Run the complete schema.sql to ensure all policies are properly configured')
    
  } catch (err) {
    console.log('❌ RLS check error:', err.message)
    console.log('🔍 Full error:', err)
  }
}

checkRLSPolicies()
