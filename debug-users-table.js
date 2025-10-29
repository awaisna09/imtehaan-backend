// Debug script to examine users table structure and content
// Run with: node debug-users-table.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUsersTable() {
  try {
    console.log('🔍 Debugging Users Table Structure...')
    
    // Test 1: Check table structure
    console.log('\n📊 Test 1: Checking table structure...')
    const { data: structureData, error: structureError } = await supabase
      .from('users')
      .select('*')
      .limit(0) // This should return column info without data
    
    if (structureError) {
      console.log('❌ Structure check failed:', structureError.message)
      console.log('🔍 Error details:', structureError)
    } else {
      console.log('✅ Table structure accessible')
    }
    
    // Test 2: Try to get column information
    console.log('\n📋 Test 2: Getting column information...')
    const { data: columnsData, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' })
      .single()
    
    if (columnsError) {
      console.log('❌ Column info failed:', columnsError.message)
      console.log('🔍 This is expected if the function doesn\'t exist')
    } else {
      console.log('✅ Column info:', columnsData)
    }
    
    // Test 3: Try the exact query that's failing
    console.log('\n🎯 Test 3: Testing the failing query...')
    const { data: queryData, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'artistawais@gmail.com')
    
    if (queryError) {
      console.log('❌ Query failed:', queryError.message)
      console.log('🔍 Error details:', queryError)
      console.log('📊 Error status:', queryError.status)
      console.log('📋 Error hint:', queryError.hint)
    } else {
      console.log('✅ Query successful!')
      console.log('📊 Results:', queryData)
    }
    
    // Test 4: Check if email column exists and has data
    console.log('\n📧 Test 4: Checking email column...')
    const { data: emailData, error: emailError } = await supabase
      .from('users')
      .select('email')
      .limit(5)
    
    if (emailError) {
      console.log('❌ Email column check failed:', emailError.message)
    } else {
      console.log('✅ Email column accessible')
      console.log('📊 Sample emails:', emailData)
    }
    
    // Test 5: Check RLS policies
    console.log('\n🔒 Test 5: Checking RLS status...')
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_policies', { table_name: 'users' })
      .single()
    
    if (rlsError) {
      console.log('❌ RLS check failed:', rlsError.message)
      console.log('🔍 This is expected if the function doesn\'t exist')
    } else {
      console.log('✅ RLS info:', rlsData)
    }
    
    console.log('\n🎯 SUMMARY:')
    console.log('The 406 error suggests a table structure or permission issue.')
    console.log('Check the error details above to identify the specific problem.')
    
  } catch (err) {
    console.log('❌ Debug error:', err.message)
    console.log('🔍 Full error:', err)
  }
}

debugUsersTable()
