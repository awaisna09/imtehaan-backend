import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import { p2MockExamService } from '../utils/supabase/services';
import { P2MockExam } from '../utils/supabase/client';
import { useAutoTracking } from '../hooks/useAutoTracking';
import { 
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  CheckSquare,
  Settings,
  LogOut,
  Globe,
  Construction,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Lightbulb,
  AlertCircle,
  Loader2,
  Trophy,
  Award,
  TrendingUp,
  Target
} from 'lucide-react';

const translations = {
  en: {
    title: "Paper 2 Mock Exam",
    backToDashboard: "Back to Dashboard",
    context: "Case Study Context",
    questions: "Questions",
    loading: "Loading...",
    noData: "No exam data available",
    caseStudy: "Case Study",
    question: "Question",
    part: "Part",
    marks: "Marks",
    previous: "Previous",
    next: "Next",
    of: "of"
  }};
interface CaseStudy {
  case: string;
  questions: P2MockExam[];
  totalMarks: number;
  caseStudyText: string;
}

interface AttemptedQuestion {
  question_id: number;
  question_number: number;
  part: string;
  question: string;
  user_answer: string;
  model_answer: string; // Model answer from database (answer column)
  marks: number;
  case: string;
  timestamp: string;
}



export function MockExamP2() {
  const { setCurrentPage, user: currentUser } = useApp();
  const t = translations.en;

  // Auto-tracking for mock exam time
  useAutoTracking({
    pageTitle: 'P2 Mock Exam',
    pageUrl: '/mock-exam-p2',
    trackClicks: true,
    trackTime: true,
    trackScroll: true
  });
  
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState<P2MockExam[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attemptedQuestions, setAttemptedQuestions] = useState<AttemptedQuestion[]>([]);
  const [showAttemptedQuestions, setShowAttemptedQuestions] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [gradingReport, setGradingReport] = useState<any>(null);
  const [showGradingReport, setShowGradingReport] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentCase = caseStudies[selectedCaseIndex];



  // Debug: Check if caseStudyText is available
  if (currentCase) {
    console.log('Current case details:', {
      case: currentCase.case,
      caseStudyText: currentCase.caseStudyText,
      caseStudyTextLength: currentCase.caseStudyText?.length || 0,
      totalQuestions: currentCase.questions?.length || 0,
      totalMarks: currentCase.totalMarks
    });
  }

  // Fetch case studies on component mount
  useEffect(() => {
    fetchCaseStudies();
  }, []);

  // No need for separate fetchQuestionsByCase since questions are already grouped in caseStudies
  // useEffect(() => {
  //   if (caseStudies.length > 0) {
  //     fetchQuestionsByCase(caseStudies[selectedCaseIndex].case);
  //   }
  // }, [caseStudies, selectedCaseIndex]);

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      const allCases = await p2MockExamService.getCaseStudies();
      
             if (allCases.length > 0) {
         // Randomly select a case study
         const randomIndex = Math.floor(Math.random() * allCases.length);
         const randomCase = allCases[randomIndex];
         
         // Set the randomly selected case
         setCaseStudies([randomCase]);
         setSelectedCaseIndex(0);
         
         // Set current questions from the randomly selected case, organized in A, B, A, B pattern
         const organizedQuestions = organizeQuestions(randomCase.questions);
         setCurrentQuestions(organizedQuestions);
         setCurrentQuestionIndex(0);
         
       } else {
      }
    } catch (error) {
      console.error('Error fetching case studies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove fetchQuestionsByCase function since we don't need it



  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      // Check if answer is provided
      if (!currentQuestion) return;
      
      const currentAnswer = answers[currentQuestion.question_id] || '';
      if (!currentAnswer.trim()) {
        setShowValidationError(true);
        return;
      }

      // Hide validation error if it was showing
      setShowValidationError(false);

      // Save current question to attempted questions before moving to next
      const attemptedQuestion: AttemptedQuestion = {
        question_id: currentQuestion.question_id,
        question_number: currentQuestion.question_number,
        part: currentQuestion.part,
        question: currentQuestion.question,
        user_answer: currentAnswer,
        model_answer: currentQuestion.answer || '', // Store answer column from database
        marks: currentQuestion.marks,
        case: currentQuestion.case || '',
        timestamp: new Date().toISOString()
      };
      
      // Add to attempted questions stack (newest first)
      setAttemptedQuestions(prev => [attemptedQuestion, ...prev]);
      
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // When going back, don't save to attempted questions (already saved when we moved forward)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };





  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImagePopup(true);
  };

  // Function to organize questions in A, B, A, B pattern
  const organizeQuestions = (questions: P2MockExam[]) => {
    const questionGroups: { [key: number]: P2MockExam[] } = {};
    
    // Group questions by question_number
    questions.forEach(question => {
      if (!questionGroups[question.question_number]) {
        questionGroups[question.question_number] = [];
      }
      questionGroups[question.question_number].push(question);
    });
    
    // Sort each group by part (A comes before B)
    Object.keys(questionGroups).forEach(key => {
      questionGroups[parseInt(key)].sort((a, b) => a.part.localeCompare(b.part));
    });
    
    // Flatten into A, B, A, B pattern
    const organizedQuestions: P2MockExam[] = [];
    Object.keys(questionGroups).forEach(key => {
      organizedQuestions.push(...questionGroups[parseInt(key)]);
    });
    
    return organizedQuestions;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    // Hide validation error when user starts typing
    if (showValidationError) {
      setShowValidationError(false);
    }
  };

  const handleExamSubmit = async () => {
    try {
      // Save current question if there's an answer
      if (currentQuestion) {
        const currentAnswer = answers[currentQuestion.question_id] || '';
        if (currentAnswer.trim()) {
          const attemptedQuestion: AttemptedQuestion = {
            question_id: currentQuestion.question_id,
            question_number: currentQuestion.question_number,
            part: currentQuestion.part,
            question: currentQuestion.question,
            user_answer: currentAnswer,
            model_answer: currentQuestion.answer || '',
            marks: currentQuestion.marks,
            case: currentQuestion.case || '',
            timestamp: new Date().toISOString()
          };
          setAttemptedQuestions(prev => [attemptedQuestion, ...prev]);
        }
      }

      // Check if there are attempted questions
      if (attemptedQuestions.length === 0) {
        alert('Please answer at least one question before submitting.');
        return;
      }

      // Show loading
      setIsGrading(true);

      // Prepare data for grading
      const gradingData = attemptedQuestions.map(q => ({
        question_id: q.question_id,
        question: q.question,
        user_answer: q.user_answer,
        model_answer: q.model_answer,
        marks: q.marks,
        part: q.part,
        question_number: q.question_number,
        case: q.case
      }));

      // Call grading API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/grade-mock-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attempted_questions: gradingData,
          exam_type: 'P2',
          student_id: currentUser?.id || 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to grade exam');
      }

      const report = await response.json();
      
      // Set grading report and show modal
      setGradingReport(report);
      setShowGradingReport(true);
      setIsGrading(false);

    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Error submitting exam. Please try again.');
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (caseStudies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Construction className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">{t.noData}</h2>
          <p className="text-gray-500">No P2 mock exam data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
      {/* Navigation Header - Exact match to P1 mock page */}
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
              {/* Time Limit */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200/50 shadow-sm">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  Time Limit: 1.5 hours
                </span>
              </div>

              {/* Total Marks */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200/50 shadow-sm">
                <CheckSquare className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Total: {currentCase?.totalMarks || 0} marks
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2.5 rounded-xl border border-red-200/50 shadow-sm">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="font-mono text-red-700 font-bold text-sm">
                  01:30:00
                </span>
              </div>

              {/* Attempted Questions Button */}
              {attemptedQuestions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAttemptedQuestions(true)}
                  className="bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-purple-700 hover:text-purple-800 transition-colors"
                >
                  <List className="h-4 w-4 mr-2" />
                  Attempted ({attemptedQuestions.length})
                </Button>
              )}

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

      {/* Main Content - Single Column Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Case Study Container */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-3 w-3 text-green-600" />
                </div>
                {t.context}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300/60 p-4">
                {currentCase && currentQuestions.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {currentCase.caseStudyText || 'No case study text available'}
                      </p>
                    </div>
          
                    {/* Images Section */}
                    {(() => {
                      // Function to extract all images from image_url fields
                      const extractAllImages = () => {
                        const allImages: string[] = [];
                        
                        currentQuestions.forEach(question => {
                          if (question.image_url) {
                            // Handle different possible formats of image_url
                            if (typeof question.image_url === 'string') {
                              // Check if it's a comma-separated string
                              if (question.image_url.includes(',')) {
                                const imageUrls = question.image_url.split(',').map(url => url.trim());
                                allImages.push(...imageUrls);
                              } else {
                                // Single image URL
                                allImages.push(question.image_url);
                              }
                            }
                          }
                        });
                        
                        return allImages;
                      };
                      
                      const allImages = extractAllImages();
                      // Remove duplicates and filter out empty strings
                      const uniqueImages = [...new Set(allImages)].filter(url => url && url.trim() !== '');
                      
                      return uniqueImages.length > 0 ? (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            Images ({uniqueImages.length})
                          </h4>
                          
                          <div className="grid grid-cols-3 gap-4">
                            {uniqueImages.map((imageUrl, index) => (
                              <div 
                                key={`${currentCase.case}-image-${index}`}
                                className="cursor-pointer transition-all duration-300 rounded-lg overflow-hidden hover:scale-105"
                                onClick={() => handleImageClick(imageUrl)}
                              >
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 h-32 relative overflow-hidden rounded-lg">
                                  <img 
                                    src={imageUrl} 
                                    alt={`Case Study Image ${index + 1}`}
                                    className="w-full h-full object-contain rounded transition-all duration-300 hover:scale-110"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Construction className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-xs text-gray-500">Case study context will be displayed here when available.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Container */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-3 w-3 text-purple-600" />
                </div>
                {t.questions}
              </CardTitle>
              <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                <span className="font-medium">
                  {t.question} {currentQuestionIndex + 1} {t.of} {currentQuestions.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {currentQuestion ? (
                <>
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1 border-blue-300 text-blue-700 bg-blue-50">
                        Question {currentQuestion.question_number}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1 border-purple-300 text-purple-700 bg-purple-50">
                        Part {currentQuestion.part}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-700 border-green-200">
                      {currentQuestion.marks} {t.marks}
                    </Badge>
                  </div>

                  {/* Question Content */}
                  <div className="text-sm text-gray-700 leading-relaxed mb-4">
                    <p className="whitespace-pre-line">{currentQuestion.question}</p>
                  </div>

                  {/* Answer Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer:
                    </label>
                    <textarea
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your answer here..."
                      value={answers[currentQuestion.question_id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                    />
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                      <span>Answer saved automatically</span>
                      <span>{answers[currentQuestion.question_id]?.length || 0} characters</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-600">Question Content</h3>
                  <p className="text-sm text-gray-500">Questions will be displayed here when available.</p>
                </div>
              )}

              {/* Question Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t.previous}
                </Button>
               
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex >= currentQuestions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  {t.next}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Validation Error Message */}
              {showValidationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">
                      Please write an answer before moving to the next question.
                    </span>
                  </div>
                  <button
                    onClick={() => setShowValidationError(false)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:opacity-50"
                  onClick={handleExamSubmit}
                  disabled={isGrading || attemptedQuestions.length === 0}
                >
                  {isGrading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Grading...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Submit Exam
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Image Popup Modal */}
      {showImagePopup && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowImagePopup(false)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowImagePopup(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold z-10 shadow-lg"
            >
              ×
            </button>
            
            {/* Image */}
            <div className="flex justify-center items-center h-full">
              <img
                src={selectedImage}
                alt="Case Study Image"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Attempted Questions Modal */}
      {showAttemptedQuestions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <List className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Attempted Questions</h2>
                  <p className="text-sm text-purple-100">{attemptedQuestions.length} questions completed</p>
                </div>
              </div>
              <button
                onClick={() => setShowAttemptedQuestions(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Content - Scrollable List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {attemptedQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Attempted Questions Yet</h3>
                  <p className="text-sm text-gray-500">Start answering questions to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attemptedQuestions.map((attempted, index) => (
                    <Card key={`${attempted.question_id}-${index}`} className="shadow-md border-0">
                      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs">
                              Question #{attempted.question_number}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                              Part {attempted.part}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {attempted.marks} marks
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(attempted.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {/* Question */}
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-2 block">Question:</label>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-900 whitespace-pre-line">{attempted.question}</p>
                          </div>
                        </div>

                        {/* Your Answer */}
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-2 block">Your Answer:</label>
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                              {attempted.user_answer || <span className="text-gray-400 italic">No answer provided</span>}
                            </p>
                          </div>
                        </div>

                        {/* Model Answer - Hidden from student view */}
                        {/* {attempted.model_answer && (
                          <div>
                            <label className="text-xs font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                              <Lightbulb className="h-3 w-3 text-amber-600" />
                              Model Answer:
                            </label>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-100">
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">{attempted.model_answer}</p>
                            </div>
                          </div>
                        )} */}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Report Modal */}
      {showGradingReport && gradingReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Exam Report</h2>
                  <p className="text-sm text-green-100">P2 Mock Exam Grading Results</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGradingReport(false);
                  setCurrentPage('dashboard');
                }}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Report Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {/* Overall Score */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-700">
                      {gradingReport.percentage_score}%
                    </div>
                    <div className="text-xs text-blue-600 mt-1">Score</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-purple-700">
                      {gradingReport.overall_grade}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">Grade</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-700">
                      {gradingReport.marks_obtained}/{gradingReport.total_marks}
                    </div>
                    <div className="text-xs text-green-600 mt-1">Marks</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-700">
                      {gradingReport.questions_attempted}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">Attempted</div>
                  </CardContent>
                </Card>
              </div>

              {/* Overall Feedback */}
              <Card className="mb-6 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Lightbulb className="h-5 w-5" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {gradingReport.overall_feedback}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Strengths */}
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckSquare className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {gradingReport.strengths_summary?.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Areas for Improvement */}
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {gradingReport.weaknesses_summary?.map((weakness: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <Target className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="mb-6 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <TrendingUp className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {gradingReport.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Award className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Question-wise Results */}
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <FileText className="h-5 w-5" />
                    Question-wise Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {gradingReport.question_grades?.map((qGrade: any, index: number) => (
                      <Card key={index} className="border-2">
                        <CardHeader className="pb-3 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                Q{qGrade.question_number} Part {qGrade.part}
                              </Badge>
                              <Badge variant="outline" className="border-purple-300 text-purple-700">
                                {qGrade.marks_allocated} marks
                              </Badge>
                            </div>
                            <Badge className={`${
                              qGrade.percentage_score >= 80 ? 'bg-green-600' :
                              qGrade.percentage_score >= 60 ? 'bg-yellow-600' :
                              'bg-red-600'
                            } text-white`}>
                              {qGrade.marks_awarded.toFixed(1)}/{qGrade.marks_allocated}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-700">Question:</label>
                            <p className="text-xs text-gray-900 mt-1">{qGrade.question_text}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-700">Your Answer:</label>
                            <p className="text-xs text-gray-700 mt-1 bg-green-50 p-2 rounded">
                              {qGrade.student_answer}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                              <Lightbulb className="h-3 w-3 text-amber-600" />
                              Feedback:
                            </label>
                            <p className="text-xs text-gray-700 mt-1 bg-blue-50 p-2 rounded">
                              {qGrade.feedback}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-green-50 p-2 rounded">
                              <p className="text-[10px] font-semibold text-green-800">Strengths</p>
                              <ul className="text-[10px] text-green-700 mt-1 space-y-0.5">
                                {qGrade.strengths?.map((s: string, i: number) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-orange-50 p-2 rounded">
                              <p className="text-[10px] font-semibold text-orange-800">Improvements</p>
                              <ul className="text-[10px] text-orange-700 mt-1 space-y-0.5">
                                {qGrade.improvements?.map((i: string, idx: number) => (
                                  <li key={idx}>• {i}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="border-t bg-white p-4 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowGradingReport(false)}
                className="border-gray-300"
              >
                Close Report
              </Button>
              <Button
                onClick={() => {
                  setShowGradingReport(false);
                  setCurrentPage('dashboard');
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

