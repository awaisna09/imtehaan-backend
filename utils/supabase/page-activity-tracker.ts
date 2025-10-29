import { supabase } from './client';
import { comprehensiveAnalyticsService } from './comprehensive-analytics-service';

export interface PageSession {
  id: string;
  userId: string;
  pageName: string;
  pageCategory: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  activities: PageActivity[];
  metadata: Record<string, any>;
}

export interface PageActivity {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
}

export class PageActivityTracker {
  private static instance: PageActivityTracker;
  private activeSessions: Map<string, PageSession> = new Map();
  private sessionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private analyticsUpdateCallbacks: Map<string, (() => void)[]> = new Map();

  private constructor() {}

  public static getInstance(): PageActivityTracker {
    if (!PageActivityTracker.instance) {
      PageActivityTracker.instance = new PageActivityTracker();
    }
    return PageActivityTracker.instance;
  }

  /**
   * Track when user enters a page
   */
  async trackPageEntry(
    userId: string,
    pageName: string,
    pageCategory: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: PageSession = {
        id: sessionId,
        userId,
        pageName,
        pageCategory,
        startTime: new Date(),
        activities: [],
        metadata
      };

      // Store session locally
      this.activeSessions.set(sessionId, session);

      // Set timeout to auto-close session after 30 minutes of inactivity
      const timeout = setTimeout(() => {
        this.autoCloseSession(sessionId);
      }, 30 * 60 * 1000); // 30 minutes

      this.sessionTimeouts.set(sessionId, timeout);

      // Track page visit in daily analytics
      await this.trackPageVisit(userId, pageName, pageCategory);

      console.log(`📱 Page entry tracked: ${pageName} (${pageCategory})`);
      return sessionId;

    } catch (error) {
      console.error('Error tracking page entry:', error);
      return '';
    }
  }

  /**
   * Track when user exits a page
   */
  async trackPageExit(
    sessionId: string,
    finalMetadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        console.warn(`Session ${sessionId} not found for exit tracking`);
        return;
      }

      // Calculate session duration
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
      
      session.endTime = endTime;
      session.duration = duration;
      session.metadata = { ...session.metadata, ...finalMetadata };

      // Clear timeout
      const timeout = this.sessionTimeouts.get(sessionId);
      if (timeout) {
        clearTimeout(timeout);
        this.sessionTimeouts.delete(sessionId);
      }

      // Update daily analytics with session data
      await this.updateDailyAnalytics(session);

      // Store session in database for historical analysis
      await this.storeSessionHistory(session);

      // Force refresh analytics cache to ensure immediate updates
      comprehensiveAnalyticsService.clearUserCache(session.userId);
      
      // Trigger analytics update callbacks
      this.triggerAnalyticsUpdate(session.userId);
      
      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      console.log(`🚪 Page exit tracked: ${session.pageName} (${duration}s) - Analytics cache cleared`);

    } catch (error) {
      console.error('Error tracking page exit:', error);
    }
  }

  /**
   * Track activity within a page
   */
  async trackPageActivity(
    sessionId: string,
    activityType: string,
    activityData: Record<string, any> = {}
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        console.warn(`Session ${sessionId} not found for activity tracking`);
        return;
      }

      const activity: PageActivity = {
        type: activityType,
        timestamp: new Date(),
        data: activityData
      };

      session.activities.push(activity);

      // Update daily analytics in real-time for important activities
      await this.trackRealTimeActivity(session.userId, activityType, activityData);

      console.log(`📊 Activity tracked: ${activityType} in ${session.pageName}`);

    } catch (error) {
      console.error('Error tracking page activity:', error);
    }
  }

  /**
   * Track page visit in daily analytics
   */
  private async trackPageVisit(
    userId: string,
    pageName: string,
    pageCategory: string
  ): Promise<void> {
    try {
      // Update specific page visit counters directly in daily_analytics
      await this.updatePageVisitCounters(userId, pageName, pageCategory);

      // Special handling for dashboard visits
      if (pageCategory === 'dashboard') {
        await this.updateDashboardVisitCount(userId);
      }

      // Force refresh analytics cache to ensure immediate updates
      comprehensiveAnalyticsService.clearUserCache(userId);
      
      // Trigger analytics update callbacks
      this.triggerAnalyticsUpdate(userId);
      
      console.log(`🔄 Analytics cache cleared for user ${userId} after page visit to ${pageName}`);

    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  }

  /**
   * Update page-specific visit counters
   */
  private async updatePageVisitCounters(
    userId: string,
    pageName: string,
    pageCategory: string
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
          // Get current analytics first
          const { data: currentAnalytics, error: fetchError } = await supabase
            .from('daily_analytics')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
          }

          const updateData: any = {
            total_activities: (currentAnalytics?.total_activities || 0) + 1,
            updated_at: new Date().toISOString()
          };

          // Update specific page counters based on category
          if (pageCategory === 'practice') {
            updateData.questions_attempted = (currentAnalytics?.questions_attempted || 0) + 1;
          } else if (pageCategory === 'lessons') {
            updateData.lessons_started = (currentAnalytics?.lessons_started || 0) + 1;
          } else if (pageCategory === 'visual_learning') {
            updateData.video_lessons_watched = (currentAnalytics?.video_lessons_watched || 0) + 1;
          } else if (pageCategory === 'flashcards') {
            updateData.flashcards_reviewed = (currentAnalytics?.flashcards_reviewed || 0) + 1;
          }

          const { error } = await supabase
            .from('daily_analytics')
            .upsert({
              date: today,
              user_id: userId,
              ...updateData
            }, {
              onConflict: 'date,user_id'
            });

      if (error) throw error;

    } catch (error) {
      console.error('Error updating page visit counters:', error);
    }
  }

  /**
   * Update dashboard visit count specifically
   */
  private async updateDashboardVisitCount(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
          // Get current analytics first
          const { data: currentAnalytics, error: fetchError } = await supabase
            .from('daily_analytics')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
          }

          const { error } = await supabase
            .from('daily_analytics')
            .upsert({
              date: today,
              user_id: userId,
              dashboard_visits: (currentAnalytics?.dashboard_visits || 0) + 1,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'date,user_id'
            });

      if (error) throw error;

    } catch (error) {
      console.error('Error updating dashboard visit count:', error);
    }
  }

  /**
   * Update daily analytics with session data
   */
  private async updateDailyAnalytics(session: PageSession): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate session metrics
      const sessionDuration = session.duration || 0;
      const activityCount = session.activities.length;
      
      // Get current analytics first
      const { data: currentAnalytics, error: fetchError } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', session.userId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Update daily analytics
      const { error } = await supabase
        .from('daily_analytics')
        .upsert({
          date: today,
          user_id: session.userId,
          total_time_spent: (currentAnalytics?.total_time_spent || 0) + sessionDuration,
          session_count: (currentAnalytics?.session_count || 0) + 1,
          total_activities: (currentAnalytics?.total_activities || 0) + activityCount,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'date,user_id'
        });

      if (error) throw error;

      // Track specific activities from the session
      for (const activity of session.activities) {
        await this.trackRealTimeActivity(session.userId, activity.type, activity.data);
      }

      // Force refresh analytics cache after session analytics update
      comprehensiveAnalyticsService.clearUserCache(session.userId);
      
      // Trigger analytics update callbacks
      this.triggerAnalyticsUpdate(session.userId);
      
      console.log(`🔄 Analytics cache cleared for user ${session.userId} after session analytics update`);

    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  }

  /**
   * Track real-time activity for immediate analytics updates
   */
  private async trackRealTimeActivity(
    userId: string,
    activityType: string,
    activityData: Record<string, any>
  ): Promise<void> {
    try {
      // Since we're already updating daily_analytics directly, we just need to clear cache
      // and trigger callbacks for real-time updates
      comprehensiveAnalyticsService.clearUserCache(userId);
      
      // Trigger analytics update callbacks
      this.triggerAnalyticsUpdate(userId);
      
      console.log(`🔄 Analytics cache cleared for user ${userId} after ${activityType} activity`);

    } catch (error) {
      console.error('Error tracking real-time activity:', error);
    }
  }

  /**
   * Store session history for long-term analysis
   */
  private async storeSessionHistory(session: PageSession): Promise<void> {
    try {
      const { error } = await supabase
        .from('page_sessions')
        .insert({
          user_id: session.userId,
          page_name: session.pageName,
          page_category: session.pageCategory,
          start_time: session.startTime.toISOString(),
          end_time: session.endTime?.toISOString(),
          duration: session.duration,
          activities: session.activities,
          metadata: session.metadata
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error storing session history:', error);
    }
  }

  /**
   * Auto-close session after timeout
   */
  private async autoCloseSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        console.log(`⏰ Auto-closing session: ${session.pageName}`);
        await this.trackPageExit(sessionId, { autoClosed: true });
      }
    } catch (error) {
      console.error('Error auto-closing session:', error);
    }
  }

  /**
   * Get current active session for a user
   */
  getActiveSession(userId: string): PageSession | undefined {
    for (const session of this.activeSessions.values()) {
      if (session.userId === userId) {
        return session;
      }
    }
    return undefined;
  }

  /**
   * Clean up all sessions (useful for logout)
   */
  async cleanupUserSessions(userId: string): Promise<void> {
    try {
      const sessionsToClose = Array.from(this.activeSessions.values())
        .filter(session => session.userId === userId);

      for (const session of sessionsToClose) {
        await this.trackPageExit(session.id, { cleanup: true });
      }

    } catch (error) {
      console.error('Error cleaning up user sessions:', error);
    }
  }

  /**
   * Register callback for analytics updates
   */
  onAnalyticsUpdate(userId: string, callback: () => void): void {
    if (!this.analyticsUpdateCallbacks.has(userId)) {
      this.analyticsUpdateCallbacks.set(userId, []);
    }
    this.analyticsUpdateCallbacks.get(userId)!.push(callback);
  }

  /**
   * Remove callback for analytics updates
   */
  offAnalyticsUpdate(userId: string, callback: () => void): void {
    const callbacks = this.analyticsUpdateCallbacks.get(userId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Trigger analytics update callbacks for a user
   */
  private triggerAnalyticsUpdate(userId: string): void {
    const callbacks = this.analyticsUpdateCallbacks.get(userId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in analytics update callback:', error);
        }
      });
    }
  }
}

// Export singleton instance
export const pageActivityTracker = PageActivityTracker.getInstance();
