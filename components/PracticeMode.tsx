import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useApp } from '../App';
import { topicsService } from '../utils/supabase/services';
import { supabase } from '../utils/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { enhancedAnalyticsTracker } from '../utils/supabase/enhanced-analytics-tracker';
import { learningActivityTracker } from '../utils/supabase/learning-activity-tracker';
import { usePageTracking } from '../hooks/usePageTracking';
import { 
  ArrowLeft, 
  ArrowRight, 
  Lightbulb, 
  Flag, 
  CheckCircle,
  XCircle,
  X,
  SkipForward,
  Timer,
  Brain,
  Target,
  Home,
  Bot,
  User,
  Send,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Languages,
  Globe,
  MessageCircle,
  HelpCircle,
  Zap,
  Briefcase,
  Clock
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  subject?: string;
}

const translations = {
  en: {
    practiceMode: "Exam Style Question Paper Practice",
    backToDashboard: "Back to Dashboard",
    question: "Question",
    of: "of",
    timeRemaining: "Time Remaining",
    difficulty: "Difficulty",
    topic: "Topic",
    hint: "Show Hint",
    showHint: "Show Hint",
    hideHint: "Hide Hint",
    skip: "Next Question",
    next: "Next",
    submit: "Submit Answer",
    explanation: "Explanation",
    correct: "Correct!",
    incorrect: "Incorrect",
    wellDone: "Well done! Your answer is correct.",
    tryAgain: "Not quite right. Here's the explanation:",
    aiHint: "AI Hint",
    hintText: "Try breaking this problem into smaller steps. Start by identifying what you're solving for.",
    aiTutor: "AI Tutor",
    askTutor: "Ask your AI tutor anything about this question...",
    send: "Send",
    typing: "AI Tutor is thinking...",
    selectSubject: "Select Subject",
    selectTopic: "Select Topic",
    startPractice: "Start Practice",
    subjects: {
      mathematics: "Mathematics",
      physics: "Physics",
      chemistry: "Chemistry",
      biology: "Biology",
      english: "English",
      history: "History",
      geography: "Geography",
      economics: "Economics",
      businessStudies: "Business Studies"
    },


    difficulties: {
      easy: "Easy",
      medium: "Medium", 
      hard: "Hard"
    },
    welcomeTutor: "Hi! I'm your AI tutor. I'm here to help you understand this question and guide you through the solution. Feel free to ask me anything!"
  }};export function PracticeMode() {
  const { setCurrentPage, user: currentUser } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('businessStudies');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(450); // 7.5 minutes
  const [score, setScore] = useState(0);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [businessQuestions, setBusinessQuestions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // AI Tutor chat state
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  
  // Grading system state
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [isGrading, setIsGrading] = useState(false);
  
  // Session report state
  const [showSessionReport, setShowSessionReport] = useState(false);
  const [sessionQuestionsSummary, setSessionQuestionsSummary] = useState<any[]>([]);
  
  // Track attempted questions
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations.en;
  
  // Page tracking hook
  const { trackQuestionAttempt, trackEngagement, trackError } = usePageTracking({
    pageName: 'Practice Mode',
    pageCategory: 'practice',
    metadata: { 
      subject: selectedSubject, 
      topic: selectedTopic 
    }
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
    return subjectMap[subjectName] || 0;
  };

  useEffect(() => {
    if (practiceStarted && chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'bot',
        content: t.welcomeTutor,
        timestamp: new Date(),
        subject: selectedSubject
      };
      setChatMessages([welcomeMessage]);
    }
  }, [practiceStarted, t.welcomeTutor, selectedSubject, chatMessages.length]);

  useEffect(() => {
    if (businessQuestions.length > 0) {
      setQuestions(businessQuestions);
    }
  }, [businessQuestions]);

  useEffect(() => {
    if (currentUser?.id && selectedSubject && selectedTopicId) {
      checkAvailableTopicIDs();
    }
  }, [currentUser?.id, selectedSubject, selectedTopicId]);

  const checkAvailableTopicIDs = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('topic_id')
        .eq('subject_id', 9);

        if (error) {
        throw error;
        }
    } catch (error) {
      // Silently handle errors
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Track user engagement (scroll depth, interactions)
  useEffect(() => {
    const trackScroll = () => {
      if (currentUser?.id) {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        trackEngagement({
          scrollDepth,
          timeOnPage: 0, // Will be calculated based on session
          interactions: attemptedQuestions.size,
          focusTime: 0
        });
      }
    };

    window.addEventListener('scroll', trackScroll);
    return () => window.removeEventListener('scroll', trackScroll);
  }, [currentUser?.id, attemptedQuestions.size]);

  // Debug logging for user and session state
  useEffect(() => {
    console.log('🔍 DEBUG: Current user state:', {
      currentUser: currentUser,
      userId: currentUser?.id,
      isLoggedIn: !!currentUser,
      sessionId: sessionId,
      selectedTopicId: selectedTopicId,
      selectedSubject: selectedSubject
    });
    
    // Test if analytics tracker is available
    console.log('🔍 DEBUG: Analytics tracker available:', !!enhancedAnalyticsTracker);
    console.log('🔍 DEBUG: Analytics tracker methods:', Object.keys(enhancedAnalyticsTracker));
  }, [currentUser, sessionId, selectedTopicId, selectedSubject]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch topics when subject is selected
  const fetchTopics = async (subject: string) => {
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

  // Auto-fetch topics on mount
  useEffect(() => {
    fetchTopics('businessStudies');
  }, []);

  // Fetch business activity questions when a topic is selected
  const fetchBusinessQuestions = async (topicId: string) => {
    setLoadingQuestions(true);
    try {
      const { data, error } = await topicsService.getBusinessActivityQuestions(topicId);
      if (error) {
        console.error('Error fetching business questions:', error);
        setBusinessQuestions([]);
    } else {
        setBusinessQuestions(data || []);
        console.log('Fetched business questions:', data);
      }
    } catch (error) {
      console.error('Error in fetchBusinessQuestions:', error);
      setBusinessQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getQuestionsForSubjectAndTopic = (subject: string, topic: string) => {
    if (subject === 'businessStudies' && businessQuestions.length > 0) {
      // Return business questions from database
      return businessQuestions.map((q, index) => ({
        id: index + 1,
        question: q.question || '',
        context: q.context || '',
        marks: q.marks || 0,
        skill: q.skill || '',
        hint: q.hint || '',
        options: [], // Business questions are essay-style, no multiple choice
        correct: '',
            difficulty: 'medium',
        topic: topic,
        explanation: q.explanation || ''
      }));
    }
    
    // For now, only business studies is supported
    return [];
  };

  // Get current questions
  const getCurrentQuestions = () => {
    if (selectedSubject === 'businessStudies' && businessQuestions.length > 0) {
      return businessQuestions.map(q => ({
        id: q.id || `q_${Math.random()}`,
        question: q.question || 'Question text not available',
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correct_option || 'A',
        explanation: q.explanation || 'Explanation not available',
        difficulty: q.difficulty || 'medium',
        marks: q.marks || 1,
        topic: q.topic || 'Business Studies'
      }));
    }
    return questions;
  };

  const getCurrentQuestionData = () => {
    if (selectedSubject === 'businessStudies' && businessQuestions.length > 0) {
      // For Business Studies, get data directly from businessQuestions
      const question = businessQuestions[currentQuestion];
      if (question) {
        console.log('🔍 Raw question data from database:', question);
        const mappedQuestion = {
          id: question.id || `q_${currentQuestion}`,
          question: question.question || 'Question text not available',
          context: question.context || '',
          marks: question.marks || 1,
          skill: question.skill || '',
          hint: question.hint || '',
          modelAnswer: question.model_answer || '', // Map model_answer field
          explanation: question.explanation || '',
          difficulty: question.difficulty || 'medium',
          topic: question.topic_name || question.topic || 'Business Studies' // Use topic_name from database
        };
        console.log('🔍 Mapped question data:', mappedQuestion);
        return mappedQuestion;
      }
    }
    
    // For other subjects, use the questions array
    const currentQuestions = getCurrentQuestions();
    return currentQuestions[currentQuestion];
  };

  const currentQuestionData = getCurrentQuestionData();
  
  // Debug logging
  console.log('=== DEBUG INFO ===');
  console.log('Current questions:', questions);
  console.log('Questions length:', questions.length);
  console.log('Business questions state:', businessQuestions);
  console.log('Business questions length:', businessQuestions.length);
  console.log('Selected subject:', selectedSubject);
  console.log('Selected topic ID:', selectedTopicId);
  console.log('Practice started:', practiceStarted);
  console.log('Current question index:', currentQuestion);
  console.log('Current question data:', currentQuestionData);
  console.log('Hint data:', currentQuestionData?.hint);
  console.log('Model answer data:', currentQuestionData?.modelAnswer);
  console.log('==================');
  
  // Early return if no questions loaded yet
  if (practiceStarted && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
          <p className="text-sm text-gray-500 mt-2">Business questions: {businessQuestions.length}</p>
          <p className="text-sm text-gray-500">Selected topic ID: {selectedTopicId}</p>
        </div>
      </div>
      );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmit = async () => {
    // Track that this question was attempted
    setAttemptedQuestions(prev => new Set([...prev, currentQuestion]));
    
    if (selectedSubject === 'businessStudies' && selectedAnswer) {
      // For Business Studies, use AI grading
      await gradeAnswer(selectedAnswer);
    } else {
      // For other subjects, show answer directly
      setShowAnswer(true);
    }
    
    // Track analytics for question completion
    try {
      if (currentUser?.id && selectedTopicId && currentQuestionData) {
        // Get the current question data
        const question = currentQuestionData;
        
        // Track the question attempt with enhanced analytics
        if (selectedTopicId) {
          const topicId = parseInt(selectedTopicId);
          if (!isNaN(topicId)) {
            // Track with enhanced analytics tracker
            await enhancedAnalyticsTracker.trackActivity({
              userId: currentUser.id,
              activityType: 'question',
              topicId: topicId,
              subjectId: getSubjectId(selectedSubject),
              topicName: selectedTopic,
              subjectName: selectedSubject === 'businessStudies' ? 'Business Studies' : selectedSubject,
              duration: 450 - timeRemaining,
              timestamp: new Date().toISOString(),
              metadata: {
                questionId: String(question.id || `q_${currentQuestion}`),
                isCorrect: true,
                difficulty: question.difficulty || 'medium',
                marks: question.marks || 1,
                score: 100
              }
            });

            // Track with new learning activity tracker
            const isCorrect = true; // Assume correct for now - implement actual scoring
            const duration = 450 - timeRemaining; // Time spent on this question
            
            await learningActivityTracker.trackQuestion(
              topicId,
              selectedTopic,
              selectedSubject === 'businessStudies' ? 'Business Studies' : selectedSubject,
              isCorrect,
              duration,
              question.difficulty || 'medium',
              question.marks || 1
            );
          }
        }
      }
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  };

  // AI Grading function for Business Studies
  const gradeAnswer = async (studentAnswer: string) => {
    console.log('🎯 GradeAnswer function called with:', {
      studentAnswer,
      currentQuestionData,
      selectedTopic,
      hasModelAnswer: !!currentQuestionData?.modelAnswer
    });

    if (!currentQuestionData || !studentAnswer.trim()) {
      console.log('❌ Missing data:', { currentQuestionData, studentAnswer });
      alert('Please make sure you have selected a question and written an answer.');
      return;
    }

    if (!currentQuestionData.question) {
      console.log('❌ No question text available');
      alert('Question text not available. Please try again.');
      return;
    }

    // Track question attempt for analytics
    if (currentUser?.id && currentQuestionData) {
      try {
        await trackQuestionAttempt({
          subject: selectedSubject || 'Business Studies',
          topic: selectedTopic || 'General',
          difficulty: currentQuestionData.difficulty || 'medium',
          correct: false, // Will be updated after grading
          timeSpent: 0, // Will be calculated based on question start time
          questionId: currentQuestionData.id?.toString()
        });
      } catch (error) {
        console.error('Error tracking question attempt:', error);
      }
    }

    setIsGrading(true);
    try {
      const requestBody = {
        question: currentQuestionData.question,
        model_answer: currentQuestionData.modelAnswer || 'No model answer available for this question.',
        student_answer: studentAnswer,
        subject: 'Business Studies',
        topic: selectedTopic || 'General Business'
      };

      console.log('📤 Sending grading request:', requestBody);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/grade-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response received:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Grading successful:', result);
        setGradingResult(result.result);
        setShowAnswer(true);
        
        // Store this question's results in session summary
        const questionSummary = {
          questionNumber: currentQuestion + 1,
          questionText: currentQuestionData.question,
          studentAnswer: studentAnswer,
          gradingResult: result.result,
          topic: selectedTopic,
          difficulty: currentQuestionData.difficulty || 'medium',
          marks: currentQuestionData.marks || 1,
          timestamp: new Date().toISOString()
        };
        
        setSessionQuestionsSummary(prev => {
          // Remove any existing entry for this question number and add the new one
          const filtered = prev.filter(item => item.questionNumber !== questionSummary.questionNumber);
          return [...filtered, questionSummary];
        });
      } else {
        console.error('❌ Grading failed:', response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        // Fallback: show model answer without grading
        setShowAnswer(true);
        
        // Store this question's results in session summary (without grading)
        const questionSummary = {
          questionNumber: currentQuestion + 1,
          questionText: currentQuestionData.question,
          studentAnswer: studentAnswer,
          gradingResult: null, // No grading result due to error
          topic: selectedTopic,
          difficulty: currentQuestionData.difficulty || 'medium',
          marks: currentQuestionData.marks || 1,
          timestamp: new Date().toISOString(),
          error: 'Grading failed'
        };
        
        setSessionQuestionsSummary(prev => {
          const filtered = prev.filter(item => item.questionNumber !== questionSummary.questionNumber);
          return [...filtered, questionSummary];
        });
      }
    } catch (error) {
      console.error('❌ Error grading answer:', error);
      
      // Track error for analytics
      if (currentUser?.id) {
        try {
          await trackError({
            errorType: 'grading_error',
            errorMessage: error instanceof Error ? error.message : 'Unknown grading error',
            component: 'PracticeMode',
            userAction: 'submit_answer'
          });
        } catch (trackingError) {
          console.error('Error tracking error:', trackingError);
        }
      }
      
      // Fallback: show model answer without grading
      setShowAnswer(true);
      
      // Store this question's results in session summary (with error)
      const questionSummary = {
        questionNumber: currentQuestion + 1,
        questionText: currentQuestionData.question,
        studentAnswer: studentAnswer,
        gradingResult: null,
        topic: selectedTopic,
        difficulty: currentQuestionData.difficulty || 'medium',
        marks: currentQuestionData.marks || 1,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setSessionQuestionsSummary(prev => {
        const filtered = prev.filter(item => item.questionNumber !== questionSummary.questionNumber);
        return [...filtered, questionSummary];
      });
    } finally {
      setIsGrading(false);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      // Track question completion and move to next
      if (currentUser?.id && questions[currentQuestion]) {
        try {
          await trackQuestionAttempt({
            subject: selectedSubject || 'Business Studies',
            topic: selectedTopic || 'General',
            difficulty: questions[currentQuestion].difficulty || 'medium',
            correct: selectedAnswer === questions[currentQuestion].correctAnswer,
            timeSpent: 0, // Calculate based on question start time
            questionId: questions[currentQuestion].id?.toString()
          });
        } catch (error) {
          console.error('Error tracking question attempt:', error);
        }
      }
      
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setShowHint(false);
      setGradingResult(null); // Clear grading results for new question
      setShowSessionReport(false); // Clear session report for new question
      // Note: Don't clear attemptedQuestions here as we want to track all attempts in the session
    } else {
      // Track analytics for completed practice session
      try {
        if (currentUser?.id && selectedTopicId) {
          const sessionDuration = 450 - timeRemaining; // Calculate actual time spent
          const questionsAnswered = questions.length;
          const correctAnswers = questions.length; // For now, assume all correct - implement actual scoring later
          
          if (sessionId) {
            // Track with enhanced analytics tracker
            await enhancedAnalyticsTracker.trackActivity({
              userId: currentUser.id,
              activityType: 'practice_session',
              topicId: parseInt(selectedTopicId),
              subjectId: getSubjectId(selectedSubject),
              topicName: selectedTopic,
              subjectName: selectedSubject === 'businessStudies' ? 'Business Studies' : selectedSubject,
              duration: sessionDuration,
              timestamp: new Date().toISOString(),
              metadata: {
                sessionId: sessionId,
                questionsAnswered: questionsAnswered,
                correctAnswers: correctAnswers,
                totalQuestions: questions.length,
                score: questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0
              }
            });

            // Track with new learning activity tracker
            await learningActivityTracker.trackPracticeSession(
              parseInt(selectedTopicId),
              selectedTopic,
              selectedSubject === 'businessStudies' ? 'Business Studies' : selectedSubject,
              sessionDuration,
              questionsAnswered,
              correctAnswers
            );
          }
        }
      } catch (error) {
        console.error('Error tracking session analytics:', error);
      }
      
      // End the learning activity session
      try {
        await learningActivityTracker.endStudySession();
      } catch (error) {
        console.log('⚠️ Could not end learning activity session:', error);
      }
      
      setCurrentPage('feedback');
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartPractice = async () => {
    console.log('=== START PRACTICE DEBUG ===');
    console.log('Starting practice...');
    console.log('Selected subject:', selectedSubject);
    console.log('Selected topic ID:', selectedTopicId);
    console.log('Selected topic ID type:', typeof selectedTopicId);
    console.log('Current user:', currentUser);
    console.log('Current user ID:', currentUser?.id);
    console.log('Session ID before:', sessionId);
    
    if (selectedSubject === 'businessStudies' && selectedTopicId) {
      console.log('Fetching business questions for topic ID:', selectedTopicId);
      
      // Start tracking the practice session
      if (currentUser?.id) {
        console.log('🔍 DEBUG: Starting analytics session for user:', currentUser.id);
        
        // Start enhanced analytics session
        const sessionId = enhancedAnalyticsTracker.startSession(
          currentUser.id,
          parseInt(selectedTopicId),
          getSubjectId(selectedSubject),
          'practice_session'
        );
        
        // Start learning activity tracker session
        try {
          await learningActivityTracker.startStudySession(
            currentUser.id,
            `Practice Session - ${selectedTopic}`,
            [`Master ${selectedTopic}`, 'Improve accuracy', 'Build confidence']
          );
        } catch (error) {
          console.log('⚠️ Could not start learning activity session:', error);
        }
        
        // Store session ID for tracking
        setSessionId(sessionId);
        console.log('🔍 DEBUG: Session ID set to:', sessionId);
      } else {
        console.log('❌ DEBUG: No current user ID available for analytics');
      }
      
      // Fetch questions from database for Business Studies first
      const { data, error } = await topicsService.getBusinessActivityQuestions(selectedTopicId);
      
      console.log('=== FETCH RESULTS ===');
      console.log('Raw fetch result:', { data, error });
      console.log('Data type:', typeof data);
      console.log('Data length:', data?.length);
      console.log('Data structure:', data);
      
      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Questions loaded successfully, starting practice');
        console.log('Setting businessQuestions state to:', data);
        setBusinessQuestions(data);
        
        // Wait a moment for state to update
        setTimeout(() => {
          console.log('=== STATE UPDATE CHECK ===');
          console.log('businessQuestions state after setState:', businessQuestions);
          console.log('practiceStarted state:', practiceStarted);
        }, 100);
        
              setPracticeStarted(true);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setShowHint(false);
        setGradingResult(null); // Clear grading results
        setShowSessionReport(false); // Clear session report
        setAttemptedQuestions(new Set()); // Clear attempted questions
        setSessionQuestionsSummary([]); // Clear session questions summary
        setTimeRemaining(450);
        
        // Initialize AI Tutor
        const welcomeMessage: ChatMessage = {
          id: '1',
          type: 'bot',
          content: t.welcomeTutor,
          timestamp: new Date(),
          subject: selectedSubject
        };
        setChatMessages([welcomeMessage]);
      } else {
        console.error('No business questions found for topic ID:', selectedTopicId);
        console.log('Data is falsy or empty:', data);
        alert(`No questions found for this topic. Please check if data exists in your business_activity_questions table for topic ID: ${selectedTopicId}`);
      }
    } else {
      console.log('Using existing logic for other subjects');
      // Use existing logic for other subjects
      setPracticeStarted(true);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setShowHint(false);
      setTimeRemaining(450);
      
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'bot',
        content: t.welcomeTutor,
        timestamp: new Date(),
        subject: selectedSubject
      };
      setChatMessages([welcomeMessage]);
    }
    console.log('=== END START PRACTICE DEBUG ===');
  };

  const generateTutorResponse = async (userMessage: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    const currentQuestionText = currentQuestionData?.question || '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hint') || lowerMessage.includes('تلميح')) {
      return true
        ? `Here's a hint for this question: "${currentQuestionText}"\n\nTry to identify the key information given and what you need to find. Break the problem into smaller steps. Would you like me to guide you through the first step?`
        : `إليك تلميح لهذا السؤال: "${currentQuestionText}"\n\nحاول تحديد المعلومات الرئيسية المعطاة وما تحتاج لإيجاده. قسم المسألة إلى خطوات أصغر. هل تريد مني أن أرشدك خلال الخطوة الأولى؟`;
    }
    
    if (lowerMessage.includes('explain') || lowerMessage.includes('شرح')) {
      return true
        ? `Let me explain the concept behind this question:\n\n"${currentQuestionText}"\n\nThis is a ${currentQuestionData?.topic || 'mathematics'} problem that tests your understanding of fundamental principles. The key is to approach it systematically. Would you like me to walk you through the solution step by step?`
        : `دعني أشرح المفهوم وراء هذا السؤال:\n\n"${currentQuestionText}"\n\nهذه مسألة ${currentQuestionData?.topic || 'رياضيات'} تختبر فهمك للمبادئ الأساسية. المفتاح هو التعامل معها بشكل منهجي. هل تريد مني أن أرشدك خلال الحل خطوة بخطوة؟`;
    }
    
    return true
      ? `I'm here to help you with this question: "${currentQuestionText}"\n\nFeel free to ask me about:\n- The concept being tested\n- How to approach the problem\n- Step-by-step guidance\n- Similar examples\n\nWhat specific aspect would you like help with?`
      : `أنا هنا لمساعدتك في هذا السؤال: "${currentQuestionText}"\n\nلا تتردد في سؤالي عن:\n- المفهوم المختبر\n- كيفية التعامل مع المسألة\n- الإرشاد خطوة بخطوة\n- أمثلة مشابهة\n\nأي جانب محدد تريد المساعدة فيه؟`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      subject: selectedSubject
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await generateTutorResponse(inputValue);
      
      setIsTyping(false);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        subject: selectedSubject
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // For Business Studies, grade the answer; for other subjects, send chat message
      if (selectedSubject === 'businessStudies' && selectedAnswer && selectedAnswer.trim().length >= 10) {
        console.log('🔘 Enter key pressed - grading answer');
        gradeAnswer(selectedAnswer);
      } else if (selectedSubject !== 'businessStudies') {
        handleSendMessage();
      }
    }
  };

  if (!practiceStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        {/* Redesigned Header */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Left: Back Button */}
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentPage('dashboard')}
                  className="hover:bg-gray-100 rounded-xl px-4 py-2.5 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="font-medium">{t.backToDashboard}</span>
                </Button>
        </div>

              {/* Center: Title */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t.practiceMode}
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
                      <Briefcase className={`h-5 w-5 ${
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
                    <Target className="h-5 w-5 text-blue-600" />
                    Select Your Topic
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {loadingTopics ? (
                    <div className="flex items-center justify-center py-20 text-gray-500">
                      <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-3"></div>
                      <span className="text-lg">Loading topics...</span>
                  </div>
                  ) : topics.length > 0 ? (
                    <div className="space-y-2 bg-white">
                  {topics.map((topic, index) => (
                        <button
                          key={topic.topic_id}
                          onClick={() => {
                            setSelectedTopic(topic.title);
                            setSelectedTopicId(topic.topic_id || null);
                          }}
                          className={`group w-full p-4 rounded-xl border-2 transition-all duration-200 text-left bg-white ${
                            selectedTopic === topic.title
                              ? 'border-blue-500 shadow-sm'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedTopic === topic.title
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'
                      }`}>
                              <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-semibold ${
                        selectedTopic === topic.title
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
                      {selectedTopic === topic.title && (
                              <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                        </div>
                        </button>
                      ))}
                </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Target className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-center">No topics available for this subject</p>
                </div>
              )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Start Practice Button */}
          {selectedTopic && (
            <div className="mt-6 flex justify-center">
                <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl"
                onClick={() => {
                  if (selectedTopicId) {
                    fetchBusinessQuestions(selectedTopicId);
                    setPracticeStarted(true);
                  }
                }}
                disabled={loadingQuestions}
              >
                <Zap className="h-6 w-6 mr-3" />
                  {t.startPractice}
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
            {/* Left: Back Button */}
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
              </div>
            
            {/* Center: Main Title */}
            <div className="flex-1 flex justify-center items-center">
              <h1 className="text-lg font-medium text-center">{t.practiceMode}</h1>
            </div>
            
            {/* Right: Topic Selection Dropdown */}
            <div className="flex items-center space-x-4">
              {loadingTopics ? (
                <div className="w-[200px] h-8 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              ) : topics.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 hidden md:block">Topic:</span>
                  <Select 
                    value={topics.find(t => t.title.toLowerCase().replace(/\s+/g, '_') === selectedTopic)?.topic_id.toString() || ''} 
                    onValueChange={(topicId) => {
                      const topic = topics.find(t => t.topic_id.toString() === topicId);
                      if (topic) {
                        setSelectedTopic(topic.title);
                        setSelectedTopicId(topic.topic_id || null);
                        if (topic.topic_id) {
                          fetchBusinessQuestions(topic.topic_id.toString());
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px] h-9 bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md transition-all">
                      <Target className="h-3.5 w-3.5 mr-2 text-blue-600" />
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto bg-white border-2 border-blue-200 shadow-lg rounded-lg z-50">
                      {topics.map((topic, index) => (
                        <SelectItem 
                          key={topic.topic_id} 
                          value={topic.topic_id.toString()}
                          className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors"
                        >
                          <span className="text-xs font-semibold text-blue-600 mr-2">{index + 1}.</span>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
              </div>
            </div>
          </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Action Buttons Row */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-3">
              {currentQuestionData?.hint && (
                <Button 
                  variant="outline"
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-700 hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-300 transition-all duration-300 shadow-sm"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showHint ? t.hideHint : t.showHint}
                </Button>
              )}
              
              {/* Answering Guidelines Button */}
              <Button 
                variant="outline"
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 shadow-sm"
              >
                <HelpCircle className="h-4 w-4" />
                {showGuidelines ? 'Hide Guidelines' : 'Answering Guidelines'}
              </Button>
              </div>

            {/* Center: Progress Info */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-1">Progress</div>
              <div className="text-xs text-gray-500">{currentQuestion + 1} of {questions.length}</div>
            </div>
            
            {/* Right: Navigation Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={currentQuestion === questions.length - 1}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.skip}
              </Button>
              </div>
              </div>

          {/* Hint Popup */}
          {showHint && currentQuestionData?.hint && (
            <div className="absolute top-full left-0 mt-2 z-50 w-96 max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl border border-yellow-200/50 p-6 animate-in slide-in-from-top-2 duration-300">
                {/* Popup Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800 text-lg">Hint</h4>
            </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(false)}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
          </div>
                
                {/* Hint Content */}
                <div className="mb-4">
                  <p className="text-yellow-700 leading-relaxed">{currentQuestionData.hint}</p>
        </div>
                
                {/* Popup Footer */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(false)}
                    className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-700 hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-300 transition-all duration-300"
                  >
                    Got it!
                  </Button>
      </div>
              </div>
            </div>
          )}

          {/* Answering Guidelines Popup */}
          {showGuidelines && (
            <div className="absolute top-full left-0 mt-2 z-50 w-96 max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl border border-blue-200/50 p-6 animate-in slide-in-from-top-2 duration-300">
                {/* Popup Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800 text-lg">Answering Guidelines</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGuidelines(false)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Guidelines Content */}
                <div className="mb-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-blue-700 text-sm">Write a comprehensive answer that addresses all parts of the question</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-blue-700 text-sm">Use relevant business terminology and concepts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-blue-700 text-sm">Provide examples where appropriate</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-blue-700 text-sm">Structure your answer with clear paragraphs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-blue-700 text-sm">Ensure your answer is at least 10 words long</span>
                  </div>
                </div>
                
                {/* Popup Footer */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGuidelines(false)}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300"
                  >
                    Got it!
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Questions Panel */}
          <div>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg px-1 py-0.5">
                      {currentQuestion + 1}
                    </div>
                    <span className="text-xl font-semibold">{t.question} {currentQuestion + 1}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
                      {currentQuestionData?.difficulty || 'medium'}
                        </Badge>
                    {selectedSubject === 'businessStudies' && currentQuestionData?.marks && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
                        {currentQuestionData.marks} marks
                        </Badge>
                    )}
                    {selectedSubject === 'businessStudies' && currentQuestionData?.skill && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
                        {currentQuestionData.skill}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                {/* Context (for Business Studies) */}
                {selectedSubject === 'businessStudies' && currentQuestionData?.context && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="font-semibold text-blue-800 text-lg">Context</h4>
                    </div>
                    <p className="text-blue-700 leading-relaxed">{currentQuestionData.context}</p>
                  </div>
                )}

                {/* Question */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-2xl border border-gray-200/50 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                      Q
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
                    {currentQuestionData?.question}
                  </h3>
                  </div>
                        </div>

                {/* Multiple Choice Options (only for non-business subjects) */}
                {selectedSubject !== 'businessStudies' && currentQuestionData?.options && currentQuestionData.options.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Select your answer:</h4>
                    {currentQuestionData.options.map((option: any) => (
                      <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="answer"
                          value={option.id}
                          checked={selectedAnswer === option.id}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                        />
                        <span className="text-gray-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}



                {/* Note: Debug info and grading results are now displayed in the "Answer Here" panel */}


                {/* Answer Explanation */}
                {showAnswer && currentQuestionData?.explanation && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800 text-lg">{t.explanation}</h4>
                    </div>
                    <p className="text-green-700 leading-relaxed">{currentQuestionData.explanation}</p>
                  </div>
                )}

                {/* Note: Grading results are now displayed in the "Answer Here" panel */}
              </CardContent>
            </Card>
                    </div>

          {/* Answer Here Panel */}
          <div>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-orange-50/30 to-red-50/30">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold">Answer Here</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full flex flex-col space-y-6 p-6">
                
                {/* Answer Input Section */}
                {selectedSubject === 'businessStudies' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 p-4 rounded-2xl border border-orange-200/50 shadow-sm">
                      <textarea
                        value={selectedAnswer || ''}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="w-full h-32 p-4 border-0 bg-transparent focus:ring-0 focus:outline-none resize-none text-gray-700 leading-relaxed"
                      />
                    </div>
                    
                    {/* Character Count */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Minimum 10 words required</span>
                      <span>{selectedAnswer?.split(' ').filter(word => word.length > 0).length || 0} words</span>
                    </div>
                    
                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedAnswer || selectedAnswer.trim().length < 10 || isGrading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isGrading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Grading Answer...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                    
                    {/* Complete Session Button */}
                    <Button
                      onClick={() => setShowSessionReport(true)}
                      disabled={!gradingResult}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Complete Session & View Report
                    </Button>
                  </div>
                )}

                {/* AI Grading Results */}
                {showAnswer && selectedSubject === 'businessStudies' && gradingResult && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800 text-lg">AI Grading Results</h4>
                    </div>
                    
                    {/* Score and Grade */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/50 p-4 rounded-xl text-center shadow-sm">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {gradingResult.overall_score}/50
                        </div>
                        <div className="text-sm text-blue-500 font-medium">Score</div>
                      </div>
                      <div className="bg-white/50 p-4 rounded-xl text-center shadow-sm">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {gradingResult.percentage}%
                        </div>
                        <div className="text-sm text-blue-500 font-medium">Percentage</div>
                      </div>
                    </div>
                    
                    <div className="text-center mb-6">
                      <Badge className={`text-xl px-6 py-3 rounded-xl font-bold shadow-lg ${
                        gradingResult.grade === 'A' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' :
                        gradingResult.grade === 'B' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200' :
                        gradingResult.grade === 'C' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200' :
                        gradingResult.grade === 'D' ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200' :
                        'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200'
                      }`}>
                        Grade: {gradingResult.grade}
                      </Badge>
                    </div>

                    {/* Strengths */}
                    {gradingResult.strengths && gradingResult.strengths.length > 0 && (
                      <div className="mb-6 bg-green-50/50 p-4 rounded-xl border border-green-200/50">
                        <h5 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Strengths
                        </h5>
                        <ul className="space-y-2">
                          {gradingResult.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-green-600 leading-relaxed">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Areas for Improvement */}
                    {gradingResult.areas_for_improvement && gradingResult.areas_for_improvement.length > 0 && (
                      <div className="mb-6 bg-orange-50/50 p-4 rounded-xl border border-orange-200/50">
                        <h5 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                          <XCircle className="h-5 w-5" />
                          Areas for Improvement
                        </h5>
                        <ul className="space-y-2">
                          {gradingResult.areas_for_improvement.map((area: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-orange-600 leading-relaxed">{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Specific Feedback */}
                    {gradingResult.specific_feedback && (
                      <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-200/50">
                        <h5 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Specific Feedback
                        </h5>
                        <p className="text-sm text-blue-600 leading-relaxed">{gradingResult.specific_feedback}</p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {gradingResult.suggestions && gradingResult.suggestions.length > 0 && (
                      <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200/50">
                        <h5 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Suggestions for Improvement
                        </h5>
                        <ul className="space-y-2">
                          {gradingResult.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-purple-600 leading-relaxed">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Model Answer Display */}
                {showAnswer && selectedSubject === 'businessStudies' && currentQuestionData?.modelAnswer && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold text-green-800 text-lg">Model Answer</h4>
                    </div>
                    <p className="text-green-700 leading-relaxed">{currentQuestionData.modelAnswer}</p>
                  </div>
                )}


              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Session Report Modal */}
      {showSessionReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Practice Session Report</h2>
                <Button
                  onClick={() => setShowSessionReport(false)}
                  variant="outline"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              {/* Session Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Topic</h3>
                  <p className="text-blue-600">{selectedTopic}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Questions Attempted</h3>
                  <p className="text-green-600">{sessionQuestionsSummary.length} of {questions.length}</p>
                  <p className="text-xs text-green-500 mt-1">
                    {questions.length > 0 ? Math.round((sessionQuestionsSummary.length / questions.length) * 100) : 0}% completed
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">Session Duration</h3>
                  <p className="text-purple-600">{Math.ceil((450 - timeRemaining) / 60)} minutes</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">Average Score</h3>
                  <p className="text-orange-600">
                    {sessionQuestionsSummary.length > 0 
                      ? Math.round(sessionQuestionsSummary
                          .filter(q => q.gradingResult)
                          .reduce((sum, q) => sum + (q.gradingResult?.percentage || 0), 0) / 
                        sessionQuestionsSummary.filter(q => q.gradingResult).length)
                      : 0}%
                  </p>
                </div>
              </div>
              
              {/* Overall Performance Summary */}
              {sessionQuestionsSummary.length > 0 && (
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-200 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {sessionQuestionsSummary
                          .filter(q => q.gradingResult)
                          .reduce((sum, q) => sum + (q.gradingResult?.overall_score || 0), 0)}/{sessionQuestionsSummary.filter(q => q.gradingResult).length * 50}
                      </div>
                      <div className="text-sm text-blue-500">Total Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {sessionQuestionsSummary.length > 0 
                          ? Math.round(sessionQuestionsSummary
                              .filter(q => q.gradingResult)
                              .reduce((sum, q) => sum + (q.gradingResult?.percentage || 0), 0) / 
                            sessionQuestionsSummary.filter(q => q.gradingResult).length)
                          : 0}%
                      </div>
                      <div className="text-sm text-green-500">Average Percentage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {sessionQuestionsSummary.filter(q => q.gradingResult).length > 0 
                          ? sessionQuestionsSummary
                              .filter(q => q.gradingResult)
                              .reduce((sum, q) => {
                                const gradeValue = q.gradingResult?.grade === 'A' ? 5 : 
                                                 q.gradingResult?.grade === 'B' ? 4 : 
                                                 q.gradingResult?.grade === 'C' ? 3 : 
                                                 q.gradingResult?.grade === 'D' ? 2 : 1;
                                return sum + gradeValue;
                              }, 0) / sessionQuestionsSummary.filter(q => q.gradingResult).length
                          : 0}
                      </div>
                      <div className="text-sm text-purple-500">Average Grade</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {sessionQuestionsSummary.length}
                      </div>
                      <div className="text-sm text-orange-500">Questions Attempted</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Questions Summary */}
              {sessionQuestionsSummary.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Questions Summary</h3>
                  <div className="space-y-4">
                    {sessionQuestionsSummary
                      .sort((a, b) => a.questionNumber - b.questionNumber)
                      .map((question, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                Question {question.questionNumber}
                              </h4>
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <Badge className="bg-purple-100 text-purple-800">
                                {question.marks} marks
                              </Badge>
                              {question.gradingResult ? (
                                <Badge className={`${
                                  question.gradingResult.grade === 'A' ? 'bg-green-100 text-green-800' :
                                  question.gradingResult.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                  question.gradingResult.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                  question.gradingResult.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  Grade: {question.gradingResult.grade} ({question.gradingResult.percentage}%)
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  {question.error || 'Not Graded'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{question.questionText}</p>
                          </div>
                        </div>
                        
                        {/* Student Answer */}
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-800 mb-1">Your Answer:</h5>
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm text-gray-700">{question.studentAnswer}</p>
                          </div>
                        </div>
                        
                        {/* Grading Results */}
                        {question.gradingResult && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Strengths
                              </h5>
                              <ul className="list-disc list-inside text-sm text-green-600 space-y-1">
                                {question.gradingResult.strengths?.slice(0, 2).map((strength: string, i: number) => (
                                  <li key={i}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Areas for Improvement
                              </h5>
                              <ul className="list-disc list-inside text-sm text-orange-600 space-y-1">
                                {question.gradingResult.areas_for_improvement?.slice(0, 2).map((area: string, i: number) => (
                                  <li key={i}>{area}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowSessionReport(false)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white"
                >
                  Continue Practice
                </Button>
                <Button
                  onClick={() => {
                    setShowSessionReport(false);
                    setCurrentPage('dashboard');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}