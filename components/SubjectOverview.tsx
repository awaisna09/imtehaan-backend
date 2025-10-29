import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import { 
  ArrowLeft, 
  Play, 
  Brain, 
  Eye, 
  CreditCard as CardIcon,
  FileText,
  CheckCircle,
  Clock,
  Target,
  BookOpen
} from 'lucide-react';

export function SubjectOverview() {
  const { setCurrentPage } = useApp();

  const translations = {
    en: {
      backToDashboard: "Back to Dashboard",
      mathematics: "Mathematics",
      progress: "Overall Progress",
      chapters: "Chapters",
      smartPractice: "Smart Practice",
      smartPracticeDesc: "AI-powered questions based on past papers",
      visualLearning: "Visual Learning", 
      visualLearningDesc: "Interactive animations and diagrams",
      flashcards: "Flashcards",
      flashcardsDesc: "Spaced repetition learning system",
      mockExams: "Mock Exams",
      mockExamsDesc: "Full-length practice examinations",
      startPractice: "Start Practice",
      watchVideo: "Watch Video",
      reviewCards: "Review Cards",
      takeExam: "Take Exam",
      completed: "Completed",
      inProgress: "In Progress",
      notStarted: "Not Started"
    }};
const t = translations.en;

  const chapters = [
    {
      id: 1,
      title: true ? "Algebra Fundamentals" : "أساسيات الجبر",
      progress: 100,
      status: 'completed',
      topics: 8,
      completedTopics: 8
    },
    {
      id: 2,
      title: true ? "Quadratic Equations" : "المعادلات التربيعية",
      progress: 75,
      status: 'inProgress',
      topics: 6,
      completedTopics: 4
    },
    {
      id: 3,
      title: true ? "Functions and Graphs" : "الدوال والرسوم البيانية",
      progress: 60,
      status: 'inProgress',
      topics: 10,
      completedTopics: 6
    },
    {
      id: 4,
      title: true ? "Calculus Introduction" : "مقدمة في التفاضل والتكامل",
      progress: 0,
      status: 'notStarted',
      topics: 12,
      completedTopics: 0
    }
  ];

  const overallProgress = Math.round(chapters.reduce((acc, chapter) => acc + chapter.progress, 0) / chapters.length);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'inProgress': return 'bg-blue-100 text-blue-800';
      case 'notStarted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t.completed;
      case 'inProgress': return t.inProgress;
      case 'notStarted': return t.notStarted;
      default: return t.notStarted;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-xl font-semibold">{t.mathematics}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overall Progress */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-[#FF4A10]" />
                  {t.progress}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-[#FF4A10]">{overallProgress}%</span>
                    <span className="text-gray-600">
                      {chapters.filter(c => c.status === 'completed').length} / {chapters.length} {t.chapters}
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Learning Options */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" 
                    onClick={() => setCurrentPage('practice')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-6 w-6 mr-3 text-[#FF4A10]" />
                    {t.smartPractice}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{t.smartPracticeDesc}</p>
                  <Button className="w-full bg-[#FF4A10] hover:bg-[#E63E0E] text-white">
                    <Play className="h-4 w-4 mr-2" />
                    {t.startPractice}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setCurrentPage('visual-learning')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-6 w-6 mr-3 text-blue-600" />
                    {t.visualLearning}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{t.visualLearningDesc}</p>
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Play className="h-4 w-4 mr-2" />
                    {t.watchVideo}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setCurrentPage('flashcard-selection')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CardIcon className="h-6 w-6 mr-3 text-green-600" />
                    {t.flashcards}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{t.flashcardsDesc}</p>
                  <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                    <CardIcon className="h-4 w-4 mr-2" />
                    {t.reviewCards}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-6 w-6 mr-3 text-purple-600" />
                    {t.mockExams}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{t.mockExamsDesc}</p>
                  <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                    <FileText className="h-4 w-4 mr-2" />
                    {t.takeExam}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Chapters List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-[#FF4A10]" />
                  {t.chapters}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{chapter.title}</h3>
                        <Badge className={getStatusColor(chapter.status)}>
                          {getStatusText(chapter.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{chapter.completedTopics}/{chapter.topics} topics completed</span>
                          <span>{chapter.progress}%</span>
                        </div>
                        <Progress value={chapter.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-sm text-gray-600">
                          {chapter.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          )}
                          {chapter.status === 'inProgress' && (
                            <Clock className="h-4 w-4 text-blue-600 mr-1" />
                          )}
                          <span>
                            {chapter.status === 'completed' && ('Chapter completed')}
                            {chapter.status === 'inProgress' && ('In progress')}
                            {chapter.status === 'notStarted' && ('Not started')}
                          </span>
                        </div>
                        
                        {chapter.status !== 'notStarted' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setCurrentPage('practice')}
                          >
                            {'Continue'}
                          </Button>
                        )}
                        
                        {chapter.status === 'notStarted' && (
                          <Button 
                            size="sm" 
                            className="bg-[#FF4A10] hover:bg-[#E63E0E] text-white"
                            onClick={() => setCurrentPage('practice')}
                          >
                            {'Start'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>
                  {'Quick Stats'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {'Completed'}
                  </span>
                  <span className="font-semibold text-green-600">
                    {chapters.filter(c => c.status === 'completed').length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {'In Progress'}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {chapters.filter(c => c.status === 'inProgress').length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {'Not Started'}
                  </span>
                  <span className="font-semibold text-gray-600">
                    {chapters.filter(c => c.status === 'notStarted').length}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {'Overall Progress'}
                    </span>
                    <span className="font-semibold text-[#FF4A10]">{overallProgress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>
                  {'Recent Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {'Completed Algebra Quiz'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {'2 hours ago'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Play className="h-4 w-4 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {'Watched Functions Video'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {'Yesterday'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}