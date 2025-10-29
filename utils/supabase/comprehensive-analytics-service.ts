import { supabase } from './client';
import enhancedAnalyticsTracker from './enhanced-analytics-tracker';

export interface DailyProgressData {
  date: string;
  totalActivities: number;
  totalTimeSpent: number;
  questionsAttempted: number;
  questionsCorrect: number;
  dailyAccuracy: number;
  studyStreak: number;
  productivityScore: number;
  studyTimeMinutes: number;
  sessionCount: number;
  avgSessionMinutes: number;
  lessonsCompleted: number;
  videoLessonsCompleted: number;
  flashcardsReviewed: number;
  mockExamsTaken: number;
  aiTutorInteractions: number;
  dashboardVisits: number;
  topicSelections: number;
}

export interface WeeklyProgressData {
  weekStart: string;
  weekEnd: string;
  totalActivities: number;
  totalTimeSpent: number;
  averageDailyAccuracy: number;
  studyStreak: number;
  mostProductiveDay: string;
  topicsStudied: string[];
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
}

export interface MonthlyProgressData {
  month: string;
  totalActivities: number;
  totalTimeSpent: number;
  averageDailyAccuracy: number;
  longestStreak: number;
  totalTopicsStudied: number;
  improvementRate: number;
  studyPatterns: {
    preferredStudyTime: string;
    averageSessionLength: number;
    peakStudyDays: string[];
  };
}

export interface RealTimeAnalytics {
  today: DailyProgressData;
  thisWeek: WeeklyProgressData;
  thisMonth: MonthlyProgressData;
  currentStreak: number;
  nextMilestone: string;
  focusAreas: string[];
  achievements: string[];
}

export class ComprehensiveAnalyticsService {
  private static instance: ComprehensiveAnalyticsService;
  private analyticsCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): ComprehensiveAnalyticsService {
    if (!ComprehensiveAnalyticsService.instance) {
      ComprehensiveAnalyticsService.instance = new ComprehensiveAnalyticsService();
    }
    return ComprehensiveAnalyticsService.instance;
  }

  /**
   * Get comprehensive real-time analytics for a user
   */
  async getRealTimeAnalytics(userId: string): Promise<RealTimeAnalytics> {
    try {
      const cacheKey = `realtime_${userId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const [today, thisWeek, thisMonth] = await Promise.all([
        this.getTodayProgress(userId),
        this.getWeeklyProgress(userId),
        this.getMonthlyProgress(userId)
      ]);

      const currentStreak = await this.getCurrentStreak(userId);
      const nextMilestone = this.calculateNextMilestone(today);
      const focusAreas = await this.getFocusAreas(userId);
      const achievements = await this.getRecentAchievements(userId);

      const analytics: RealTimeAnalytics = {
        today,
        thisWeek,
        thisMonth,
        currentStreak,
        nextMilestone,
        focusAreas,
        achievements
      };

      this.cacheData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error getting real-time analytics:', error);
      throw error;
    }
  }

  /**
   * Get today's progress data
   */
  async getTodayProgress(userId: string): Promise<DailyProgressData> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to get from daily analytics table first
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (dailyData && !dailyError) {
        console.log('📊 Using daily analytics data for today:', dailyData);
        console.log('📊 Raw database data - total_time_spent:', dailyData.total_time_spent);
        console.log('📊 Calculated study_time_minutes:', Math.round((dailyData.total_time_spent || 0) / 60));
        const mappedData = this.mapDailyAnalyticsToProgress(dailyData);
        console.log('📊 Mapped data - studyTimeMinutes:', mappedData.studyTimeMinutes);
        return mappedData;
      }

      // If no data in daily_analytics table, return empty progress
      // Don't fall back to enhanced tracker to ensure reset works properly
      console.log('📊 No daily analytics data found, returning empty progress');
      return this.getEmptyDailyProgress(today);
    } catch (error) {
      console.error('❌ Error getting today progress:', error);
      return this.getEmptyDailyProgress(new Date().toISOString().split('T')[0]);
    }
  }

  /**
   * Get weekly progress data
   */
  async getWeeklyProgress(userId: string): Promise<WeeklyProgressData> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: weeklyData, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      if (weeklyData && weeklyData.length > 0) {
        return this.calculateWeeklyProgress(weeklyData);
      }

      // Fallback to enhanced tracker
      const weeklyAnalytics = await enhancedAnalyticsTracker.getWeeklyAnalytics(userId);
      return this.calculateWeeklyProgress(weeklyAnalytics);
    } catch (error) {
      console.error('❌ Error getting weekly progress:', error);
      return this.getEmptyWeeklyProgress();
    }
  }

  /**
   * Get monthly progress data
   */
  async getMonthlyProgress(userId: string): Promise<MonthlyProgressData> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const { data: monthlyData, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      if (monthlyData && monthlyData.length > 0) {
        return this.calculateMonthlyProgress(monthlyData);
      }

      // Fallback to enhanced tracker
      const monthlyAnalytics = await enhancedAnalyticsTracker.getMonthlyAnalytics(userId);
      return this.calculateMonthlyProgress(monthlyAnalytics);
    } catch (error) {
      console.error('❌ Error getting monthly progress:', error);
      return this.getEmptyMonthlyProgress();
    }
  }

  /**
   * Get current study streak
   */
  async getCurrentStreak(userId: string): Promise<number> {
    try {
      const { data: streakData, error } = await supabase
        .rpc('get_user_daily_progress', { user_uuid: userId })
        .limit(30);

      if (error) throw error;

      if (streakData && streakData.length > 0) {
        return this.calculateCurrentStreak(streakData);
      }

      // Fallback to enhanced tracker
      const monthlyAnalytics = await enhancedAnalyticsTracker.getMonthlyAnalytics(userId);
      const streakInfo = enhancedAnalyticsTracker.calculateStudyStreak(monthlyAnalytics);
      return streakInfo.currentStreak;
    } catch (error) {
      console.error('❌ Error getting current streak:', error);
      return 0;
    }
  }

  /**
   * Get focus areas for improvement
   */
  async getFocusAreas(userId: string): Promise<string[]> {
    try {
      const { data: weakAreas, error } = await supabase
        .from('daily_analytics')
        .select('weak_areas')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;

      if (weakAreas && weakAreas.length > 0) {
        const allWeakAreas = weakAreas.flatMap(day => day.weak_areas || []);
        return [...new Set(allWeakAreas)].slice(0, 5);
      }

      return ['Start studying to identify weak areas'];
    } catch (error) {
      console.error('❌ Error getting focus areas:', error);
      return ['Start studying to identify weak areas'];
    }
  }

  /**
   * Get recent achievements
   */
  async getRecentAchievements(userId: string): Promise<string[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error || !todayData) return ['Complete your first activity to earn achievements'];

      const achievements: string[] = [];

      if (todayData.questions_attempted >= 10) {
        achievements.push('Question Master: Completed 10+ questions today');
      }
      if (todayData.total_time_spent >= 3600) {
        achievements.push('Study Champion: Studied for 1+ hour today');
      }
      if (todayData.lessons_completed >= 3) {
        achievements.push('Lesson Learner: Completed 3+ lessons today');
      }
      if (todayData.study_streak >= 7) {
        achievements.push('Streak Master: 7+ day study streak');
      }
      if (todayData.productivity_score >= 80) {
        achievements.push('Productivity Pro: High productivity score');
      }

      return achievements.length > 0 ? achievements : ['Keep studying to earn achievements'];
    } catch (error) {
      console.error('❌ Error getting achievements:', error);
      return ['Complete your first activity to earn achievements'];
    }
  }

  /**
   * Track platform activity
   */
  async trackPlatformActivity(
    userId: string,
    activityType: string,
    topicId: number = 0,
    topicName: string = 'General',
    subjectName: string = 'General',
    metadata: any = {}
  ): Promise<void> {
    try {
      // For platform activities, we don't need to insert into learning_activities table
      // since we're tracking everything in daily_analytics and page_sessions
      console.log(`📊 Platform activity tracked: ${activityType} for user ${userId}`);
      
      // Clear cache to ensure fresh data
      this.clearUserCache(userId);
    } catch (error) {
      console.error('❌ Error tracking platform activity:', error);
    }
  }

  /**
   * Manually add study time for a user
   */
  async addStudyTime(userId: string, timeInSeconds: number): Promise<void> {
    try {
      if (!userId || timeInSeconds <= 0) {
        console.warn('⚠️ Invalid parameters for addStudyTime');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      console.log(`🕒 Adding ${timeInSeconds} seconds of study time for user ${userId}`);

      // Get current analytics
      const { data: currentAnalytics, error: fetchError } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Initialize analytics if not exists
      let analytics = currentAnalytics || {
        date: today,
        user_id: userId,
        total_activities: 0,
        total_time_spent: 0,
        questions_attempted: 0,
        questions_correct: 0,
        flashcards_reviewed: 0,
        flashcards_correct: 0,
        lessons_started: 0,
        lessons_completed: 0,
        video_lessons_watched: 0,
        video_lessons_completed: 0,
        mock_exams_taken: 0,
        average_mock_exam_score: 0,
        practice_sessions_completed: 0,
        average_practice_score: 0,
        ai_tutor_interactions: 0,
        dashboard_visits: 0,
        topic_selections: 0,
        settings_changes: 0,
        profile_updates: 0,
        total_topics_studied: 0,
        study_streak: 0,
        productivity_score: 0,
        focus_time: 0,
        break_time: 0,
        session_count: 0,
        average_session_length: 0,
        peak_study_hour: 0,
        weak_areas: [],
        strong_areas: [],
        recommendations: []
      };

      // Add study time
      analytics.total_time_spent += timeInSeconds;
      analytics.total_activities += 1; // Count as an activity

      // Recalculate productivity score
      analytics.productivity_score = this.calculateProductivityScore(analytics);

      // Update database
      const { error: upsertError } = await supabase
        .from('daily_analytics')
        .upsert(analytics, { onConflict: 'date,user_id' });

      if (upsertError) {
        throw upsertError;
      }

      // Clear cache
      this.clearUserCache(userId);
      
      console.log(`✅ Added ${timeInSeconds} seconds of study time. Total: ${analytics.total_time_spent} seconds`);
    } catch (error) {
      console.error('❌ Error adding study time:', error);
      throw error;
    }
  }

  /**
   * Calculate productivity score
   */
  private calculateProductivityScore(analytics: any): number {
    let score = 0;
    
    // Base score from activities
    score += analytics.total_activities * 2;
    
    // Time efficiency bonus
    if (analytics.total_time_spent > 0) {
      const timeEfficiency = analytics.total_activities / (analytics.total_time_spent / 60);
      score += timeEfficiency * 10;
    }
    
    // Accuracy bonus
    if (analytics.questions_attempted > 0) {
      const accuracy = (analytics.questions_correct / analytics.questions_attempted) * 100;
      score += accuracy * 0.5;
    }
    
    // Completion bonus
    score += analytics.lessons_completed * 5;
    score += analytics.ai_tutor_interactions * 2;
    
    return Math.min(Math.round(score), 100);
  }

  /**
   * Get study insights and recommendations
   */
  async getStudyInsights(userId: string): Promise<{
    insights: string[];
    recommendations: string[];
    nextMilestone: string;
  }> {
    try {
      const analytics = await this.getRealTimeAnalytics(userId);
      const insights: string[] = [];
      const recommendations: string[] = [];

      // Generate insights based on current data
      if (analytics.today.totalActivities === 0) {
        insights.push('Start your learning journey today!');
        recommendations.push('Complete your first lesson or question');
      } else if (analytics.today.totalActivities < 5) {
        insights.push('Good start! Try to complete more activities today');
        recommendations.push('Aim for 10+ activities daily');
      } else if (analytics.today.totalActivities >= 10) {
        insights.push('Excellent progress! You\'re on track for today');
        recommendations.push('Maintain this momentum');
      }

      if (analytics.today.dailyAccuracy < 70) {
        insights.push('Focus on improving accuracy');
        recommendations.push('Review incorrect answers and practice more');
      } else if (analytics.today.dailyAccuracy >= 90) {
        insights.push('Outstanding accuracy! You\'re mastering the content');
        recommendations.push('Challenge yourself with harder topics');
      }

      if (analytics.currentStreak < 3) {
        insights.push('Build a consistent study habit');
        recommendations.push('Study for at least 15 minutes daily');
      } else if (analytics.currentStreak >= 7) {
        insights.push('Amazing consistency! You\'re building great habits');
        recommendations.push('Keep up the excellent work');
      }

      return {
        insights,
        recommendations,
        nextMilestone: analytics.nextMilestone
      };
    } catch (error) {
      console.error('❌ Error getting study insights:', error);
      return {
        insights: ['Start studying to get personalized insights'],
        recommendations: ['Complete your first activity'],
        nextMilestone: 'First activity completion'
      };
    }
  }

  // Helper methods
  private mapDailyAnalyticsToProgress(data: any): DailyProgressData {
    console.log('🔄 Mapping daily analytics data:', data);
    
    // Calculate study time in minutes from total_time_spent (which is in seconds)
    const studyTimeMinutes = Math.round((data.total_time_spent || 0) / 60);
    
    // Calculate accuracy with proper validation
    const questionsAttempted = data.questions_attempted || 0;
    const questionsCorrect = data.questions_correct || 0;
    const dailyAccuracy = questionsAttempted > 0 
      ? Math.round((questionsCorrect / questionsAttempted) * 100)
      : 0;
    
    console.log('📊 Calculated studyTimeMinutes:', studyTimeMinutes);
    console.log('📊 Calculated accuracy:', `${questionsCorrect}/${questionsAttempted} = ${dailyAccuracy}%`);
    
    return {
      date: data.date,
      totalActivities: data.total_activities || 0,
      totalTimeSpent: data.total_time_spent || 0,
      questionsAttempted: data.questions_attempted || 0,
      questionsCorrect: data.questions_correct || 0,
      dailyAccuracy: dailyAccuracy,
      studyStreak: data.study_streak || 0,
      productivityScore: data.productivity_score || 0,
      studyTimeMinutes: studyTimeMinutes,
      sessionCount: data.session_count || 0,
      avgSessionMinutes: data.average_session_length ? Math.round(data.average_session_length / 60) : 0,
      lessonsCompleted: data.lessons_completed || 0,
      videoLessonsCompleted: data.video_lessons_completed || 0,
      flashcardsReviewed: data.flashcards_reviewed || 0,
      mockExamsTaken: data.mock_exams_taken || 0,
      aiTutorInteractions: data.ai_tutor_interactions || 0,
      dashboardVisits: data.dashboard_visits || 0,
      topicSelections: data.topic_selections || 0
    };
  }

  private calculateWeeklyProgress(data: any[]): WeeklyProgressData {
    if (!data || data.length === 0) {
      return {
        weekStart: '',
        weekEnd: '',
        totalActivities: 0,
        totalTimeSpent: 0,
        averageDailyAccuracy: 0,
        studyStreak: 0,
        mostProductiveDay: '',
        topicsStudied: [],
        weakAreas: [],
        strongAreas: [],
        recommendations: []
      };
    }

    const totalActivities = data.reduce((sum, day) => sum + (day.total_activities || 0), 0);
    const totalTimeSpent = data.reduce((sum, day) => sum + (day.total_time_spent || 0), 0);
    const totalQuestions = data.reduce((sum, day) => sum + (day.questions_attempted || 0), 0);
    const totalCorrect = data.reduce((sum, day) => sum + (day.questions_correct || 0), 0);
    
    const averageDailyAccuracy = totalQuestions > 0 ? 
      Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const mostProductiveDay = data.reduce((max, day) => 
      (day.total_activities || 0) > (max.total_activities || 0) ? day : max
    );

    // Get unique topics from all days
    const allTopics = new Set<string>();
    data.forEach(day => {
      if (day.weak_areas) day.weak_areas.forEach((topic: string) => allTopics.add(topic));
      if (day.strong_areas) day.strong_areas.forEach((topic: string) => allTopics.add(topic));
    });

    // Generate recommendations based on data
    const recommendations = [];
    if (averageDailyAccuracy < 70) {
      recommendations.push('Focus on improving accuracy in practice questions');
    }
    if (totalActivities < 10) {
      recommendations.push('Try to complete more activities daily');
    }
    if (data.length < 3) {
      recommendations.push('Maintain consistent daily study habits');
    }

    return {
      weekStart: data[0]?.date || '',
      weekEnd: data[data.length - 1]?.date || '',
      totalActivities,
      totalTimeSpent,
      averageDailyAccuracy,
      studyStreak: data[data.length - 1]?.study_streak || 0,
      mostProductiveDay: this.formatDate(mostProductiveDay?.date) || 'No data',
      topicsStudied: Array.from(allTopics) as string[],
      weakAreas: [...new Set(data.flatMap(day => day.weak_areas || []))].slice(0, 3),
      strongAreas: [...new Set(data.flatMap(day => day.strong_areas || []))].slice(0, 3),
      recommendations: recommendations.length > 0 ? recommendations : ['Keep up the great work!']
    };
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return dateString;
    }
  }

  private calculateMonthlyProgress(data: any[]): MonthlyProgressData {
    if (!data || data.length === 0) {
      return {
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalActivities: 0,
        totalTimeSpent: 0,
        averageDailyAccuracy: 0,
        longestStreak: 0,
        totalTopicsStudied: 0,
        improvementRate: 0,
        studyPatterns: {
          preferredStudyTime: 'Morning',
          averageSessionLength: 0,
          peakStudyDays: []
        }
      };
    }

    const totalActivities = data.reduce((sum, day) => sum + (day.total_activities || 0), 0);
    const totalTimeSpent = data.reduce((sum, day) => sum + (day.total_time_spent || 0), 0);
    const totalQuestions = data.reduce((sum, day) => sum + (day.questions_attempted || 0), 0);
    const totalCorrect = data.reduce((sum, day) => sum + (day.questions_correct || 0), 0);
    
    const averageDailyAccuracy = totalQuestions > 0 ? 
      Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const longestStreak = Math.max(...data.map(day => day.study_streak || 0));
    const totalTopicsStudied = data.reduce((sum, day) => sum + (day.total_topics_studied || 0), 0);

    // Calculate improvement rate (simplified)
    const firstWeek = data.slice(0, 7);
    const lastWeek = data.slice(-7);
    const firstWeekAvg = firstWeek.reduce((sum, day) => sum + (day.questions_attempted || 0), 0) / 7;
    const lastWeekAvg = lastWeek.reduce((sum, day) => sum + (day.questions_attempted || 0), 0) / 7;
    const improvementRate = firstWeekAvg > 0 ? 
      Math.round(((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100) : 0;

    return {
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalActivities,
      totalTimeSpent,
      averageDailyAccuracy,
      longestStreak,
      totalTopicsStudied,
      improvementRate,
      studyPatterns: {
        preferredStudyTime: 'Morning', // This would need more complex calculation
        averageSessionLength: Math.round(totalTimeSpent / Math.max(data.length, 1)),
        peakStudyDays: ['Monday', 'Wednesday', 'Friday'] // This would need more complex calculation
      }
    };
  }

  private calculateCurrentStreak(data: any[]): number {
    if (!data || data.length === 0) return 0;
    
    // Sort by date descending (most recent first)
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sortedData.length; i++) {
      const currentDate = new Date(sortedData[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      // Check if this is the expected date for the streak
      if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        if (sortedData[i].total_activities > 0) {
          streak++;
        } else {
          break; // Streak broken
        }
      } else {
        break; // Gap in dates, streak broken
      }
    }
    
    return streak;
  }

  private calculateNextMilestone(today: DailyProgressData): string {
    if (today.totalActivities === 0) return 'Complete your first activity';
    if (today.totalActivities < 5) return 'Complete 5 activities today';
    if (today.totalActivities < 10) return 'Complete 10 activities today';
    if (today.totalActivities < 20) return 'Complete 20 activities today';
    if (today.dailyAccuracy < 70) return 'Achieve 70% accuracy';
    if (today.dailyAccuracy < 90) return 'Achieve 90% accuracy';
    if (today.studyStreak < 3) return 'Build a 3-day study streak';
    if (today.studyStreak < 7) return 'Build a 7-day study streak';
    return 'Maintain your excellent progress';
  }

  private getEmptyDailyProgress(date: string): DailyProgressData {
    return {
      date,
      totalActivities: 0,
      totalTimeSpent: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      dailyAccuracy: 0,
      studyStreak: 0,
      productivityScore: 0,
      studyTimeMinutes: 0,
      sessionCount: 0,
      avgSessionMinutes: 0,
      lessonsCompleted: 0,
      videoLessonsCompleted: 0,
      flashcardsReviewed: 0,
      mockExamsTaken: 0,
      aiTutorInteractions: 0,
      dashboardVisits: 0,
      topicSelections: 0
    };
  }

  private getEmptyWeeklyProgress(): WeeklyProgressData {
    return {
      weekStart: '',
      weekEnd: '',
      totalActivities: 0,
      totalTimeSpent: 0,
      averageDailyAccuracy: 0,
      studyStreak: 0,
      mostProductiveDay: '',
      topicsStudied: [],
      weakAreas: [],
      strongAreas: [],
      recommendations: []
    };
  }

  private getEmptyMonthlyProgress(): MonthlyProgressData {
    return {
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalActivities: 0,
      totalTimeSpent: 0,
      averageDailyAccuracy: 0,
      longestStreak: 0,
      totalTopicsStudied: 0,
      improvementRate: 0,
      studyPatterns: {
        preferredStudyTime: 'Morning',
        averageSessionLength: 0,
        peakStudyDays: []
      }
    };
  }

  private getCachedData(key: string): any | null {
    const cached = this.analyticsCache.get(key);
    const expiry = this.cacheExpiry.get(key);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }
    
    return null;
  }

  private cacheData(key: string, data: any): void {
    this.analyticsCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  public clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.analyticsCache.keys())
      .filter(key => key.includes(userId));
    
    keysToDelete.forEach(key => {
      this.analyticsCache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  /**
   * Force refresh analytics data without cache
   */
  public async forceRefreshAnalytics(userId: string): Promise<RealTimeAnalytics> {
    this.clearUserCache(userId);
    return this.getRealTimeAnalyticsNoCache(userId);
  }

  /**
   * Reset daily time spent for a user (called on login)
   */
  public async resetDailyTimeSpent(userId: string): Promise<void> {
    try {
      // Validate userId
      if (!userId || userId.trim() === '') {
        console.error('❌ Invalid userId provided to resetDailyTimeSpent');
        throw new Error('Invalid userId');
      }

      const today = new Date().toISOString().split('T')[0];
      console.log(`🔄 FORCE RESET: Resetting daily time spent for user ${userId} on date ${today}`);

      // Force delete any existing record first
      const { error: deleteError } = await supabase
        .from('daily_analytics')
        .delete()
        .eq('user_id', userId)
        .eq('date', today);

      if (deleteError) {
        console.log('⚠️ Error deleting existing analytics:', deleteError);
      } else {
        console.log('✅ Deleted existing analytics record');
      }

      // Insert fresh record with all zeros using upsert to handle conflicts
      const { error: insertError } = await supabase
        .from('daily_analytics')
        .upsert({
          user_id: userId,
          date: today,
          total_time_spent: 0,
          session_count: 0,
          average_session_length: 0,
          total_activities: 0,
          questions_attempted: 0,
          questions_correct: 0,
          study_streak: 0,
          productivity_score: 0,
          lessons_completed: 0,
          video_lessons_completed: 0,
          flashcards_reviewed: 0,
          mock_exams_taken: 0,
          ai_tutor_interactions: 0,
          dashboard_visits: 0,
          topic_selections: 0
        }, {
          onConflict: 'date,user_id'
        });

      if (insertError) {
        console.error('❌ Failed to insert fresh daily analytics:', insertError);
        throw insertError;
      } else {
        console.log('✅ Fresh daily analytics record inserted with all zeros');
      }

      // Clear all caches to ensure fresh data
      this.clearUserCache(userId);
      console.log('✅ User cache cleared');

      // Also clear enhanced tracker cache if available
      try {
        if (enhancedAnalyticsTracker && typeof enhancedAnalyticsTracker.clearUserCache === 'function') {
          await (enhancedAnalyticsTracker as any).clearUserCache(userId);
          console.log('✅ Enhanced tracker cache cleared');
        }
      } catch (error) {
        console.log('⚠️ Could not clear enhanced tracker cache:', error);
      }

      // Wait a moment to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Reset completed with database consistency delay');
    } catch (error) {
      console.error('❌ Error resetting daily time spent:', error);
      throw error;
    }
  }

  /**
   * Reset and get fresh analytics data (for dashboard initialization)
   */
  public async resetAndGetFreshAnalytics(userId: string): Promise<RealTimeAnalytics> {
    try {
      console.log('🔄 RESET AND FRESH: Starting complete reset and fresh data fetch...');
      
      // First reset the daily time spent
      await this.resetDailyTimeSpent(userId);
      
      // Wait a moment for database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get completely fresh data without any caching
      const freshAnalytics = await this.getRealTimeAnalyticsNoCache(userId);
      
      console.log('✅ RESET AND FRESH: Complete reset and fresh data fetch completed');
      console.log('📊 Fresh analytics study time:', freshAnalytics.today.studyTimeMinutes);
      
      return freshAnalytics;
    } catch (error) {
      console.error('❌ Error in reset and fresh analytics:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics with page session data included
   */
  public async getRealTimeAnalyticsWithSessions(userId: string): Promise<RealTimeAnalytics> {
    try {
      // Clear cache first
      this.clearUserCache(userId);
      
      // Get fresh analytics WITHOUT caching
      const analytics = await this.getRealTimeAnalyticsNoCache(userId);
      
      // Get recent page sessions for additional context
      const { data: recentSessions } = await supabase
        .from('page_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: false })
        .limit(10);

      if (recentSessions && recentSessions.length > 0) {
        console.log(`📊 Found ${recentSessions.length} recent page sessions for user ${userId}`);
      }

      return analytics;
    } catch (error) {
      console.error('❌ Error getting real-time analytics with sessions:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics without caching (for fresh data)
   */
  private async getRealTimeAnalyticsNoCache(userId: string): Promise<RealTimeAnalytics> {
    try {
      console.log('🔄 Getting fresh analytics without cache for user:', userId);
      
      const [today, thisWeek, thisMonth] = await Promise.all([
        this.getTodayProgress(userId),
        this.getWeeklyProgress(userId),
        this.getMonthlyProgress(userId)
      ]);

      const currentStreak = await this.getCurrentStreak(userId);
      const nextMilestone = this.calculateNextMilestone(today);
      const focusAreas = await this.getFocusAreas(userId);
      const achievements = await this.getRecentAchievements(userId);

      const analytics: RealTimeAnalytics = {
        today,
        thisWeek,
        thisMonth,
        currentStreak,
        nextMilestone,
        focusAreas,
        achievements
      };

      console.log('📊 Fresh analytics data:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error getting real-time analytics without cache:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const comprehensiveAnalyticsService = ComprehensiveAnalyticsService.getInstance();
