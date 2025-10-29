import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import type { Curriculum } from '../App';
import { Checkbox } from './ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Logo } from './Logo';
import { useApp, StudySession } from '../App';
import { learningActivityTracker, ActivityAnalytics } from '../utils/supabase/learning-activity-tracker';
import { comprehensiveAnalyticsService, RealTimeAnalytics } from '../utils/supabase/comprehensive-analytics-service';
import { supabase } from '../utils/supabase/client';
import { useAutoTracking } from '../hooks/useAutoTracking';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Play,
  Brain,
  Plus,
  Users,
  Flame,
  Award,
  CreditCard,
  Settings,
  Globe,
  Home,
  CreditCard as CardIcon,
  User,
  LogOut,
  MessageCircle,
  Zap,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  FileText,
  Video
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const translations = {
    nav: {
      dashboard: "Dashboard",
    learning: "Learning",
      practice: "Practice", 
      analytics: "Analytics",
      account: "Account",
    aiTutor: "AI Tutor",
    // Learning menu options
    lessons: "Interactive Lessons",
    lessonsDesc: "Structured lessons with AI-powered explanations",
    visualLearning: "Visual Learning", 
    visualLearningDesc: "Learn through videos and visual content",
    // Practice menu options
    practiceMode: "Topical Practice",
    practiceModeDesc: "Practice questions with instant feedback",
    mockExams: "Mock Exams",
    mockExamsDesc: "Full-length exams with detailed grading",
    flashcards: "Flashcards",
    flashcardsDesc: "Quick review with flashcards"
    },
    welcome: "Welcome back",
    teacherTasks: "Teacher Assigned Tasks",
    createStudyPlan: "Create New Study Plan",
    studySchedule: "Study Schedule",
    date: "Date",
    studyTime: "Study Time",
    topics: "Topics",
    questions: "Questions",
    status: "Status",
    planned: "Planned",
    completed: "Completed",
    missed: "Missed",
    hours: "hours",
    minutes: "minutes",
    expandQuestions: "Show Questions",
    collapseQuestions: "Hide Questions",
    resumePractice: "Resume Practice",
    suggestedForYou: "Suggested for You",
    studyRecommendations: "Study Recommendations",
    recentActivity: "Recent Activity",
    achievements: "Achievements",
    studyStreak: "Study Streak",
    weeklyGoal: "Weekly Goal",
    upcomingDeadlines: "Upcoming Deadlines",
    viewAll: "View All",
    startPractice: "Start Practice",
    continue: "Continue",
    newBadge: "New Badge!",
    consecutiveDays: "{count} consecutive days",
    hoursThisWeek: "{count} hours this week",
    questionsCompleted: "{count} questions completed today",
    mockExam: "Mock Exam",
    visualLearning: "Visual Learning",
    aiTutor: "AI Tutor Session",
    askAI: "Ask AI Tutor",
    aiTutorDescription: "Get instant help with any topic",
    curriculum: {
      label: "Curriculum",
      igcse: "IGCSE",
      oLevels: "O Levels",
      aLevels: "A Levels", 
      edexcel: "Edexcel",
      ib: "IB System"
  }
};

export function StudentDashboard() {
  const { setCurrentPage, user, setUser, curriculum, setCurriculum, studySessions, setStudySessions } = useApp();
  
  // Auto-tracking for dashboard time
  useAutoTracking({
    pageTitle: 'Student Dashboard',
    pageUrl: '/dashboard',
    trackClicks: true,
    trackTime: true,
    trackScroll: true
  });
  
  const [expandedQuestions, setExpandedQuestions] = useState<{[key: string]: boolean}>({});
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [loadingStudyPlans, setLoadingStudyPlans] = useState(false);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  
  // New state for real-time learning analytics
  const [userAnalytics, setUserAnalytics] = useState<ActivityAnalytics[]>([]);
  const [studyStreaks, setStudyStreaks] = useState({ currentStreak: 0, longestStreak: 0 });
  const [learningPatterns, setLearningPatterns] = useState({
    preferredStudyTime: 'Morning',
    averageSessionLength: 30,
    topicsPerSession: 1,
    retentionRate: 0
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [dailyAnalytics, setDailyAnalytics] = useState<RealTimeAnalytics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  const t = translations;
  
  // Fetch study plans from database
  useEffect(() => {
    console.log('Dashboard mounted, user:', user);
    if (user?.id) {
      console.log('User authenticated, fetching study plans for:', user.id);
      fetchStudyPlans();
    } else {
      console.log('No authenticated user yet, skipping study plans fetch');
    }
  }, [user?.id]);
  
  // Fetch analytics when user changes (reset is handled at auth level)
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 Dashboard: User authenticated, fetching analytics...');
      
      // Force reset and fetch fresh data
      const initializeDashboard = async () => {
        try {
          setIsResetting(true);
          
          // Use the new reset and fresh analytics function
          console.log('🔄 Dashboard: Starting complete reset and fresh data fetch...');
          const freshAnalytics = await comprehensiveAnalyticsService.resetAndGetFreshAnalytics(user.id);
          
          // Set the fresh analytics data directly
          console.log('🔄 Dashboard: Setting fresh analytics state...');
          console.log('📊 Fresh analytics before set:', freshAnalytics);
          console.log('📊 Fresh analytics study time:', freshAnalytics.today.studyTimeMinutes);
          
          setDailyAnalytics(freshAnalytics);
          setLastUpdated(new Date());
          
          console.log('✅ Dashboard: Fresh analytics state set');
          console.log('📊 State should now show:', freshAnalytics.today.studyTimeMinutes, 'minutes');
          
          // Also fetch other analytics data (but reset userAnalytics to empty first)
          setUserAnalytics([]); // Reset to empty array first
          
          const [analytics, streaks, patterns] = await Promise.all([
            learningActivityTracker.getUserAnalytics(user.id),
            learningActivityTracker.getStudyStreaks(user.id),
            learningActivityTracker.getLearningPatterns(user.id)
          ]);
          
          setUserAnalytics(analytics);
          setStudyStreaks(streaks);
          setLearningPatterns(patterns);
          
          // Track dashboard visit
          trackDashboardVisit();
          
        } catch (error) {
          console.log('⚠️ Dashboard: Error during initialization:', error);
          // Still try to fetch analytics even if reset failed
        fetchLearningAnalytics();
          trackDashboardVisit();
        } finally {
          setIsResetting(false);
        }
      };
      
      initializeDashboard();
    } else {
      // User logged out, clear analytics state
      console.log('🔄 Dashboard: User logged out, clearing analytics state...');
      setDailyAnalytics(null);
      setUserAnalytics([]); // Clear user analytics
      setStudyStreaks({ currentStreak: 0, longestStreak: 0 });
      setLearningPatterns({
        preferredStudyTime: 'Morning',
        averageSessionLength: 30,
        topicsPerSession: 1,
        retentionRate: 0
      });
    }
  }, [user?.id]);

  // Set initial zero state when user first logs in
  useEffect(() => {
    if (user?.id && !dailyAnalytics) {
      console.log('🔄 Dashboard: Setting initial zero state for new user...');
      // Set a temporary zero state while we fetch real data
      setUserAnalytics([]); // Clear user analytics first
      setDailyAnalytics({
        today: {
          date: new Date().toISOString().split('T')[0],
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
        },
        thisWeek: {
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
        },
        thisMonth: {
          month: '',
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
        },
        currentStreak: 0,
        nextMilestone: 'Complete your first activity',
        focusAreas: ['Start studying to identify weak areas'],
        achievements: ['Complete your first activity to earn achievements']
      });
    }
  }, [user?.id, dailyAnalytics]);

  // Monitor dailyAnalytics state changes
  useEffect(() => {
    if (dailyAnalytics) {
      console.log('🔄 DAILY ANALYTICS STATE CHANGED:');
      console.log('📊 Study Time Minutes:', dailyAnalytics.today.studyTimeMinutes);
      console.log('📊 Total Time Spent:', dailyAnalytics.today.totalTimeSpent);
      console.log('📊 Full today object:', dailyAnalytics.today);
    } else {
      console.log('🔄 DAILY ANALYTICS STATE: NULL');
    }
  }, [dailyAnalytics]);

  // Fallback mechanism to reset stuck loading state
  useEffect(() => {
    if (!loadingAnalytics) return;
    
    const stuckTimeout = setTimeout(() => {
      console.log('⚠️ Loading state stuck for too long, resetting...');
      setLoadingAnalytics(false);
    }, 15000); // 15 seconds fallback
    
    return () => clearTimeout(stuckTimeout);
  }, [loadingAnalytics]);



  
  // Add debouncing to prevent rapid successive calls
  const fetchLearningAnalytics = React.useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingAnalytics(true);
    
    // Add timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      console.log('⏰ Analytics fetch timeout - forcing loading state to false');
      setLoadingAnalytics(false);
    }, 10000); // 10 second timeout
    
    try {
      console.log('🔄 Starting analytics fetch...');
      
      // Fetch all analytics data in parallel including daily analytics (force refresh with sessions)
      const [analytics, streaks, patterns, daily, recent] = await Promise.all([
        learningActivityTracker.getUserAnalytics(user.id),
        learningActivityTracker.getStudyStreaks(user.id),
        learningActivityTracker.getLearningPatterns(user.id),
        comprehensiveAnalyticsService.getRealTimeAnalyticsWithSessions(user.id),
        getRecentActivities()
      ]);
      
      setUserAnalytics(analytics);
      setStudyStreaks(streaks);
      setLearningPatterns(patterns);
      setDailyAnalytics(daily);
      setRecentActivities(recent);
      setLastUpdated(new Date());
      console.log('✅ Analytics refreshed successfully at', new Date().toLocaleTimeString());
      console.log('📊 Daily analytics data:', daily);
      console.log('📊 Today study time minutes:', daily?.today?.studyTimeMinutes);
      console.log('📊 Recent activities:', recent);
    } catch (error) {
      console.error('❌ Error fetching learning analytics:', error);
      // Set default values on error
      setUserAnalytics([]);
      setStudyStreaks({ currentStreak: 0, longestStreak: 0 });
      setLearningPatterns({
        preferredStudyTime: 'Morning',
        averageSessionLength: 30,
        topicsPerSession: 1,
        retentionRate: 0
      });
      setDailyAnalytics(null);
    } finally {
      clearTimeout(timeoutId);
      setLoadingAnalytics(false);
    }
  }, [user?.id]);

  // Force refresh function that bypasses loading state
  const forceRefreshAnalytics = React.useCallback(async () => {
    if (!user?.id) return;
    
    console.log('🔄 Force refreshing analytics...');
    setLoadingAnalytics(true);
    
    try {
      // Use the new reset and fresh analytics function
      const freshAnalytics = await comprehensiveAnalyticsService.resetAndGetFreshAnalytics(user.id);
      
      // Set the fresh analytics data directly
      setDailyAnalytics(freshAnalytics);
      setLastUpdated(new Date());
      console.log('✅ Analytics force refreshed, study time:', freshAnalytics.today.studyTimeMinutes);
      
    } catch (error) {
      console.error('❌ Failed to force refresh analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [user?.id]);

  
  const fetchStudyPlans = async () => {
    if (!user?.id) {
      console.log('No authenticated user, skipping study plans fetch');
      setStudyPlans([]);
      return;
    }

    setLoadingStudyPlans(true);
    try {
      const { studyPlansService } = await import('../utils/supabase/services');
      const { data, error } = await studyPlansService.getUserStudyPlans(user.id);
      
      if (error) {
        console.error('Error fetching study plans:', error);
        setStudyPlans([]);
      } else {
        console.log('Study plans fetched successfully:', data);
        setStudyPlans(data || []);
      }
    } catch (error) {
      console.error('Error importing study plans service:', error);
      setStudyPlans([]);
    } finally {
      setLoadingStudyPlans(false);
    }
  };
  
  // Function to refresh study plans (can be called from other components)
  const refreshStudyPlans = () => {
    fetchStudyPlans();
  };

  // Function to refresh all analytics including daily analytics
  const refreshAllAnalytics = () => {
    console.log('🔄 Manual refresh triggered by user');
    fetchLearningAnalytics();
  };

  // Track dashboard visit for analytics
  const trackDashboardVisit = async () => {
    if (!user?.id) return;
    
    try {
      // Track dashboard visit using comprehensive analytics service
      await comprehensiveAnalyticsService.trackPlatformActivity(
        user.id,
        'dashboard_visit',
        0,
        'Dashboard',
        'General'
      );
      console.log('📊 Dashboard visit tracked');
    } catch (error) {
      // Silently handle tracking errors
      console.log('Dashboard visit tracking failed:', error);
    }
  };

  // Helper functions for study sessions
  const toggleQuestionExpansion = (sessionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  // Helper functions for real-time analytics
  const calculateOverallProgress = () => {
    if (userAnalytics.length === 0) return 0;
    const totalProgress = userAnalytics.reduce((sum, topic) => sum + topic.completionPercentage, 0);
    return Math.round(totalProgress / userAnalytics.length);
  };

  const calculateTotalTimeSpent = () => {
    return userAnalytics.reduce((sum, topic) => sum + topic.timeSpent, 0);
  };

  const calculateAverageAccuracy = () => {
    if (userAnalytics.length === 0) return 0;
    const totalAccuracy = userAnalytics.reduce((sum, topic) => sum + topic.accuracy, 0);
    return Math.round(totalAccuracy / userAnalytics.length);
  };

  const getTopPerformingTopics = (limit: number = 3) => {
    return userAnalytics
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, limit);
  };

  const getTopicsNeedingReview = (limit: number = 3) => {
    return userAnalytics
      .filter(topic => topic.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit);
  };

  const getRecentActivities = async () => {
    try {
      if (!user?.id) return [];

      console.log('🔄 Fetching comprehensive recent activities for user:', user.id);

      // Get recent learning activities from multiple sources
      const [learningActivities, pageSessions] = await Promise.all([
        // Get learning activities from the main table
        supabase
          .from('learning_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Get recent page sessions to capture page visits
        supabase
          .from('page_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(10)
      ]);

      const allActivities: any[] = [];

      // Process learning activities
      if (learningActivities.data && !learningActivities.error) {
        learningActivities.data.forEach(activity => {
          allActivities.push({
            id: `learning_${activity.id}`,
            type: 'learning_activity',
            subject: activity.subject_name || 'Unknown Subject',
            topic: activity.topic_name || 'Unknown Topic',
            score: activity.accuracy || 0,
            time: formatTimeAgo(activity.created_at),
            activityType: activity.activity_type,
            duration: activity.duration,
            metadata: activity.metadata,
            timestamp: new Date(activity.created_at).getTime(),
            pageName: getPageNameFromActivityType(activity.activity_type),
            description: getActivityDescription(activity.activity_type, activity.topic_name, activity.accuracy)
          });
        });
      }

      // Process page sessions for page visits
      if (pageSessions.data && !pageSessions.error) {
        pageSessions.data.forEach(session => {
          // Only include learning-related page sessions
          if (isLearningPage(session.page_name)) {
            allActivities.push({
              id: `session_${session.id}`,
              type: 'page_visit',
              subject: 'Platform',
              topic: session.page_name,
              score: 0,
              time: formatTimeAgo(session.start_time),
              activityType: 'page_visit',
              duration: session.duration || 0,
              metadata: session.metadata,
              timestamp: new Date(session.start_time).getTime(),
              pageName: session.page_name,
              description: `Visited ${session.page_name}`
            });
          }
        });
      }

      // Sort all activities by timestamp (most recent first)
      allActivities.sort((a, b) => b.timestamp - a.timestamp);

      // Return the 5 most recent activities
      const recentActivities = allActivities.slice(0, 5);

      console.log('📊 Found recent activities:', recentActivities.length);
      recentActivities.forEach(activity => {
        console.log(`  - ${activity.activityType}: ${activity.topic} (${activity.time})`);
      });

      return recentActivities;

    } catch (error) {
      console.error('❌ Error in getRecentActivities:', error);
      // Fallback to topic-based activities
    return userAnalytics
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, 5)
      .map(topic => ({
          id: `topic_${topic.topicId}`,
        type: 'topic',
        subject: topic.subjectName,
        topic: topic.topicName,
        score: topic.accuracy,
          time: formatTimeAgo(topic.lastActivity),
          activityType: 'topic_review',
          description: `Reviewed ${topic.topicName}`
        }));
    }
  };

  // Helper function to get page name from activity type
  const getPageNameFromActivityType = (activityType: string): string => {
    switch (activityType) {
      case 'question': return 'Practice Mode';
      case 'lesson': return 'AI Tutor & Lessons';
      case 'video_lesson': return 'Visual Learning';
      case 'flashcard': return 'Flashcards';
      case 'mock_exam': return 'Mock Exams';
      case 'practice_session': return 'Practice Mode';
      case 'ai_tutor': return 'AI Tutor';
      default: return 'Learning Platform';
    }
  };

  // Helper function to get activity description
  const getActivityDescription = (activityType: string, topicName: string, accuracy?: number): string => {
    switch (activityType) {
      case 'question':
        return accuracy ? `Answered questions on ${topicName} (${accuracy}% accuracy)` : `Practiced questions on ${topicName}`;
      case 'lesson':
        return `Studied lesson: ${topicName}`;
      case 'video_lesson':
        return `Watched video lesson: ${topicName}`;
      case 'flashcard':
        return accuracy ? `Reviewed flashcards on ${topicName} (${accuracy}% mastery)` : `Reviewed flashcards on ${topicName}`;
      case 'mock_exam':
        return accuracy ? `Completed mock exam: ${topicName} (${accuracy}% score)` : `Completed mock exam: ${topicName}`;
      case 'practice_session':
        return `Completed practice session on ${topicName}`;
      case 'ai_tutor':
        return `Used AI tutor for ${topicName}`;
      default:
        return `Activity on ${topicName}`;
    }
  };

  // Helper function to check if a page is learning-related
  const isLearningPage = (pageName: string): boolean => {
    const learningPages = [
      'Practice Mode', 'Flashcards', 'AI Tutor & Lessons', 'Visual Learning', 
      'Mock Exams', 'Analytics', 'AI Tutor', 'Lessons', 'Practice'
    ];
    return learningPages.some(page => pageName.includes(page));
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return true ? `${diffInHours} hours ago` : `منذ ${diffInHours} ساعة`;
    if (diffInHours < 48) return 'Yesterday';
    const days = Math.floor(diffInHours / 24);
    return true ? `${days} days ago` : `منذ ${days} يوم`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return true 
        ? `${hours}h ${minutes}m`
        : `${hours}س ${minutes}د`;
    }
    return true ? `${minutes}m` : `${minutes}د`;
  };

  const updateSessionStatus = (sessionId: string, newStatus: 'planned' | 'completed' | 'missed') => {
    const updatedSessions = studySessions.map(session =>
      session.id === sessionId ? { ...session, status: newStatus } : session
    );
    setStudySessions(updatedSessions);
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return true 
        ? `${hours} ${hours === 1 ? 'hour' : t.hours}${mins > 0 ? ` ${mins} ${t.minutes}` : ''}`
        : `${hours} ${t.hours}${mins > 0 ? ` ${mins} ${t.minutes}` : ''}`;
    }
    return `${mins} ${t.minutes}`;
  };

  const getStatusBadge = (status: 'planned' | 'completed' | 'missed') => {
    const statusConfig = {
      planned: { 
        text: t.planned, 
        className: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      completed: { 
        text: t.completed, 
        className: 'bg-success-light text-success-dark border-success' 
      },
      missed: { 
        text: t.missed, 
        className: 'bg-red-100 text-red-800 border-red-200' 
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getSubjectsForCurriculum = () => {
    const getCurriculumName = () => {
      // Always return IGCSE
      return 'IGCSE';
    };

    const getTopicName = (subject: string) => {
      // Always use IGCSE topics
      const igcseTopics = {
          Mathematics: 'Algebra & Functions',
          Physics: 'Forces & Motion',
          Chemistry: 'Atomic Structure'
      };
      return igcseTopics[subject as keyof typeof igcseTopics] || subject;
    };

    const getChapterCount = () => {
      // Always return IGCSE chapter counts
      return { math: 8, physics: 6, chemistry: 7 };
    };

    const chapterCounts = getChapterCount();
    const curriculumName = getCurriculumName();

    // Get real analytics data for subjects
    const getSubjectAnalytics = (subjectName: string) => {
      const subjectTopics = userAnalytics.filter(topic => 
        topic.subjectName.toLowerCase().includes(subjectName.toLowerCase())
      );
      
      if (subjectTopics.length === 0) {
        return {
          progress: 0,
          completed: 0,
          accuracy: 0,
          timeSpent: 0
        };
      }
      
      const progress = Math.round(
        subjectTopics.reduce((sum, topic) => sum + topic.completionPercentage, 0) / subjectTopics.length
      );
      const completed = Math.round(
        subjectTopics.reduce((sum, topic) => sum + topic.lessonsCompleted, 0)
      );
      const accuracy = Math.round(
        subjectTopics.reduce((sum, topic) => sum + topic.accuracy, 0) / subjectTopics.length
      );
      const timeSpent = subjectTopics.reduce((sum, topic) => sum + topic.timeSpent, 0);
      
      return { progress, completed, accuracy, timeSpent };
    };

    const baseSubjects = [
      {
        name: 'Mathematics',
        progress: getSubjectAnalytics('Mathematics').progress,
        nextTopic: getTopicName('Mathematics'),
        color: 'bg-imtehaan-accent',
        chapters: chapterCounts.math,
        completed: getSubjectAnalytics('Mathematics').completed,
        level: curriculumName,
        accuracy: getSubjectAnalytics('Mathematics').accuracy,
        timeSpent: getSubjectAnalytics('Mathematics').timeSpent
      },
      {
        name: 'Physics',
        progress: getSubjectAnalytics('Physics').progress,
        nextTopic: getTopicName('Physics'),
        color: 'bg-imtehaan-secondary',
        chapters: chapterCounts.physics,
        completed: getSubjectAnalytics('Physics').completed,
        level: curriculumName,
        accuracy: getSubjectAnalytics('Physics').accuracy,
        timeSpent: getSubjectAnalytics('Physics').timeSpent
      },
      {
        name: 'Chemistry',
        progress: getSubjectAnalytics('Chemistry').progress,
        nextTopic: getTopicName('Chemistry'),
        color: 'bg-imtehaan-warning',
        chapters: chapterCounts.chemistry,
        completed: getSubjectAnalytics('Chemistry').completed,
        level: curriculumName,
        accuracy: getSubjectAnalytics('Chemistry').accuracy,
        timeSpent: getSubjectAnalytics('Chemistry').timeSpent
      }
    ];

    // Add IGCSE Biology as the fourth subject
    baseSubjects.push({
      name: 'Biology',
      progress: getSubjectAnalytics('Biology').progress,
      nextTopic: 'Cell Biology',
      color: 'bg-imtehaan-primary',
      chapters: 8,
      completed: getSubjectAnalytics('Biology').completed,
      level: curriculumName,
      accuracy: getSubjectAnalytics('Biology').accuracy,
      timeSpent: getSubjectAnalytics('Biology').timeSpent
    });

    // Helper function to get the weakest subject based on accuracy
    const getWeakestSubject = () => {
      const subjects = ['Mathematics', 'Physics', 'Chemistry'];
      let weakestSubject = subjects[0];
      let lowestAccuracy = 100;
      
      subjects.forEach(subject => {
        const analytics = getSubjectAnalytics(subject);
        if (analytics.accuracy < lowestAccuracy) {
          lowestAccuracy = analytics.accuracy;
          weakestSubject = subject;
        }
      });
      
      return true ? weakestSubject : 
        weakestSubject === 'Mathematics' ? 'الرياضيات' :
        weakestSubject === 'Physics' ? 'الفيزياء' : 'الكيمياء';
    };

    return baseSubjects;
  };

  const subjects = getSubjectsForCurriculum();

  // Helper function to get the weakest subject based on accuracy
  const getWeakestSubject = () => {
    const subjects = ['Mathematics', 'Physics', 'Chemistry'];
    let weakestSubject = subjects[0];
    let lowestAccuracy = 100;
    
    subjects.forEach(subject => {
      const subjectData = userAnalytics.filter(t => t.subjectName === subject);
      if (subjectData.length > 0) {
        const totalQuestions = subjectData.reduce((sum, t) => sum + t.questionsAttempted, 0);
        const correctAnswers = subjectData.reduce((sum, t) => sum + t.questionsCorrect, 0);
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        if (accuracy < lowestAccuracy) {
          lowestAccuracy = accuracy;
          weakestSubject = subject;
        }
      }
    });
    
    return true ? weakestSubject : 
      weakestSubject === 'Mathematics' ? 'الرياضيات' :
      weakestSubject === 'Physics' ? 'الفيزياء' : 'الكيمياء';
  };

  // Recent activities are now fetched and stored in state

  // Generate real achievements based on analytics
  const achievements = [
    {
      icon: Flame,
      title: true ? `${studyStreaks.currentStreak}-Day Streak` : `سلسلة ${studyStreaks.currentStreak} أيام`,
      description: 'Studied every day this week',
      isNew: studyStreaks.currentStreak >= 7
    },
    {
      icon: Target,
      title: 'Perfect Score',
      description: true ? `Got ${calculateAverageAccuracy()}% average accuracy` : `حصلت على ${calculateAverageAccuracy()}% متوسط الدقة`,
      isNew: calculateAverageAccuracy() >= 90
    },
    {
      icon: Trophy,
      title: 'Quick Learner',
      description: true ? `Completed ${userAnalytics.reduce((sum, t) => sum + t.questionsAttempted, 0)} questions total` : `أكملت ${userAnalytics.reduce((sum, t) => sum + t.questionsAttempted, 0)} سؤال إجمالي`,
      isNew: userAnalytics.reduce((sum, t) => sum + t.questionsAttempted, 0) >= 50
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <nav className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-b border-blue-100/50 sticky top-0 z-40 shadow-sm backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-0 sm:px-1 lg:px-2">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <Logo size="md" showText={true} className="-mt-2" />
              <div className="ml-4 hidden sm:block">
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:block ml-8">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="flex items-center px-4 py-2 text-imtehaan-primary font-medium rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                >
                  <Home className="h-4 w-4 mr-2" />
                  {t.nav.dashboard}
                </button>
                
                {/* Learning Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center px-4 py-2 text-gray-700 hover:text-imtehaan-primary font-medium rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border hover:border-blue-200/50 transition-all duration-200">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {t.nav.learning}
                      <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="start">
                    <DropdownMenuLabel className="font-semibold">Choose Learning Mode</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('ai-tutor-topic-selection')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors w-full cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.lessons}</h4>
                          <p className="text-sm text-gray-600">{t.nav.lessonsDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                  onClick={() => setCurrentPage('visual-learning')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors w-full cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.visualLearning}</h4>
                          <p className="text-sm text-gray-600">{t.nav.visualLearningDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Practice Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center px-4 py-2 text-gray-700 hover:text-imtehaan-primary font-medium rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border hover:border-blue-200/50 transition-all duration-200">
                      <Target className="h-4 w-4 mr-2" />
                      {t.nav.practice}
                      <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="start">
                    <DropdownMenuLabel className="font-semibold">Choose Practice Mode</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('practice')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors w-full cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.practiceMode}</h4>
                          <p className="text-sm text-gray-600">{t.nav.practiceModeDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('mock-exam-selection')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors w-full cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.mockExams}</h4>
                          <p className="text-sm text-gray-600">{t.nav.mockExamsDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('flashcard-selection')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-pink-50 transition-colors w-full cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CardIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.flashcards}</h4>
                          <p className="text-sm text-gray-600">{t.nav.flashcardsDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button 
                  onClick={() => setCurrentPage('analytics')}
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-imtehaan-primary font-medium rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border hover:border-blue-200/50 transition-all duration-200"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t.nav.analytics}
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* IGCSE Badge */}
              <div className="hidden sm:flex items-center">
                <div className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
                  {t.curriculum.igcse}
                </div>
              </div>
              
              {/* IGCSE Only - Mobile */}
              <div className="sm:hidden">
                <div className="px-2 py-1 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-xs font-semibold rounded-full">
                  {t.curriculum.igcse}
                </div>
              </div>
              
              {/* Settings */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage('settings')}
                className="text-gray-600 hover:text-imtehaan-primary hover:bg-blue-50/50 rounded-lg transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setUser(null);
                  setCurrentPage('landing');
                }}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-0 sm:px-1 lg:px-2 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="mb-4">
              <h1 className="text-3xl font-bold text-black mb-2">
                {t.welcome}, {user?.email?.split('@')[0] || 'Student'}! 👋
              </h1>
              <p className="text-gray-600">
                {true 
                  ? "Ready to continue your learning journey?" 
                  : "مستعد لمتابعة رحلة التعلم؟"
                }
              </p>
              
              {/* Refresh Analytics Button */}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceRefreshAnalytics}
                  disabled={loadingAnalytics}
                  className="flex items-center gap-2 hover:bg-blue-50"
                >
                  {loadingAnalytics ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh Analytics
                    </>
                  )}
                </Button>
              </div>
              
              {/* Real-time Progress Summary */}
              {!loadingAnalytics && userAnalytics.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Overall Progress</p>
                        <p className="text-2xl font-bold text-imtehaan-primary">{calculateOverallProgress()}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-imtehaan-primary" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Study Streak</p>
                        <p className="text-2xl font-bold text-imtehaan-error">{studyStreaks.currentStreak} days</p>
                      </div>
                      <Flame className="h-8 w-8 text-imtehaan-error" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Average Accuracy</p>
                        <p className="text-2xl font-bold text-imtehaan-success">{calculateAverageAccuracy()}%</p>
                      </div>
                      <Target className="h-8 w-8 text-imtehaan-success" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Time Spent</p>
                        <p className="text-2xl font-bold text-imtehaan-accent">
                          {isResetting ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-imtehaan-accent"></div>
                          ) : (
                            formatDuration(dailyAnalytics?.today?.studyTimeMinutes ? dailyAnalytics.today.studyTimeMinutes * 60 : 0)
                          )}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-imtehaan-accent" />
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Study Schedule Container */}
        <div className="mb-8">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-6">
              {loadingStudyPlans ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your study schedule...</p>
            </div>
          </div>
              ) : studyPlans.length > 0 ? (
                <div>
                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {studyPlans.length > 1 && (
                        <>
                <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPlanIndex((prev) => (prev === 0 ? studyPlans.length - 1 : prev - 1))}
                            disabled={studyPlans.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowLeft className="h-4 w-4" />
                </Button>
                          <span className="text-sm text-gray-600 font-medium px-2">
                            {currentPlanIndex + 1} / {studyPlans.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPlanIndex((prev) => (prev === studyPlans.length - 1 ? 0 : prev + 1))}
                            disabled={studyPlans.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
              </div>
                    {studyPlans.length === 1 && <div></div>}
                  <Button 
                      onClick={() => setCurrentPage('study-plan')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                      <Plus className="mr-2 h-4 w-4" />
                      Create New
                  </Button>
        </div>

                  {/* Current Plan Display */}
                  {(() => {
                    const plan = studyPlans[currentPlanIndex];
                    const studyHours = Math.floor(plan.study_time_minutes / 60);
                    const studyMins = plan.study_time_minutes % 60;
                    
                    return (
                      <div key={plan.plan_id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 mb-1">{plan.plan_name}</h4>
                              <p className="text-gray-600">
                                Subject: <span className="font-medium">{plan.subject || 'Business Studies'}</span>
                              </p>
                            </div>
                          </div>
                          <Badge 
                            className={`text-xs px-3 py-1 ${
                              plan.status === 'completed' 
                                ? 'bg-green-500 text-white' 
                                : plan.status === 'missed' 
                                ? 'bg-red-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            {plan.status || 'active'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Exam Date</p>
                            <p className="font-semibold text-gray-900">
                              {plan.exam_date 
                                ? new Date(plan.exam_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })
                                : 'Not set'}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Daily Study Time</p>
                            <p className="font-semibold text-gray-900 flex items-center gap-1">
                              <Clock className="h-4 w-4 text-blue-600" />
                              {studyHours > 0 ? `${studyHours}h` : ''} {studyMins > 0 ? `${studyMins}m` : '0m'}
                            </p>
                          </div>
                          </div>

                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Total Topics: <span className="text-blue-600">{plan.total_topics || 0}</span>
                          </p>
                          </div>
                        
                        {/* Topics to Cover */}
                        {plan.topics_to_cover && plan.topics_to_cover.length > 0 && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              Topics to Cover:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {plan.topics_to_cover.map((topic: string, index: number) => (
                                <div 
                                  key={index} 
                                  className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100 transition-colors"
                                >
                                  {topic}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">No Study Schedule Yet</h3>
                  <p className="text-gray-600 mb-4">Create a study plan to track your learning progress</p>
                    <Button 
                      onClick={() => setCurrentPage('study-plan')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Study Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">


            {/* Daily Analytics Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      {true ? 'Today\'s Progress' : 'تقدم اليوم'}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {'Real-time daily analytics'}
                      {lastUpdated && (
                        <div className="text-xs text-gray-400 mt-1">
                          {'Last updated: '}
                          {lastUpdated.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshAllAnalytics}
                    disabled={loadingAnalytics}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                    {'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading daily analytics...</p>
                  </div>
                ) : dailyAnalytics ? (
                  <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dailyAnalytics.today.totalActivities}
                      </div>
                      <div className="text-sm text-blue-700">
                        {'Activities'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {isResetting ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        ) : (
                          Math.round(dailyAnalytics.today.studyTimeMinutes)
                        )}
                      </div>
                      <div className="text-sm text-green-700">
                        {isResetting ? (
                          'Resetting...'
                        ) : (
                          'Minutes'
                        )}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {dailyAnalytics.today.dailyAccuracy}%
                      </div>
                      <div className="text-sm text-purple-700">
                        {'Accuracy'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {dailyAnalytics.today.sessionCount}
                      </div>
                      <div className="text-sm text-orange-700">
                        {'Sessions'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Daily Stats */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3 text-gray-900">
                        {'Learning Activities'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Questions Attempted'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.questionsAttempted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Lessons Completed'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.lessonsCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Flashcards Reviewed'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.flashcardsReviewed}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3 text-gray-900">
                        {'Platform Usage'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'AI Tutor Interactions'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.aiTutorInteractions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Topic Selections'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.topicSelections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Productivity Score'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.productivityScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage('analytics')}
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {'View Full Analytics'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage('practice')}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {'Start Practice'}
                    </Button>
                  </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {'No Daily Data Yet'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {true 
                        ? 'Start learning to see your daily progress here.'
                        : 'ابدأ التعلم لرؤية تقدمك اليومي هنا.'
                      }
                    </p>
                    <Button
                      onClick={() => setCurrentPage('practice')}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {'Start Learning'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume Practice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Play className="h-5 w-5 mr-2 text-imtehaan-primary" />
                    {t.resumePractice}
                  </div>
                  <Button variant="ghost" size="sm">
                    {t.viewAll}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading practice data...</p>
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {/* Last Activity */}
                    {recentActivities.slice(0, 1).map((activity, index) => (
                      <div key={activity.id || index} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {activity.activityType === 'question' || activity.activityType === 'practice_session' ? (
                                <BookOpen className="h-8 w-8 text-blue-600" />
                              ) : activity.activityType === 'lesson' || activity.activityType === 'video_lesson' ? (
                                <GraduationCap className="h-8 w-8 text-green-600" />
                              ) : activity.activityType === 'flashcard' ? (
                                <Brain className="h-8 w-8 text-purple-600" />
                              ) : activity.activityType === 'mock_exam' ? (
                                <Trophy className="h-8 w-8 text-orange-600" />
                              ) : activity.activityType === 'ai_tutor' ? (
                                <MessageCircle className="h-8 w-8 text-indigo-600" />
                              ) : (
                                <Play className="h-8 w-8 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {'Continue '}
                                {activity.activityType === 'question' || activity.activityType === 'practice_session' ? ('Practice') :
                                 activity.activityType === 'lesson' || activity.activityType === 'video_lesson' ? ('Lesson') :
                                 activity.activityType === 'flashcard' ? ('Flashcards') :
                                 activity.activityType === 'mock_exam' ? ('Mock Exam') :
                                 activity.activityType === 'ai_tutor' ? ('AI Tutor') :
                                 ('Activity')}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {activity.type === 'page_visit' ? activity.topic : `${activity.subject} - ${activity.topic}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.time}
                                {activity.score > 0 && ` • ${activity.score}% accuracy`}
                                {activity.duration && activity.duration > 0 && ` • ${Math.round(activity.duration / 60)}m`}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              // Navigate to appropriate page based on activity type
                              if (activity.activityType === 'question' || activity.activityType === 'practice_session') {
                                setCurrentPage('practice');
                              } else if (activity.activityType === 'flashcard') {
                                setCurrentPage('flashcards');
                              } else if (activity.activityType === 'lesson' || activity.activityType === 'video_lesson' || activity.activityType === 'ai_tutor') {
                                setCurrentPage('ai-tutor-topic-selection');
                              } else if (activity.activityType === 'mock_exam') {
                                setCurrentPage('mock-exam-selection');
                              } else {
                                setCurrentPage('practice');
                              }
                            }}
                            className="bg-imtehaan-primary hover:bg-imtehaan-primary-dark text-white"
                          >
                            {'Continue'}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Additional Recent Activities */}
                    {recentActivities.slice(1, 3).map((activity, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {activity.activityType === 'question' ? (
                                <BookOpen className="h-6 w-6 text-blue-600" />
                              ) : activity.activityType === 'lesson' ? (
                                <GraduationCap className="h-6 w-6 text-green-600" />
                              ) : activity.activityType === 'flashcard' ? (
                                <Brain className="h-6 w-6 text-purple-600" />
                              ) : (
                                <Play className="h-6 w-6 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {activity.subject} - {activity.topic}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.time}
                                {activity.score > 0 && ` • ${activity.score}%`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage('practice')}
                          >
                            {'Resume'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userAnalytics.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Top Performing Topic */}
                    {(() => {
                      const topTopic = getTopPerformingTopics(1)[0];
                      if (!topTopic) return null;
                      
                      return (
                        <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                             onClick={() => setCurrentPage('practice')}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {topTopic.topicName} Practice
                            </span>
                            <Badge variant="outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                              {topTopic.accuracy}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="h-2 rounded-full transition-all duration-300" 
                                 style={{ 
                                   width: `${topTopic.completionPercentage}%`,
                                   background: 'linear-gradient(90deg, var(--teal-medium), var(--success))'
                                 }}></div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {topTopic.questionsAttempted} questions completed • {formatDuration(topTopic.timeSpent)}
                          </div>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setCurrentPage('ai-tutor-topic-selection'); }}
                                  style={{ borderColor: 'var(--ai-blue)', color: 'var(--ai-blue)' }}
                                  className="hover:bg-blue-50">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {'Get Help'}
                          </Button>
                        </div>
                      );
                    })()}

                    {/* Topic Needing Review */}
                    {(() => {
                      const reviewTopic = getTopicsNeedingReview(1)[0];
                      if (!reviewTopic) return null;
                      
                      return (
                        <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                             onClick={() => setCurrentPage('practice')}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {reviewTopic.topicName} Review
                            </span>
                            <Badge variant="outline" className="border-imtehaan-warning text-imtehaan-warning">
                              {reviewTopic.accuracy}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="bg-imtehaan-gradient-secondary h-2 rounded-full transition-all duration-300" 
                                 style={{ width: `${reviewTopic.completionPercentage}%` }}></div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {reviewTopic.questionsAttempted} questions • {formatDuration(reviewTopic.timeSpent)}
                          </div>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setCurrentPage('ai-tutor-topic-selection'); }}
                                  style={{ borderColor: 'var(--ai-blue)', color: 'var(--ai-blue)' }}
                                  className="hover:bg-blue-50">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {'Get Help'}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg text-gray-600 mb-2">
                      {'No Practice Data Yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {true 
                        ? 'Start practicing to see your progress here.'
                        : 'ابدأ الممارسة لرؤية تقدمك هنا.'
                      }
                    </p>
                    <Button
                      onClick={() => setCurrentPage('practice')}
                      className="bg-imtehaan-primary hover:bg-imtehaan-primary-dark text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Practice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-imtehaan-primary" />
                  {t.studyRecommendations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing your performance...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Performance-Based Recommendations */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-1">
                            {'Focus on Weak Areas'}
                          </h4>
                          <p className="text-sm text-blue-700 mb-3">
                            {true 
                              ? `Based on your ${calculateAverageAccuracy()}% accuracy, practice more questions in challenging topics`
                              : `بناءً على دقتك ${calculateAverageAccuracy()}%، مارس المزيد من الأسئلة في المواضيع الصعبة`
                            }
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                            onClick={() => setCurrentPage('practice')}
                          >
                            {'Start Practice'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Study Schedule Recommendation */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 mb-1">
                            {'Optimal Study Time'}
                          </h4>
                          <p className="text-sm text-green-700 mb-3">
                            {true 
                              ? `Your best performance is between 2-4 PM. Schedule your study sessions accordingly.`
                              : `أفضل أداء لك بين الساعة 2-4 مساءً. جدول جلسات الدراسة وفقاً لذلك.`
                            }
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => setCurrentPage('study-plan')}
                          >
                            {'View Schedule'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* AI Tutor Recommendation */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-900 mb-1">
                            {'AI Tutor Session'}
                          </h4>
                          <p className="text-sm text-purple-700 mb-3">
                            {true 
                              ? `You've been struggling with ${getWeakestSubject()}. Let AI help you understand it better.`
                              : `كنت تواجه صعوبة في ${getWeakestSubject()}. دع الذكي يساعدك على فهمه بشكل أفضل.`
                            }
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-purple-300 text-purple-700 hover:bg-purple-100"
                            onClick={() => setCurrentPage('ai-tutor-topic-selection')}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {'Ask AI Tutor'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Milestone */}
                    <div 
                      className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setCurrentPage('analytics')}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-900 mb-1">
                            {'Next Milestone'}
                          </h4>
                          <p className="text-sm text-orange-700 mb-3">
                            {true 
                              ? `Complete 5 more questions to unlock the "Problem Solver" badge!`
                              : `أكمل 5 أسئلة أخرى لفتح شارة "حلال المشاكل"!`
                            }
                          </p>
                          <div className="w-full bg-orange-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  {true ? 'Today\'s Summary' : 'ملخص اليوم'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loadingAnalytics ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading...</p>
                  </div>
                ) : dailyAnalytics ? (
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {dailyAnalytics.today.totalActivities}
                      </div>
                      <div className="text-sm text-green-700">
                        {'Activities Today'}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {'Study Time'}
                        </span>
                        <span className="font-medium">
                          {Math.round(dailyAnalytics.today.studyTimeMinutes)}m
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {'Accuracy'}
                        </span>
                        <span className="font-medium">
                          {dailyAnalytics.today.dailyAccuracy}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {'Sessions'}
                        </span>
                        <span className="font-medium">
                          {dailyAnalytics.today.sessionCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Study Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Flame className="h-5 w-5 text-imtehaan-error mr-2" />
                      <span className="font-medium">{t.studyStreak}</span>
                    </div>
                    <span className="text-2xl font-bold text-imtehaan-error">
                      {loadingAnalytics ? '...' : studyStreaks.currentStreak}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {loadingAnalytics 
                      ? 'Loading...' 
                      : t.consecutiveDays.replace('{count}', studyStreaks.currentStreak.toString())
                    }
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{t.weeklyGoal}</span>
                      <span className="text-sm text-gray-600">
                        {loadingAnalytics ? '...' : formatDuration(calculateTotalTimeSpent())}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${loadingAnalytics ? 0 : Math.min(calculateOverallProgress(), 100)}%`,
                          background: 'linear-gradient(90deg, var(--emerald), var(--success))'
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {loadingAnalytics 
                        ? 'Loading...' 
                        : `${calculateOverallProgress()}% overall progress`
                      }
                    </div>
                  </div>

                  {/* Additional Real-time Metrics */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Average Accuracy</span>
                      <span className="text-sm text-gray-600">
                        {loadingAnalytics ? '...' : `${calculateAverageAccuracy()}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${loadingAnalytics ? 0 : calculateAverageAccuracy()}%`,
                          background: calculateAverageAccuracy() >= 80 
                            ? 'linear-gradient(90deg, var(--emerald), var(--success))'
                            : calculateAverageAccuracy() >= 60
                            ? 'linear-gradient(90deg, var(--teal-medium), var(--emerald))'
                            : 'linear-gradient(90deg, var(--teal-light), var(--teal-medium))'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-imtehaan-accent" />
                  Learning Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preferred Study Time</span>
                    <span className="font-medium">
                      {loadingAnalytics ? '...' : learningPatterns.preferredStudyTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Session Length</span>
                    <span className="font-medium">
                      {loadingAnalytics ? '...' : formatDuration(learningPatterns.averageSessionLength)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Topics per Session</span>
                    <span className="font-medium">
                      {loadingAnalytics ? '...' : learningPatterns.topicsPerSession}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <span className="font-medium">
                      {loadingAnalytics ? '...' : `${learningPatterns.retentionRate}%`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick AI Access */}
            <Card style={{ background: 'linear-gradient(135deg, var(--ai-blue-light), var(--ai-blue-accent))', borderColor: 'var(--ai-blue)' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" 
                     style={{ backgroundColor: 'var(--ai-blue)' }}>
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{'Need Help?'}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {true 
                    ? 'Ask our AI tutor anything about your studies'
                    : 'اسأل مدرسنا الذكي أي شيء عن دراستك'
                  }
                </p>
                <Button 
                  onClick={() => setCurrentPage('ai-tutor-topic-selection')}
                  className="w-full text-white"
                  style={{ backgroundColor: 'var(--ai-blue)', borderColor: 'var(--ai-blue)' }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {t.askAI}
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-imtehaan-warning" />
                  {t.achievements}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading achievements...</p>
                  </div>
                ) : achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <achievement.icon className="h-5 w-5 text-imtehaan-primary mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">{achievement.title}</span>
                            {achievement.isNew && (
                              <Badge className="ml-2 text-xs bg-imtehaan-primary text-white">{t.newBadge}</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg text-gray-600 mb-2">
                      {'No Achievements Yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {true 
                        ? 'Start learning to earn your first achievements.'
                        : 'ابدأ التعلم لكسب إنجازاتك الأولى.'
                      }
                    </p>
                    <Button
                      onClick={() => setCurrentPage('practice')}
                      className="bg-imtehaan-primary hover:bg-imtehaan-primary-dark text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-imtehaan-accent" />
                  {t.recentActivity}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading recent activities...</p>
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex-shrink-0">
                            {activity.activityType === 'question' || activity.activityType === 'practice_session' ? (
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            ) : activity.activityType === 'lesson' || activity.activityType === 'video_lesson' ? (
                              <GraduationCap className="h-5 w-5 text-green-600" />
                            ) : activity.activityType === 'flashcard' ? (
                              <Brain className="h-5 w-5 text-purple-600" />
                            ) : activity.activityType === 'mock_exam' ? (
                              <Trophy className="h-5 w-5 text-orange-600" />
                            ) : activity.activityType === 'ai_tutor' ? (
                              <MessageCircle className="h-5 w-5 text-indigo-600" />
                            ) : activity.activityType === 'page_visit' ? (
                              <Home className="h-5 w-5 text-gray-600" />
                            ) : (
                              <Play className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {activity.type === 'page_visit' ? activity.topic : `${activity.subject} - ${activity.topic}`}
                        </div>
                            <div className="text-xs text-gray-600">
                              {activity.description || (
                                activity.activityType === 'question' ? ('Practice Questions') :
                                activity.activityType === 'lesson' ? ('Lesson') :
                                activity.activityType === 'video_lesson' ? ('Video Lesson') :
                                activity.activityType === 'flashcard' ? ('Flashcards') :
                                activity.activityType === 'mock_exam' ? ('Mock Exam') :
                                activity.activityType === 'ai_tutor' ? ('AI Tutor') :
                                activity.activityType === 'page_visit' ? ('Page Visit') :
                                ('Activity')
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.time}
                              {activity.duration && activity.duration > 0 && ` • ${Math.round(activity.duration / 60)}m`}
                              {activity.pageName && activity.type === 'page_visit' && ` • ${activity.pageName}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {activity.score && activity.score > 0 && (
                          <Badge 
                              className={activity.score >= 80 ? 'bg-green-100 text-green-800' : 
                                       activity.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                          >
                            {activity.score}%
                          </Badge>
                        )}
                          {activity.type === 'page_visit' && (
                            <Badge variant="outline" className="text-xs">
                              {'Visit'}
                          </Badge>
                        )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg text-gray-600 mb-2">
                      {'No Recent Activity'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {true 
                        ? 'Start learning to see your recent activities here.'
                        : 'ابدأ التعلم لرؤية أنشطتك الحديثة هنا.'
                      }
                    </p>
                    <Button
                      onClick={() => setCurrentPage('practice')}
                      className="bg-imtehaan-primary hover:bg-imtehaan-primary-dark text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}