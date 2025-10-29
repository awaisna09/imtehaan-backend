// Test script to verify study time tracking
// Run this in your browser console

const testStudyTimeTracking = async () => {
  console.log('🧪 Testing Study Time Tracking...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user found');
      return false;
    }

    console.log('✅ User authenticated:', user.id);

    // Get current analytics
    const { data: currentAnalytics, error: fetchError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching current analytics:', fetchError);
      return false;
    }

    const beforeTime = currentAnalytics?.total_time_spent || 0;
    console.log('📊 Current total_time_spent:', beforeTime, 'seconds');

    // Simulate some activities
    console.log('🎯 Simulating activities...');
    
    // Track page view
    autoActivityTracker.trackPageView('Test Page', '/test');
    
    // Track time spent (5 seconds)
    autoActivityTracker.trackTimeSpent('Test Page', '/test', 5000);
    
    // Track AI interaction
    autoActivityTracker.trackAIInteraction('Test query', 100, 'Test Page', '/test');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Force flush activities
    console.log('🔄 Flushing activities...');
    await autoActivityTracker.forceFlush();
    
    // Wait for database consistency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get updated analytics
    const { data: updatedAnalytics, error: updateError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (updateError) {
      console.error('❌ Error fetching updated analytics:', updateError);
      return false;
    }

    const afterTime = updatedAnalytics?.total_time_spent || 0;
    console.log('📊 Updated total_time_spent:', afterTime, 'seconds');
    
    const timeDifference = afterTime - beforeTime;
    console.log('📊 Time difference:', timeDifference, 'seconds');
    
    if (timeDifference > 0) {
      console.log('✅ Study time tracking is working!');
      console.log('📊 Activities tracked:', updatedAnalytics?.total_activities || 0);
      console.log('📊 AI interactions:', updatedAnalytics?.ai_tutor_interactions || 0);
      return true;
    } else {
      console.log('❌ Study time not updated');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Run the test
testStudyTimeTracking().then(success => {
  if (success) {
    console.log('🎉 Study time tracking test passed!');
  } else {
    console.log('❌ Study time tracking test failed.');
  }
});














