import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { AspectRatio } from './ui/aspect-ratio';
import { Separator } from './ui/separator';
import { useApp } from '../App';
import { topicsService, videoLessonsService } from '../utils/supabase/services';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { enhancedAnalyticsTracker } from '../utils/supabase/enhanced-analytics-tracker';
import { usePageTracking } from '../hooks/usePageTracking';
import { learningActivityTracker } from '../utils/supabase/learning-activity-tracker';
import { comprehensiveAnalyticsService } from '../utils/supabase/comprehensive-analytics-service';
import { 
  ArrowLeft,
  Play,
  Clock,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Languages,
  Globe,
  History,
  Target,
  Eye,
  PlayCircle,
  Video,
  Users,
  Star,
  ThumbsUp,
  Download,
  Share2,
  Bookmark,
  Brain,
  TrendingUp,
  Briefcase,
  Building2,
  RefreshCw,
  ArrowRight,
  X
} from 'lucide-react';

interface VideoContent {
  video_id: string;
  video_num: number | null;
  title: string;
  description: string | null;
  duration_seconds?: number | null;
  source: string | null;
  tags: string[] | null;
  language: string | null;
  // Computed fields for display
  duration: string;
  views?: string;
  rating?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  videoUrl: string;
  instructor?: string;
}

interface Topic {
  topic_id: number;
  title: string;
  description?: string;
}

const translations = {
  en: {
    visualLearning: "Visual Learning",
    backToDashboard: "Back to Dashboard",
    selectSubject: "Select Subject",
    selectTopic: "Select Topic",
    startLearning: "Start Learning",
    duration: "Duration",
    views: "Views",
    rating: "Rating",
    instructor: "Instructor",
    difficulty: "Difficulty",
    watchNow: "Watch Now",
    addToBookmarks: "Add to Bookmarks",
    shareVideo: "Share Video",
    downloadNotes: "Download Notes",
    relatedVideos: "Related Videos",
    videoLibrary: "Video Library",
    businessStudies: "Business Studies",
    videoDescription: "Comprehensive video lessons designed for Business Studies curriculum. Learn through visual explanations, animations, and expert instruction.",
    noVideosFound: "No videos found for this topic. Please try selecting a different topic.",
    loadingTopics: "Loading topics..."
  }
};

export function VisualLearning() {
  const { setCurrentPage, user: currentUser } = useApp();
  
  // Page tracking hook
  const { trackVideoProgress, trackEngagement, trackError } = usePageTracking({
    pageName: 'Visual Learning',
    pageCategory: 'visual_learning',
    metadata: { 
      subject: 'Business Studies', 
      topic: 'General',
      videoCount: 0
    }
  });
  
  const [selectedSubject, setSelectedSubject] = useState('businessStudies'); // Default to Business Studies
  const [selectedTopic, setSelectedTopic] = useState('');
  const [learningStarted, setLearningStarted] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoContent | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0); // Track time in seconds

  const t = translations.en;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Time tracking effect - track actual study time
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Track study time in analytics when component unmounts or user changes
  useEffect(() => {
    return () => {
      // Save accumulated time when component unmounts
      if (currentUser?.id && timeSpent > 0) {
        console.log(`🕒 VisualLearning: Saving ${timeSpent} seconds of study time`);
        comprehensiveAnalyticsService.addStudyTime(currentUser.id, timeSpent);
      }
    };
  }, [currentUser?.id, timeSpent]);

  // Track study time periodically (every 30 seconds) to ensure data is saved
  useEffect(() => {
    if (!currentUser?.id || timeSpent === 0) return;

    const saveInterval = setInterval(() => {
      if (timeSpent > 0 && timeSpent % 30 === 0) { // Every 30 seconds
        console.log(`🕒 VisualLearning: Periodic save - ${timeSpent} seconds`);
        comprehensiveAnalyticsService.addStudyTime(currentUser.id, 30); // Add 30 seconds
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [currentUser?.id, timeSpent]);

  // Helper function to convert subject name to subject ID
  const getSubjectId = (subjectName: string): number => {
    const subjectMap: { [key: string]: number } = {
      'mathematics': 1,
      'physics': 2,
      'chemistry': 3,
      'biology': 4,
      'english': 5,
      'history': 6,
      'geography': 7,
      'economics': 8,
      'businessStudies': 9
    };
    return subjectMap[subjectName] || 0;
  };

  // Helper function to convert topic name to topic ID
  const getTopicId = (topicName: string): number => {
    // For now, return a default topic ID - you can implement actual topic mapping
    return 1;
  };

  // Track video lesson completion
  const trackVideoCompletion = async (video: VideoContent) => {
    try {
      if (currentUser?.id && selectedTopic) {
        const duration = video.duration_seconds ? Math.ceil(video.duration_seconds / 60) : 5; // Default 5 minutes
        
        // Track with enhanced analytics tracker
        await enhancedAnalyticsTracker.trackVideoLesson(
          currentUser.id,
          getTopicId(selectedTopic),
          selectedTopic,
          selectedSubject === 'businessStudies' ? 'Business Studies' : selectedSubject,
          duration,
          video.duration_seconds || 0,
          video.duration_seconds || 0
        );

        // Track with new learning activity tracker
        const topicData = topics.find(t => t.title.toLowerCase().replace(/\s+/g, '_') === selectedTopic);
        const topicId = topicData?.topic_id || 1;
        
        await learningActivityTracker.trackLesson(
          topicId,
          selectedTopic,
          selectedSubject === 'businessStudies' ? 'Business Studies' : selectedSubject,
          video.duration_seconds || 300, // Convert to seconds, default 5 minutes
          'video'
        );
      }
    } catch (error) {
      // Silently handle analytics errors
    }
  };

  // Fetch topics when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      fetchTopics();
    }
  }, [selectedSubject]);

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const { data, error } = await topicsService.getTopicsBySubject('businessStudies');
      
      if (error) {
        throw error;
      }
      
      setTopics(data || []);
    } catch (error) {
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const fetchVideosForTopic = async (topicId: number) => {
    try {
      setLoadingVideos(true);
      const { data, error } = await videoLessonsService.getVideoLessonsByTopic(topicId);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Transform database videos to match our interface
        const transformedVideos = data.map((dbVideo: any) => {
          const transformed: VideoContent = {
            video_id: dbVideo.video_id || `video_${Math.random()}`,
            video_num: dbVideo.video_num,
            title: dbVideo.title || 'Untitled Video',
            description: dbVideo.description,
            duration_seconds: dbVideo.duration_seconds,
            source: dbVideo.source,
            tags: dbVideo.tags || [],
            language: dbVideo.language || 'en',
            // Computed fields
            duration: formatDuration(dbVideo.duration_seconds || 0),
            views: '1.2K',
            rating: 4.5,
            difficulty: 'intermediate',
            thumbnail: `https://img.youtube.com/vi/${getYouTubeVideoId(dbVideo.source || '')}/maxresdefault.jpg`,
            videoUrl: dbVideo.source || '',
            instructor: 'Business Studies Expert'
          };
          return transformed;
        });
        
        setVideos(transformedVideos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartLearning = () => {
    if (selectedTopic) {
      setLearningStarted(true);
      // Videos will be loaded when a topic is selected
    }
  };

  const handleVideoSelect = async (video: VideoContent) => {
    setCurrentVideo(video);
    
    // Track video selection for analytics
    if (currentUser?.id) {
      try {
        await trackVideoProgress({
          subject: selectedSubject === 'businessStudies' ? 'Business Studies' : selectedSubject,
          topic: selectedTopic || 'General',
          videoId: video.video_id,
          progress: 0, // Starting the video
          timeSpent: 0,
          watched: false
        });
      } catch (error) {
        console.error('Error tracking video selection:', error);
      }
    }
    
    // Track analytics for video selection
    await trackVideoCompletion(video);
  };

  const handleTopicChange = async (topicId: string) => {
    console.log('🔄 handleTopicChange called with topicId:', topicId);
    const selectedTopicObj = topics.find(t => t.topic_id.toString() === topicId);
    console.log('🔍 Found topic:', selectedTopicObj);
    
    if (selectedTopicObj) {
      const topicKey = selectedTopicObj.title.toLowerCase().replace(/\s+/g, '_');
      console.log('🔄 Changing topic to:', selectedTopicObj.title);
      
      setSelectedTopic(topicKey);
      setCurrentVideo(null);
      setVideos([]);
      
      // Fetch videos for the new topic
      try {
        console.log('📹 Fetching videos for topic:', selectedTopicObj.topic_id);
        await fetchVideosForTopic(selectedTopicObj.topic_id);
        console.log('✅ Videos fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching videos:', error);
      }
      
      console.log('✅ Topic changed successfully to:', selectedTopicObj.title);
    } else {
      console.error('❌ Topic not found for ID:', topicId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getYouTubeVideoId = (url: string) => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^#&?]*)/,
      /youtube\.com\/watch\?.*v=([^#&?]*)/,
      /youtu\.be\/([^#&?]*)/,
      /youtube\.com\/embed\/([^#&?]*)/,
      /youtube\.com\/v\/([^#&?]*)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    
    return '';
  };

  const getVimeoVideoId = (url: string) => {
    const regExp = /https?:\/\/(www\.)?vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    if (match && match[2]) {
      return match[2];
    }
    return '';
  };

  if (!learningStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Left - Back Button */}
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentPage('dashboard')}
                  className="hover:bg-gray-100 rounded-xl px-4 py-2"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {t.backToDashboard}
                </Button>

              {/* Center - Visual Learning Heading */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t.visualLearning}
                </h1>
              </div>

              {/* Right - Empty space for balance */}
              <div className="w-[120px]" />
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6 h-[calc(100vh-8rem)]">
            {/* Left Panel - Subject Selection */}
            <div className="w-64 flex-shrink-0">
              <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-gray-200">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {/* Mathematics - Disabled */}
                  <div className="relative group">
                    <div className="p-3 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-40 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Calculator className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Mathematics</span>
                      </div>
                    </div>
                    <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Coming Soon
                    </div>
                  </div>
                  
                  {/* Physics - Disabled */}
                  <div className="relative group">
                    <div className="p-3 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-40 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Atom className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Physics</span>
                      </div>
                    </div>
                    <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Coming Soon
                    </div>
                  </div>
                  
                  {/* Chemistry - Disabled */}
                  <div className="relative group">
                    <div className="p-3 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-40 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FlaskConical className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Chemistry</span>
                      </div>
                    </div>
                    <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Coming Soon
                    </div>
                  </div>
                  
                  {/* Business Studies - Active */}
                  <div 
                    className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedSubject === 'businessStudies' 
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                        : 'border-gray-200 hover:border-green-400 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedSubject('businessStudies')}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className={`h-5 w-5 ${
                        selectedSubject === 'businessStudies' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        selectedSubject === 'businessStudies' ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        Business Studies
                      </span>
                    </div>
                    {selectedSubject === 'businessStudies' && (
                      <div className="mt-2 ml-8">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Topic Selection */}
            <div className="flex-1 overflow-y-auto">
              <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-gray-200">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                    <Video className="h-5 w-5 text-green-600" />
                    Select Your Topic
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {loadingTopics ? (
                    <div className="flex items-center justify-center py-20 text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mr-3" />
                      <span className="text-lg">Loading topics...</span>
                    </div>
                  ) : topics.length > 0 ? (
                    <div className="space-y-2 bg-white">
                      {topics.map((topic, index) => (
                        <button
                          key={topic.topic_id}
                          onClick={() => handleTopicChange(topic.topic_id.toString())}
                          className={`group w-full p-4 rounded-xl border-2 transition-all duration-200 text-left bg-white ${
                            selectedTopic === topic.title.toLowerCase().replace(/\s+/g, '_')
                              ? 'border-green-500 shadow-sm'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              selectedTopic === topic.title.toLowerCase().replace(/\s+/g, '_')
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-green-100'
                            }`}>
                              <span className="text-sm font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-semibold ${
                                selectedTopic === topic.title.toLowerCase().replace(/\s+/g, '_')
                                  ? 'text-green-700'
                                  : 'text-gray-700 group-hover:text-green-600'
                              }`}>
                                {topic.title}
                              </h3>
                              {topic.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                  {topic.description}
                                </p>
                              )}
                            </div>
                            {selectedTopic === topic.title.toLowerCase().replace(/\s+/g, '_') && (
                              <Target className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Video className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-center">No topics available for this subject</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Start Learning Button */}
          {selectedTopic && (
            <div className="mt-6 flex justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl"
                onClick={handleStartLearning}
              >
                <PlayCircle className="h-6 w-6 mr-3" />
                {t.startLearning}
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
              <h1 className="text-xl font-semibold">{t.visualLearning}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Display */}
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border-blue-200">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{formatTime(timeSpent)}</span>
              </Badge>
              
              {/* Topic Selection Dropdown */}
              {loadingTopics ? (
                <div className="w-[200px] h-8 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : topics.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 hidden md:block">Topic:</span>
                  <Select 
                    value={topics.find(t => t.title.toLowerCase().replace(/\s+/g, '_') === selectedTopic)?.topic_id.toString() || ''} 
                    onValueChange={handleTopicChange}
                  >
                    <SelectTrigger className="w-[200px] h-9 bg-white border-2 border-green-200 hover:border-green-400 focus:border-green-500 shadow-sm hover:shadow-md transition-all">
                      <Target className="h-3.5 w-3.5 mr-2 text-green-600" />
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto bg-white border-2 border-green-200 shadow-lg rounded-lg z-50">
                      {topics.map((topic, index) => (
                        <SelectItem 
                          key={topic.topic_id} 
                          value={topic.topic_id.toString()}
                          className="cursor-pointer hover:bg-green-50 focus:bg-green-50 transition-colors"
                        >
                          <span className="text-xs font-semibold text-green-600 mr-2">{index + 1}.</span>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-gray-800 border-0">
                <Eye className="h-3 w-3 mr-1" />
                {t.videoLibrary}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Topic Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  {'Browse Content'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject Display (Fixed to Business Studies) */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">{t.businessStudies}</span>
                    <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Selected</Badge>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Video List */}
            {loadingVideos ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span>Loading videos...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No videos available for this topic</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-purple-500" />
                    {t.relatedVideos}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {videos.map((video) => (
                        <div
                          key={video.video_id}
                          className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${
                            currentVideo?.video_id === video.video_id ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' : 'bg-white border border-gray-200'
                          }`}
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div className="flex gap-3">
                            <div className="relative w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {video.source && video.source.includes('youtube') ? (
                                <div className="w-full h-full bg-red-600 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                </div>
                              ) : video.thumbnail ? (
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                  <Video className="h-6 w-6 text-gray-500" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <Play className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{video.title}</h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-600">{video.duration}</span>
                                {video.difficulty && (
                                <Badge className={`text-xs ${getDifficultyColor(video.difficulty)}`}>
                                    {video.difficulty === 'beginner' ? 'Beginner' : 
                                     video.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                                </Badge>
                                )}
                              </div>
                              {video.source && (
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-gray-500">
                                    {video.source && video.source.includes('youtube') ? 'YouTube Video' : 
                                     video.source && video.source.includes('vimeo') ? 'Vimeo Video' :
                                     video.source && video.source.includes('mp4') ? 'MP4 Video' : 'Video'} - Plays on page
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {currentVideo ? (
              <>
                {/* Video Player */}
                <Card className="border-0 shadow-lg" data-video-player>
                    <CardContent className="p-0">
                      <AspectRatio ratio={16 / 9}>
                        <div className="w-full h-full bg-black rounded-t-lg flex items-center justify-center">
                        {currentVideo.source && currentVideo.source.includes('youtube') ? (
                          // YouTube video embed
                          <div className="w-full h-full">
                            <iframe
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(currentVideo.source)}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
                              title={currentVideo.title}
                              className="w-full h-full rounded-t-lg"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        ) : currentVideo.source && currentVideo.source.includes('vimeo') ? (
                          // Vimeo video embed
                          <div className="w-full h-full">
                            <iframe
                              src={`https://player.vimeo.com/video/${getVimeoVideoId(currentVideo.source)}?h=auto&title=0&byline=0&portrait=0&dnt=1&autoplay=0`}
                              title={currentVideo.title}
                              className="w-full h-full rounded-t-lg"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        ) : currentVideo.source && (currentVideo.source.includes('mp4') || currentVideo.source.includes('http')) ? (
                          // Direct video player
                          <video
                            className="w-full h-full rounded-t-lg"
                            controls
                            preload="metadata"
                            controlsList="nodownload"
                            crossOrigin="anonymous"
                          >
                            <source src={currentVideo.source} type="video/mp4" />
                            <source src={currentVideo.source} type="video/webm" />
                            <source src={currentVideo.source} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          // Fallback to thumbnail with play button
                          <>
                            {currentVideo.thumbnail ? (
                          <img 
                            src={currentVideo.thumbnail} 
                            alt={currentVideo.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-t-lg">
                                <Video className="h-16 w-16 text-gray-500" />
                              </div>
                            )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <Button 
                              size="lg"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full w-16 h-16"
                                onClick={() => {
                                  if (currentVideo.source) {
                                    // Try to open in new tab as fallback
                                    window.open(currentVideo.source, '_blank');
                                  }
                                }}
                            >
                              <Play className="h-8 w-8" />
                            </Button>
                          </div>
                          </>
                        )}
                        </div>
                      </AspectRatio>
                    
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                            onClick={() => {
                              // Play the video by clicking the play button in the iframe/video element
                              const videoPlayer = document.querySelector('[data-video-player]');
                              if (videoPlayer) {
                                // For YouTube videos, try to trigger play through the iframe
                                const iframe = videoPlayer.querySelector('iframe');
                                if (iframe && currentVideo?.source?.includes('youtube')) {
                                  // YouTube videos will play when user interacts with the iframe
                                  iframe.click();
                                }
                                // For direct video elements, use the video API
                                const videoElement = videoPlayer.querySelector('video');
                                if (videoElement) {
                                  videoElement.play();
                                }
                                // Scroll to video player
                                videoPlayer.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Play Video
                          </Button>
                          
                          <Button 
                            variant="outline"
                            onClick={() => setShowSharePopup(true)}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            {t.shareVideo}
                          </Button>
                        </div>

                        {/* Share Video Popup */}
                        {showSharePopup && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                  <Share2 className="h-5 w-5 mr-2 text-blue-600" />
                                  Share Video
                                </h3>
                                <button
                                  onClick={() => setShowSharePopup(false)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                  <X className="h-5 w-5 text-gray-500" />
                                </button>
                              </div>
                              
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Video Link:
                                </label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={currentVideo?.source || ''}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      if (currentVideo?.source) {
                                        navigator.clipboard.writeText(currentVideo.source);
                                        // You could add a toast notification here
                                      }
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Copy
                          </Button>
                                </div>
                        </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowSharePopup(false)}
                                  className="px-4 py-2"
                                >
                                  Close
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (currentVideo?.source) {
                                      navigator.clipboard.writeText(currentVideo.source);
                                      setShowSharePopup(false);
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                                >
                                  Copy & Close
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {currentVideo.tags?.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t.noVideosFound}
                </h3>
                <p className="text-gray-600">
                  {true 
                    ? 'Please select a subject and topic from the sidebar to view available videos.'
                    : 'يرجى اختيار مادة وموضوع من الشريط الجانبي لعرض الفيديوهات المتاحة.'
                  }
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}