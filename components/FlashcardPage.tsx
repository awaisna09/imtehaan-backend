import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '../App';
import { topicsService, flashcardsService } from '../utils/supabase/services';
import { enhancedAnalyticsTracker } from '../utils/supabase/enhanced-analytics-tracker';
import { learningActivityTracker } from '../utils/supabase/learning-activity-tracker';
import { comprehensiveAnalyticsService } from '../utils/supabase/comprehensive-analytics-service';
import { usePageTracking } from '../hooks/usePageTracking';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Star, 
  Filter,
  Home,
  Brain,
  CheckCircle,
  XCircle,
  Trophy,
  Flame,
  Target,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Shuffle,
  SkipForward,
  Eye,
  EyeOff,
  Volume2,
  Settings,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  explanation?: string;
  mastered?: boolean;
  lastReviewed?: Date;
  reviewCount?: number;
  // Individual options for better display
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
}

interface StudyStats {
  cardsStudied: number;
  correctAnswers: number;
  streak: number;
  timeSpent: number;
  xpEarned: number;
  level: number;
}

export function FlashcardPage() {
  const { language, setCurrentPage, user: currentUser } = useApp();
  
  // Page tracking hook
  const { trackFlashcardReview, trackEngagement, trackError } = usePageTracking({
    pageName: 'Flashcards',
    pageCategory: 'flashcards',
    metadata: { 
      subject: 'Business Studies', 
      topic: 'General',
      studyMode: 'learn'
    }
  });
  
  const [currentCard, setCurrentCard] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [studyMode, setStudyMode] = useState<'learn' | 'review' | 'test'>('learn');
  const [showHint, setShowHint] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [selectedSubject, setSelectedSubject] = useState<string>('businessStudies');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [stats, setStats] = useState<StudyStats>({
    cardsStudied: 0,
    correctAnswers: 0,
    streak: 7,
    timeSpent: 0,
    xpEarned: 0,
    level: 3
  });
  const [correctCards, setCorrectCards] = useState<number>(0);
  const [wrongCards, setWrongCards] = useState<number>(0);
  const [attemptedCards, setAttemptedCards] = useState<number>(0);
  const [cardsCompleted, setCardsCompleted] = useState<number>(0);

  // Fetch topics when component mounts
  useEffect(() => {
    fetchTopics();
  }, []);

  // Reset current card when topic changes
  useEffect(() => {
    setCurrentCard(0);
    setDifficulty(null);
    setSelectedOption(null);
    setShowHint(false);
    setCardsCompleted(0);
  }, [selectedTopic]);

  // Fetch topics from database
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

  // Fetch flashcards when topic changes
  const fetchFlashcards = async (topicId: number, topicTitle?: string) => {
    setLoadingFlashcards(true);
    try {
      const { data, error } = await flashcardsService.getFlashcardsByTopic(topicId);
      
      if (error) {
        throw error;
      }

      // Use the provided topic title or fall back to selectedTopic
      const topicName = topicTitle || selectedTopic;

      // Transform database flashcards to match our interface
      const transformedFlashcards = (data || []).map((dbCard: any, index: number) => {
        const transformed = {
          id: dbCard.card_id,
          front: dbCard.question,
          back: `Correct Answer: ${dbCard.correct_option}\n\nOptions:\nA) ${dbCard.option_a}\nB) ${dbCard.option_b}\nC) ${dbCard.option_c}\nD) ${dbCard.option_d}`,
          subject: "Business Studies",
          topic: topicName,
          difficulty: dbCard.difficulty || 'medium',
          hint: dbCard.hint || '',
          explanation: dbCard.explanation || '',
          mastered: false,
          reviewCount: 0,
          // Individual options for better display
          optionA: dbCard.option_a,
          optionB: dbCard.option_b,
          optionC: dbCard.option_c,
          optionD: dbCard.option_d,
          correctOption: dbCard.correct_option
        };
        return transformed;
      });
      
      setFlashcards(transformedFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setFlashcards([]);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // Handle topic change
  const handleTopicChange = async (topic: string) => {
    setSelectedTopic(topic);
    
    if (topic === 'all') {
      setFlashcards([]);
      setLoadingFlashcards(false);
    } else {
      // Find the topic object to get the ID
      setLoadingFlashcards(true);
      const topicObj = topics.find(t => t.title === topic);
      if (topicObj) {
        if (topicObj.topic_id) {
          await fetchFlashcards(topicObj.topic_id);
        } else if (topicObj.id) {
          // Fallback for legacy id property
          await fetchFlashcards(topicObj.id);
        } else {
          setFlashcards([]);
          setLoadingFlashcards(false);
        }
      } else {
        setFlashcards([]);
        setLoadingFlashcards(false);
      }
    }
  };

  // Check for flashcards data from localStorage (from FlashcardSelection)
  useEffect(() => {
    const storedFlashcards = localStorage.getItem('flashcardsData');
    const storedTopic = localStorage.getItem('flashcardTopic');
    const storedTopicId = localStorage.getItem('selectedTopicId');
    
    if (storedFlashcards && storedTopic && storedTopicId) {
      try {
        const parsedFlashcards = JSON.parse(storedFlashcards);
        
        // Transform database flashcards to match our interface
        const transformedFlashcards = parsedFlashcards.map((dbCard: any, index: number) => {
          const transformed = {
            id: dbCard.card_id,
            front: dbCard.question,
            back: `Correct Answer: ${dbCard.correct_option}\n\nOptions:\nA) ${dbCard.option_a}\nB) ${dbCard.option_b}\nC) ${dbCard.option_c}\nD) ${dbCard.option_d}`,
            subject: "Business Studies",
            topic: storedTopic,
            difficulty: dbCard.difficulty || 'medium',
            hint: dbCard.hint || '',
            explanation: dbCard.explanation || '',
            mastered: false,
            reviewCount: 0,
            // Individual options for better display
            optionA: dbCard.option_a,
            optionB: dbCard.option_b,
            optionC: dbCard.option_c,
            optionD: dbCard.option_d,
            correctOption: dbCard.correct_option
          };
          return transformed;
        });
        
        setFlashcards(transformedFlashcards);
        setSelectedTopic(storedTopic);
        
        // Clear localStorage after loading
        localStorage.removeItem('flashcardsData');
        localStorage.removeItem('flashcardTopic');
        localStorage.removeItem('selectedTopicId');
        
      } catch (error) {
        console.error('❌ FlashcardPage: Error parsing flashcards from localStorage:', error);
      }
    } else {
      console.log('ℹ️ FlashcardPage: No flashcards data in localStorage, will fetch from database');
    }
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        if (currentCard < flashcards.length - 1) {
          handleNext();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, currentCard, flashcards.length]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Track study time in analytics when component unmounts or user changes
  useEffect(() => {
    return () => {
      // Save accumulated time when component unmounts
      if (currentUser?.id && stats.timeSpent > 0) {
        console.log(`🕒 FlashcardPage: Saving ${stats.timeSpent} seconds of study time`);
        comprehensiveAnalyticsService.addStudyTime(currentUser.id, stats.timeSpent);
      }
    };
  }, [currentUser?.id, stats.timeSpent]);

  // Track study time periodically (every 30 seconds) to ensure data is saved
  useEffect(() => {
    if (!currentUser?.id || stats.timeSpent === 0) return;

    const saveInterval = setInterval(() => {
      if (stats.timeSpent > 0 && stats.timeSpent % 30 === 0) { // Every 30 seconds
        console.log(`🕒 FlashcardPage: Periodic save - ${stats.timeSpent} seconds`);
        comprehensiveAnalyticsService.addStudyTime(currentUser.id, 30); // Add 30 seconds
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [currentUser?.id, stats.timeSpent]);

  const accuracy = stats.cardsStudied > 0 ? Math.round((stats.correctAnswers / stats.cardsStudied) * 100) : 0;

  // Filter flashcards based on selected topic (now using database flashcards)
  const filteredFlashcards = selectedTopic === 'all' 
    ? flashcards 
    : flashcards.filter(card => card.topic === selectedTopic);

  const currentFlashcard = filteredFlashcards[currentCard];

  const handleNext = () => {
    if (currentCard < filteredFlashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setDifficulty(null);
      setSelectedOption(null);
      setShowFeedback(false);
      setShowHint(false);
    }
  };

  const handleNextTopic = async () => {
    // Find the current topic index
    const currentTopicIndex = topics.findIndex(t => t.title === selectedTopic);
    
    // If there's a next topic, switch to it
    if (currentTopicIndex >= 0 && currentTopicIndex < topics.length - 1) {
      const nextTopic = topics[currentTopicIndex + 1];
      
      // Set loading state for smooth transition
      setLoadingFlashcards(true);
      
      // Change topic first (this will trigger the useEffect to reset card state)
      setSelectedTopic(nextTopic.title);
      
      // Fetch flashcards for the next topic with the new topic title
      if (nextTopic.topic_id) {
        await fetchFlashcards(nextTopic.topic_id, nextTopic.title);
      } else if (nextTopic.id) {
        // Fallback for legacy id property
        await fetchFlashcards(nextTopic.id, nextTopic.title);
      }
      
      // The useEffect hook will handle resetting card state when selectedTopic changes
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setDifficulty(null);
      setSelectedOption(null);
      setShowFeedback(false);
      setShowHint(false);
    }
  };

  const handleDifficulty = async (level: 'easy' | 'hard') => {
    setDifficulty(level);
    setAttemptedCards(prev => prev + 1);
    setCardsCompleted(prev => prev + 1);
    if (level === 'easy') {
      setCorrectCards(prev => prev + 1);
    } else {
      setWrongCards(prev => prev + 1);
    }
    setStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: level === 'easy' ? prev.correctAnswers + 1 : prev.correctAnswers,
      xpEarned: prev.xpEarned + (level === 'easy' ? 10 : 5)
    }));
    
    // Track flashcard review for analytics
    if (currentUser?.id && currentFlashcard) {
      try {
        await trackFlashcardReview({
          subject: currentFlashcard.subject || 'Business Studies',
          topic: currentFlashcard.topic || 'General',
          difficulty: currentFlashcard.difficulty || 'medium',
          correct: level === 'easy',
          timeSpent: 0.5, // 30 seconds per flashcard
          cardId: currentFlashcard.id?.toString()
        });
      } catch (error) {
        console.error('Error tracking flashcard review:', error);
      }
    }
    
    // Track analytics for flashcard review
    try {
      if (currentUser?.id && currentFlashcard) {
        const isCorrect = level === 'easy';
        await enhancedAnalyticsTracker.trackActivity({
          userId: currentUser.id,
          activityType: 'flashcard',
          topicId: getTopicId(currentFlashcard.topic),
          subjectId: getSubjectId(currentFlashcard.subject),
          topicName: currentFlashcard.topic,
          subjectName: currentFlashcard.subject === 'businessStudies' ? 'Business Studies' : currentFlashcard.subject,
          duration: 0.5, // 30 seconds per flashcard
          timestamp: new Date().toISOString(),
          metadata: {
            flashcardId: String(currentFlashcard.id),
            isCorrect: isCorrect,
            difficulty: level === 'easy' ? 'easy' : 'hard',
            score: isCorrect ? 100 : 0
          }
        });
      }
    } catch (error) {
      // Silently handle analytics errors
    }
    
    // Auto advance after rating
    setTimeout(() => {
      if (currentCard < filteredFlashcards.length - 1) {
        handleNext();
      }
    }, 5000);
  };

  const handleOptionSelect = async (option: string) => {
    const isCorrect = option === currentFlashcard?.correctOption;
    
    // Set the selected option
    setSelectedOption(option);
    
    // Set difficulty based on correctness (for stats)
    setDifficulty(isCorrect ? 'easy' : 'hard');
    
    // Show feedback for wrong answers
    if (!isCorrect) {
      setShowFeedback(true);
    }
    
    // Update tracking stats
    setAttemptedCards(prev => prev + 1);
    setCardsCompleted(prev => prev + 1);
    if (isCorrect) {
      setCorrectCards(prev => prev + 1);
    } else {
      setWrongCards(prev => prev + 1);
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      xpEarned: prev.xpEarned + (isCorrect ? 10 : 5)
    }));

    // Track flashcard activity
    try {
      if (currentUser?.id && currentFlashcard) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000); // Time spent on this card
        
        // Track with page tracking hook
        await trackFlashcardReview({
          subject: currentFlashcard.subject || 'Business Studies',
          topic: currentFlashcard.topic || 'General',
          difficulty: currentFlashcard.difficulty || 'medium',
          correct: isCorrect,
          timeSpent: duration,
          cardId: currentFlashcard.id?.toString()
        });
        
        // Find topic ID from selected topic
        const topicData = topics.find(t => t.title === selectedTopic);
        const topicId = Number(topicData?.topic_id) || 1;
        
        await learningActivityTracker.trackFlashcard(
          topicId,
          currentFlashcard.topic || 'General',
          currentFlashcard.subject || 'Business Studies',
          isCorrect,
          duration,
          currentFlashcard.difficulty || 'medium'
        );
      }
    } catch (error) {
      // Silently handle analytics errors
    }

    // Show immediate feedback
    if (isCorrect) {
      // Correct answer feedback
    } else {
      // Wrong answer feedback
    }

    // Auto advance after selecting (longer delay for wrong answers to read feedback)
    const delay = isCorrect ? 2000 : 4000; // 4 seconds for wrong answers to read feedback
    setTimeout(() => {
      if (currentCard < filteredFlashcards.length - 1) {
        handleNext();
      }
    }, delay);
  };

  const getMotivationalMessage = () => {
    const progress = (currentCard + 1) / filteredFlashcards.length;
    if (progress >= 0.8) return "Almost there! Just a few more! 💪";
    if (progress >= 0.6) return "Well done! You're on fire! 🔥";
    return "Excellent work! You're improving! ⭐";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const translations = {
    en: {
      title: "Flashcards",
      subtitle: "Master Business Studies concepts",
      backToDashboard: "Back to Dashboard",
      learn: "Learn",
      review: "Review", 
      test: "Test",
      previous: "Previous",
      next: "Next",
      cardOf: "Card {current} of {total}",
      hint: "Hint",
      mastered: "Mastered!",
      reviewLater: "Review Later",
      easy: "Easy",
      hard: "Hard",
      cardsToday: "Cards Today",
      accuracy: "Accuracy",
      streak: "Streak",
      timeSpent: "Time Spent",
      achievements: "Achievements",
      fireStreak: "Fire Streak",
      perfectScore: "Perfect Score",
      speedLearner: "Speed Learner"
    }
  };

  const t = translations.en;

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

  const resetSession = () => {
    setCurrentCard(0);
    setDifficulty(null);
    setSelectedOption(null);
    setShowFeedback(false);
    setShowHint(false);
    setCorrectCards(0);
    setWrongCards(0);
    setAttemptedCards(0);
    setCardsCompleted(0);
    setStats({
      cardsStudied: 0,
      correctAnswers: 0,
      streak: 7,
      timeSpent: 0,
      xpEarned: 0,
      level: 3
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header with Stats */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button */}
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
            </div>
            
            {/* Center: Title and Topic */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
              {selectedTopic && selectedTopic !== 'all' && (
                <p className="text-sm text-gray-600 mt-1">{selectedTopic}</p>
              )}
            </div>
            
            {/* Right: Time and Accuracy Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700">{formatTime(stats.timeSpent)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1.5 rounded-full">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">{accuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t.cardOf.replace('{current}', (currentCard + 1).toString()).replace('{total}', filteredFlashcards.length.toString())}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(((currentCard + 1) / filteredFlashcards.length) * 100)}%
            </span>
          </div>
          <Progress 
            value={((currentCard + 1) / filteredFlashcards.length) * 100} 
            className="h-3 bg-white/60"
          />
          <p className="text-xs text-gray-600 mt-2 text-center">{getMotivationalMessage()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Flashcard Area */}
          <div className="lg:col-span-3">
            {loadingFlashcards ? (
              <div className="text-center py-20">
                <RefreshCw className="h-16 w-16 mx-auto mb-4 text-blue-500 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Flashcards...</h3>
                <p className="text-gray-500">Fetching questions from the database</p>
              </div>
            ) : filteredFlashcards.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Flashcards Available</h3>
                <p className="text-gray-500">
                  {selectedTopic === 'all' 
                    ? 'Please select a specific topic to view flashcards' 
                    : 'No flashcards found for this topic. Please try another topic or check the database.'
                  }
                </p>
              </div>
            ) : (
            <div className="relative mb-8 -mt-4">
              {/* Simple Flashcard Design */}
              <Card 
                className="relative w-full min-h-[400px] transition-all duration-300 transform-gpu shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-0 backdrop-blur-sm"
              >
                  {/* Hint Button - Right Side */}
                  {currentFlashcard?.hint && (
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 bg-white/90 backdrop-blur-sm"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {showHint ? 'Hide' : 'Hint'}
                      </Button>
                      
                      {/* Hint Popup */}
                      {showHint && (
                        <div className="absolute top-full right-0 mt-2 z-50 w-80 max-w-md">
                          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200/50 p-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">Hint</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {currentFlashcard.hint}
                                </p>
                              </div>
                              <button
                                onClick={() => setShowHint(false)}
                                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0"
                              >
                                <span className="text-gray-500 text-sm">×</span>
                              </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <button
                                onClick={() => setShowHint(false)}
                                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                              >
                                Got it!
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content */}
                  <CardContent 
                    className="p-10 flex flex-col justify-center items-center text-center min-h-[400px]"
                  >
                    <div className="space-y-7 w-full max-w-xl">
                      {/* Icon with animated glow */}
                      <div className="relative flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <Brain className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-ping"></div>
                      </div>
                      
                      {/* Question */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 text-sm">{currentFlashcard?.front}</h3>
                      </div>
                      
                      {/* Options Display - Simple and Clean */}
                      <div className="flex flex-col items-center justify-center space-y-5 w-full">
                        <h3 className="text-base font-semibold text-gray-800 text-center">Choose your answer</h3>
                        <div className="grid grid-cols-2 gap-5 w-full max-w-lg">
                          {['A', 'B', 'C', 'D'].map((option, index) => {
                            const optionText = currentFlashcard?.[`option${option}` as keyof typeof currentFlashcard] as string;
                            const isSelected = selectedOption === option;
                            const isCorrect = currentFlashcard?.correctOption === option;
                            const isWrong = isSelected && !isCorrect;
                            
                            return (
                              <button
                                key={option}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOptionSelect(option);
                                }}
                                className={`
                                  relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left
                                  hover:scale-105 hover:shadow-lg transform
                                  ${isSelected
                                    ? isCorrect
                                      ? 'bg-green-50 border-green-400 shadow-green-200 shadow-lg'
                                      : 'bg-red-50 border-red-400 shadow-red-200 shadow-lg'
                                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                                  }
                                  ${selectedOption !== null ? 'cursor-not-allowed' : 'cursor-pointer'}
                                `}
                                disabled={selectedOption !== null}
                              >
                                {/* Option Letter Badge */}
                                <div className={`
                                  absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                                  ${isSelected
                                    ? isCorrect
                                      ? 'bg-green-500 text-white'
                                      : 'bg-red-500 text-white'
                                    : 'bg-blue-500 text-white'
                                  }
                                `}>
                                  {option}
                                </div>
                                
                                {/* Option Text */}
                                <div className="mt-2">
                                  <p className="text-gray-800 font-medium text-sm leading-relaxed">
                                    {optionText || `Option ${option}`}
                                  </p>
                                </div>
                                
                                {/* Status Icon */}
                                {isSelected && (
                                  <div className="absolute top-3 right-3">
                                    {isCorrect ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                        
                        {/* Feedback Section - Show when wrong answer is selected */}
                        {showFeedback && selectedOption && selectedOption !== currentFlashcard?.correctOption && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <h4 className="text-sm font-semibold text-red-800">Incorrect Answer</h4>
                            </div>
                            
                            {/* Correct Answer Display */}
                            <div className="mb-3">
                              <p className="text-xs text-red-700 mb-2">Correct Answer:</p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-600 text-white px-2 py-1 text-xs">
                                  {currentFlashcard?.correctOption}
                                </Badge>
                                <span className="text-sm text-gray-700">
                                  {currentFlashcard?.correctOption === 'A' && currentFlashcard?.optionA}
                                  {currentFlashcard?.correctOption === 'B' && currentFlashcard?.optionB}
                                  {currentFlashcard?.correctOption === 'C' && currentFlashcard?.optionC}
                                  {currentFlashcard?.correctOption === 'D' && currentFlashcard?.optionD}
                                </span>
                              </div>
                            </div>
                            
                            {/* Explanation */}
                            {currentFlashcard?.explanation && (
                              <div>
                                <p className="text-xs text-red-700 mb-2">Explanation:</p>
                                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                                  {currentFlashcard.explanation}
                                </p>
                              </div>
                            )}
                            
                            {/* Countdown to next card */}
                            <div className="mt-3 pt-3 border-t border-red-200">
                              <div className="flex items-center justify-center gap-2 text-xs text-red-600">
                                <Clock className="h-3 w-3" />
                                <span>Next card in 5 seconds...</span>
                              </div>
                            </div>
                        </div>
                      )}
                        
                        {/* Hint Section (if study mode allows) */}
                        {/* This section is now moved to the front of the question */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Enhanced Navigation */}
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentCard === 0}
                className="px-6 py-3 bg-white/80 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.previous}
              </Button>

              {/* Card Indicators with Progress */}
              <div className="flex space-x-2">
                {filteredFlashcards.map((card, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index === currentCard 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-lg' 
                        : index < currentCard
                        ? 'bg-green-500 shadow-md'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <Button 
                onClick={cardsCompleted >= 5 ? handleNextTopic : handleNext}
                disabled={cardsCompleted >= 5 ? false : currentCard === filteredFlashcards.length - 1}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                {cardsCompleted >= 5 ? "Next Topic" : t.next}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Sidebar - Stats Container */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-gray-200">
                <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Flashcards Attempted */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Attempted</p>
                      <p className="text-lg font-bold text-gray-900">{attemptedCards}</p>
                    </div>
                  </div>
                </div>

                {/* Correct Answers */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Correct</p>
                      <p className="text-lg font-bold text-gray-900">{correctCards}</p>
                    </div>
                  </div>
                </div>

                {/* Wrong Answers */}
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Incorrect</p>
                      <p className="text-lg font-bold text-gray-900">{wrongCards}</p>
                    </div>
                  </div>
                </div>

                {/* Accuracy */}
                {attemptedCards > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Accuracy</span>
                      <span className="text-lg font-bold text-purple-600">
                        {Math.round((correctCards / attemptedCards) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(correctCards / attemptedCards) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Motivational Badge */}
                {attemptedCards > 0 && correctCards === attemptedCards && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl border border-yellow-300">
                    <Flame className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-700">Perfect Score! 🔥</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}