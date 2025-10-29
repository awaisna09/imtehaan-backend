// Test authentication with users table
// Run with: node test-users-table-auth.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aHRjbHhhYmlyYW93ZXJmbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDY2MjksImV4cCI6MjA1NjI4MjYyOX0.jwnn4sR78xx08p-8V8d-gSU9EHCjPPnT376Vt9KDO3Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUsersTableAuth() {
  try {
    console.log('🔐 Testing Authentication with Users Table...')
    
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    const testName = 'Test User'
    
    console.log('📧 Email:', testEmail)
    console.log('🔑 Password:', testPassword)
    console.log('👤 Name:', testName)
    
    // Test signup with metadata for users table
    const metadata = {
      user_type: 'student',
      curriculum: 'igcse',
      grade: 'Year 10',
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      preferences: {
        language: 'en',
        notifications: true,
        darkMode: false,
        theme: 'light',
        autoPlayFlashcards: true,
        showHints: true,
        soundEffects: true,
        studyReminders: true,
        dailyGoal: 60
      }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
          user_type: metadata.user_type,
          curriculum: metadata.curriculum,
          grade: metadata.grade,
          subjects: metadata.subjects,
          preferences: metadata.preferences
        }
      }
    })
    
    if (error) {
      console.log('❌ Signup failed:', error.message)
      console.log('🔍 Error details:', error)
    } else {
      console.log('✅ Signup successful!')
      console.log('📧 User email:', data.user?.email)
      console.log('🆔 User ID:', data.user?.id)
      console.log('📋 User metadata:', data.user?.user_metadata)
      
      // Test loading user from users table
      console.log('\n📊 Testing users table access...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single()
      
      if (userError) {
        console.log('❌ Users table access failed:', userError.message)
      } else {
        console.log('✅ Users table access successful!')
        console.log('👤 User profile:', userData)
      }
      
      // Test signin
      console.log('\n🔑 Testing signin...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (signInError) {
        console.log('❌ Signin failed:', signInError.message)
      } else {
        console.log('✅ Signin successful!')
        console.log('👤 Signed in user:', signInData.user?.email)
      }
      
      // Clean up
      await supabase.auth.signOut()
      console.log('🧹 Signed out test user')
    }
    
  } catch (err) {
    console.log('❌ Test error:', err.message)
  }
}

testUsersTableAuth() 