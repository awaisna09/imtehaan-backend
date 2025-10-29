import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../App';
import { 
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  CheckSquare,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
  Globe
} from 'lucide-react';

const translations = {
  en: {
    title: "Mock Exam Selection",
    backToDashboard: "Back to Dashboard",
    selectPaper: "Select Your Paper",
    paper1: "Paper 1",
    paper2: "Paper 2",
    duration: "Duration",
    format: "Format",
    weightage: "Weightage",
    marks: "Marks",
    questions: "Questions",
    assessment: "Assessment",
    startExam: "Start Exam",
    paper1Description: "Short Answer and Data Response",
    paper2Description: "Case Study",
    paper1Details: "Four questions requiring a mixture of short answers and structured data responses",
    paper2Details: "Four questions based on a case study, provided as an insert with the paper",
    candidatesAnswer: "Candidates answer all questions",
    externallyAssessed: "Externally assessed",
    hour30: "1 hour 30 minutes",
    percentage50: "50%",
    marks80: "80 marks"
  }
};

export function MockExamSelection() {
  const {setCurrentPage} = useApp();
  const t = translations.en;

  const handlePaperSelection = (paper: 'p1' | 'p2') => {
    if (paper === 'p1') {
      setCurrentPage('mock-exam');
    } else {
      // For Paper 2, you can redirect to a different page or show a message
      setCurrentPage('mock-exam-p2');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t.title}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('settings')} className="hover:bg-gray-100/80 transition-colors">
                <Settings className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('landing')} className="hover:bg-gray-100/80 transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.selectPaper}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose between Paper 1 (Short Answer and Data Response) or Paper 2 (Case Study) to begin your mock exam.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Paper 1 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3 text-blue-700">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-blue-600" />
                </div>
                {t.paper1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t.duration}:</span>
                  <span className="text-gray-600">{t.hour30}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t.marks}:</span>
                  <span className="text-gray-600">{t.marks80}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t.weightage}:</span>
                  <span className="text-gray-600">{t.percentage50}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t.questions}:</span>
                  <span className="text-gray-600">4</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">{t.format}</h4>
                  <p className="text-blue-700 text-sm">{t.paper1Description}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-gray-700 text-sm">{t.paper1Details}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span>{t.candidatesAnswer}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span>{t.externallyAssessed}</span>
                </div>
              </div>

              <Button 
                onClick={() => handlePaperSelection('p1')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
              >
                {t.startExam} - {t.paper1}
              </Button>
            </CardContent>
          </Card>

          {/* Paper 2 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3 text-green-700">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                {t.paper2}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t.duration}:</span>
                  <span className="text-gray-600">{t.hour30}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t.marks}:</span>
                  <span className="text-gray-600">{t.marks80}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t.weightage}:</span>
                  <span className="text-gray-600">{t.percentage50}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t.questions}:</span>
                  <span className="text-gray-600">4</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">{t.format}</h4>
                  <p className="text-green-700 text-sm">{t.paper2Description}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-gray-700 text-sm">{t.paper2Details}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span>{t.candidatesAnswer}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span>{t.externallyAssessed}</span>
                </div>
              </div>

              <Button 
                onClick={() => handlePaperSelection('p2')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
              >
                {t.startExam} - {t.paper2}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}