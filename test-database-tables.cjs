const { createClient } = require('@supabase/supabase-js');

// Using the Supabase credentials from info.tsx
const supabaseUrl = "https://bgenvwieabtxwzapgeee.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE";

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  // Check if learning_activities table exists and has data
  try {
    const { data: learningActivities, error: learningError } = await supabase
      .from('learning_activities')
      .select('*')
      .limit(5);
    
    if (learningError) {
      console.log('❌ learning_activities table error:', learningError.message);
    } else {
      console.log('✅ learning_activities table exists');
      console.log('📊 Sample learning activities:', learningActivities?.length || 0);
      if (learningActivities && learningActivities.length > 0) {
        console.log('   Sample:', learningActivities[0]);
      }
    }
  } catch (err) {
    console.log('❌ learning_activities table not found or error:', err.message);
  }

  // Check if page_sessions table exists and has data
  try {
    const { data: pageSessions, error: pageError } = await supabase
      .from('page_sessions')
      .select('*')
      .limit(5);
    
    if (pageError) {
      console.log('❌ page_sessions table error:', pageError.message);
    } else {
      console.log('✅ page_sessions table exists');
      console.log('📊 Sample page sessions:', pageSessions?.length || 0);
      if (pageSessions && pageSessions.length > 0) {
        console.log('   Sample:', pageSessions[0]);
      }
    }
  } catch (err) {
    console.log('❌ page_sessions table not found or error:', err.message);
  }

  // Check if daily_analytics table exists and has data
  try {
    const { data: dailyAnalytics, error: dailyError } = await supabase
      .from('daily_analytics')
      .select('*')
      .limit(5);
    
    if (dailyError) {
      console.log('❌ daily_analytics table error:', dailyError.message);
    } else {
      console.log('✅ daily_analytics table exists');
      console.log('📊 Sample daily analytics:', dailyAnalytics?.length || 0);
      if (dailyAnalytics && dailyAnalytics.length > 0) {
        console.log('   Sample:', dailyAnalytics[0]);
      }
    }
  } catch (err) {
    console.log('❌ daily_analytics table not found or error:', err.message);
  }

  // Check if topics table exists
  try {
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(3);
    
    if (topicsError) {
      console.log('❌ topics table error:', topicsError.message);
    } else {
      console.log('✅ topics table exists');
      console.log('📊 Sample topics:', topics?.length || 0);
      if (topics && topics.length > 0) {
        console.log('   Sample:', topics[0]);
      }
    }
  } catch (err) {
    console.log('❌ topics table not found or error:', err.message);
  }
}

checkTables();
