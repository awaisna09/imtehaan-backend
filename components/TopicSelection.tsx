import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import { topicsService } from '../utils/supabase/services';
import { 
  ArrowLeft,
  BookOpen,
  Target,
  Brain,
  Building2,
  ArrowRight,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface Topic {
  topic_id: number;
  title: string;
  description?: string;
}

const translations = {
  en: {
    topicSelection: "Choose Your Topic",
    backToDashboard: "Back to Dashboard",
    selectTopic: "Select a topic to start learning",
    businessStudies: "Business Studies",
    startLearning: "Start Learning",
    loadingTopics: "Loading topics...",
    debugTopics: "Debug Topic Fetching",
    noTopicsFound: "No topics found. Please try again.",
    topicDescription: "Select a topic to access interactive lessons, AI tutor sessions, and comprehensive learning materials.",
    continueToLessons: "Continue to Lessons"
  }};
export function TopicSelection() {
  const {setCurrentPage} = useApp();
  const t = translations.en;
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [learningMode, setLearningMode] = useState<string>('ai-tutor');

  useEffect(() => {
    // Detect learning mode from localStorage
    const mode = localStorage.getItem('learningMode') || 'ai-tutor';
    setLearningMode(mode);
    fetchTopics();
  }, []);

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
    console.log('✅ Topic selected:', topic);
  };

  const handleStartLearning = () => {
    if (selectedTopic) {
      // Store selected topic in localStorage for the next page
      localStorage.setItem('selectedTopic', JSON.stringify(selectedTopic));
      localStorage.setItem('selectedTopicId', selectedTopic.topic_id.toString());
      
      // Redirect to appropriate page based on learning mode
      if (learningMode === 'ai-tutor') {
        setCurrentPage('ai-tutor-topic-selection');
      } else if (learningMode === 'visual-learning') {
        setCurrentPage('visual-learning');
      } else if (learningMode === 'practice') {
        setCurrentPage('practice');
      } else if (learningMode === 'flashcards') {
        setCurrentPage('flashcards');
      } else {
        setCurrentPage('ai-tutor-topic-selection'); // Default fallback
      }
    }
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard}
                className="hover:bg-gray-100 rounded-xl px-4 py-2"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t.backToDashboard}
              </Button>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  learningMode === 'ai-tutor' ? 'bg-gradient-to-br from-blue-600 to-purple-600' :
                  learningMode === 'visual-learning' ? 'bg-gradient-to-br from-green-600 to-emerald-600' :
                  learningMode === 'practice' ? 'bg-gradient-to-br from-orange-600 to-red-600' :
                  learningMode === 'flashcards' ? 'bg-gradient-to-br from-purple-600 to-pink-600' :
                  'bg-gradient-to-br from-green-600 to-emerald-600'
                }`}>
                  {learningMode === 'ai-tutor' ? <Brain className="h-5 w-5 text-white" /> :
                   learningMode === 'visual-learning' ? <BookOpen className="h-5 w-5 text-white" /> :
                   learningMode === 'practice' ? <Target className="h-5 w-5 text-white" /> :
                   learningMode === 'flashcards' ? <BookOpen className="h-5 w-5 text-white" /> :
                   <BookOpen className="h-5 w-5 text-white" />}
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{t.topicSelection}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className={`px-4 py-2 rounded-full ${
                learningMode === 'ai-tutor' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200' :
                learningMode === 'visual-learning' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' :
                learningMode === 'practice' ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200' :
                learningMode === 'flashcards' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200' :
                'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
              }`}>
                {learningMode === 'ai-tutor' ? <Brain className="h-4 w-4 mr-2" /> :
                 learningMode === 'visual-learning' ? <BookOpen className="h-4 w-4 mr-2" /> :
                 learningMode === 'practice' ? <Target className="h-4 w-4 mr-2" /> :
                 learningMode === 'flashcards' ? <BookOpen className="h-4 w-4 mr-2" /> :
                 <Brain className="h-4 w-4 mr-2" />}
                {learningMode === 'ai-tutor' ? 'AI Tutor' :
                 learningMode === 'visual-learning' ? 'Visual Learning' :
                 learningMode === 'practice' ? 'Practice Mode' :
                 learningMode === 'flashcards' ? 'Flashcards' :
                 'Learning Mode'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {learningMode === 'ai-tutor' ? 'Welcome to AI Tutor' : 
             learningMode === 'visual-learning' ? 'Welcome to Visual Learning' :
             learningMode === 'practice' ? 'Welcome to Practice Mode' :
             learningMode === 'flashcards' ? 'Welcome to Flashcards' :
             'Welcome to Learning'}
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            {learningMode === 'ai-tutor' ? 'Select a topic to start your AI-powered learning session' :
             learningMode === 'visual-learning' ? 'Comprehensive video lessons for Business Studies curriculum' :
             learningMode === 'practice' ? 'Practice questions and exercises for selected topics' :
             learningMode === 'flashcards' ? 'Interactive flashcards for effective memorization' :
             'Choose your learning path and start your educational journey'}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Subject Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className={`p-4 text-white ${
                learningMode === 'ai-tutor' ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                learningMode === 'visual-learning' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                learningMode === 'practice' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                learningMode === 'flashcards' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                'bg-gradient-to-br from-green-500 to-emerald-600'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  {learningMode === 'ai-tutor' ? <Brain className="h-5 w-5" /> :
                   learningMode === 'visual-learning' ? <Building2 className="h-5 w-5" /> :
                   learningMode === 'practice' ? <Target className="h-5 w-5" /> :
                   learningMode === 'flashcards' ? <BookOpen className="h-5 w-5" /> :
                   <Building2 className="h-5 w-5" />}
                  <h2 className="text-lg font-bold">
                    {learningMode === 'ai-tutor' ? 'AI Learning' :
                     learningMode === 'visual-learning' ? 'Business Studies' :
                     learningMode === 'practice' ? 'Practice Mode' :
                     learningMode === 'flashcards' ? 'Flashcards' :
                     'Business Studies'}
                  </h2>
                </div>
                <p className="text-xs opacity-90">
                  {learningMode === 'ai-tutor' ? 'Master topics through AI-powered tutoring sessions' :
                   learningMode === 'visual-learning' ? 'Master business concepts through interactive video lessons' :
                   learningMode === 'practice' ? 'Practice and improve with targeted exercises' :
                   learningMode === 'flashcards' ? 'Reinforce learning with interactive flashcards' :
                   'Master business concepts through interactive lessons'}
                </p>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Comprehensive curriculum</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Interactive lessons</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Expert instructors</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Topic Selection */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
                <CardTitle className="flex items-center space-x-3 text-lg">
                  <Target className="h-5 w-5" />
                  <span>Select Topic</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4">
                {loadingTopics ? (
                  <div className="text-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">{t.loadingTopics}</p>
                    </div>
                  </div>
                ) : topics.length > 0 ? (
                  <div className="space-y-1">
                    {topics.map((topic) => (
                      <div
                        key={topic.topic_id}
                        className={`p-2 rounded-md border cursor-pointer transition-all duration-200 ${
                          selectedTopic?.topic_id === topic.topic_id
                            ? 'border-green-500 bg-green-50 shadow-sm' 
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                        onClick={() => handleTopicSelect(topic)}
                      >
                        <div className="flex items-center space-x-2">
                          <Target className={`h-3 w-3 ${
                            selectedTopic?.topic_id === topic.topic_id ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <h3 className="text-xs font-medium text-gray-900">
                              {topic.title}
                            </h3>
                            {topic.description && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {topic.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-center">
                      <p className="text-gray-600 mb-3 text-sm">{t.noTopicsFound}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchTopics}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Start Learning Button */}
            {selectedTopic && (
              <div className="mt-6 text-center">
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleBackToDashboard}
                    className="px-4 py-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <Button 
                    size="default"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 font-semibold shadow-lg"
                    onClick={handleStartLearning}
                  >
                    {t.continueToLessons}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Selected: <span className="font-semibold text-green-600">{selectedTopic.title}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
