// Manual test for study time tracking
// Run this in your browser console to test study time updates

const testManualStudyTime = async () => {
  console.log('🧪 Manual Study Time Test...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user found');
      return false;
    }

    console.log('✅ User authenticated:', user.id);

    // Get current analytics
    const { data: beforeAnalytics, error: fetchError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching analytics:', fetchError);
      return false;
    }

    const beforeTime = beforeAnalytics?.total_time_spent || 0;
    console.log('📊 Before - total_time_spent:', beforeTime, 'seconds');

    // Manually add 60 seconds of study time
    console.log('🕒 Adding 60 seconds of study time...');
    await comprehensiveAnalyticsService.addStudyTime(user.id, 60);

    // Wait for database consistency
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get updated analytics
    const { data: afterAnalytics, error: updateError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (updateError) {
      console.error('❌ Error fetching updated analytics:', updateError);
      return false;
    }

    const afterTime = afterAnalytics?.total_time_spent || 0;
    console.log('📊 After - total_time_spent:', afterTime, 'seconds');
    
    const timeDifference = afterTime - beforeTime;
    console.log('📊 Time difference:', timeDifference, 'seconds');
    
    if (timeDifference >= 60) {
      console.log('✅ Manual study time tracking works!');
      console.log('📊 Total activities:', afterAnalytics?.total_activities || 0);
      console.log('📊 Productivity score:', afterAnalytics?.productivity_score || 0);
      return true;
    } else {
      console.log('❌ Study time not updated correctly');
      console.log('Expected: +60 seconds, Got: +' + timeDifference + ' seconds');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Test auto-tracking
const testAutoTracking = async () => {
  console.log('🧪 Auto-Tracking Test...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user found');
      return false;
    }

    console.log('✅ User authenticated:', user.id);

    // Get current analytics
    const { data: beforeAnalytics, error: fetchError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching analytics:', fetchError);
      return false;
    }

    const beforeTime = beforeAnalytics?.total_time_spent || 0;
    const beforeActivities = beforeAnalytics?.total_activities || 0;
    console.log('📊 Before - total_time_spent:', beforeTime, 'seconds, activities:', beforeActivities);

    // Simulate auto-tracking activities
    console.log('🎯 Simulating auto-tracking activities...');
    
    // Track some activities
    autoActivityTracker.trackPageView('Test Page', '/test');
    autoActivityTracker.trackTimeSpent('Test Page', '/test', 10000); // 10 seconds
    autoActivityTracker.trackAIInteraction('Test query', 50, 'Test Page', '/test');
    
    // Force flush
    console.log('🔄 Flushing activities...');
    await autoActivityTracker.forceFlush();
    
    // Wait for database consistency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get updated analytics
    const { data: afterAnalytics, error: updateError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (updateError) {
      console.error('❌ Error fetching updated analytics:', updateError);
      return false;
    }

    const afterTime = afterAnalytics?.total_time_spent || 0;
    const afterActivities = afterAnalytics?.total_activities || 0;
    console.log('📊 After - total_time_spent:', afterTime, 'seconds, activities:', afterActivities);
    
    const timeDifference = afterTime - beforeTime;
    const activityDifference = afterActivities - beforeActivities;
    
    console.log('📊 Time difference:', timeDifference, 'seconds');
    console.log('📊 Activity difference:', activityDifference);
    
    if (timeDifference > 0 && activityDifference > 0) {
      console.log('✅ Auto-tracking works!');
      console.log('📊 AI interactions:', afterAnalytics?.ai_tutor_interactions || 0);
      return true;
    } else {
      console.log('❌ Auto-tracking not working');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Run both tests
const runAllTests = async () => {
  console.log('🚀 Running all study time tests...');
  
  const manualTest = await testManualStudyTime();
  console.log('---');
  const autoTest = await testAutoTracking();
  
  console.log('📊 Test Results:');
  console.log('Manual tracking:', manualTest ? '✅ PASS' : '❌ FAIL');
  console.log('Auto tracking:', autoTest ? '✅ PASS' : '❌ FAIL');
  
  if (manualTest && autoTest) {
    console.log('🎉 All tests passed! Study time tracking is working correctly.');
  } else {
    console.log('❌ Some tests failed. Check the logs above for details.');
  }
};

// Export functions for manual testing
window.testManualStudyTime = testManualStudyTime;
window.testAutoTracking = testAutoTracking;
window.runAllTests = runAllTests;

console.log('🧪 Study time test functions loaded!');
console.log('Run: testManualStudyTime() - Test manual study time addition');
console.log('Run: testAutoTracking() - Test automatic activity tracking');
console.log('Run: runAllTests() - Run both tests');














