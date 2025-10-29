// Check if database schema is properly set up
// Run with: node check-schema-setup.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchemaSetup() {
  try {
    console.log('🔍 Checking Database Schema Setup...')
    
    // Check if users table exists
    console.log('\n📊 Checking users table...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
      console.log('🔧 SOLUTION: Run the schema.sql in your Supabase SQL Editor')
    } else {
      console.log('✅ Users table exists and is accessible')
    }
    
    // Check if questions table exists
    console.log('\n📝 Checking questions table...')
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(1)
    
    if (questionsError) {
      console.log('❌ Questions table error:', questionsError.message)
    } else {
      console.log('✅ Questions table exists and is accessible')
    }
    
    // Check if study_sessions table exists
    console.log('\n📚 Checking study_sessions table...')
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('*')
      .limit(1)
    
    if (sessionsError) {
      console.log('❌ Study sessions table error:', sessionsError.message)
    } else {
      console.log('✅ Study sessions table exists and is accessible')
    }
    
    // Check if chat_messages table exists
    console.log('\n💬 Checking chat_messages table...')
    const { data: chatData, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1)
    
    if (chatError) {
      console.log('❌ Chat messages table error:', chatError.message)
    } else {
      console.log('✅ Chat messages table exists and is accessible')
    }
    
    console.log('\n🎯 SUMMARY:')
    console.log('If you see errors above, you need to set up your database schema.')
    console.log('\n📋 TO SET UP SCHEMA:')
    console.log('1. Go to: https://supabase.com/dashboard/project/bgenvwieabtxwzapgeee')
    console.log('2. Navigate to: SQL Editor')
    console.log('3. Copy the content from: supabase/schema.sql')
    console.log('4. Paste and run the SQL script')
    console.log('5. This will create all tables and the trigger')
    
  } catch (err) {
    console.log('❌ Test error:', err.message)
    console.log('🔧 SOLUTION: Check your internet connection and Supabase project access')
  }
}

checkSchemaSetup() 