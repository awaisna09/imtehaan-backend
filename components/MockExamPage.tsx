import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useApp } from '../App';
import { p1MockExamService } from '../utils/supabase/services';
import { enhancedAnalyticsTracker } from '../utils/supabase/enhanced-analytics-tracker';
import { learningActivityTracker } from '../utils/supabase/learning-activity-tracker';
import { comprehensiveAnalyticsService } from '../utils/supabase/comprehensive-analytics-service';
import { useAutoTracking } from '../hooks/useAutoTracking';
import { 
  ArrowLeft,
  Clock,
  BookOpen,
  Lightbulb,
  Send,
  CheckCircle,
  X,
  AlertCircle,
  Timer,
  Eye,
  EyeOff,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Settings,
  LogOut,
  Globe,
  Image as ImageIcon,
  FileText,
  CheckSquare,
  Loader2,
  List,
  Trophy,
  Award,
  TrendingUp,
  Target
} from 'lucide-react';

// TypeScript interfaces
interface P1MockExam {
  question_id: number;
  part: string;
  case_study: string;
  question: string;
  solution: string;
  hint: string | null;
  topic_name: string;
  marks: number;
  image: string | null;
  Set: string | null;
}

interface QuestionSet {
  set: string;
  questions: P1MockExam[];
  totalMarks: number;
}

interface AttemptedQuestion {
  question_id: number;
  part: string;
  question: string;
  user_answer: string;
  solution: string;
  marks: number;
  set: string;
  timestamp: string;
}

const translations = {
  en: {
    title: "P1 Mock Exam",
    backToDashboard: "Back to Dashboard",
    question: "Question",
    answer: "Your Answer",
    hint: "Hint",
    submit: "Submit Answer",
    next: "Next Question",
    previous: "Previous Question",
    timeRemaining: "Time Remaining",
    questionNumber: "Question",
    of: "of",
    showHint: "Show Hint",
    hideHint: "Hide Hint",
    flagQuestion: "Flag Question",
    examType: "Exam Type",
    p1: "Paper 1",
    p2: "Paper 2",
    minutes: "minutes",
    seconds: "seconds",
    content: "Case Study",
    images: "Images",
    questions: "Questions",
    part: "Part",
    marks: "Marks",
    topic: "Topic",
    caseStudy: "Case Study",
    loading: "Loading...",
    noData: "No exam data available",
    totalMarks: "Total Marks"
  }};
export function MockExamPage() {
  const { setCurrentPage, user: currentUser } = useApp();
  const t = translations.en;

  // Auto-tracking for mock exam time
  useAutoTracking({
    pageTitle: 'P1 Mock Exam',
    pageUrl: '/mock-exam-p1',
    trackClicks: true,
    trackTime: true,
    trackScroll: true
  });

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
    return subjectMap['businessStudies'] || 9; // Default to Business Studies for P1
  };
  
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState<P1MockExam[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(90 * 60); // 90 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [attemptedQuestions, setAttemptedQuestions] = useState<AttemptedQuestion[]>([]);
  const [showAttemptedQuestions, setShowAttemptedQuestions] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [gradingReport, setGradingReport] = useState<any>(null);
  const [showGradingReport, setShowGradingReport] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0); // Track time in seconds

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentSet = questionSets[selectedSetIndex];

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
        console.log(`🕒 MockExamPage: Saving ${timeSpent} seconds of study time`);
        comprehensiveAnalyticsService.addStudyTime(currentUser.id, timeSpent);
      }
    };
  }, [currentUser?.id, timeSpent]);

  // Track study time periodically (every 30 seconds) to ensure data is saved
  useEffect(() => {
    if (!currentUser?.id || timeSpent === 0) return;

    const saveInterval = setInterval(() => {
      if (timeSpent > 0 && timeSpent % 30 === 0) { // Every 30 seconds
        console.log(`🕒 MockExamPage: Periodic save - ${timeSpent} seconds`);
        comprehensiveAnalyticsService.addStudyTime(currentUser.id, 30); // Add 30 seconds
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [currentUser?.id, timeSpent]);

  // Fetch question sets on component mount
  useEffect(() => {
    fetchQuestionSets();
  }, []);

  // Fetch questions when a set is selected
  useEffect(() => {
    if (questionSets.length > 0) {
      fetchQuestionsBySet(questionSets[selectedSetIndex].set);
    }
  }, [questionSets, selectedSetIndex]);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      const allSets = await p1MockExamService.getQuestionSets();
      
      // Randomly select 4 different sets from all available sets
      const shuffledSets = [...allSets].sort(() => Math.random() - 0.5);
      const selectedSets = shuffledSets.slice(0, 4);
      
      // If we have less than 4 sets total in the database, we can't reach 80 marks
      if (allSets.length < 4) {
        console.warn(`Only ${allSets.length} question sets available in database, cannot reach 80 marks`);
      }
      
      setQuestionSets(selectedSets);
      if (selectedSets.length > 0) {
        setSelectedSetIndex(0);
      }
    } catch (error) {
      console.error('Error fetching question sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsBySet = async (setName: string) => {
    try {
      const questions = await p1MockExamService.getQuestionsBySet(setName);
      
      setCurrentQuestions(questions);
      setCurrentQuestionIndex(0);
      setShowHint(false);
      setAnswers({});
      
      // Preload images to check if they're accessible
      questions.forEach(question => {
        if (question.image) {
          preloadImage(question.image, question.question_id);
        }
      });
    } catch (error) {
      console.error('Error fetching questions by set:', error);
    }
  };

  // Function to preload images and check accessibility
  const preloadImage = (src: string, questionId: number) => {
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Image ${questionId} loaded successfully:`, src);
    };
    img.onerror = () => {
      console.log(`❌ Image ${questionId} failed to load:`, src);
      // Try to fetch with fetch API to bypass CORS
      tryFetchImage(src, questionId);
    };
    img.src = src;
  };

  // Function to try fetching image with fetch API to bypass CORS
  const tryFetchImage = async (src: string, questionId: number) => {
    try {
      const response = await fetch(src, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'image/*',
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        console.log(`✅ Image ${questionId} fetched successfully via fetch API`);
        
        // Update the image source in the DOM
        const imgElement = document.querySelector(`img[src="${src}"]`) as HTMLImageElement;
        if (imgElement) {
          imgElement.src = objectURL;
        }
      } else {
        console.log(`❌ Image ${questionId} fetch failed:`, response.status, response.statusText);
      }
    } catch (error) {
      console.log(`❌ Image ${questionId} fetch error:`, error);
    }
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          
          // Track analytics when exam time runs out
          handleExamCompletion();
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle exam completion and track analytics
  const handleExamCompletion = async () => {
    try {
      if (currentUser?.id) {
        const examDuration = 90 * 60 - timeRemaining; // Calculate actual time spent
        const totalQuestions = currentQuestions.length;
        const answeredQuestions = Object.keys(answers).length;
        
        // For now, assume all answered questions are correct
        // You can implement actual scoring logic later
        const correctAnswers = answeredQuestions;
        
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        // Track with enhanced analytics tracker
        await enhancedAnalyticsTracker.trackMockExam(
          currentUser.id,
          1, // Default topic ID for Business Studies
          'Mock Exam P1',
          'Business Studies',
          Math.ceil(examDuration / 60), // Convert to minutes
          correctAnswers,
          totalQuestions,
          score
        );

        // Track with new learning activity tracker
        await learningActivityTracker.trackMockExam(
          1, // Default topic ID for Business Studies
          'Mock Exam P1',
          'Business Studies',
          examDuration,
          correctAnswers,
          totalQuestions,
          score
        );
        
      }
    } catch (error) {
      console.error('Error tracking mock exam analytics:', error);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.question_id]: value
    }));
    // Hide validation error when user starts typing
    if (showValidationError) {
      setShowValidationError(false);
    }
  };

  const toggleFlag = () => {
    // Toggle flag logic here
  };

  const handleExamSubmit = async () => {
    try {
      // Save current question if there's an answer
      if (currentQuestion) {
        const currentAnswer = answers[currentQuestion.question_id] || '';
        if (currentAnswer.trim()) {
          const attemptedQuestion: AttemptedQuestion = {
            question_id: currentQuestion.question_id,
            part: currentQuestion.part,
            question: currentQuestion.question,
            user_answer: currentAnswer,
            solution: currentQuestion.solution,
            marks: currentQuestion.marks,
            set: currentQuestion.Set || '',
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
        solution: q.solution,
        marks: q.marks,
        part: q.part,
        set: q.set
      }));

      // Call grading API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/grade-mock-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attempted_questions: gradingData,
          exam_type: 'P1',
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
        part: currentQuestion.part,
        question: currentQuestion.question,
        user_answer: currentAnswer,
        solution: currentQuestion.solution,
        marks: currentQuestion.marks,
        set: currentQuestion.Set || '',
        timestamp: new Date().toISOString()
      };
      
      // Add to attempted questions stack (newest first)
      setAttemptedQuestions(prev => [attemptedQuestion, ...prev]);
      
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowHint(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // When going back, don't save to attempted questions (already saved when we moved forward)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowHint(false);
    }
  };

  const nextSet = () => {
    if (selectedSetIndex < Math.min(questionSets.length, 4) - 1) {
      setSelectedSetIndex(selectedSetIndex + 1);
    }
  };

  const previousSet = () => {
    if (selectedSetIndex > 0) {
      setSelectedSetIndex(selectedSetIndex - 1);
    }
  };

  const handleImageLoad = (questionId: string, src: string) => {
    // Image loaded successfully
  };

  const handleImageError = (questionId: string, src: string) => {
    // Handle image load error
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImagePopup(true);
  };

  const closeImagePopup = () => {
    setShowImagePopup(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (questionSets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600">{t.noData}</p>
        </div>
      </div>
    );
  }

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
              {/* Study Time Display */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200/50 shadow-sm">
                <Clock className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Study: {formatTime(timeSpent)}
                </span>
              </div>
              
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
                  Total: 80 marks
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2.5 rounded-xl border border-red-200/50 shadow-sm">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="font-mono text-red-700 font-bold text-sm">
                  {formatTime(timeRemaining)}
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

      {/* Main Content - Three Column Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* Left Column - Images */}
          <div className="w-80 flex-shrink-0">
            <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-base flex items-center gap-2 text-blue-800 font-semibold">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                  {t.images}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {currentQuestions.length > 0 ? (
                  currentQuestions
                    .map((question, index) => {
                      if (!question.image) return null; // Skip questions without images
                      
                      return (
                        <div 
                          key={question.question_id}
                          className={`cursor-pointer transition-all duration-300 rounded-lg overflow-hidden ${
                            currentQuestionIndex === index 
                              ? 'shadow-lg scale-105' 
                              : 'hover:scale-102 hover:shadow-md'
                          }`}
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          <div 
                            className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 h-32 relative overflow-hidden rounded-lg cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(question.image!);
                            }}
                          >
                            <img 
                              src={question.image} 
                              alt={`Question ${question.part}`}
                              className="w-full h-full object-contain rounded transition-all duration-300 hover:scale-110"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                // If image fails to load, show a fallback image
                                const target = e.target as HTMLImageElement;
                                console.log(`Image failed to load: ${target.src}`);
                                
                                // Try multiple fallback options
                                if (target.src.includes('picsum')) {
                                  // If already using fallback, show placeholder
                                  target.style.display = 'none';
                                  const placeholder = target.nextElementSibling as HTMLElement;
                                  if (placeholder) placeholder.classList.remove('hidden');
                                } else {
                                  // First fallback: Picsum with random seed
                                  target.src = 'https://picsum.photos/400/300?random=' + question.question_id;
                                  target.onerror = null; // Prevent infinite loop
                                }
                              }}
                              onLoad={(e) => {
                                // Hide placeholder when image loads successfully
                                const target = e.target as HTMLImageElement;
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.classList.add('hidden');
                                console.log(`Image loaded successfully: ${target.src}`);
                              }}
                            />
                            {/* Placeholder when image fails to load */}
                            <div className="hidden absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                              <div className="text-center text-gray-600">
                                <ImageIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                                <p className="text-xs font-medium">Image placeholder</p>
                                <p className="text-xs text-gray-500 mt-1">Question {question.part}</p>
                                <p className="text-xs text-gray-500 mt-1">CORS issue detected</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean) // Remove null values
                    .slice(0, 1) // Show only the first image
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-xs font-medium">No questions available</p>
                  </div>
                )}
                
                {/* Show message if no images in current set */}
                {currentQuestions.length > 0 && currentQuestions.filter(q => q.image).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-xs font-medium">No images required for this question set</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Case Study */}
          <div className="flex-1">
            <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-base flex items-center gap-2 text-green-800 font-semibold">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  {t.caseStudy}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-4">
                <div className="h-full flex flex-col">
                  <div className="flex-1 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300/60 overflow-y-auto">
                    {currentQuestions.length > 0 && currentQuestions[0].case_study ? (
                      <div>
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-800">
                            {t.caseStudy}
                          </h3>
                        </div>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {currentQuestions[0].case_study}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2 text-gray-600">{t.caseStudy}</h3>
                        <p className="text-xs text-gray-500">No case study available for this question set.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Set Navigation Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-green-100 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousSet}
                      disabled={selectedSetIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all text-xs font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous Set
                    </Button>
                    
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold px-3 py-1.5 border border-green-300">
                      Set {selectedSetIndex + 1} of 4
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextSet}
                      disabled={selectedSetIndex >= Math.min(questionSets.length, 4) - 1}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all text-xs font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      Next Set
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Questions */}
          <div className="w-80 flex-shrink-0">
            <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-base flex items-center gap-2 text-purple-800 font-semibold">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <CheckSquare className="h-4 w-4 text-white" />
                  </div>
                  {t.questions}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {currentQuestion && (
                  <>
                    {/* Hint Button */}
                    {currentQuestion.hint && (
                      <div className="flex justify-end mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHint(!showHint)}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-300 transition-all text-xs font-medium rounded-xl shadow-sm"
                        >
                          <Lightbulb className="h-4 w-4 mr-2" />
                          {showHint ? t.hideHint : t.showHint}
                        </Button>
                      </div>
                    )}

                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-xs px-3 py-1.5 border-blue-400 text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 font-medium shadow-sm">
                        {t.part} {currentQuestion.part}
                      </Badge>
                      <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300 font-semibold shadow-sm">
                        {currentQuestion.marks} {t.marks}
                      </Badge>
                    </div>

                    {/* Question */}
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200/60 shadow-sm relative">
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-md">
                          Q{currentQuestionIndex + 1}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-relaxed pr-12">{currentQuestion.question}</h3>
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                        {t.answer}
                      </label>
                      <Textarea
                        placeholder="Type your answer here..."
                        className="min-h-[100px] resize-none border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-xl text-xs leading-relaxed shadow-sm"
                        value={answers[currentQuestion.question_id] || ''}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                      />
                    </div>

                    {/* Hint Popup */}
                    {showHint && currentQuestion.hint && (
                      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                              <Lightbulb className="h-5 w-5" />
                              {t.hint}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowHint(false)}
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200/60 mb-4">
                            <p className="text-sm text-amber-900 font-medium leading-relaxed">{currentQuestion.hint}</p>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => setShowHint(false)}
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium px-6 py-2 rounded-xl shadow-md"
                            >
                              Got it!
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t border-purple-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-1 px-3 py-1.5 border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all text-[10px] font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      >
                        <ChevronLeft className="h-3 w-3" />
                        {t.previous}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex === currentQuestions.length - 1}
                        className="flex items-center gap-1 px-3 py-1.5 border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all text-[10px] font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      >
                        {t.next}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Validation Error Message */}
                    {showValidationError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-700 font-medium">
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
                    <div className="mt-4 pt-4 border-t border-purple-100">
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 text-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:opacity-50"
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
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Submit Exam
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Popup Modal */}
      {showImagePopup && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[70vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeImagePopup}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
            
            {/* Image */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Question Image"
                className="max-w-full max-h-full object-contain rounded-lg"
                crossOrigin="anonymous"
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
                              Question #{index + 1}
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
                            <p className="text-sm text-gray-900">{attempted.question}</p>
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

                        {/* Solution - Hidden from student view */}
                        {/* <div>
                          <label className="text-xs font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                            <Lightbulb className="h-3 w-3 text-amber-600" />
                            Model Solution:
                          </label>
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-100">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{attempted.solution}</p>
                          </div>
                        </div> */}
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
                  <p className="text-sm text-green-100">P1 Mock Exam Grading Results</p>
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
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {gradingReport.strengths_summary?.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                                Question {qGrade.question_number || qGrade.part} Part {qGrade.part}
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