// Test script to verify study time and accuracy tracking
// Run this in browser console to test analytics tracking

async function testStudyTimeAndAccuracy() {
  console.log('🧪 Testing Study Time and Accuracy Tracking...');
  
  // Test 1: Track a lesson completion
  console.log('\n📚 Test 1: Tracking Lesson Completion');
  try {
    await enhancedAnalyticsTracker.trackLesson(
      'test-user-123',
      1,
      'Test Topic',
      'Business Studies',
      15, // 15 minutes
      'completed'
    );
    console.log('✅ Lesson tracking completed');
  } catch (error) {
    console.error('❌ Lesson tracking failed:', error);
  }

  // Test 2: Track question attempts
  console.log('\n❓ Test 2: Tracking Question Attempts');
  try {
    await enhancedAnalyticsTracker.trackActivity({
      userId: 'test-user-123',
      activityType: 'question',
      subjectId: 1,
      topicId: 1,
      subjectName: 'Business Studies',
      topicName: 'Test Topic',
      timestamp: new Date().toISOString(),
      duration: 300, // 5 minutes in seconds
      metadata: {
        totalQuestions: 5,
        correctAnswers: 4,
        isCorrect: true
      }
    });
    console.log('✅ Question tracking completed');
  } catch (error) {
    console.error('❌ Question tracking failed:', error);
  }

  // Test 3: Track mock exam
  console.log('\n📝 Test 3: Tracking Mock Exam');
  try {
    await enhancedAnalyticsTracker.trackMockExam(
      'test-user-123',
      1,
      'Mock Exam',
      'Business Studies',
      30, // 30 minutes
      8, // 8 correct answers
      10, // 10 total questions
      80 // 80% score
    );
    console.log('✅ Mock exam tracking completed');
  } catch (error) {
    console.error('❌ Mock exam tracking failed:', error);
  }

  // Test 4: Check analytics data
  console.log('\n📊 Test 4: Checking Analytics Data');
  try {
    const analytics = await enhancedAnalyticsTracker.getDailyAnalytics('test-user-123');
    if (analytics) {
      console.log('📈 Current Analytics:');
      console.log(`   Total Activities: ${analytics.totalActivities}`);
      console.log(`   Study Time: ${Math.round(analytics.totalTimeSpent / 60)} minutes`);
      console.log(`   Questions Attempted: ${analytics.questionsAttempted}`);
      console.log(`   Questions Correct: ${analytics.questionsCorrect}`);
      console.log(`   Accuracy: ${analytics.questionsAttempted > 0 ? Math.round((analytics.questionsCorrect / analytics.questionsAttempted) * 100) : 0}%`);
      console.log(`   Lessons Completed: ${analytics.lessonsCompleted}`);
      console.log(`   Mock Exams Taken: ${analytics.mockExamsTaken}`);
      console.log(`   Productivity Score: ${analytics.productivityScore}`);
    } else {
      console.log('❌ No analytics data found');
    }
  } catch (error) {
    console.error('❌ Failed to get analytics data:', error);
  }

  // Test 5: Test comprehensive analytics service
  console.log('\n🔄 Test 5: Testing Comprehensive Analytics Service');
  try {
    const realTimeAnalytics = await comprehensiveAnalyticsService.forceRefreshAnalytics('test-user-123');
    if (realTimeAnalytics) {
      console.log('📊 Real-time Analytics:');
      console.log(`   Today's Study Time: ${realTimeAnalytics.today.studyTimeMinutes} minutes`);
      console.log(`   Today's Accuracy: ${realTimeAnalytics.today.dailyAccuracy}%`);
      console.log(`   Today's Activities: ${realTimeAnalytics.today.totalActivities}`);
      console.log(`   Today's Questions: ${realTimeAnalytics.today.questionsAttempted} attempted, ${realTimeAnalytics.today.questionsCorrect} correct`);
    } else {
      console.log('❌ No real-time analytics data found');
    }
  } catch (error) {
    console.error('❌ Failed to get real-time analytics:', error);
  }

  console.log('\n✅ Testing completed! Check the console logs above for results.');
}

// Run the test
testStudyTimeAndAccuracy();
