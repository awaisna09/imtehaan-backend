import { supabase } from './client';

export interface LearningActivity {
  userId: string;
  activityType: 'question' | 'flashcard' | 'lesson' | 'video_lesson' | 'mock_exam' | 'practice_session' | 'ai_tutor' | 'dashboard_visit' | 'topic_selection' | 'settings_change' | 'profile_update';
  subjectId: number;
  topicId: number;
  subjectName: string;
  topicName: string;
  timestamp: string;
  duration?: number; // in minutes
  metadata: {
    // For questions
    questionId?: string;
    isCorrect?: boolean;
    difficulty?: string;
    marks?: number;
    
    // For flashcards
    flashcardId?: string;
    reviewCount?: number;
    masteryLevel?: 'easy' | 'medium' | 'hard';
    
    // For lessons
    lessonId?: string;
    readingTime?: number;
    completionStatus?: 'started' | 'completed' | 'abandoned';
    
    // For video lessons
    videoId?: string;
    watchTime?: number;
    videoDuration?: number;
    
    // For mock exams
    examId?: string;
    totalQuestions?: number;
    correctAnswers?: number;
    score?: number;
    
    // For practice sessions
    sessionId?: string;
    questionsAnswered?: number;
    practiceCorrectAnswers?: number;
    sessionDuration?: number;
    
    // For AI tutor interactions
    aiQuery?: string;
    responseLength?: number;
    topicRelevance?: number;
    
    // For general platform usage
    pageVisited?: string;
    timeSpent?: number;
    actionType?: string;
    settingType?: string;
    oldValue?: string;
    newValue?: string;
    updateType?: string;
  };
}

export interface DailyAnalytics {
  date: string;
  userId: string;
  totalActivities: number;
  totalTimeSpent: number;
  questionsAttempted: number;
  questionsCorrect: number;
  flashcardsReviewed: number;
  flashcardsCorrect: number;
  lessonsStarted: number;
  lessonsCompleted: number;
  videoLessonsWatched: number;
  videoLessonsCompleted: number;
  mockExamsTaken: number;
  averageMockExamScore: number;
  practiceSessionsCompleted: number;
  averagePracticeScore: number;
  aiTutorInteractions: number;
  dashboardVisits: number;
  topicSelections: number;
  settingsChanges: number;
  profileUpdates: number;
  totalTopicsStudied: number;
  studyStreak: number;
  productivityScore: number;
  focusTime: number;
  breakTime: number;
  sessionCount: number;
  averageSessionLength: number;
  peakStudyHour: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
}

export interface ActivitySummary {
  totalActivities: number;
  totalTimeSpent: number;
  questionsAttempted: number;
  questionsCorrect: number;
  flashcardsReviewed: number;
  flashcardsCorrect: number;
  lessonsStarted: number;
  lessonsCompleted: number;
  videoLessonsWatched: number;
  videoLessonsCompleted: number;
  mockExamsTaken: number;
  averageMockExamScore: number;
  practiceSessionsCompleted: number;
  averagePracticeScore: number;
  totalTopicsStudied: number;
  currentStreak: number;
  longestStreak: number;
  weeklyStudyTime: number;
  monthlyStudyTime: number;
  // Daily analytics
  todayActivities: number;
  todayTimeSpent: number;
  todayQuestions: number;
  todayLessons: number;
  todayStreak: number;
}

export interface SessionTracker {
  startTime: number;
  endTime?: number;
  duration: number;
  activities: string[];
  topicId: number;
  subjectId: number;
}

export const enhancedAnalyticsTracker = {
  // Active session tracking
  activeSessions: new Map<string, SessionTracker>(),

  // Daily analytics cache
  dailyAnalyticsCache: new Map<string, DailyAnalytics>(),

  // Start tracking a learning session
  startSession(userId: string, topicId: number, subjectId: number, activityType: string): string {
    const sessionId = `session_${userId}_${Date.now()}`;
    console.log('🔍 DEBUG: startSession called with:', { userId, topicId, subjectId, activityType });
    console.log('🔍 DEBUG: Created sessionId:', sessionId);
    
    this.activeSessions.set(sessionId, {
      startTime: Date.now(),
      duration: 0,
      activities: [activityType],
      topicId,
      subjectId
    });
    
    console.log('🔍 DEBUG: Session stored, activeSessions size:', this.activeSessions.size);
    console.log('🔍 DEBUG: Active sessions:', Array.from(this.activeSessions.entries()));
    
    return sessionId;
  },

  // End tracking a learning session
  endSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.endTime = Date.now();
      session.duration = Math.floor((session.endTime - session.startTime) / 1000);
      console.log('🔍 DEBUG: Session ended:', sessionId, 'Duration:', session.duration, 'seconds');
      this.activeSessions.delete(sessionId);
    }
  },

  // Track any learning activity
  async trackActivity(activity: LearningActivity): Promise<void> {
    try {
      // Insert into learning_activities table
      const { error } = await supabase
        .from('learning_activities')
        .insert({
          user_id: activity.userId,
          activity_type: activity.activityType,
          topic_id: activity.topicId,
          subject_id: activity.subjectId,
          topic_name: activity.topicName,
          subject_name: activity.subjectName,
          duration: activity.duration || 0,
          score: activity.metadata.score || 0,
          correct_answers: activity.metadata.correctAnswers || 0,
          total_questions: activity.metadata.totalQuestions || 0,
          accuracy: activity.metadata.isCorrect ? 100 : 0,
          metadata: activity.metadata,
          created_at: activity.timestamp
        });

      if (error) {
        console.error('❌ Error tracking activity:', error);
        throw error;
      }

      // Update daily analytics
      await this.updateDailyAnalytics(activity);

      console.log('✅ Activity tracked:', activity.activityType, 'for topic:', activity.topicName);
    } catch (error) {
      console.error('❌ Error tracking activity:', error);
      throw error;
    }
  },

  // Update daily analytics for a user
  async updateDailyAnalytics(activity: LearningActivity): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `${activity.userId}_${today}`;
      
      let dailyAnalytics = this.dailyAnalyticsCache.get(cacheKey);
      
      if (!dailyAnalytics) {
        // Try to get existing daily analytics from database
        const { data: existing } = await supabase
          .from('daily_analytics')
          .select('*')
          .eq('user_id', activity.userId)
          .eq('date', today)
          .single();

        if (existing) {
          dailyAnalytics = existing as DailyAnalytics;
        } else {
          // Create new daily analytics entry
          dailyAnalytics = {
            date: today,
            userId: activity.userId,
            totalActivities: 0,
            totalTimeSpent: 0,
            questionsAttempted: 0,
            questionsCorrect: 0,
            flashcardsReviewed: 0,
            flashcardsCorrect: 0,
            lessonsStarted: 0,
            lessonsCompleted: 0,
            videoLessonsWatched: 0,
            videoLessonsCompleted: 0,
            mockExamsTaken: 0,
            averageMockExamScore: 0,
            practiceSessionsCompleted: 0,
            averagePracticeScore: 0,
            aiTutorInteractions: 0,
            dashboardVisits: 0,
            topicSelections: 0,
            settingsChanges: 0,
            profileUpdates: 0,
            totalTopicsStudied: 0,
            studyStreak: 0,
            productivityScore: 0,
            focusTime: 0,
            breakTime: 0,
            sessionCount: 0,
            averageSessionLength: 0,
            peakStudyHour: 0,
            weakAreas: [],
            strongAreas: [],
            recommendations: []
          };
        }
      }

      // Update analytics based on activity type
      dailyAnalytics.totalActivities++;
      
      // Add duration in seconds (activity.duration is already in seconds)
      const durationInSeconds = activity.duration || 0;
      if (durationInSeconds > 0) {
        dailyAnalytics.totalTimeSpent += durationInSeconds;
        console.log(`🎯 Enhanced tracker: Adding ${durationInSeconds} seconds to totalTimeSpent`);
      }

      switch (activity.activityType) {
          case 'question':
          dailyAnalytics.questionsAttempted += activity.metadata.totalQuestions || 1;
          dailyAnalytics.questionsCorrect += activity.metadata.correctAnswers || (activity.metadata.isCorrect ? 1 : 0);
            break;
          case 'flashcard':
          dailyAnalytics.flashcardsReviewed += activity.metadata.reviewCount || 1;
          dailyAnalytics.flashcardsCorrect += activity.metadata.correctAnswers || (activity.metadata.isCorrect ? 1 : 0);
            break;
          case 'lesson':
          if (activity.metadata.completionStatus === 'started') {
            dailyAnalytics.lessonsStarted++;
          } else if (activity.metadata.completionStatus === 'completed') {
            dailyAnalytics.lessonsCompleted++;
          }
            break;
          case 'video_lesson':
          dailyAnalytics.videoLessonsWatched++;
          if (activity.metadata.watchTime && activity.metadata.videoDuration) {
            if (activity.metadata.watchTime >= activity.metadata.videoDuration * 0.8) {
              dailyAnalytics.videoLessonsCompleted++;
            }
          }
            break;
          case 'mock_exam':
          dailyAnalytics.mockExamsTaken++;
          if (activity.metadata.score) {
            const currentTotal = dailyAnalytics.averageMockExamScore * (dailyAnalytics.mockExamsTaken - 1);
            dailyAnalytics.averageMockExamScore = (currentTotal + activity.metadata.score) / dailyAnalytics.mockExamsTaken;
          }
            break;
          case 'practice_session':
          dailyAnalytics.practiceSessionsCompleted++;
          if (activity.metadata.score) {
            const currentTotal = dailyAnalytics.averagePracticeScore * (dailyAnalytics.practiceSessionsCompleted - 1);
            dailyAnalytics.averagePracticeScore = (currentTotal + activity.metadata.score) / dailyAnalytics.practiceSessionsCompleted;
          }
          break;
        case 'ai_tutor':
          dailyAnalytics.aiTutorInteractions++;
          break;
        case 'dashboard_visit':
          dailyAnalytics.dashboardVisits++;
          break;
        case 'topic_selection':
          dailyAnalytics.topicSelections++;
          break;
        case 'settings_change':
          dailyAnalytics.settingsChanges++;
          break;
        case 'profile_update':
          dailyAnalytics.profileUpdates++;
            break;
        }

      // Update unique topics studied
      if (!dailyAnalytics.weakAreas.includes(activity.topicName)) {
        dailyAnalytics.weakAreas.push(activity.topicName);
      }

      // Calculate productivity score
      dailyAnalytics.productivityScore = this.calculateProductivityScore(dailyAnalytics);

      // Calculate and log accuracy for verification
      const accuracy = dailyAnalytics.questionsAttempted > 0 
        ? Math.round((dailyAnalytics.questionsCorrect / dailyAnalytics.questionsAttempted) * 100)
        : 0;
      console.log(`📊 Updated accuracy: ${dailyAnalytics.questionsCorrect}/${dailyAnalytics.questionsAttempted} = ${accuracy}%`);

      // Update cache
      this.dailyAnalyticsCache.set(cacheKey, dailyAnalytics);

      // Save to database
      await this.saveDailyAnalytics(dailyAnalytics);

    } catch (error) {
      console.error('❌ Error updating daily analytics:', error);
    }
  },

  // Save daily analytics to database
  async saveDailyAnalytics(analytics: DailyAnalytics): Promise<void> {
    try {
      const { error } = await supabase
        .from('daily_analytics')
        .upsert({
          date: analytics.date,
          user_id: analytics.userId,
          total_activities: analytics.totalActivities,
          total_time_spent: analytics.totalTimeSpent,
          questions_attempted: analytics.questionsAttempted,
          questions_correct: analytics.questionsCorrect,
          flashcards_reviewed: analytics.flashcardsReviewed,
          flashcards_correct: analytics.flashcardsCorrect,
          lessons_started: analytics.lessonsStarted,
          lessons_completed: analytics.lessonsCompleted,
          video_lessons_watched: analytics.videoLessonsWatched,
          video_lessons_completed: analytics.videoLessonsCompleted,
          mock_exams_taken: analytics.mockExamsTaken,
          average_mock_exam_score: analytics.averageMockExamScore,
          practice_sessions_completed: analytics.practiceSessionsCompleted,
          average_practice_score: analytics.averagePracticeScore,
          ai_tutor_interactions: analytics.aiTutorInteractions,
          dashboard_visits: analytics.dashboardVisits,
          topic_selections: analytics.topicSelections,
          settings_changes: analytics.settingsChanges,
          profile_updates: analytics.profileUpdates,
          total_topics_studied: analytics.totalTopicsStudied,
          study_streak: analytics.studyStreak,
          productivity_score: analytics.productivityScore,
          focus_time: analytics.focusTime,
          break_time: analytics.breakTime,
          session_count: analytics.sessionCount,
          average_session_length: analytics.averageSessionLength,
          peak_study_hour: analytics.peakStudyHour,
          weak_areas: analytics.weakAreas,
          strong_areas: analytics.strongAreas,
          recommendations: analytics.recommendations
        }, {
          onConflict: 'date,user_id'
        });

      if (error) {
        console.error('❌ Error saving daily analytics:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Error saving daily analytics:', error);
    }
  },

  // Calculate productivity score with improved algorithm
  calculateProductivityScore(analytics: DailyAnalytics): number {
    let score = 0;
    
    // Quality over quantity approach
    const activityWeight = {
      questions: 3,
      lessons: 4,
      videoLessons: 3,
      flashcards: 2,
      mockExams: 5,
      practiceSessions: 3
    };
    
    // Weighted activity score
    score += (analytics.questionsAttempted * activityWeight.questions);
    score += (analytics.lessonsCompleted * activityWeight.lessons);
    score += (analytics.videoLessonsCompleted * activityWeight.videoLessons);
    score += (analytics.flashcardsReviewed * activityWeight.flashcards);
    score += (analytics.mockExamsTaken * activityWeight.mockExams);
    score += (analytics.practiceSessionsCompleted * activityWeight.practiceSessions);
    
    // Accuracy multiplier (0.5 to 1.5)
    if (analytics.questionsAttempted > 0) {
      const accuracy = (analytics.questionsCorrect / analytics.questionsAttempted);
      score *= (0.5 + accuracy); // 0.5 base + accuracy bonus
    }
    
    // Time efficiency bonus (activities per hour)
    if (analytics.totalTimeSpent > 0) {
      const hoursSpent = analytics.totalTimeSpent / 3600; // Convert to hours
      const activitiesPerHour = analytics.totalActivities / hoursSpent;
      score += Math.min(activitiesPerHour * 2, 20); // Cap at 20 bonus points
    }
    
    // Consistency bonus (streak)
    score += Math.min(analytics.studyStreak * 1.5, 15); // Cap at 15 bonus points
    
    // Normalize to 0-100 scale
    const maxPossibleScore = 100; // Estimated maximum
    const normalizedScore = Math.min(Math.round((score / maxPossibleScore) * 100), 100);
    
    return Math.max(normalizedScore, 0);
  },

  // Get daily analytics for a user
  async getDailyAnalytics(userId: string, date?: string): Promise<DailyAnalytics | null> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const cacheKey = `${userId}_${targetDate}`;
      
      // Check cache first
      if (this.dailyAnalyticsCache.has(cacheKey)) {
        return this.dailyAnalyticsCache.get(cacheKey)!;
      }

      // Get from database
      const { data, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', targetDate)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, return null
          return null;
        }
        throw error;
      }

      // Cache the result
      this.dailyAnalyticsCache.set(cacheKey, data as DailyAnalytics);
      
      return data as DailyAnalytics;
    } catch (error) {
      console.error('❌ Error getting daily analytics:', error);
      return null;
    }
  },

  // Get weekly analytics for a user
  async getWeeklyAnalytics(userId: string): Promise<DailyAnalytics[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return (data || []) as DailyAnalytics[];
    } catch (error) {
      console.error('❌ Error getting weekly analytics:', error);
      return [];
    }
  },

  // Get monthly analytics for a user
  async getMonthlyAnalytics(userId: string): Promise<DailyAnalytics[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return (data || []) as DailyAnalytics[];
    } catch (error) {
      console.error('❌ Error getting monthly analytics:', error);
      return [];
    }
  },

  // Reset daily analytics (called at midnight)
  async resetDailyAnalytics(): Promise<void> {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Archive yesterday's analytics if needed
      // This could be moved to a separate analytics archive table
      
      // Clear cache for yesterday
      for (const [key] of this.dailyAnalyticsCache) {
        if (key.includes(yesterday)) {
          this.dailyAnalyticsCache.delete(key);
        }
      }
      
      console.log('✅ Daily analytics reset completed');
    } catch (error) {
      console.error('❌ Error resetting daily analytics:', error);
    }
  },

  // Track dashboard visit
  async trackDashboardVisit(userId: string): Promise<void> {
    await this.trackActivity({
      userId,
      activityType: 'dashboard_visit',
      subjectId: 0,
      topicId: 0,
      subjectName: 'General',
      topicName: 'Dashboard',
      timestamp: new Date().toISOString(),
      metadata: {
        pageVisited: 'dashboard',
        actionType: 'view'
      }
    });
  },

  // Track topic selection
  async trackTopicSelection(userId: string, topicId: number, topicName: string, subjectName: string): Promise<void> {
    await this.trackActivity({
        userId,
      activityType: 'topic_selection',
      subjectId: 0,
      topicId,
      subjectName,
      topicName,
      timestamp: new Date().toISOString(),
      metadata: {
        pageVisited: 'topic_selection',
        actionType: 'select'
      }
    });
  },

  // Track AI tutor interaction
  async trackAITutorInteraction(userId: string, topicId: number, topicName: string, subjectName: string, query: string): Promise<void> {
    await this.trackActivity({
      userId,
      activityType: 'ai_tutor',
      subjectId: 0,
      topicId,
      subjectName,
      topicName,
      timestamp: new Date().toISOString(),
      metadata: {
        aiQuery: query,
        responseLength: query.length,
        topicRelevance: 1.0
      }
    });
  },

  // Track settings change
  async trackSettingsChange(userId: string, settingType: string, oldValue: any, newValue: any): Promise<void> {
    await this.trackActivity({
      userId,
      activityType: 'settings_change',
      subjectId: 0,
      topicId: 0,
      subjectName: 'General',
      topicName: 'Settings',
      timestamp: new Date().toISOString(),
      metadata: {
        pageVisited: 'settings',
        actionType: 'change',
        settingType: settingType,
        oldValue: JSON.stringify(oldValue),
        newValue: JSON.stringify(newValue)
      }
    });
  },

  // Track profile update
  async trackProfileUpdate(userId: string, updateType: string): Promise<void> {
    await this.trackActivity({
      userId,
      activityType: 'profile_update',
      subjectId: 0,
      topicId: 0,
      subjectName: 'General',
      topicName: 'Profile',
      timestamp: new Date().toISOString(),
      metadata: {
        pageVisited: 'profile',
        actionType: 'update',
        updateType: updateType
      }
    });
  },

  // Get comprehensive activity summary
  async getActivitySummary(userId: string): Promise<ActivitySummary> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayAnalytics = await this.getDailyAnalytics(userId, today);
      const weeklyAnalytics = await this.getWeeklyAnalytics(userId);
      const monthlyAnalytics = await this.getMonthlyAnalytics(userId);

      // Calculate totals from all periods
      const totalActivities = monthlyAnalytics.reduce((sum, day) => sum + day.totalActivities, 0);
      const totalTimeSpent = monthlyAnalytics.reduce((sum, day) => sum + day.totalTimeSpent, 0);
      const questionsAttempted = monthlyAnalytics.reduce((sum, day) => sum + day.questionsAttempted, 0);
      const questionsCorrect = monthlyAnalytics.reduce((sum, day) => sum + day.questionsCorrect, 0);
      const lessonsCompleted = monthlyAnalytics.reduce((sum, day) => sum + day.lessonsCompleted, 0);
      const videoLessonsCompleted = monthlyAnalytics.reduce((sum, day) => sum + day.videoLessonsCompleted, 0);
      const mockExamsTaken = monthlyAnalytics.reduce((sum, day) => sum + day.mockExamsTaken, 0);
      const practiceSessionsCompleted = monthlyAnalytics.reduce((sum, day) => sum + day.practiceSessionsCompleted, 0);

      // Calculate weekly and monthly study time
      const weeklyStudyTime = weeklyAnalytics.reduce((sum, day) => sum + day.totalTimeSpent, 0);
      const monthlyStudyTime = monthlyAnalytics.reduce((sum, day) => sum + day.totalTimeSpent, 0);

      // Calculate study streak
      const studyStreak = this.calculateStudyStreak(monthlyAnalytics);

      return {
        totalActivities,
        totalTimeSpent,
        questionsAttempted,
        questionsCorrect,
        flashcardsReviewed: monthlyAnalytics.reduce((sum, day) => sum + day.flashcardsReviewed, 0),
        flashcardsCorrect: monthlyAnalytics.reduce((sum, day) => sum + day.flashcardsCorrect, 0),
        lessonsStarted: monthlyAnalytics.reduce((sum, day) => sum + day.lessonsStarted, 0),
        lessonsCompleted,
        videoLessonsWatched: monthlyAnalytics.reduce((sum, day) => sum + day.videoLessonsWatched, 0),
        videoLessonsCompleted,
        mockExamsTaken,
        averageMockExamScore: mockExamsTaken > 0 ? 
          monthlyAnalytics.reduce((sum, day) => sum + (day.averageMockExamScore * day.mockExamsTaken), 0) / mockExamsTaken : 0,
        practiceSessionsCompleted,
        averagePracticeScore: practiceSessionsCompleted > 0 ?
          monthlyAnalytics.reduce((sum, day) => sum + (day.averagePracticeScore * day.practiceSessionsCompleted), 0) / practiceSessionsCompleted : 0,
        totalTopicsStudied: monthlyAnalytics.reduce((sum, day) => sum + day.totalTopicsStudied, 0),
        currentStreak: studyStreak.currentStreak,
        longestStreak: studyStreak.longestStreak,
        weeklyStudyTime,
        monthlyStudyTime,
        // Today's data
        todayActivities: todayAnalytics?.totalActivities || 0,
        todayTimeSpent: todayAnalytics?.totalTimeSpent || 0,
        todayQuestions: todayAnalytics?.questionsAttempted || 0,
        todayLessons: todayAnalytics?.lessonsCompleted || 0,
        todayStreak: todayAnalytics?.studyStreak || 0
      };
    } catch (error) {
      console.error('❌ Error getting activity summary:', error);
    return {
      totalActivities: 0,
      totalTimeSpent: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      flashcardsReviewed: 0,
      flashcardsCorrect: 0,
      lessonsStarted: 0,
      lessonsCompleted: 0,
      videoLessonsWatched: 0,
      videoLessonsCompleted: 0,
      mockExamsTaken: 0,
      averageMockExamScore: 0,
      practiceSessionsCompleted: 0,
      averagePracticeScore: 0,
      totalTopicsStudied: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyStudyTime: 0,
        monthlyStudyTime: 0,
        todayActivities: 0,
        todayTimeSpent: 0,
        todayQuestions: 0,
        todayLessons: 0,
        todayStreak: 0
      };
    }
  },

  // Calculate study streak from analytics data
  calculateStudyStreak(analytics: DailyAnalytics[]): { currentStreak: number; longestStreak: number } {
    if (analytics.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sortedAnalytics = analytics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedAnalytics.length; i++) {
      const currentDate = new Date(sortedAnalytics[i].date);
      const nextDate = i < sortedAnalytics.length - 1 ? new Date(sortedAnalytics[i + 1].date) : null;

      if (nextDate) {
        const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (dayDiff === 1 && sortedAnalytics[i].totalActivities > 0) {
          tempStreak++;
    } else {
          longestStreak = Math.max(longestStreak, tempStreak + 1);
          tempStreak = 0;
        }
    } else {
        if (sortedAnalytics[i].totalActivities > 0) {
          tempStreak++;
        }
      }

      if (i === 0) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (currentDate.toDateString() === today || currentDate.toDateString() === yesterday) {
          currentStreak = tempStreak;
        }
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  },

  // Initialize daily reset scheduler
  initializeDailyReset(): void {
    // Check if it's midnight and reset if needed
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    // Schedule reset at midnight
    setTimeout(() => {
      this.resetDailyAnalytics();
      // Schedule next reset for 24 hours later
      setInterval(() => {
        this.resetDailyAnalytics();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
    
    console.log('✅ Daily analytics reset scheduler initialized');
  },

  // Clear user cache
  async clearUserCache(userId: string): Promise<void> {
    try {
      // Clear cache entries for this user
      for (const [key] of this.dailyAnalyticsCache) {
        if (key.includes(userId)) {
          this.dailyAnalyticsCache.delete(key);
        }
      }
      console.log(`✅ Cleared cache for user: ${userId}`);
    } catch (error) {
      console.error('❌ Error clearing user cache:', error);
    }
  },

  // Track lesson
  async trackLesson(
    userId: string,
    topicId: number,
    topicName: string,
    subjectName: string,
    duration: number, // duration in minutes
    completionStatus: 'started' | 'completed' | 'abandoned' = 'completed'
  ): Promise<void> {
    await this.trackActivity({
      userId,
      activityType: 'lesson',
      subjectId: 0,
      topicId,
      subjectName,
      topicName,
      timestamp: new Date().toISOString(),
      duration: duration * 60, // Convert minutes to seconds
      metadata: {
        completionStatus,
        lessonId: `lesson_${topicId}`,
        readingTime: duration
      }
    });
  },

  // Track mock exam
  async trackMockExam(
    userId: string,
    topicId: number,
    topicName: string,
    subjectName: string,
    duration: number, // duration in minutes
    correctAnswers: number,
    totalQuestions: number,
    score: number
  ): Promise<void> {
    await this.trackActivity({
      userId,
      activityType: 'mock_exam',
      subjectId: 0,
      topicId,
      subjectName,
      topicName,
      timestamp: new Date().toISOString(),
      duration: duration * 60, // Convert minutes to seconds
      metadata: {
        correctAnswers,
        totalQuestions,
        score
      }
    });
  },

  // Track video lesson
  async trackVideoLesson(
    userId: string,
    topicId: number,
    topicName: string,
    subjectName: string,
    duration: number, // duration in minutes
    watchTime: number, // watch time in seconds
    videoDuration: number // video duration in seconds
  ): Promise<void> {
    await this.trackActivity({
      userId,
      activityType: 'video_lesson',
      subjectId: 0,
      topicId,
      subjectName,
      topicName,
      timestamp: new Date().toISOString(),
      duration: duration * 60, // Convert minutes to seconds
      metadata: {
        watchTime,
        videoDuration,
        completionStatus: watchTime >= videoDuration * 0.8 ? 'completed' : 'started'
      }
    });
  }
};

// Initialize the daily reset scheduler when the module is loaded
enhancedAnalyticsTracker.initializeDailyReset();

// Export the enhanced tracker
export default enhancedAnalyticsTracker;
