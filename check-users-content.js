// Check what users exist in the table and examine structure
// Run with: node check-users-content.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsersContent() {
  try {
    console.log('🔍 Checking Users Table Content...')
    
    // Check 1: Count total users
    console.log('\n📊 Check 1: Counting total users...')
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Count failed:', countError.message)
    } else {
      console.log(`✅ Total users in table: ${count}`)
    }
    
    // Check 2: Get all users (if any exist)
    console.log('\n👥 Check 2: Getting all users...')
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*')
      .limit(10)
    
    if (allUsersError) {
      console.log('❌ Get users failed:', allUsersError.message)
    } else {
      if (allUsers && allUsers.length > 0) {
        console.log('✅ Users found:')
        allUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ID: ${user.id}`)
          console.log(`     Email: ${user.email}`)
          console.log(`     Name: ${user.full_name}`)
          console.log(`     Type: ${user.user_type}`)
          console.log('')
        })
      } else {
        console.log('📭 No users found in the table')
      }
    }
    
    // Check 3: Test with a different email
    console.log('\n🧪 Check 3: Testing with different email...')
    const { data: testUser, error: testError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'test@example.com')
    
    if (testError) {
      console.log('❌ Test query failed:', testError.message)
    } else {
      console.log('✅ Test query successful, results:', testUser)
    }
    
    // Check 4: Look at table structure by trying to insert a test user
    console.log('\n🔧 Check 4: Testing table structure...')
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'structure-test@example.com',
        full_name: 'Structure Test User',
        user_type: 'student'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message)
      console.log('🔍 This tells us about table structure issues')
    } else {
      console.log('✅ Insert successful:', insertData)
      
      // Clean up - delete the test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', testUserId)
      
      if (deleteError) {
        console.log('⚠️ Could not delete test user:', deleteError.message)
      } else {
        console.log('🧹 Test user cleaned up')
      }
    }
    
    console.log('\n🎯 ANALYSIS:')
    if (count === 0) {
      console.log('📭 Your users table is empty - no users have been created yet')
      console.log('🔧 This explains why queries return empty results')
      console.log('💡 You need to create a user first (sign up)')
    } else {
      console.log('👥 Users exist in the table')
      console.log('🔍 The 406 error might be coming from your app logic, not the database')
    }
    
  } catch (err) {
    console.log('❌ Check error:', err.message)
    console.log('🔍 Full error:', err)
  }
}

checkUsersContent()
