
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Logo } from './Logo';
import { useApp } from '../App';
import { lessonsService, topicsService } from '../utils/supabase/services';
import { enhancedAnalyticsTracker } from '../utils/supabase/enhanced-analytics-tracker';
import { comprehensiveAnalyticsService } from '../utils/supabase/comprehensive-analytics-service';
import aiTutorService from '../utils/ai-tutor-service';
import { usePageTracking } from '../hooks/usePageTracking';
import { useAutoTracking } from '../hooks/useAutoTracking';
import { 
  Send, 
  Bot,
  User,
  BookOpen,
  Brain,
  Zap,
  RefreshCw,
  Home,
  Globe,
  Target,
  Clock,
  FileText,
  Play,
  Image,
  Video,
  Lightbulb,
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  Pause,
  History,
  Plus,
  MessageSquare,
  Trash2
} from 'lucide-react';

interface Lesson {
  lessons_id: number;
  title: string;
  content: string;
  media_type: string | null;
  reading_time_minutes: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Array<{role: 'user' | 'assistant', content: string, timestamp: string}>;
  createdAt: string;
  lastUpdated: string;
}

export function AITutorPage() {
  const { setCurrentPage, user, setLanguage, language } = useApp();
  
  // Page tracking hook
  const { trackLessonProgress, trackVideoProgress, trackAITutorInteraction, trackEngagement } = usePageTracking({
    pageName: 'AI Tutor & Lessons',
    pageCategory: 'lessons',
    metadata: { 
      topic: 'Unknown',
      lessonCount: 0
    }
  });

  // Auto-tracking hook
  const { trackAIInteraction, trackLessonStart, trackLessonComplete } = useAutoTracking({
    pageTitle: 'AI Tutor & Lessons',
    pageUrl: '/ai-tutor',
    trackClicks: true,
    trackTime: true,
    trackScroll: true
  });
  
  const [storedTopicData, setStoredTopicData] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [timeSpent, setTimeSpent] = useState(0); // Track time in seconds
  const [isPlaying, setIsPlaying] = useState(false); // Track speech state
  const [isPaused, setIsPaused] = useState(false); // Track if paused
  const [speechRate, setSpeechRate] = useState(1); // Fixed speech speed
  const [highlightedText, setHighlightedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lessonContentRef = useRef<HTMLDivElement>(null);
  
  // AI Tutor chat state
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [relatedConcepts, setRelatedConcepts] = useState<string[]>([]);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  
  // Load chat history from localStorage on mount
  useEffect(() => {
    loadChatHistory();
  }, [storedTopicData]);
  
  // Save chat to history when messages change
  useEffect(() => {
    if (chatMessages.length > 1 && currentChatId) { // More than just the welcome message
      saveChatToHistory();
    }
  }, [chatMessages]);
  
  const getStorageKey = () => {
    if (!storedTopicData) return 'ai_tutor_chat_history';
    return `ai_tutor_chat_history_${storedTopicData.topic_id}`;
  };
  
  const loadChatHistory = () => {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setChatHistory(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  };
  
  const saveChatHistory = (history: ChatHistory[]) => {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(history));
    setChatHistory(history);
  };
  
  const saveChatToHistory = () => {
    if (!currentChatId || chatMessages.length <= 1) return;
    
    // Get the first user message as the title
    const firstUserMessage = chatMessages.find(msg => msg.role === 'user');
    const title = firstUserMessage?.content.slice(0, 50) || 'New Chat';
    
    const historyItem: ChatHistory = {
      id: currentChatId,
      title: title,
      messages: chatMessages,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    const updatedHistory = [...chatHistory];
    const existingIndex = updatedHistory.findIndex(h => h.id === currentChatId);
    
    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = historyItem;
    } else {
      updatedHistory.unshift(historyItem);
    }
    
    // Keep only last 20 chats
    const trimmedHistory = updatedHistory.slice(0, 20);
    saveChatHistory(trimmedHistory);
  };
  
  const startNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);
    setChatMessages([]);
    setSuggestions([]);
    setRelatedConcepts([]);
    aiTutorService.clearHistory();
    initializeAITutor(storedTopicData?.title || 'Business Studies');
  };
  
  const loadChatFromHistory = (chatId: string) => {
    const chat = chatHistory.find(h => h.id === chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setChatMessages(chat.messages);
      // Restore AI service history
      aiTutorService.clearHistory();
      chat.messages.forEach(msg => {
        aiTutorService.addToHistory(msg.role, msg.content);
      });
      setShowHistorySidebar(false);
    }
  };
  
  const deleteChatFromHistory = (chatId: string) => {
    const updatedHistory = chatHistory.filter(h => h.id !== chatId);
    saveChatHistory(updatedHistory);
    
    // If deleting current chat, start a new one
    if (currentChatId === chatId) {
      startNewChat();
    }
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
      if (user?.id && timeSpent > 0) {
        console.log(`🕒 AI Tutor: Saving ${timeSpent} seconds of study time`);
        comprehensiveAnalyticsService.addStudyTime(user.id, timeSpent);
      }
    };
  }, [user?.id, timeSpent]);

  // Track study time periodically (every 30 seconds) to ensure data is saved
  useEffect(() => {
    if (!user?.id || timeSpent === 0) return;

    const saveInterval = setInterval(() => {
      if (timeSpent > 0 && timeSpent % 30 === 0) { // Every 30 seconds
        console.log(`🕒 AI Tutor: Periodic save - ${timeSpent} seconds`);
        comprehensiveAnalyticsService.addStudyTime(user.id, 30); // Add 30 seconds
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [user?.id, timeSpent]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      console.error('Error fetching topics:', error);
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Get selected topic from localStorage and fetch lessons
  
  useEffect(() => {
    // Fetch topics first
    fetchTopics();
    
    // Load selected topic from localStorage
    const storedTopic = localStorage.getItem('selectedTopic');
    const storedTopicId = localStorage.getItem('selectedTopicId');
    
    if (storedTopic && storedTopicId) {
      try {
        const topicData = JSON.parse(storedTopic);
        setStoredTopicData(topicData);
        
        // Initialize AI Tutor service
        aiTutorService.setUserId(user?.id || 'anonymous');
        aiTutorService.setCurrentTopic(topicData.title);
        
        // Fetch lessons for this topic
        fetchLessons(topicData.topic_id);
        
        // Initialize AI Tutor with welcome message and generate new chat ID
        initializeAITutor(topicData.title, true);
      } catch (error) {
        // Silently handle parsing errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const fetchLessons = async (topicId: number) => {
    try {
      setLoadingLessons(true);
      
      const { data, error } = await lessonsService.getLessonsByTopic(topicId);
      
      if (error) {
        throw error;
      }
      
      setLessons(data || []);
      
      // Set first lesson as selected by default
      if (data && data.length > 0) {
        setSelectedLesson(data[0]);
      }
    } catch (error) {
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Handle topic change
  const handleTopicChange = async (topicId: string) => {
    const selectedTopic = topics.find(t => t.topic_id.toString() === topicId);
    if (selectedTopic) {
      setStoredTopicData(selectedTopic);
      
      // Update AI Tutor service
      aiTutorService.setCurrentTopic(selectedTopic.title);
      
      // Fetch lessons for the new topic
      await fetchLessons(selectedTopic.topic_id);
      
      // Initialize AI Tutor with new topic
      initializeAITutor(selectedTopic.title, true);
      
      // Clear highlighting
      setHighlightedText('');
      setCurrentWordIndex(0);
    }
  };

  // Initialize AI Tutor with welcome message
  const initializeAITutor = async (topicTitle: string, generateNewChatId: boolean = false) => {
    try {
      // Generate new chat ID if requested
      if (generateNewChatId || !currentChatId) {
        const newChatId = `chat_${Date.now()}`;
        setCurrentChatId(newChatId);
      }
      
      const welcomeMessage = `Hi! I'm here to help you understand ${topicTitle}. What would you like to know about this topic?`;
      
      setChatMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }]);
      
      // Get suggested questions
      const suggestedQuestions = aiTutorService.getSuggestedQuestions(topicTitle);
      setSuggestions(suggestedQuestions);
      
    } catch (error) {
      console.error('Error initializing AI Tutor:', error);
    }
  };

  // Send message to AI Tutor
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    
    try {
      // Get lesson content for context
      const lessonContent = selectedLesson?.content || '';
      
      // Track AI tutor interaction for analytics
      if (user?.id) {
        try {
          await trackAITutorInteraction({
            subject: storedTopicData?.subject || 'General',
            topic: storedTopicData?.title || 'Unknown',
            questionType: 'general_question',
            responseTime: 0, // Will be calculated after response
            helpful: false // Will be updated based on user feedback
          });
        } catch (error) {
          console.error('Error tracking AI tutor interaction:', error);
        }
      }

      // Track AI interaction for auto-tracking
      trackAIInteraction(userMessage, 0); // Response length will be updated after response
      
      // Send message to AI Tutor
      const response = await aiTutorService.sendMessage(userMessage, lessonContent);
      
      if (response.success && response.data) {
        // Add AI response to chat
        const aiMessage = {
          role: 'assistant' as const,
          content: response.data.response,
          timestamp: new Date().toISOString()
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        setSuggestions(response.data.suggestions);
        setRelatedConcepts(response.data.related_concepts);
      } else {
        // Handle error
        const errorMessage = {
          role: 'assistant' as const,
          content: 'I apologize, but I\'m having trouble processing your request. Please try again.',
          timestamp: new Date().toISOString()
        };
        
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        role: 'assistant' as const,
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  // Clear chat history and start new chat
  const clearChat = () => {
    startNewChat();
  };

  // Helper functions
  const trackLessonCompletion = async (lesson: Lesson) => {
    try {
      if (user?.id && storedTopicData) {
        await enhancedAnalyticsTracker.trackLesson(
          user.id,
          storedTopicData.topic_id,
          storedTopicData.title,
          'Business Studies',
          lesson.reading_time_minutes || 5,
          'completed'
        );
      }
    } catch (error) {
      // Silently handle errors
    }
  };

  const handleLessonSelect = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    
    // Track lesson selection for analytics
    if (user?.id) {
      try {
        await trackLessonProgress({
          subject: storedTopicData?.subject || 'General',
          topic: storedTopicData?.title || 'Unknown',
          lessonType: (lesson.media_type === 'video' ? 'video' : lesson.media_type === 'interactive' ? 'interactive' : 'text'),
          progress: 0, // Starting the lesson
          timeSpent: 0
        });
      } catch (error) {
        console.error('Error tracking lesson selection:', error);
      }
    }
    
    trackLessonCompletion(lesson);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getMediaTypeIcon = (mediaType: string | null) => {
    switch (mediaType?.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'audio':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'image':
        return <Image className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to split text into words for highlighting
  const splitTextIntoWords = (text: string) => {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 0);
  };

  // Helper function to highlight current word
  const highlightCurrentWord = (words: string[], currentIndex: number) => {
    return words.map((word, index) => {
      if (index === currentIndex) {
        return `<span class="highlighted-word" style="background-color: #fef08a; padding: 2px 4px; border-radius: 4px; transition: all 0.2s;">${word}</span>`;
      }
      return word;
    }).join(' ');
  };

  // Text-to-Speech functions
  const handlePlayLesson = () => {
    if (!selectedLesson) return;

    // Stop any existing speech
    window.speechSynthesis.cancel();

    // Clean the content - remove asterisks and HTML
    const cleanContent = selectedLesson.content
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/<[^>]*>/g, '');

    // Split content into words for highlighting
    const words = splitTextIntoWords(cleanContent);
    setCurrentWordIndex(0);

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(cleanContent);
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Calculate approximate time per word for highlighting (more accurate)
    const wordsPerMinute = 150; // Average reading speed
    const timePerWord = (60 / wordsPerMinute) * 1000; // Convert to milliseconds

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentWordIndex(0);
      
      // Start highlighting animation immediately
      let wordIndex = 0;
      const highlightInterval = setInterval(() => {
        if (wordIndex < words.length && window.speechSynthesis.speaking) {
          setCurrentWordIndex(wordIndex);
          const highlightedContent = highlightCurrentWord(words, wordIndex);
          setHighlightedText(highlightedContent);
          console.log(`Highlighting word ${wordIndex}: ${words[wordIndex]}`);
          console.log('Highlighted content:', highlightedContent);
          wordIndex++;
        } else {
          clearInterval(highlightInterval);
        }
      }, timePerWord);
      
      // Store interval ID for cleanup
      (utterance as any).highlightInterval = highlightInterval;
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(0);
      setHighlightedText('');
      // Clear any remaining interval
      if ((utterance as any).highlightInterval) {
        clearInterval((utterance as any).highlightInterval);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(0);
      setHighlightedText('');
      // Clear any remaining interval
      if ((utterance as any).highlightInterval) {
        clearInterval((utterance as any).highlightInterval);
      }
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseLesson = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      // Clear highlighting interval when paused
      if (speechSynthesisRef.current && (speechSynthesisRef.current as any).highlightInterval) {
        clearInterval((speechSynthesisRef.current as any).highlightInterval);
      }
    }
  };

  const handleResumeLesson = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      // Restart highlighting when resumed
      if (selectedLesson) {
        const cleanContent = selectedLesson.content
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/<[^>]*>/g, '');
        const words = splitTextIntoWords(cleanContent);
        const wordsPerMinute = 150;
        const timePerWord = (60 / wordsPerMinute) * 1000;
        
        let wordIndex = currentWordIndex;
        const highlightInterval = setInterval(() => {
          if (wordIndex < words.length && window.speechSynthesis.speaking) {
            setCurrentWordIndex(wordIndex);
            const highlightedContent = highlightCurrentWord(words, wordIndex);
            setHighlightedText(highlightedContent);
            wordIndex++;
          } else {
            clearInterval(highlightInterval);
          }
        }, timePerWord);
        
        if (speechSynthesisRef.current) {
          (speechSynthesisRef.current as any).highlightInterval = highlightInterval;
        }
      }
    }
  };

  const handleStopLesson = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(0);
    setHighlightedText('');
    // Clear any highlighting interval
    if (speechSynthesisRef.current && (speechSynthesisRef.current as any).highlightInterval) {
      clearInterval((speechSynthesisRef.current as any).highlightInterval);
    }
  };


  // Cleanup speech on component unmount or lesson change
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedLesson]);

  // Clear highlighting when lesson changes
  useEffect(() => {
    setHighlightedText('');
    setCurrentWordIndex(0);
  }, [selectedLesson]);

  // Debug: Log when highlightedText changes
  useEffect(() => {
    console.log('highlightedText changed:', highlightedText);
  }, [highlightedText]);

  if (!storedTopicData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between relative">
          {/* Left - Back Button */}
              <Button 
                variant="ghost" 
                size="sm"
              onClick={() => setCurrentPage('ai-tutor-topic-selection')}
              className="text-gray-600 hover:text-gray-900"
              >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Topics
              </Button>

          {/* Center - Topic Selection Dropdown */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            {loadingTopics ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Loading topics...</span>
              </div>
            ) : topics.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Topic:</span>
                <Select 
                  value={storedTopicData?.topic_id?.toString() || ''} 
                  onValueChange={handleTopicChange}
                >
                  <SelectTrigger className="w-[300px] h-9 bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md transition-all">
                    <Target className="h-4 w-4 mr-2 text-blue-600" />
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto bg-white border-2 border-blue-200 shadow-lg rounded-lg z-50">
                    {topics.map((topic, index) => (
                      <SelectItem 
                        key={topic.topic_id} 
                        value={topic.topic_id.toString()}
                        className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-600">{index + 1}.</span>
                          <span className="text-sm">{topic.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {storedTopicData?.title || 'AI Tutor'}
              </h1>
            )}
          </div>

          {/* Right - Time Tracking & Language */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border-blue-200">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{formatTime(timeSpent)}</span>
            </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLanguage('ar')}
              >
                <Globe className="h-4 w-4 mr-2" />
                {'العربية'}
              </Button>
            </div>
          </div>
        </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Lessons Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loadingLessons ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading lessons...</p>
              </div>
            </div>
          ) : lessons.length > 0 ? (
              <div className="space-y-4">
              {/* Selected Lesson Content */}
              {selectedLesson && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMediaTypeIcon(selectedLesson.media_type)}
                        <span className="text-sm font-medium">{selectedLesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Voice Controls */}
                        {!isPlaying ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePlayLesson}
                            className="flex items-center gap-1.5 text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Volume2 className="h-3.5 w-3.5 text-blue-600" />
                            Listen
                          </Button>
                        ) : isPaused ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleResumeLesson}
                              className="flex items-center gap-1.5 text-xs border-green-200 hover:bg-green-50 hover:border-green-300"
                            >
                              <Play className="h-3.5 w-3.5 text-green-600" />
                              Resume
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleStopLesson}
                              className="flex items-center gap-1.5 text-xs border-red-200 hover:bg-red-50 hover:border-red-300"
                            >
                              <VolumeX className="h-3.5 w-3.5 text-red-600" />
                              Stop
                            </Button>
                          </div>
                        ) : (
              <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handlePauseLesson}
                              className="flex items-center gap-1.5 text-xs border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                            >
                              <Pause className="h-3.5 w-3.5 text-orange-600" />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleStopLesson}
                              className="flex items-center gap-1.5 text-xs border-red-200 hover:bg-red-50 hover:border-red-300"
                            >
                              <VolumeX className="h-3.5 w-3.5 text-red-600" />
                              Stop
                            </Button>
              </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {selectedLesson.media_type || 'text'}
                        </Badge>
                      </div>
            </div>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <div 
                        ref={lessonContentRef}
                        className="text-gray-700 leading-relaxed text-sm"
                        dangerouslySetInnerHTML={{
                          __html: highlightedText || selectedLesson.content
                            // Remove asterisks and format headings
                            .replace(/\*\*/g, '')
                            .replace(/\*/g, '')
                            // Format headings with proper HTML
                            .split('\n')
                            .map(line => {
                              // Main headings (all caps or starts with number)
                              if (line.trim() && (line === line.toUpperCase() || /^\d+\./.test(line.trim()))) {
                                return `<h3 class="text-base font-bold text-gray-900 mt-4 mb-2">${line.trim()}</h3>`;
                              }
                              // Sub-headings (Title Case or starts with -)
                              else if (line.trim() && /^[A-Z][a-z]+/.test(line.trim()) && line.trim().length < 100 && !line.includes('.') && !line.includes(',')) {
                                return `<h4 class="text-sm font-semibold text-gray-800 mt-3 mb-1">${line.trim()}</h4>`;
                              }
                              // Regular paragraphs
                              else if (line.trim()) {
                                return `<p class="mb-2">${line.trim()}</p>`;
                              }
                              return '';
                            })
                            .join('')
                        }}
                      />
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {formatDate(selectedLesson.created_at)}</span>
                        <span>Updated: {formatDate(selectedLesson.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Available</h3>
              <p className="text-sm text-gray-600">
                No lessons found for this topic. Please check if data exists in your lessons table.
                     </p>
                        </div>
                 )}
                            </div>
                            
        {/* Right - AI Tutor Chat Panel */}
        <div className="relative w-[500px] bg-gradient-to-b from-white to-blue-50/30 border-l border-gray-200 flex flex-col shadow-xl">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white p-4 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">AI Tutor</div>
                <div className="flex items-center text-xs text-blue-100">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                  Always Available
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewChat}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="New Chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 relative"
                  title="Chat History"
                >
                  <History className="h-4 w-4" />
                  {chatHistory.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                      {chatHistory.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Chat History Sidebar */}
          {showHistorySidebar && (
            <div className="absolute inset-y-0 right-full w-[350px] bg-white border-r border-gray-200 shadow-2xl z-50 flex flex-col">
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <h3 className="font-bold text-sm">Chat History</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistorySidebar(false)}
                    className="text-white hover:bg-white/20 h-7 w-7 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={startNewChat}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
              
              {/* History List */}
              <div className="flex-1 overflow-y-auto p-2">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 mb-1">No chat history yet</p>
                    <p className="text-xs text-gray-400">Start a conversation to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          currentChatId === chat.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => loadChatFromHistory(chat.id)}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate mb-1">
                              {chat.title}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {new Date(chat.lastUpdated).toLocaleDateString()} at {new Date(chat.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {chat.messages.filter(m => m.role === 'user').length} messages
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChatFromHistory(chat.id);
                          }}
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-white/50">
            {chatMessages.length === 0 ? (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 p-3 rounded-2xl max-w-[85%] text-xs shadow-sm border border-blue-100">
                  {storedTopicData 
                    ? selectedLesson
                      ? `Hi! I'm here to help you understand "${selectedLesson.title}" from the ${storedTopicData.title} topic. Feel free to ask me any questions about this lesson!`
                      : `Hi! I'm here to help you with ${storedTopicData.title}. Please select a lesson to get started!`
                    : "Hi! I'm here to help you with your studies. Please select a topic to get started!"
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl max-w-[80%] text-xs shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                        : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 border border-blue-100'
                    }`}>
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 p-3 rounded-2xl max-w-[80%] text-xs shadow-sm border border-blue-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <Input
                placeholder={
                  selectedLesson 
                    ? `Ask me about "${selectedLesson.title}"...`
                    : "Ask me anything about this topic..."
                }
                className="flex-1 text-xs border-2 border-gray-200 focus:border-blue-500 rounded-xl py-2 px-3"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 shadow-lg hover:shadow-xl transition-all"
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Related Concepts */}
            {relatedConcepts.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  Related concepts:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {relatedConcepts.slice(0, 3).map((concept, index) => (
                    <span
                      key={index}
                      className="text-[10px] bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200 shadow-sm"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Chat Actions */}
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-[10px] flex-1 border-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all rounded-lg py-1"
              >
                <Plus className="h-3 w-3 mr-1" />
                New Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => aiTutorService.exportConversation()}
                className="text-[10px] flex-1 border-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all rounded-lg py-1"
              >
                Export Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}