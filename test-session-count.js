// Test script to verify session count functionality
// Run this script to test if daily statistics and session count are working properly

import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSessionCount() {
  console.log('🧪 Testing Session Count Functionality');
  console.log('=====================================');

  try {
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ No authenticated user found');
      return;
    }

    console.log(`✅ Testing for user: ${user.id}`);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Testing for date: ${today}`);

    // Check current daily analytics
    const { data: currentData, error: fetchError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching daily analytics:', fetchError);
      return;
    }

    if (currentData) {
      console.log('📊 Current Daily Analytics:');
      console.log(`   Session Count: ${currentData.session_count || 0}`);
      console.log(`   Total Time Spent: ${currentData.total_time_spent || 0} seconds`);
      console.log(`   Average Session Length: ${currentData.average_session_length || 0} seconds`);
      console.log(`   Total Activities: ${currentData.total_activities || 0}`);
      console.log(`   Dashboard Visits: ${currentData.dashboard_visits || 0}`);
      console.log(`   AI Tutor Interactions: ${currentData.ai_tutor_interactions || 0}`);
    } else {
      console.log('📊 No daily analytics data found for today');
    }

    // Test session count calculation
    if (currentData && currentData.session_count > 0 && currentData.total_time_spent > 0) {
      const calculatedAvgSession = Math.round(currentData.total_time_spent / currentData.session_count);
      console.log(`🧮 Calculated Average Session Length: ${calculatedAvgSession} seconds`);
      
      if (currentData.average_session_length === calculatedAvgSession) {
        console.log('✅ Average session length calculation is correct');
      } else {
        console.log('⚠️  Average session length calculation mismatch');
        console.log(`   Stored: ${currentData.average_session_length}`);
        console.log(`   Calculated: ${calculatedAvgSession}`);
      }
    }

    // Check for any recent activities
    const { data: recentActivities, error: activitiesError } = await supabase
      .from('learning_activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.log('⚠️  Could not fetch recent activities:', activitiesError.message);
    } else if (recentActivities && recentActivities.length > 0) {
      console.log(`📈 Found ${recentActivities.length} recent activities`);
      
      // Count different activity types
      const activityTypes = {};
      recentActivities.forEach(activity => {
        activityTypes[activity.activity_type] = (activityTypes[activity.activity_type] || 0) + 1;
      });
      
      console.log('📊 Recent Activity Types:');
      Object.entries(activityTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    } else {
      console.log('📈 No recent activities found');
    }

    console.log('\n🎯 Recommendations:');
    console.log('1. Navigate to different pages to test session tracking');
    console.log('2. Start lessons or practice sessions to increment session count');
    console.log('3. Use the AI tutor to test interaction tracking');
    console.log('4. Check the analytics dashboard after activities');

  } catch (error) {
    console.error('❌ Error during session count test:', error);
  }
}

// Run the test
testSessionCount();
