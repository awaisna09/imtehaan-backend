import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import { topicsService } from '../utils/supabase/services';
import { 
  ArrowLeft, 
  Brain,
  BookOpen,
  Target,
  CheckCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const translations = {
  en: {
    title: "Flashcard Selection",
    subtitle: "Choose your Business Studies topic for focused learning",
    backToDashboard: "Back to Dashboard",
    selectSubject: "Select Subject",
    selectTopic: "Select Topic",
    startFlashcards: "Start Flashcards",
    allSubjects: "All Subjects",
    allTopics: "All Topics",
    subjects: {
      businessStudies: "Business Studies"
    },
    topics: {
      businessStudies: [] // Will be fetched from database
    }
  }};const subjectIcons = {
  businessStudies: BookOpen
};

export function FlashcardSelection() {
  const { language, setCurrentPage } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('businessStudies');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const t = translations.en;

  // Fetch topics when component mounts
  useEffect(() => {
    fetchTopics();
  }, []);

  // Fetch topics from database
  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const { data, error } = await topicsService.getTopicsBySubject('businessStudies');
      if (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
      } else {
        setTopics(data || []);
      }
    } catch (error) {
      console.error('Error in fetchTopics:', error);
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedTopic('all');
  };

  const handleStartFlashcards = () => {
    // Store selected subject and topic in localStorage
    localStorage.setItem('flashcardSubject', selectedSubject);
    localStorage.setItem('flashcardTopic', selectedTopic);
    
    // Navigate to flashcards page
    setCurrentPage('flashcards');
  };

  const getTopicsForSubject = (subject: string) => {
    if (subject === 'businessStudies') {
      return topics.map(topic => topic.title);
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center text-gray-600 hover:text-imtehaan-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-green-600" />
                <span className="font-semibold text-lg">{t.title}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Subject Selection - Only Business Studies */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                {t.selectSubject}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(t.subjects).map(([key, value]) => {
                  const Icon = (subjectIcons as any)[key] || BookOpen;
                  return (
                    <Button
                      key={key}
                      variant={selectedSubject === key ? "default" : "outline"}
                      className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                        selectedSubject === key 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                      onClick={() => handleSubjectChange(key)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{value}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Topic Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                {t.selectTopic}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSubject === 'businessStudies' ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <Button
                    variant={selectedTopic === 'all' ? "default" : "outline"}
                    className={`w-full justify-start ${
                      selectedTopic === 'all' 
                        ? 'bg-green-600 text-white border-green-600' 
                        : 'hover:bg-green-50 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedTopic('all')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t.allTopics}
                  </Button>
                  {loadingTopics ? (
                    <div className="flex items-center justify-center py-4 text-gray-500">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading topics...</span>
                    </div>
                  ) : (
                    getTopicsForSubject(selectedSubject).map((topic: string, index: number) => (
                      <Button
                        key={index}
                        variant={selectedTopic === topic ? "default" : "outline"}
                        className={`w-full justify-start ${
                          selectedTopic === topic 
                            ? 'bg-green-600 text-white border-green-600' 
                            : 'hover:bg-green-50 hover:border-green-300'
                        }`}
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {topic}
                      </Button>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{'Please select a subject first'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Start Button */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
            onClick={handleStartFlashcards}
            disabled={selectedSubject === 'businessStudies' && topics.length === 0}
          >
            <Brain className="h-5 w-5 mr-2" />
            {t.startFlashcards}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          {selectedSubject === 'businessStudies' && (
            <div className="mt-4 flex items-center justify-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                {t.subjects.businessStudies}
              </Badge>
              {selectedTopic !== 'all' && (
                <>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    {selectedTopic}
                  </Badge>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




