// Test script for Supabase signup
// Run with: node test-signup.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aHRjbHhhYmlyYW93ZXJmbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDY2MjksImV4cCI6MjA1NjI4MjYyOX0.jwnn4sR78xx08p-8V8d-gSU9EHCjPPnT376Vt9KDO3Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
  try {
    console.log('🔐 Testing Supabase Signup...')
    
    // Test 1: Check if users table structure is correct
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
      console.log('💡 This suggests the database schema needs to be set up')
      return
    } else {
      console.log('✅ Users table structure is correct')
    }
    
    // Test 2: Check if auth is properly configured
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ Auth error:', userError.message)
    } else {
      console.log('✅ Auth is properly configured')
      console.log('👤 Current user:', user ? user.email : 'No user logged in')
    }
    
    // Test 3: Try a simple signup (this will fail but show us the exact error)
    console.log('🧪 Testing signup process...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })
    
    if (error) {
      console.log('❌ Signup error:', error.message)
      console.log('🔍 Error details:', error)
    } else {
      console.log('✅ Signup successful!')
      console.log('📧 User email:', data.user?.email)
      
      // Clean up - delete the test user
      if (data.user) {
        await supabase.auth.admin.deleteUser(data.user.id)
        console.log('🧹 Test user cleaned up')
      }
    }
    
  } catch (err) {
    console.log('❌ Test error:', err.message)
  }
}

testSignup() 