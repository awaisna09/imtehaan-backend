// Check if the handle_new_user trigger function exists and is working
// Run with: node check-trigger-function.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTriggerFunction() {
  try {
    console.log('🔍 Checking handle_new_user Trigger Function...')
    
    // Check 1: See if the function exists
    console.log('\n📋 Check 1: Testing if function exists...')
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
      console.log('❌ Function call failed:', functionError.message)
      console.log('🔍 This suggests the function either:')
      console.log('   - Doesn\'t exist')
      console.log('   - Has syntax errors')
      console.log('   - Is not accessible')
    } else {
      console.log('✅ Function exists and is callable')
      console.log('📊 Function result:', functionData)
    }
    
    // Check 2: Look at auth.users table to see if any users exist there
    console.log('\n🔐 Check 2: Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .limit(5)
    
    if (authError) {
      console.log('❌ Auth users query failed:', authError.message)
      console.log('🔍 This is expected - auth.users is not directly accessible via client')
    } else {
      console.log('✅ Auth users accessible (unexpected)')
      console.log('📊 Auth users:', authUsers)
    }
    
    // Check 3: Check if there are any triggers on the users table
    console.log('\n⚡ Check 3: Checking for triggers...')
    const { data: triggerData, error: triggerError } = await supabase
      .rpc('get_table_triggers', { table_name: 'users' })
      .single()
    
    if (triggerError) {
      console.log('❌ Trigger check failed:', triggerError.message)
      console.log('🔍 This is expected if the function doesn\'t exist')
    } else {
      console.log('✅ Trigger info:', triggerData)
    }
    
    // Check 4: Try to see the actual trigger definition
    console.log('\n📖 Check 4: Checking trigger definition...')
    const { data: definitionData, error: definitionError } = await supabase
      .rpc('get_trigger_definition', { trigger_name: 'on_auth_user_created' })
      .single()
    
    if (definitionError) {
      console.log('❌ Trigger definition check failed:', definitionError.message)
      console.log('🔍 This is expected if the function doesn\'t exist')
    } else {
      console.log('✅ Trigger definition:', definitionData)
    }
    
    console.log('\n🎯 ANALYSIS:')
    console.log('The issue is likely that the handle_new_user trigger function is missing or broken.')
    console.log('This function should automatically create users in the public.users table when they sign up.')
    
    console.log('\n📋 IMMEDIATE ACTIONS NEEDED:')
    console.log('1. Go to: https://supabase.com/dashboard/project/bgenvwieabtxwzapgeee')
    console.log('2. Navigate to: SQL Editor')
    console.log('3. Run the complete schema.sql script to create:')
    console.log('   - The handle_new_user function')
    console.log('   - The trigger on auth.users')
    console.log('   - Proper RLS policies')
    
    console.log('\n🔧 ALTERNATIVE:')
    console.log('Check if the trigger exists in: Database → Functions → handle_new_user')
    
  } catch (err) {
    console.log('❌ Trigger check error:', err.message)
    console.log('🔍 Full error:', err)
  }
}

checkTriggerFunction()
