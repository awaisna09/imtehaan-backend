// Test script to verify analytics system works
// Run this in your browser console or as a Node.js script

const testAnalytics = async () => {
  console.log('🧪 Testing Analytics System...');
  
  try {
    // Test 1: Check if daily_analytics table exists
    console.log('📊 Test 1: Checking daily_analytics table...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('daily_analytics')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table check failed:', tableError);
      return false;
    }
    
    console.log('✅ daily_analytics table exists');
    
    // Test 2: Check if we can insert a record
    console.log('📊 Test 2: Testing record insertion...');
    
    const today = new Date().toISOString().split('T')[0];
    const testData = {
      date: today,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      total_activities: 1,
      total_time_spent: 60,
      questions_attempted: 1,
      questions_correct: 1,
      study_streak: 1,
      productivity_score: 50
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('daily_analytics')
      .upsert(testData, { onConflict: 'date,user_id' })
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return false;
    }
    
    console.log('✅ Record insertion successful');
    
    // Test 3: Check if we can read the record
    console.log('📊 Test 3: Testing record retrieval...');
    
    const { data: readData, error: readError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('date', today)
      .single();
    
    if (readError) {
      console.error('❌ Read test failed:', readError);
      return false;
    }
    
    console.log('✅ Record retrieval successful');
    console.log('📊 Retrieved data:', readData);
    
    // Test 4: Check the view
    console.log('📊 Test 4: Testing daily_progress_summary view...');
    
    const { data: viewData, error: viewError } = await supabase
      .from('daily_progress_summary')
      .select('*')
      .eq('date', today)
      .single();
    
    if (viewError) {
      console.error('❌ View test failed:', viewError);
      return false;
    }
    
    console.log('✅ View test successful');
    console.log('📊 View data:', viewData);
    
    // Test 5: Test comprehensive analytics service
    console.log('📊 Test 5: Testing comprehensive analytics service...');
    
    try {
      const analytics = await comprehensiveAnalyticsService.getRealTimeAnalytics(
        (await supabase.auth.getUser()).data.user?.id
      );
      console.log('✅ Comprehensive analytics service works');
      console.log('📊 Analytics data:', analytics);
    } catch (serviceError) {
      console.error('❌ Service test failed:', serviceError);
      return false;
    }
    
    console.log('🎉 All tests passed! Analytics system is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
};

// Run the test
testAnalytics().then(success => {
  if (success) {
    console.log('✅ Analytics system is ready!');
  } else {
    console.log('❌ Analytics system needs fixing.');
  }
});














