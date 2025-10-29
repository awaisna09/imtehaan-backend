// Test bypassing database trigger issues
// Run with: node test-bypass-auth.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aHRjbHhhYmlyYW93ZXJmbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDY2MjksImV4cCI6MjA1NjI4MjYyOX0.jwnn4sR78xx08p-8V8d-gSU9EHCjPPnT376Vt9KDO3Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBypassAuth() {
  try {
    console.log('🔐 Testing Bypass Authentication Methods...')
    
    // Method 1: Try signup without metadata
    console.log('\n🧪 Method 1: Signup without metadata...')
    const testEmail1 = `test1-${Date.now()}@example.com`
    const testPassword1 = 'testpassword123'
    
    const { data: data1, error: error1 } = await supabase.auth.signUp({
      email: testEmail1,
      password: testPassword1
    })
    
    if (error1) {
      console.log('❌ Method 1 failed:', error1.message)
    } else {
      console.log('✅ Method 1 successful!')
      console.log('📧 User:', data1.user?.email)
    }
    
    // Method 2: Try signup with minimal metadata
    console.log('\n🧪 Method 2: Signup with minimal metadata...')
    const testEmail2 = `test2-${Date.now()}@example.com`
    const testPassword2 = 'testpassword123'
    
    const { data: data2, error: error2 } = await supabase.auth.signUp({
      email: testEmail2,
      password: testPassword2,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })
    
    if (error2) {
      console.log('❌ Method 2 failed:', error2.message)
    } else {
      console.log('✅ Method 2 successful!')
      console.log('📧 User:', data2.user?.email)
    }
    
    // Method 3: Check if we can at least connect to auth
    console.log('\n🧪 Method 3: Test basic auth connection...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ Method 3 failed:', userError.message)
    } else {
      console.log('✅ Method 3 successful!')
      console.log('🔗 Auth connection works')
    }
    
    console.log('\n📋 RECOMMENDATIONS:')
    console.log('1. If Method 1 works: Use signup without metadata')
    console.log('2. If Method 2 works: Use minimal metadata only')
    console.log('3. If all fail: Check Supabase project settings')
    
  } catch (err) {
    console.log('❌ Test error:', err.message)
  }
}

testBypassAuth() 