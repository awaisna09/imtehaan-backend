import { supabase } from './client';

export interface LearningActivity {
  id?: string;
  user_id: string;
  activity_type: 'question' | 'lesson' | 'flashcard' | 'mock_exam' | 'practice_session' | 'video_lesson';
  topic_id: number;
  subject_id?: number;
  topic_name: string;
  subject_name: string;
  duration: number; // in seconds
  score?: number; // percentage score
  correct_answers?: number;
  total_questions?: number;
  accuracy?: number;
  session_id?: string;
  session_start?: string;
  session_end?: string;
  metadata?: Record<string, any>;
}

export interface StudySession {
  id?: string;
  user_id: string;
  session_name: string;
  start_time: string;
  end_time?: string;
  duration: number; // in seconds
  topics_covered: string[];
  total_activities: number;
  session_goals: string[];
  notes?: string;
}

export interface ActivityAnalytics {
  topicId: number;
  topicName: string;
  subjectName: string;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  timeSpent: number;
  lessonsCompleted: number;
  videoLessonsCompleted: number;
  flashcardsReviewed: number;
  flashcardsCorrect: number;
  mockExamsTaken: number;
  averageMockExamScore: number;
  lastActivity: string;
  completionPercentage: number;
  studyStreak: number;
  averageStudyTime: number;
}

export class LearningActivityTracker {
  private currentSessionId: string | null = null;
  private sessionStartTime: Date | null = null;

  /**
   * Start a new study session
   */
  async startStudySession(
    userId: string, 
    sessionName: string = 'Study Session',
    goals: string[] = []
  ): Promise<string> {
    try {
      const session: StudySession = {
        user_id: userId,
        session_name: sessionName,
        start_time: new Date().toISOString(),
        duration: 0,
        topics_covered: [],
        total_activities: 0,
        session_goals: goals,
        notes: ''
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(session)
        .select('id')
        .single();

      if (error) throw error;

      this.currentSessionId = data.id;
      this.sessionStartTime = new Date();
      
      console.log('🎯 Study session started:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error starting study session:', error);
      throw error;
    }
  }

  /**
   * End the current study session
   */
  async endStudySession(): Promise<void> {
    if (!this.currentSessionId || !this.sessionStartTime) {
      console.warn('⚠️ No active study session to end');
      return;
    }

    try {
      const sessionDuration = Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
      
      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration: sessionDuration
        })
        .eq('id', this.currentSessionId);

      if (error) throw error;

      console.log('✅ Study session ended:', this.currentSessionId, 'Duration:', sessionDuration, 'seconds');
      
      this.currentSessionId = null;
      this.sessionStartTime = null;
    } catch (error) {
      console.error('❌ Error ending study session:', error);
      throw error;
    }
  }

  /**
   * Track a learning activity
   */
  async trackActivity(activity: Omit<LearningActivity, 'user_id' | 'session_id' | 'session_start' | 'session_end'>): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fullActivity: LearningActivity = {
        ...activity,
        user_id: user.id,
        session_id: this.currentSessionId || undefined,
        session_start: this.sessionStartTime?.toISOString(),
        session_end: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('learning_activities')
        .insert(fullActivity)
        .select('id')
        .single();

      if (error) throw error;

      // Update session with new activity
      if (this.currentSessionId) {
        await this.updateSessionActivity(this.currentSessionId, activity.topic_name);
      }

      console.log('📊 Activity tracked:', activity.activity_type, 'for topic:', activity.topic_name);
      return data.id;
    } catch (error) {
      console.error('❌ Error tracking activity:', error);
      throw error;
    }
  }

  /**
   * Track question attempt
   */
  async trackQuestion(
    topicId: number,
    topicName: string,
    subjectName: string,
    isCorrect: boolean,
    duration: number = 0,
    difficulty?: string,
    marks?: number
  ): Promise<string> {
    const accuracy = isCorrect ? 100 : 0;
    
    return this.trackActivity({
      activity_type: 'question',
      topic_id: topicId,
      topic_name: topicName,
      subject_name: subjectName,
      duration,
      correct_answers: isCorrect ? 1 : 0,
      total_questions: 1,
      accuracy,
      metadata: {
        difficulty,
        marks,
        questionType: 'practice'
      }
    });
  }

  /**
   * Track lesson completion
   */
  async trackLesson(
    topicId: number,
    topicName: string,
    subjectName: string,
    duration: number,
    lessonType: 'reading' | 'video' | 'interactive' = 'reading'
  ): Promise<string> {
    return this.trackActivity({
      activity_type: lessonType === 'video' ? 'video_lesson' : 'lesson',
      topic_id: topicId,
      topic_name: topicName,
      subject_name: subjectName,
      duration,
      score: 100, // Lesson completion is always 100%
      accuracy: 100,
      metadata: {
        lessonType,
        completionStatus: 'completed'
      }
    });
  }

  /**
   * Track flashcard review
   */
  async trackFlashcard(
    topicId: number,
    topicName: string,
    subjectName: string,
    isCorrect: boolean,
    duration: number = 0,
    masteryLevel?: string
  ): Promise<string> {
    const accuracy = isCorrect ? 100 : 0;
    
    return this.trackActivity({
      activity_type: 'flashcard',
      topic_id: topicId,
      topic_name: topicName,
      subject_name: subjectName,
      duration,
      correct_answers: isCorrect ? 1 : 0,
      total_questions: 1,
      accuracy,
      metadata: {
        masteryLevel,
        flashcardType: 'review'
      }
    });
  }

  /**
   * Track mock exam
   */
  async trackMockExam(
    topicId: number,
    topicName: string,
    subjectName: string,
    duration: number,
    correctAnswers: number,
    totalQuestions: number,
    score: number
  ): Promise<string> {
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    return this.trackActivity({
      activity_type: 'mock_exam',
      topic_id: topicId,
      topic_name: topicName,
      subject_name: subjectName,
      duration,
      score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      accuracy,
      metadata: {
        examType: 'mock',
        difficulty: score >= 80 ? 'easy' : score >= 60 ? 'medium' : 'hard'
      }
    });
  }

  /**
   * Track practice session
   */
  async trackPracticeSession(
    topicId: number,
    topicName: string,
    subjectName: string,
    duration: number,
    questionsAnswered: number,
    correctAnswers: number
  ): Promise<string> {
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
    
    return this.trackActivity({
      activity_type: 'practice_session',
      topic_id: topicId,
      topic_name: topicName,
      subject_name: subjectName,
      duration,
      score: accuracy,
      correct_answers: correctAnswers,
      total_questions: questionsAnswered,
      accuracy,
      metadata: {
        sessionType: 'practice',
        questionsAnswered,
        correctAnswers
      }
    });
  }

  /**
   * Update session with new activity
   */
  private async updateSessionActivity(sessionId: string, topicName: string): Promise<void> {
    try {
      const { data: session } = await supabase
        .from('study_sessions')
        .select('topics_covered, total_activities')
        .eq('id', sessionId)
        .single();

      if (session) {
        const topicsCovered = session.topics_covered || [];
        if (!topicsCovered.includes(topicName)) {
          topicsCovered.push(topicName);
        }

        const { error } = await supabase
          .from('study_sessions')
          .update({
            topics_covered: topicsCovered,
            total_activities: (session.total_activities || 0) + 1
          })
          .eq('id', sessionId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('❌ Error updating session activity:', error);
    }
  }

  /**
   * Get analytics data for a user
   */
  async getUserAnalytics(userId: string): Promise<ActivityAnalytics[]> {
    try {
      // Get data from learning_activities table instead of non-existent view
      const { data, error } = await supabase
        .from('learning_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group activities by topic and calculate analytics
      const topicAnalytics = new Map<string, ActivityAnalytics>();

      (data || []).forEach(activity => {
        const topicKey = `${activity.topic_id}_${activity.topic_name}`;
        
        if (!topicAnalytics.has(topicKey)) {
          topicAnalytics.set(topicKey, {
            topicId: activity.topic_id?.toString() || '0',
            topicName: activity.topic_name || 'Unknown',
            subjectName: activity.subject_name || 'Unknown',
            questionsAttempted: 0,
            questionsCorrect: 0,
            accuracy: 0,
            timeSpent: 0,
            lessonsCompleted: 0,
            videoLessonsCompleted: 0,
            flashcardsReviewed: 0,
            flashcardsCorrect: 0,
            mockExamsTaken: 0,
            averageMockExamScore: 0,
            lastActivity: activity.created_at || new Date().toISOString(),
            completionPercentage: 0,
            studyStreak: 0,
            averageStudyTime: 0
          });
        }

        const analytics = topicAnalytics.get(topicKey)!;

        // Update metrics based on activity type
        switch (activity.activity_type) {
          case 'question':
            analytics.questionsAttempted += activity.total_questions || 0;
            analytics.questionsCorrect += activity.correct_answers || 0;
            analytics.timeSpent += activity.duration || 0;
            break;
          case 'lesson':
            analytics.lessonsCompleted += 1;
            analytics.timeSpent += activity.duration || 0;
            break;
          case 'video_lesson':
            analytics.videoLessonsCompleted += 1;
            analytics.timeSpent += activity.duration || 0;
            break;
          case 'flashcard':
            analytics.flashcardsReviewed += 1;
            analytics.flashcardsCorrect += activity.correct_answers || 0;
            analytics.timeSpent += activity.duration || 0;
            break;
          case 'mock_exam':
            analytics.mockExamsTaken += 1;
            analytics.averageMockExamScore = activity.score || 0;
            analytics.timeSpent += activity.duration || 0;
            break;
        }

        // Update last activity
        if (new Date(activity.created_at) > new Date(analytics.lastActivity)) {
          analytics.lastActivity = activity.created_at;
        }
      });

      // Calculate final metrics
      const result = Array.from(topicAnalytics.values()).map(analytics => {
        analytics.accuracy = analytics.questionsAttempted > 0 
          ? Math.round((analytics.questionsCorrect / analytics.questionsAttempted) * 100)
          : 0;
        
        analytics.averageStudyTime = analytics.timeSpent > 0 
          ? Math.round(analytics.timeSpent / 10) // Estimate based on activities
          : 0;
        
        analytics.completionPercentage = this.calculateCompletionPercentage({
          questions_attempted: analytics.questionsAttempted,
          questions_correct: analytics.questionsCorrect,
          lessons_completed: analytics.lessonsCompleted,
          video_lessons_completed: analytics.videoLessonsCompleted,
          flashcards_reviewed: analytics.flashcardsReviewed,
          mock_exams_taken: analytics.mockExamsTaken
        });

        return analytics;
      });

      return result;
    } catch (error) {
      console.error('❌ Error fetching user analytics:', error);
      return [];
    }
  }

  /**
   * Calculate completion percentage based on learning science principles
   */
  private calculateCompletionPercentage(analytics: any): number {
    const questionsAttempted = analytics.questions_attempted || 0;
    const questionsCorrect = analytics.questions_correct || 0;
    const lessonsCompleted = analytics.lessons_completed || 0;
    const videoLessonsCompleted = analytics.video_lessons_completed || 0;
    const flashcardsReviewed = analytics.flashcards_reviewed || 0;
    const mockExamsTaken = analytics.mock_exams_taken || 0;

    if (questionsAttempted === 0 && lessonsCompleted === 0 && videoLessonsCompleted === 0 && 
        flashcardsReviewed === 0 && mockExamsTaken === 0) {
      return 0;
    }

    // Learning science-based weights (based on Bloom's taxonomy and retention research)
    const weights = {
      questions: 0.35,      // Practice and application (highest retention)
      lessons: 0.25,        // Understanding and comprehension
      videoLessons: 0.20,   // Visual learning (good retention)
      flashcards: 0.15,     // Memorization (lower retention)
      mockExams: 0.05       // Assessment (validation, not learning)
    };

    // Calculate weighted score
    let weightedScore = 0;
    let totalWeight = 0;

    if (questionsAttempted > 0) {
      const accuracy = questionsCorrect / questionsAttempted;
      weightedScore += (questionsAttempted * weights.questions * accuracy);
      totalWeight += weights.questions;
    }

    if (lessonsCompleted > 0) {
      weightedScore += (lessonsCompleted * weights.lessons);
      totalWeight += weights.lessons;
    }

    if (videoLessonsCompleted > 0) {
      weightedScore += (videoLessonsCompleted * weights.videoLessons);
      totalWeight += weights.videoLessons;
    }

    if (flashcardsReviewed > 0) {
      weightedScore += (flashcardsReviewed * weights.flashcards);
      totalWeight += weights.flashcards;
    }

    if (mockExamsTaken > 0) {
      weightedScore += (mockExamsTaken * weights.mockExams);
      totalWeight += weights.mockExams;
    }

    // Normalize based on total weight used
    const normalizedScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    
    return Math.min(Math.round(normalizedScore), 100);
  }

  /**
   * Get study streaks for a user with improved algorithm
   */
  async getStudyStreaks(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('learning_activities')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
      }

      // Group activities by date
      const activitiesByDate = new Map<string, number>();
      data.forEach(item => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        activitiesByDate.set(date, (activitiesByDate.get(date) || 0) + 1);
      });

      const sortedDates = Array.from(activitiesByDate.keys())
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i];
        const nextDate = i < sortedDates.length - 1 ? sortedDates[i + 1] : null;

        // Check if this date is part of current streak
        if (currentDate === today || currentDate === yesterday) {
          if (i === 0 || (nextDate && this.isConsecutiveDay(currentDate, nextDate))) {
            tempStreak++;
            if (currentDate === today || currentDate === yesterday) {
              currentStreak = tempStreak;
            }
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
            if (currentDate === today || currentDate === yesterday) {
              currentStreak = tempStreak;
            }
          }
        } else {
          // Check for consecutive days
          if (nextDate && this.isConsecutiveDay(currentDate, nextDate)) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
          }
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);

      return { currentStreak, longestStreak };
    } catch (error) {
      console.error('❌ Error calculating study streaks:', error);
      return { currentStreak: 0, longestStreak: 0 };
    }
  }

  /**
   * Check if two dates are consecutive days
   */
  private isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d1.getTime() - d2.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  /**
   * Get learning patterns for a user
   */
  async getLearningPatterns(userId: string): Promise<{
    preferredStudyTime: string;
    averageSessionLength: number;
    topicsPerSession: number;
    retentionRate: number;
  }> {
    try {
      const { data: sessions, error } = await supabase
        .from('study_sessions')
        .select('start_time, duration, topics_covered')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        return {
          preferredStudyTime: 'Morning',
          averageSessionLength: 30,
          topicsPerSession: 1,
          retentionRate: 0
        };
      }

      // Analyze study time patterns
      const timeSlots = sessions.map(session => {
        const hour = new Date(session.start_time).getHours();
        if (hour >= 6 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 18) return 'Afternoon';
        if (hour >= 18 && hour < 22) return 'Evening';
        return 'Night';
      });

      const timeCounts = timeSlots.reduce((acc, time) => {
        acc[time] = (acc[time] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const preferredStudyTime = Object.entries(timeCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

      // Calculate average session length
      const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const averageSessionLength = Math.round(totalDuration / sessions.length);

      // Calculate topics per session
      const totalTopics = sessions.reduce((sum, session) => 
        sum + (session.topics_covered?.length || 0), 0);
      const topicsPerSession = Math.round(totalTopics / sessions.length);

      // Calculate retention rate (simplified - based on session frequency)
      const retentionRate = Math.min(Math.round((sessions.length / 30) * 100), 100);

      return {
        preferredStudyTime,
        averageSessionLength,
        topicsPerSession,
        retentionRate
      };
    } catch (error) {
      console.error('❌ Error analyzing learning patterns:', error);
      return {
        preferredStudyTime: 'Morning',
        averageSessionLength: 30,
        topicsPerSession: 1,
        retentionRate: 0
      };
    }
  }
}

// Export singleton instance
export const learningActivityTracker = new LearningActivityTracker();
