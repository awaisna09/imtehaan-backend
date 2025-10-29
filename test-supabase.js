// Simple test script to verify Supabase connection
// Run with: node test-supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aHRjbHhhYmlyYW93ZXJmbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDY2MjksImV4cCI6MjA1NjI4MjYyOX0.jwnn4sR78xx08p-8V8d-gSU9EHCjPPnT376Vt9KDO3Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('questions').select('count').limit(1)
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Database is accessible')
    
  } catch (err) {
    console.log('❌ Connection error:', err.message)
  }
}

testConnection() 