// Verify database schema setup
// Run with: node verify-schema.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aHRjbHhhYmlyYW93ZXJmbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDY2MjksImV4cCI6MjA1NjI4MjYyOX0.jwnn4sR78xx08p-8V8d-gSU9EHCjPPnT376Vt9KDO3Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySchema() {
  try {
    console.log('🔍 Verifying database schema...')
    
    // Check if all required tables exist
    const tables = ['users', 'questions', 'study_sessions', 'chat_messages', 'study_plans', 'flashcards', 'achievements']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}' error:`, error.message)
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`)
      }
    }
    
    // Check if the user creation trigger exists
    console.log('\n🔧 Checking for user creation trigger...')
    const { data: triggerData, error: triggerError } = await supabase
      .rpc('check_trigger_exists', { trigger_name: 'on_auth_user_created' })
      .catch(() => ({ data: null, error: { message: 'Trigger check failed' } }))
    
    if (triggerError) {
      console.log('❌ User creation trigger may not be set up properly')
      console.log('💡 You need to run the schema.sql file in your Supabase SQL Editor')
    } else {
      console.log('✅ User creation trigger appears to be set up')
    }
    
    console.log('\n📋 NEXT STEPS:')
    console.log('1. Go to https://app.supabase.com/project/mwhtclxabiraowerfmkz')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the content from supabase/schema.sql')
    console.log('4. Click "Run" to execute the schema')
    console.log('5. Test signup again')
    
  } catch (err) {
    console.log('❌ Verification error:', err.message)
  }
}

verifySchema() 