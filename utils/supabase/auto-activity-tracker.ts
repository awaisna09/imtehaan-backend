import { supabase } from './client';
import { comprehensiveAnalyticsService } from './comprehensive-analytics-service';
import enhancedAnalyticsTracker from './enhanced-analytics-tracker';

export interface AutoTrackedActivity {
  activityType: 'page_view' | 'button_click' | 'form_submit' | 'time_spent' | 'scroll' | 'focus' | 'blur' | 'ai_interaction' | 'lesson_start' | 'lesson_complete' | 'question_attempt' | 'flashcard_review';
  elementId?: string;
  elementType?: string;
  pageUrl: string;
  pageTitle: string;
  duration?: number; // in milliseconds
  metadata?: Record<string, any>;
}

export class AutoActivityTracker {
  private static instance: AutoActivityTracker;
  private isTracking = false;
  private currentUserId: string | null = null;
  private activityBuffer: AutoTrackedActivity[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private readonly MAX_BUFFER_SIZE = 50;

  private constructor() {
    this.initializeTracking();
  }

  public static getInstance(): AutoActivityTracker {
    if (!AutoActivityTracker.instance) {
      AutoActivityTracker.instance = new AutoActivityTracker();
    }
    return AutoActivityTracker.instance;
  }

  /**
   * Initialize automatic tracking
   */
  private initializeTracking(): void {
    // Check for authenticated user
    this.checkAuthStatus();
    
    // Set up periodic auth check
    setInterval(() => {
      this.checkAuthStatus();
    }, 60000); // Check every minute

    // Set up automatic flushing
    this.flushInterval = setInterval(() => {
      this.flushActivities();
    }, this.FLUSH_INTERVAL);

    console.log('🎯 Auto Activity Tracker initialized');
  }

  /**
   * Check authentication status
   */
  private async checkAuthStatus(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id !== this.currentUserId) {
        this.currentUserId = user.id;
        this.isTracking = true;
        console.log('🎯 Auto tracking started for user:', user.id);
      } else if (!user && this.isTracking) {
        this.currentUserId = null;
        this.isTracking = false;
        console.log('🎯 Auto tracking stopped - user logged out');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    }
  }

  /**
   * Track an activity automatically
   */
  public trackActivity(activity: AutoTrackedActivity): void {
    if (!this.isTracking || !this.currentUserId) {
      return;
    }

    // Add timestamp
    const trackedActivity = {
      ...activity,
      timestamp: new Date().toISOString(),
      userId: this.currentUserId
    };

    this.activityBuffer.push(trackedActivity);

    // Flush if buffer is full
    if (this.activityBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.flushActivities();
    }

    console.log('🎯 Activity tracked:', activity.activityType, activity.pageTitle);
  }

  /**
   * Track page view
   */
  public trackPageView(pageTitle: string, pageUrl: string): void {
    this.trackActivity({
      activityType: 'page_view',
      pageUrl,
      pageTitle,
      metadata: {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    });
  }

  /**
   * Track button click
   */
  public trackButtonClick(elementId: string, elementType: string, pageTitle: string, pageUrl: string): void {
    this.trackActivity({
      activityType: 'button_click',
      elementId,
      elementType,
      pageUrl,
      pageTitle,
      metadata: {
        clickTime: new Date().toISOString()
      }
    });
  }

  /**
   * Track time spent on page
   */
  public trackTimeSpent(pageTitle: string, pageUrl: string, duration: number): void {
    this.trackActivity({
      activityType: 'time_spent',
      pageUrl,
      pageTitle,
      duration,
      metadata: {
        sessionStart: new Date(Date.now() - duration).toISOString()
      }
    });
  }

  /**
   * Track AI tutor interaction
   */
  public trackAIInteraction(query: string, responseLength: number, pageTitle: string, pageUrl: string): void {
    this.trackActivity({
      activityType: 'ai_interaction',
      pageUrl,
      pageTitle,
      metadata: {
        query: query.substring(0, 100), // Limit query length
        responseLength,
        interactionType: 'chat'
      }
    });
  }

  /**
   * Track lesson start
   */
  public trackLessonStart(lessonId: string, lessonTitle: string, pageTitle: string, pageUrl: string): void {
    this.trackActivity({
      activityType: 'lesson_start',
      pageUrl,
      pageTitle,
      metadata: {
        lessonId,
        lessonTitle,
        startTime: new Date().toISOString()
      }
    });
  }

  /**
   * Track lesson completion
   */
  public trackLessonComplete(lessonId: string, lessonTitle: string, duration: number, pageTitle: string, pageUrl: string): void {
    this.trackActivity({
      activityType: 'lesson_complete',
      pageUrl,
      pageTitle,
      duration,
      metadata: {
        lessonId,
        lessonTitle,
        completionTime: new Date().toISOString()
      }
    });
  }

  /**
   * Track question attempt
   */
  public trackQuestionAttempt(questionId: string, isCorrect: boolean, timeSpent: number, pageTitle: string, pageUrl: string): void {
    this.trackActivity({
      activityType: 'question_attempt',
      pageUrl,
      pageTitle,
      duration: timeSpent,
      metadata: {
        questionId,
        isCorrect,
        attemptTime: new Date().toISOString()
      }
    });
  }

  /**
   * Track flashcard review
   */
  public trackFlashcardReview(flashcardId: string, isCorrect: boolean, timeSpent: number, pageTitle: string, pageUrl: string): void {
    this.trackActivity({
      activityType: 'flashcard_review',
      pageUrl,
      pageTitle,
      duration: timeSpent,
      metadata: {
        flashcardId,
        isCorrect,
        reviewTime: new Date().toISOString()
      }
    });
  }

  /**
   * Flush activities to database
   */
  private async flushActivities(): Promise<void> {
    if (this.activityBuffer.length === 0 || !this.currentUserId) {
      return;
    }

    try {
      const activitiesToFlush = [...this.activityBuffer];
      this.activityBuffer = [];

      // Process activities and update daily analytics
      await this.processActivities(activitiesToFlush);

      console.log(`🎯 Flushed ${activitiesToFlush.length} activities to database`);
    } catch (error) {
      console.error('❌ Error flushing activities:', error);
      // Re-add activities to buffer for retry
      this.activityBuffer.unshift(...this.activityBuffer);
    }
  }

  /**
   * Process activities and update analytics
   */
  private async processActivities(activities: AutoTrackedActivity[]): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get current daily analytics
      const { data: currentAnalytics, error: fetchError } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', this.currentUserId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Initialize analytics if not exists
      let analytics = currentAnalytics || {
        date: today,
        user_id: this.currentUserId,
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

      // Process each activity
      for (const activity of activities) {
        analytics.total_activities++;
        
        if (activity.duration) {
          // Convert milliseconds to seconds and add to total time spent
          const durationInSeconds = Math.round(activity.duration / 1000);
          analytics.total_time_spent += durationInSeconds;
          console.log(`🎯 Adding ${durationInSeconds} seconds to total_time_spent (from ${activity.duration}ms)`);
        }

        switch (activity.activityType) {
          case 'page_view':
            if (activity.pageUrl.includes('dashboard')) {
              analytics.dashboard_visits++;
            }
            // Increment session count for significant page views (new session indicators)
            if (activity.pageUrl.includes('dashboard') || 
                activity.pageUrl.includes('analytics') || 
                activity.pageUrl.includes('practice')) {
              analytics.session_count++;
              console.log('🎯 Session count incremented for significant page view');
            }
            break;
          case 'ai_interaction':
            analytics.ai_tutor_interactions++;
            break;
          case 'lesson_start':
            analytics.lessons_started++;
            // Increment session count when starting a lesson (new learning session)
            analytics.session_count++;
            console.log('🎯 Session count incremented for lesson start');
            break;
          case 'lesson_complete':
            analytics.lessons_completed++;
            break;
          case 'question_attempt':
            analytics.questions_attempted++;
            if (activity.metadata?.isCorrect) {
              analytics.questions_correct++;
            }
            break;
          case 'flashcard_review':
            analytics.flashcards_reviewed++;
            if (activity.metadata?.isCorrect) {
              analytics.flashcards_correct++;
            }
            break;
          case 'focus':
            // Increment session count when user focuses (indicates active session)
            if (activity.metadata?.focusTime) {
              analytics.session_count++;
              console.log('🎯 Session count incremented for focus event');
            }
            break;
        }
      }

      // Calculate average session length if we have sessions
      if (analytics.session_count > 0 && analytics.total_time_spent > 0) {
        analytics.average_session_length = Math.round(analytics.total_time_spent / analytics.session_count);
        console.log(`🎯 Calculated average session length: ${analytics.average_session_length} seconds`);
      }

      // Calculate productivity score
      analytics.productivity_score = this.calculateProductivityScore(analytics);

      // Update or insert analytics
      const { error: upsertError } = await supabase
        .from('daily_analytics')
        .upsert(analytics, { onConflict: 'date,user_id' });

      if (upsertError) {
        throw upsertError;
      }

      // Clear cache to ensure fresh data
      comprehensiveAnalyticsService.clearUserCache(this.currentUserId!);

    } catch (error) {
      console.error('❌ Error processing activities:', error);
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
    
    // Accuracy bonus
    if (analytics.questions_attempted > 0) {
      const accuracy = (analytics.questions_correct / analytics.questions_attempted) * 100;
      score += accuracy * 0.5;
    }
    
    // Time efficiency bonus
    if (analytics.total_time_spent > 0) {
      const timeEfficiency = analytics.total_activities / (analytics.total_time_spent / 60);
      score += timeEfficiency * 10;
    }
    
    // Completion bonus
    score += analytics.lessons_completed * 5;
    score += analytics.ai_tutor_interactions * 2;
    
    return Math.min(Math.round(score), 100);
  }

  /**
   * Force flush activities (for manual refresh)
   */
  public async forceFlush(): Promise<void> {
    await this.flushActivities();
  }

  /**
   * Get current buffer size
   */
  public getBufferSize(): number {
    return this.activityBuffer.length;
  }

  /**
   * Stop tracking
   */
  public stopTracking(): void {
    this.isTracking = false;
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    console.log('🎯 Auto tracking stopped');
  }
}

// Export singleton instance
export const autoActivityTracker = AutoActivityTracker.getInstance();
