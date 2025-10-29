import { useEffect, useRef } from 'react';
import { useApp } from '../App';
import { pageActivityTracker } from '../utils/supabase/page-activity-tracker';

interface UsePageTrackingOptions {
  pageName: string;
  pageCategory: string;
  metadata?: Record<string, any>;
  trackActivities?: boolean;
}

export function usePageTracking({
  pageName,
  pageCategory,
  metadata = {},
  trackActivities = true
}: UsePageTrackingOptions) {
  const { user } = useApp();
  const sessionIdRef = useRef<string>('');
  const startTimeRef = useRef<Date>(new Date());

  // Track page entry when component mounts
  useEffect(() => {
    if (!user?.id) return;

    const trackEntry = async () => {
      try {
        const sessionId = await pageActivityTracker.trackPageEntry(
          user.id,
          pageName,
          pageCategory,
          {
            ...metadata,
            entryTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
          }
        );
        
        sessionIdRef.current = sessionId;
        startTimeRef.current = new Date();
        
        console.log(`📱 Page tracking started: ${pageName}`);
      } catch (error) {
        console.error('Error tracking page entry:', error);
      }
    };

    trackEntry();

    // Track page exit when component unmounts
    return () => {
      if (sessionIdRef.current && user?.id) {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
        
        pageActivityTracker.trackPageExit(sessionIdRef.current, {
          ...metadata,
          exitTime: endTime.toISOString(),
          sessionDuration: duration,
          exitReason: 'component_unmount',
          finalViewport: `${window.innerWidth}x${window.innerHeight}`
        });
        
        console.log(`🚪 Page tracking ended: ${pageName} (${duration}s)`);
      }
    };
  }, [user?.id, pageName, pageCategory]);

  // Track page activity (can be called from components)
  const trackActivity = async (
    activityType: string,
    activityData: Record<string, any> = {}
  ) => {
    if (!sessionIdRef.current || !trackActivities) return;

    try {
      await pageActivityTracker.trackPageActivity(
        sessionIdRef.current,
        activityType,
        {
          ...activityData,
          timestamp: new Date().toISOString(),
          pageName,
          pageCategory
        }
      );
    } catch (error) {
      console.error('Error tracking page activity:', error);
    }
  };

  // Track specific learning activities
  const trackQuestionAttempt = async (
    questionData: {
      subject: string;
      topic: string;
      difficulty: string;
      correct: boolean;
      timeSpent: number;
      questionId?: string;
    }
  ) => {
    await trackActivity('question_attempt', questionData);
  };

  const trackLessonProgress = async (
    lessonData: {
      subject: string;
      topic: string;
      lessonType: 'video' | 'text' | 'interactive';
      progress: number;
      timeSpent: number;
    }
  ) => {
    await trackActivity('lesson_progress', lessonData);
  };

  const trackFlashcardReview = async (
    flashcardData: {
      subject: string;
      topic: string;
      difficulty: string;
      correct: boolean;
      timeSpent: number;
      cardId?: string;
    }
  ) => {
    await trackActivity('flashcard_review', flashcardData);
  };

  const trackVideoProgress = async (
    videoData: {
      subject: string;
      topic: string;
      videoId: string;
      progress: number;
      timeSpent: number;
      watched: boolean;
    }
  ) => {
    await trackActivity('video_progress', videoData);
  };

  const trackAITutorInteraction = async (
    aiData: {
      subject: string;
      topic: string;
      questionType: string;
      responseTime: number;
      helpful: boolean;
    }
  ) => {
    await trackActivity('ai_tutor_interaction', aiData);
  };

  // Track user engagement metrics
  const trackEngagement = async (
    engagementData: {
      scrollDepth: number;
      timeOnPage: number;
      interactions: number;
      focusTime: number;
    }
  ) => {
    await trackActivity('user_engagement', engagementData);
  };

  // Track errors or issues
  const trackError = async (
    errorData: {
      errorType: string;
      errorMessage: string;
      component: string;
      userAction: string;
    }
  ) => {
    await trackActivity('error_occurred', errorData);
  };

  return {
    trackActivity,
    trackQuestionAttempt,
    trackLessonProgress,
    trackFlashcardReview,
    trackVideoProgress,
    trackAITutorInteraction,
    trackEngagement,
    trackError,
    sessionId: sessionIdRef.current
  };
}


















