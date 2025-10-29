// Test the complete trigger system
// Run with: node test-trigger-system.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTriggerSystem() {
  try {
    console.log('🧪 TESTING COMPLETE TRIGGER SYSTEM')
    console.log('=' .repeat(50))
    
    // Test 1: Check if function exists
    console.log('\n📋 Test 1: Checking handle_new_user function...')
    try {
      const { data, error } = await supabase
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
      
      if (error) {
        console.log('❌ Function call failed:', error.message)
        console.log('🔍 The handle_new_user function is missing!')
      } else {
        console.log('✅ Function exists and works!')
        console.log('📊 Result:', data)
      }
    } catch (err) {
      console.log('❌ Function test error:', err.message)
    }
    
    // Test 2: Check current users count
    console.log('\n👥 Test 2: Current users in table...')
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Count failed:', countError.message)
    } else {
      console.log(`📊 Total users: ${count}`)
    }
    
    // Test 3: Try to create a test user manually
    console.log('\n➕ Test 3: Testing manual user creation...')
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        full_name: 'Test User',
        user_type: 'student',
        curriculum: 'igcse',
        grade: 'Year 10'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Manual insert failed:', insertError.message)
      console.log('🔍 This suggests RLS policies are blocking inserts')
    } else {
      console.log('✅ Manual insert successful!')
      console.log('📊 Inserted user:', insertData)
      
      // Clean up - delete the test user
      await supabase
        .from('users')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000')
      console.log('🧹 Test user cleaned up')
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('🎯 DIAGNOSIS')
    console.log('=' .repeat(50))
    
    if (count === 0) {
      console.log('❌ Users table is empty')
      console.log('❌ handle_new_user function is missing')
      console.log('❌ Automatic user creation is not working')
      console.log('')
      console.log('🔧 SOLUTION:')
      console.log('You need to run the complete schema.sql script')
      console.log('This will create the missing handle_new_user function')
      console.log('')
      console.log('📋 Next steps:')
      console.log('1. Go to Supabase dashboard')
      console.log('2. Open SQL Editor')
      console.log('3. Run the COMPLETE schema.sql script')
      console.log('4. This will create the function AND ensure triggers work')
    } else {
      console.log('✅ Users table has data')
      console.log('✅ Basic functionality is working')
    }
    
  } catch (err) {
    console.log('❌ Test error:', err.message)
  }
}

testTriggerSystem()
