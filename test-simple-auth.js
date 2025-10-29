// Test simplified Supabase authentication
// Run with: node test-simple-auth.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aHRjbHhhYmlyYW93ZXJmbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDY2MjksImV4cCI6MjA1NjI4MjYyOX0.jwnn4sR78xx08p-8V8d-gSU9EHCjPPnT376Vt9KDO3Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSimpleAuth() {
  try {
    console.log('🔐 Testing Simplified Supabase Authentication...')
    
    // Test 1: Check if auth is accessible
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ Auth error:', userError.message)
    } else {
      console.log('✅ Auth is accessible')
      console.log('👤 Current user:', user ? user.email : 'No user logged in')
    }
    
    // Test 2: Try a simple signup with metadata
    console.log('\n🧪 Testing signup with metadata...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          user_type: 'student',
          curriculum: 'igcse',
          grade: 'Year 10',
          newsletter_opt_in: true,
          subjects: ['Mathematics', 'Physics', 'Chemistry']
        }
      }
    })
    
    if (error) {
      console.log('❌ Signup error:', error.message)
      console.log('🔍 Error details:', error)
    } else {
      console.log('✅ Signup successful!')
      console.log('📧 User email:', data.user?.email)
      console.log('📋 User metadata:', data.user?.user_metadata)
      
      // Test 3: Try signing in with the created user
      console.log('\n🔑 Testing signin...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (signInError) {
        console.log('❌ Signin error:', signInError.message)
      } else {
        console.log('✅ Signin successful!')
        console.log('👤 Signed in user:', signInData.user?.email)
        console.log('📋 User metadata:', signInData.user?.user_metadata)
      }
      
      // Clean up - sign out
      await supabase.auth.signOut()
      console.log('🧹 Signed out test user')
    }
    
    console.log('\n🎉 Simplified auth test completed!')
    
  } catch (err) {
    console.log('❌ Test error:', err.message)
  }
}

testSimpleAuth() 