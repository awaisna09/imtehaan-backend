import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import { topicsService } from '../utils/supabase/services';
import { 
  ArrowLeft,
  Brain,
  Bot,
  Sparkles,
  Target,
  BookOpen,
  Zap,
  Lightbulb,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Calculator,
  Atom,
  FlaskConical,
  Building2
} from 'lucide-react';

interface Topic {
  topic_id: number;
  title: string;
  description?: string;
}

const translations = {
  en: {
    lessons: "Lessons",
    backToDashboard: "Back to Dashboard",
    selectTopic: "Select a topic to start your AI-powered learning session",
    businessStudies: "Business Studies",
    startAISession: "Start Learning",
    loadingTopics: "Loading topics...",
    noTopicsFound: "No topics found. Please try again.",
    aiTutorDescription: "Your personal AI tutor is ready to help you master any topic through interactive conversations and personalized explanations.",
    continueToAITutor: "Continue to AI Tutor",
    aiFeatures: "AI Features",
    personalizedLearning: "Personalized Learning",
    interactiveConversations: "Interactive Conversations",
    instantFeedback: "Instant Feedback",
    adaptiveExplanations: "Adaptive Explanations"
  }};
export function AITutorTopicSelection() {
  const { setCurrentPage } = useApp();
  const t = translations.en;
  
  const [selectedSubject, setSelectedSubject] = useState('businessStudies'); // Default to Business Studies
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

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

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    console.log('✅ Topic selected for AI Tutor:', topic);
  };

  const handleStartAISession = () => {
    if (selectedTopic) {
      // Store selected topic in localStorage for the AI Tutor page
      localStorage.setItem('selectedTopic', JSON.stringify(selectedTopic));
      localStorage.setItem('selectedTopicId', selectedTopic.topic_id.toString());
      
      // Redirect to AI Tutor page
      setCurrentPage('ai-tutor');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Back Button */}
            <Button 
              variant="ghost" 
              onClick={handleBackToDashboard}
              className="hover:bg-gray-100 rounded-xl px-4 py-2"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t.backToDashboard}
            </Button>

            {/* Center - Lessons Heading */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.lessons}
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
                  <BookOpen className="h-5 w-5 text-blue-600" />
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
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedSubject('businessStudies')}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`h-5 w-5 ${
                      selectedSubject === 'businessStudies' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedSubject === 'businessStudies' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      Business Studies
                    </span>
                  </div>
                  {selectedSubject === 'businessStudies' && (
                    <div className="mt-2 ml-8">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
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
                  <Brain className="h-5 w-5 text-blue-600" />
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
                        onClick={() => handleTopicSelect(topic)}
                        className={`group w-full p-4 rounded-xl border-2 transition-all duration-200 text-left bg-white ${
                          selectedTopic?.topic_id === topic.topic_id
                            ? 'border-blue-500 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selectedTopic?.topic_id === topic.topic_id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'
                          }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-semibold ${
                              selectedTopic?.topic_id === topic.topic_id
                                ? 'text-blue-700'
                                : 'text-gray-700 group-hover:text-blue-600'
                            }`}>
                              {topic.title}
                            </h3>
                            {topic.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {topic.description}
                              </p>
                            )}
                          </div>
                          {selectedTopic?.topic_id === topic.topic_id && (
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Brain className="h-16 w-16 text-gray-300 mb-4" />
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl"
              onClick={handleStartAISession}
            >
              <Brain className="h-6 w-6 mr-3" />
              {t.startAISession}
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
