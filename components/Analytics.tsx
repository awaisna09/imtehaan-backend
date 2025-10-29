import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase/client';
import { useApp } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Trophy, 
  Target, 
  RefreshCw, 
  Lightbulb, 
  BarChart3,
  AlertCircle,
  Calendar,
  Clock,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { comprehensiveAnalyticsService, RealTimeAnalytics, DailyProgressData } from '../utils/supabase/comprehensive-analytics-service';
import { autoActivityTracker } from '../utils/supabase/auto-activity-tracker';
import { useAutoTracking } from '../hooks/useAutoTracking';

// Types
interface TopicProgress {
  topicId: string;
  topicName: string;
  subjectName: string;
  totalQuestions: number;
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
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedCompletionTime: number;
  prerequisites: string[];
  relatedTopics: string[];
  completionPercentage: number;
  studyStreak: number;
  averageStudyTime: number;
  recommendedNextTopics: string[];
}

// Translations
const translations = {
  en: {
    analytics: "Analytics",
    backToDashboard: "Back to Dashboard",
    refresh: "Refresh",
    lastActivity: "Last Updated",
    overview: "Overview",
    topics: "Topics",
    insights: "Insights",
    progress: "Progress",
    performance: "Performance",
    patterns: "Patterns",
    totalTopics: "Total Topics",
    completedTopics: "Completed",
    topicsInProgress: "In Progress",
    averageMastery: "Avg Mastery",
    topicProgress: "Topic Progress",
    nextTopics: "Next Topics",
    reviewTopics: "Review Topics",
    topicMastery: "Topic Mastery",
    topicInsights: "Topic Insights",
    masteryLevel: "Mastery Level",
    difficulty: "Difficulty",
    completionPercentage: "Completion",
    questions: "Questions",
    accuracy: "Accuracy",
    timeSpent: "Time Spent",
    streakDays: "day streak",
    noTopics: "No Topics Found",
    startStudying: "Start studying to see your progress",
    loadingTopics: "Loading topics...",
    errorLoading: "Error Loading Analytics",
    retry: "Try Again",
    minutes: "min",
    hours: "h",
    // Enhanced features
    weeklyProgress: "Weekly Progress",
    studyStreaks: "Study Streaks",
    performanceMetrics: "Performance Metrics",
    learningPatterns: "Learning Patterns",
    currentStreak: "Current Streak",
    longestStreak: "Longest Streak",
    averageDailyTime: "Avg Daily Time",
    mostProductiveDay: "Most Productive Day",
    overallAccuracy: "Overall Accuracy",
    improvementRate: "Improvement Rate",
    weakAreas: "Weak Areas",
    strongAreas: "Strong Areas",
    timeEfficiency: "Time Efficiency",
    preferredStudyTime: "Preferred Study Time",
    averageSessionLength: "Avg Session Length",
    topicsPerSession: "Topics per Session",
    retentionRate: "Retention Rate",
    studyTrends: "Study Trends",
    productivityScore: "Productivity Score",
    focusAreas: "Focus Areas",
    // Daily progress
    todayProgress: "Today's Progress",
    dailyOverview: "Daily Overview",
    dailyStats: "Daily Statistics",
    dailyGoals: "Daily Goals",
    nextMilestone: "Next Milestone",
    achievements: "Achievements",
    recommendations: "Recommendations",
    studyTime: "Study Time",
    activitiesCompleted: "Activities Completed",
    currentAccuracy: "Current Accuracy",
    sessionCount: "Session Count",
    averageSession: "Average Session",
    monthlyProgress: "Monthly Progress",
    aiTutorInteractions: "AI Tutor Interactions",
    topicSelections: "Topic Selections",
    lessonsCompleted: "Lessons Completed",
    videoLessonsCompleted: "Video Lessons Completed",
    flashcardsReviewed: "Flashcards Reviewed"
  },
  ar: {
    analytics: "التحليلات",
    backToDashboard: "العودة للوحة التحكم",
    refresh: "تحديث",
    lastActivity: "آخر تحديث",
    overview: "نظرة عامة",
    topics: "المواضيع",
    insights: "رؤى",
    progress: "التقدم",
    performance: "الأداء",
    patterns: "الأنماط",
    totalTopics: "إجمالي المواضيع",
    completedTopics: "مكتمل",
    topicsInProgress: "قيد التقدم",
    averageMastery: "متوسط الإتقان",
    topicProgress: "تقدم المواضيع",
    nextTopics: "المواضيع التالية",
    reviewTopics: "مراجعة المواضيع",
    topicMastery: "إتقان المواضيع",
    topicInsights: "رؤى المواضيع",
    masteryLevel: "مستوى الإتقان",
    difficulty: "الصعوبة",
    completionPercentage: "النسبة المئوية للإكمال",
    questions: "الأسئلة",
    accuracy: "الدقة",
    timeSpent: "الوقت المستغرق",
    streakDays: "أيام متتالية",
    noTopics: "لم يتم العثور على مواضيع",
    startStudying: "ابدأ الدراسة لرؤية تقدمك",
    loadingTopics: "جاري تحميل المواضيع...",
    errorLoading: "خطأ في تحميل التحليلات",
    retry: "حاول مرة أخرى",
    minutes: "دقيقة",
    hours: "ساعة",
    // Enhanced features
    weeklyProgress: "التقدم الأسبوعي",
    studyStreaks: "سلسلة الدراسة",
    performanceMetrics: "مقاييس الأداء",
    learningPatterns: "أنماط التعلم",
    currentStreak: "السلسلة الحالية",
    longestStreak: "أطول سلسلة",
    averageDailyTime: "متوسط الوقت اليومي",
    mostProductiveDay: "أكثر يوم إنتاجية",
    overallAccuracy: "الدقة الإجمالية",
    improvementRate: "معدل التحسن",
    weakAreas: "المناطق الضعيفة",
    strongAreas: "المناطق القوية",
    timeEfficiency: "كفاءة الوقت",
    preferredStudyTime: "وقت الدراسة المفضل",
    averageSessionLength: "متوسط طول الجلسة",
    topicsPerSession: "المواضيع لكل جلسة",
    retentionRate: "معدل الاحتفاظ",
    studyTrends: "اتجاهات الدراسة",
    productivityScore: "درجة الإنتاجية",
    focusAreas: "مناطق التركيز",
    // Daily progress
    todayProgress: "تقدم اليوم",
    dailyOverview: "نظرة عامة يومية",
    dailyStats: "إحصائيات يومية",
    dailyGoals: "الأهداف اليومية",
    nextMilestone: "المرحلة التالية",
    achievements: "الإنجازات",
    recommendations: "التوصيات",
    studyTime: "وقت الدراسة",
    activitiesCompleted: "الأنشطة المكتملة",
    currentAccuracy: "الدقة الحالية",
    sessionCount: "عدد الجلسات",
    averageSession: "متوسط الجلسة",
    monthlyProgress: "التقدم الشهري",
    aiTutorInteractions: "تفاعلات المعلم الذكي",
    topicSelections: "اختيارات المواضيع",
    lessonsCompleted: "الدروس المكتملة",
    videoLessonsCompleted: "الدروس المرئية المكتملة",
    flashcardsReviewed: "البطاقات التعليمية المراجعة"
  }
};

export default function Analytics() {
  const { currentPage, setCurrentPage, language } = useApp();
  const t = translations[language as keyof typeof translations];
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState<RealTimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bufferSize, setBufferSize] = useState(0);

  // Auto-tracking for analytics page
  const { forceFlush, getBufferSize } = useAutoTracking({
    pageTitle: 'Analytics Dashboard',
    pageUrl: '/analytics',
    trackClicks: true,
    trackTime: true,
    trackScroll: true
  });

  // Helper functions
  const formatDuration = (minutes: number) => {
    if (!minutes || minutes < 0) return '0 min';
    if (minutes < 60) {
      return `${minutes} ${t.minutes}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${t.hours}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const safePercentage = (value: number, total: number) => {
    if (!total || total === 0 || !value || value < 0) return 0;
    return Math.min(Math.max(Math.round((value / total) * 100), 0), 100);
  };

  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  const safeString = (value: any, fallback: string = 'No data'): string => {
    return value && String(value).trim() ? String(value).trim() : fallback;
  };

  const getMasteryColor = (masteryLevel: string) => {
    switch (masteryLevel) {
      case 'expert': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'easy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch real-time analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Track dashboard visit for analytics
      try {
        await comprehensiveAnalyticsService.trackPlatformActivity(
          user.id,
          'dashboard_visit',
          0,
          'Dashboard',
          'General'
        );
      } catch (error) {
        // Silently handle tracking errors
        console.log('⚠️ Tracking error (non-critical):', error);
      }

      // Get comprehensive real-time analytics (force fresh data)
      const realTimeAnalytics = await comprehensiveAnalyticsService.forceRefreshAnalytics(user.id);
      
      // Validate and set default values for missing data
      if (realTimeAnalytics) {
        // Ensure all required properties exist with default values
        const validatedAnalytics = {
          ...realTimeAnalytics,
          today: {
            ...realTimeAnalytics.today,
            totalActivities: realTimeAnalytics.today?.totalActivities || 0,
            studyTimeMinutes: realTimeAnalytics.today?.studyTimeMinutes || 0,
            dailyAccuracy: realTimeAnalytics.today?.dailyAccuracy || 0,
            productivityScore: realTimeAnalytics.today?.productivityScore || 0,
            sessionCount: realTimeAnalytics.today?.sessionCount || 0,
            avgSessionMinutes: realTimeAnalytics.today?.avgSessionMinutes || 0,
            questionsAttempted: realTimeAnalytics.today?.questionsAttempted || 0,
            questionsCorrect: realTimeAnalytics.today?.questionsCorrect || 0,
            lessonsCompleted: realTimeAnalytics.today?.lessonsCompleted || 0,
            videoLessonsCompleted: realTimeAnalytics.today?.videoLessonsCompleted || 0,
            flashcardsReviewed: realTimeAnalytics.today?.flashcardsReviewed || 0,
            aiTutorInteractions: realTimeAnalytics.today?.aiTutorInteractions || 0,
            topicSelections: realTimeAnalytics.today?.topicSelections || 0
          },
          thisWeek: {
            ...realTimeAnalytics.thisWeek,
            totalActivities: realTimeAnalytics.thisWeek?.totalActivities || 0,
            totalTimeSpent: realTimeAnalytics.thisWeek?.totalTimeSpent || 0,
            averageDailyAccuracy: realTimeAnalytics.thisWeek?.averageDailyAccuracy || 0,
            mostProductiveDay: realTimeAnalytics.thisWeek?.mostProductiveDay || 'No data',
            weakAreas: realTimeAnalytics.thisWeek?.weakAreas || [],
            strongAreas: realTimeAnalytics.thisWeek?.strongAreas || [],
            recommendations: realTimeAnalytics.thisWeek?.recommendations || ['Keep up the great work!']
          },
          thisMonth: {
            ...realTimeAnalytics.thisMonth,
            totalActivities: realTimeAnalytics.thisMonth?.totalActivities || 0,
            totalTimeSpent: realTimeAnalytics.thisMonth?.totalTimeSpent || 0,
            longestStreak: realTimeAnalytics.thisMonth?.longestStreak || 0,
            improvementRate: realTimeAnalytics.thisMonth?.improvementRate || 0,
            studyPatterns: {
              preferredStudyTime: realTimeAnalytics.thisMonth?.studyPatterns?.preferredStudyTime || 'Morning',
              averageSessionLength: realTimeAnalytics.thisMonth?.studyPatterns?.averageSessionLength || 0,
              peakStudyDays: realTimeAnalytics.thisMonth?.studyPatterns?.peakStudyDays || []
            }
          },
          currentStreak: realTimeAnalytics.currentStreak || 0,
          nextMilestone: realTimeAnalytics.nextMilestone || 'Complete your first lesson',
          focusAreas: realTimeAnalytics.focusAreas || [],
          achievements: realTimeAnalytics.achievements || []
        };
        
        setAnalyticsData(validatedAnalytics);
        setLastUpdated(new Date());
      } else {
        throw new Error('No analytics data received');
      }

    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Update buffer size periodically
  useEffect(() => {
    const updateBufferSize = () => {
      setBufferSize(getBufferSize());
    };

    // Update immediately
    updateBufferSize();

    // Update every 10 seconds
    const interval = setInterval(updateBufferSize, 10000);

    return () => clearInterval(interval);
  }, [getBufferSize]);

  // Manual refresh with auto-tracking flush
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null); // Clear any existing errors
    try {
      // First flush any pending activities
      console.log('🔄 Flushing pending activities...');
      await forceFlush();
      
      // Wait a moment for database consistency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Then fetch fresh analytics data (this will force refresh without cache)
      console.log('🔄 Fetching fresh analytics data...');
      await fetchAnalyticsData();
      
      // Update buffer size
      setBufferSize(getBufferSize());
      
      console.log('✅ Refresh completed successfully');
    } catch (error) {
      console.error('❌ Error during refresh:', error);
      setError('Failed to refresh analytics data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loadingTopics}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">{t.errorLoading}</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={handleRefresh} variant="outline">
              {t.retry}
            </Button>
            <Button onClick={() => setCurrentPage('dashboard')} variant="outline">
              {t.backToDashboard}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">{t.noTopics}</p>
          <p className="text-sm">{t.startStudying}</p>
          <Button onClick={handleRefresh} variant="outline">
            {t.refresh}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t.backToDashboard}</span>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">{t.analytics}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : t.refresh}</span>
                {bufferSize > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {bufferSize}
                  </Badge>
                )}
              </Button>
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  {t.lastActivity}: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t.todayProgress}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.progress}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {t.insights}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t.achievements}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Today's Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activitiesCompleted}</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeNumber(analyticsData.today.totalActivities)}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.studyTime}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(safeNumber(analyticsData.today.studyTimeMinutes))}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.currentAccuracy}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeNumber(analyticsData.today.dailyAccuracy)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.currentStreak}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeNumber(analyticsData.currentStreak)}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.streakDays}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  {t.weeklyProgress}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                  {analyticsData.thisWeek.weekStart} - {analyticsData.thisWeek.weekEnd}
                  </div>
                </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.thisWeek.totalActivities}
                          </div>
                    <div className="text-sm text-blue-700">{t.activitiesCompleted}</div>
                            </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatDuration(Math.round(analyticsData.thisWeek.totalTimeSpent / 60))}
                          </div>
                    <div className="text-sm text-green-700">{t.studyTime}</div>
                        </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.thisWeek.averageDailyAccuracy}%
                            </div>
                    <div className="text-sm text-purple-700">{t.overallAccuracy}</div>
                          </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analyticsData.thisWeek.mostProductiveDay}
                            </div>
                    <div className="text-sm text-orange-700">{t.mostProductiveDay}</div>
                          </div>
                            </div>
              </CardContent>
            </Card>

            {/* Monthly Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  {t.monthlyProgress}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {analyticsData.thisMonth.month}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.thisMonth.totalActivities}
                  </div>
                    <div className="text-sm text-green-700">{t.activitiesCompleted}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatDuration(Math.round(analyticsData.thisMonth.totalTimeSpent / 60))}
                  </div>
                    <div className="text-sm text-blue-700">{t.studyTime}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.thisMonth.longestStreak}
                  </div>
                    <div className="text-sm text-purple-700">{t.longestStreak}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analyticsData.thisMonth.improvementRate}%
                    </div>
                    <div className="text-sm text-orange-700">{t.improvementRate}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Today's Progress Tab */}
          <TabsContent value="today" className="space-y-6">
            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activitiesCompleted}</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <div className="text-2xl font-bold">{analyticsData.today.totalActivities}</div>
                   <p className="text-xs text-muted-foreground">
                     {t.todayProgress}
                   </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.studyTime}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(safeNumber(analyticsData.today.studyTimeMinutes))}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.currentAccuracy}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeNumber(analyticsData.today.dailyAccuracy)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.productivityScore}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.today.productivityScore}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Today's Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    {t.dailyStats}
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.questions}</span>
                      <span className="text-lg font-bold text-blue-600">
                        {analyticsData.today.questionsCorrect} / {analyticsData.today.questionsAttempted}
                        </span>
                      </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300" 
                        style={{ width: `${safeNumber(analyticsData.today.dailyAccuracy)}%` }}
                      ></div>
                    </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.lessonsCompleted}</span>
                      <span className="text-lg font-bold text-green-600">
                        {analyticsData.today.lessonsCompleted}
                        </span>
                      </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.videoLessonsCompleted}</span>
                      <span className="text-lg font-bold text-purple-600">
                        {analyticsData.today.videoLessonsCompleted}
                        </span>
                      </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.flashcardsReviewed}</span>
                      <span className="text-lg font-bold text-orange-600">
                        {analyticsData.today.flashcardsReviewed}
                        </span>
                      </div>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    {t.sessionCount}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.sessionCount}</span>
                      <span className="text-lg font-bold text-green-600">
                        {analyticsData.today.sessionCount}
                      </span>
                  </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.averageSession}</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatDuration(analyticsData.today.avgSessionMinutes)}
                        </span>
                      </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.aiTutorInteractions}</span>
                      <span className="text-lg font-bold text-purple-600">
                        {analyticsData.today.aiTutorInteractions}
                        </span>
                      </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.topicSelections}</span>
                      <span className="text-lg font-bold text-orange-600">
                        {analyticsData.today.topicSelections}
                        </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {/* Study Streaks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  {t.studyStreaks}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.currentStreak}
                    </div>
                    <div className="text-sm text-green-700">{t.currentStreak}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.thisMonth.longestStreak}
                    </div>
                    <div className="text-sm text-blue-700">{t.longestStreak}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatDuration(Math.round(analyticsData.thisWeek.totalTimeSpent / 7 / 60))}
                    </div>
                    <div className="text-sm text-purple-700">{t.averageDailyTime}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analyticsData.thisWeek.mostProductiveDay}
                    </div>
                    <div className="text-sm text-orange-700">{t.mostProductiveDay}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {t.performanceMetrics}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">{t.overallAccuracy}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Accuracy</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {analyticsData.thisWeek.averageDailyAccuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-blue-600 transition-all duration-300" 
                          style={{ width: `${analyticsData.thisWeek.averageDailyAccuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">{t.improvementRate}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Improvement</span>
                        <span className="text-lg font-semibold text-green-600">
                          {analyticsData.thisMonth.improvementRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-green-600 transition-all duration-300" 
                          style={{ width: `${Math.min(analyticsData.thisMonth.improvementRate + 50, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    {t.weakAreas}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData.focusAreas.length > 0 ? (
                    <div className="space-y-2">
                      {analyticsData.focusAreas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                          <span className="text-sm text-red-700">{area}</span>
                          <Badge variant="destructive" className="text-xs">Focus</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No weak areas identified</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    {t.strongAreas}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData.thisWeek.strongAreas.length > 0 ? (
                    <div className="space-y-2">
                      {analyticsData.thisWeek.strongAreas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <span className="text-sm text-green-700">{area}</span>
                          <Badge variant="default" className="bg-green-600">Strong</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No strong areas identified yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  {t.insights}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">{t.nextMilestone}</h4>
                    <p className="text-blue-700 text-sm">
                      {analyticsData.nextMilestone}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">{t.recommendations}</h4>
                    <div className="space-y-2">
                      {analyticsData.thisWeek.recommendations.map((rec, index) => (
                        <p key={index} className="text-green-700 text-sm">• {rec}</p>
                      ))}
                  </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">{t.learningPatterns}</h4>
                    <p className="text-purple-700 text-sm">
                      Your preferred study time is {analyticsData.thisMonth.studyPatterns?.preferredStudyTime || 'Not available'}. 
                      Average session length: {formatDuration(analyticsData.thisMonth.studyPatterns?.averageSessionLength || 0)}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  {t.achievements}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm text-yellow-800">{achievement}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No achievements yet</p>
                    <p className="text-sm">Keep studying to earn achievements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}