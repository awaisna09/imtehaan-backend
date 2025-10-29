import { useEffect, useRef, useCallback } from 'react';
import { autoActivityTracker } from '../utils/supabase/auto-activity-tracker';

interface UseAutoTrackingOptions {
  pageTitle: string;
  pageUrl: string;
  trackClicks?: boolean;
  trackTime?: boolean;
  trackScroll?: boolean;
  trackFocus?: boolean;
}

export const useAutoTracking = (options: UseAutoTrackingOptions) => {
  const {
    pageTitle,
    pageUrl,
    trackClicks = true,
    trackTime = true,
    trackScroll = false,
    trackFocus = false
  } = options;

  const startTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view on mount
  useEffect(() => {
    autoActivityTracker.trackPageView(pageTitle, pageUrl);
    startTimeRef.current = Date.now();
    lastActivityRef.current = Date.now();
  }, [pageTitle, pageUrl]);

  // Track time spent on page
  useEffect(() => {
    if (!trackTime) return;

    const trackTimeSpent = () => {
      const timeSpent = Date.now() - startTimeRef.current;
      if (timeSpent > 5000) { // Only track if spent more than 5 seconds
        console.log(`🎯 Tracking time spent: ${timeSpent}ms on ${pageTitle}`);
        autoActivityTracker.trackTimeSpent(pageTitle, pageUrl, timeSpent);
      }
    };

    // Track time when component unmounts or page changes
    return () => {
      trackTimeSpent();
    };
  }, [pageTitle, pageUrl, trackTime]);

  // Track clicks
  useEffect(() => {
    if (!trackClicks) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Get element info
      const elementId = target.id || target.className || target.tagName;
      const elementType = target.tagName.toLowerCase();

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.classList.contains('btn') || target.classList.contains('button')) {
        autoActivityTracker.trackButtonClick(elementId, elementType, pageTitle, pageUrl);
      }

      // Track link clicks
      if (target.tagName === 'A') {
        autoActivityTracker.trackButtonClick(elementId, elementType, pageTitle, pageUrl);
      }

      // Track form submissions
      if (target.tagName === 'FORM' || target.type === 'submit') {
        autoActivityTracker.trackActivity({
          activityType: 'form_submit',
          elementId,
          elementType,
          pageUrl,
          pageTitle,
          metadata: {
            formId: target.id || target.className
          }
        });
      }

      lastActivityRef.current = Date.now();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pageTitle, pageUrl, trackClicks]);

  // Track scroll activity
  useEffect(() => {
    if (!trackScroll) return;

    const handleScroll = () => {
      // Debounce scroll tracking
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        autoActivityTracker.trackActivity({
          activityType: 'scroll',
          pageUrl,
          pageTitle,
          metadata: {
            scrollY: window.scrollY,
            scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
          }
        });
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [pageTitle, pageUrl, trackScroll]);

  // Track focus/blur events
  useEffect(() => {
    if (!trackFocus) return;

    const handleFocus = () => {
      autoActivityTracker.trackActivity({
        activityType: 'focus',
        pageUrl,
        pageTitle,
        metadata: {
          focusTime: new Date().toISOString()
        }
      });
    };

    const handleBlur = () => {
      autoActivityTracker.trackActivity({
        activityType: 'blur',
        pageUrl,
        pageTitle,
        metadata: {
          blurTime: new Date().toISOString(),
          timeSpent: Date.now() - lastActivityRef.current
        }
      });
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [pageTitle, pageUrl, trackFocus]);

  // Manual tracking functions
  const trackAIInteraction = useCallback((query: string, responseLength: number) => {
    autoActivityTracker.trackAIInteraction(query, responseLength, pageTitle, pageUrl);
  }, [pageTitle, pageUrl]);

  const trackLessonStart = useCallback((lessonId: string, lessonTitle: string) => {
    autoActivityTracker.trackLessonStart(lessonId, lessonTitle, pageTitle, pageUrl);
  }, [pageTitle, pageUrl]);

  const trackLessonComplete = useCallback((lessonId: string, lessonTitle: string, duration: number) => {
    autoActivityTracker.trackLessonComplete(lessonId, lessonTitle, duration, pageTitle, pageUrl);
  }, [pageTitle, pageUrl]);

  const trackQuestionAttempt = useCallback((questionId: string, isCorrect: boolean, timeSpent: number) => {
    autoActivityTracker.trackQuestionAttempt(questionId, isCorrect, timeSpent, pageTitle, pageUrl);
  }, [pageTitle, pageUrl]);

  const trackFlashcardReview = useCallback((flashcardId: string, isCorrect: boolean, timeSpent: number) => {
    autoActivityTracker.trackFlashcardReview(flashcardId, isCorrect, timeSpent, pageTitle, pageUrl);
  }, [pageTitle, pageUrl]);

  const forceFlush = useCallback(async () => {
    await autoActivityTracker.forceFlush();
  }, []);

  return {
    trackAIInteraction,
    trackLessonStart,
    trackLessonComplete,
    trackQuestionAttempt,
    trackFlashcardReview,
    forceFlush,
    getBufferSize: () => autoActivityTracker.getBufferSize()
  };
};
