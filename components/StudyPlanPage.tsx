import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Logo } from './Logo';
import { useApp, StudySession, Question } from '../App';
import { StudyPlan } from '../utils/supabase/client';
import { supabase } from '../utils/supabase/client';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Target,
  CheckCircle2,
  Plus,
  X,
  Save,
  Globe,
  Settings,
  LogOut,
  Home,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Users,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from './ui/utils';

const translations = {
  en: {
    title: "Create Study Plan",
    subtitle: "Design your personalized study schedule with AI-powered recommendations",
    backToDashboard: "Back to Dashboard",
    
    // Progress steps
    step1: "Basic Information",
    step2: "Topics Management", 
    step3: "Schedule & Timeline",
    stepOf: "Step {current} of 3",
    
    // Form sections
    basicInfo: "Plan Details",
    planName: "Study Plan Name",
    planNamePlaceholder: "Enter a descriptive name for your study plan",
    subject: "Subject",
    selectSubject: "Choose your subject",
    subjectDesc: "Select the subject for your study plan",
    
    topicsSection: "Learning Path",
    topicsToCover: "Topics to Master",
    topicsToCoverDesc: "Select topics you want to focus on during this study plan",
    topicsCompleted: "Topics Already Mastered",
    topicsCompletedDesc: "Mark topics you've already completed to personalize your learning path",
    
    scheduleSection: "Timeline & Goals",
    examDate: "Target Exam Date",
    selectDate: "Select your exam date",
    formulaNote: "Based on {topicsLeft} topics and {daysLeft} days remaining, your recommended study time is calculated automatically.",
    calculatedStudyTime: "Recommended Daily Study Time",
    hours: "hours",
    minutes: "minutes",
    
    // Stats
    totalTopics: "Total Topics",
    selectedTopics: "Selected",
    completedTopics: "Completed",
    estimatedDays: "Estimated Days",
    
    // Actions
    createPlan: "Create Study Plan",
    savePlan: "Save Plan", 
    cancel: "Cancel",
    next: "Next Step",
    previous: "Previous",
    
    // Topics by subject - will be fetched from database
    topics: {},
    
    errors: {
      nameRequired: "Study plan name is required",
      subjectRequired: "Please select a subject",
      topicsRequired: "Please select at least one topic to cover",
      examDateRequired: "Please enter a valid future exam date",
      insufficientTime: "Not enough time before exam. Please select a later date."
    },
    
    success: "Study plan created successfully! Your personalized schedule is ready.",
    tips: {
      planName: "Use descriptive names for your study plan",
      topics: "Start with a few topics for your first study plan",
      schedule: "Set realistic daily study time",
      subject: "Choose a subject you want to focus on"
    }
  },};

export function StudyPlanPage() {
  // Configurable validation constants
  const STUDY_TIME_MIN = 15; // minutes
  const STUDY_TIME_MAX = 480; // minutes (8 hours)
  const MAX_STUDY_DAYS = 30; // maximum days to generate sessions for
  
  const {language, 
    setCurrentPage, 
    user, 
    curriculum,
    studyPlans,
    setStudyPlans,
    studySessions,
    setStudySessions} = useApp();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    planName: '',
    subject: '',
    topicsToCover: [] as string[],
    topicsCompleted: [] as string[],
    examDate: ''
  });
  const [calculatedStudyTime, setCalculatedStudyTime] = useState({ hours: 0, minutes: 0, totalMinutes: 0 });
  
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [loadingTableStructure, setLoadingTableStructure] = useState(true);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const t = translations.en;
  
  // Get available subjects - will be fetched from database
  const getSubjects = () => {
    // For now, return Business Studies as the primary subject
    // TODO: Fetch subjects from database based on curriculum
    return ['businessStudies'];
  };
  
  // Get topics for selected subject - will be fetched from database
  const getTopicsForSubject = async (subject: string) => {
    if (subject === 'businessStudies') {
      try {
        // Import the topics service dynamically to avoid circular dependencies
        const { topicsService } = await import('../utils/supabase/services');
        const { data, error } = await topicsService.getTopicsBySubject('businessStudies');
        
        if (error) {
          console.error('Error fetching Business Studies topics:', error);
          return [];
        }
        
        // Transform the data to match the expected format
        return data?.map(topic => topic.title) || [];
      } catch (error) {
        console.error('Error importing topics service:', error);
        // Fallback to common Business Studies topics
        return [
          'Business Activity',
          'Marketing',
          'Finance', 
          'Human Resources',
          'Operations Management',
          'Business Strategy',
          'International Business',
          'Entrepreneurship'
        ];
      }
    }
    
    return [];
  };
  
  // Fetch topics for selected subject
  const fetchTopicsForSubject = async (subject: string) => {
    setLoadingTopics(true);
    try {
      const topics = await getTopicsForSubject(subject);
      setAvailableTopics(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setAvailableTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Check table structure on component mount
  useEffect(() => {
    console.log('Component mounted, checking table structure...');
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      checkTableStructure();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch topics when subject changes
  useEffect(() => {
    if (formData.subject) {
      fetchTopicsForSubject(formData.subject);
    }
  }, [formData.subject]);
  
  // Check if study_plans table exists and get its structure
  const checkTableStructure = async () => {
    try {
      setLoadingTableStructure(true);
      setError(''); // Clear any previous errors
      
      console.log('Starting table structure check...');
      const { studyPlansService } = await import('../utils/supabase/services');
      
      // Check if table exists
      console.log('Checking if table exists...');
      const { exists, error } = await studyPlansService.checkTableStructure();
      
      if (!exists) {
        console.error('Study plans table does not exist, attempting to create it...');
        
        // Try to create the table
        const { success, error: createError } = await studyPlansService.createTableIfNotExists();
        
        if (!success) {
          console.error('Failed to create table:', createError);
          setError('Study plans table does not exist. Please run the SQL script in Supabase SQL Editor to create it.');
          setLoadingTableStructure(false);
          return;
        }
        
        console.log('Table created successfully');
      }
      
      console.log('Study plans table is accessible');
      
      // Get actual table columns
      console.log('Getting table columns...');
      const { columns, error: columnsError } = await studyPlansService.getTableColumns();
      
      if (columnsError) {
        console.error('Error getting table columns:', columnsError);
        setError(`Error getting table columns: ${(columnsError as any)?.message || 'Unknown error'}`);
        setLoadingTableStructure(false);
        return;
      }
      
      console.log('Available columns in study_plans table:', columns);
      
      if (!columns || columns.length === 0) {
        console.error('No columns found in table');
        setError('No columns found in study_plans table. Please check your database setup.');
        setLoadingTableStructure(false);
        return;
      }
      
      // Store columns for later use
      setAvailableColumns(columns);
      console.log('Table structure check completed successfully. Columns:', columns);
      
    } catch (error) {
      console.error('Error checking table structure:', error);
      setError(`Error checking table structure: ${(error as any)?.message || 'Unknown error'}`);
    } finally {
      setLoadingTableStructure(false);
    }
  };

  // Calculate daily study time using the formula
  const calculateStudyTime = useCallback((examDate: string) => {
    if (!examDate || formData.topicsToCover.length === 0) {
      setCalculatedStudyTime({ hours: 0, minutes: 0, totalMinutes: 0 });
      return;
    }
    
    const currentDate = new Date();
    const targetDate = new Date(examDate);
    const daysLeft = Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      setCalculatedStudyTime({ hours: 0, minutes: 0, totalMinutes: 0 });
      return;
    }
    
    // Calculate topics left (topics to cover - topics completed that overlap)
    const topicsLeft = formData.topicsToCover.filter(topic => !formData.topicsCompleted.includes(topic)).length;
    
    // Formula: (topics_left * 4.5 / days_till_exam) * 1.1
    const dailyStudyHours = (topicsLeft * 4.5 / daysLeft) * 1.1;
    const totalMinutes = Math.ceil(dailyStudyHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    setCalculatedStudyTime({ hours, minutes, totalMinutes });
  }, [formData.topicsToCover, formData.topicsCompleted]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess(false);
    
    // Auto-calculate study time when exam date changes
    if (field === 'examDate' && value) {
      calculateStudyTime(value);
    }
  }, [error, success, calculateStudyTime]);
  
  // Recalculate when topics change on step 3
  useEffect(() => {
    if (currentStep === 3 && formData.examDate) {
      calculateStudyTime(formData.examDate);
    }
  }, [currentStep, formData.examDate, formData.topicsToCover, formData.topicsCompleted, calculateStudyTime]);
  
  const handleTopicToggle = useCallback((topic: string, type: 'toCover' | 'completed') => {
    const field = type === 'toCover' ? 'topicsToCover' : 'topicsCompleted';
    
    setFormData(prev => {
      const currentTopics = prev[field];
      let newTopics;
      
      if (currentTopics.includes(topic)) {
        newTopics = currentTopics.filter(t => t !== topic);
      } else {
        newTopics = [...currentTopics, topic];
      }
      
      return { ...prev, [field]: newTopics };
    });
    
    if (error) setError('');
    if (success) setSuccess(false);
  }, [error, success]);
  
  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.planName.trim()) {
          setError(t.errors.nameRequired);
          return false;
        }
        if (!formData.subject) {
          setError(t.errors.subjectRequired);
          return false;
        }
        break;
      case 2:
        if (formData.topicsToCover.length === 0) {
          setError(t.errors.topicsRequired);
          return false;
        }
        break;
      case 3:
        if (!formData.examDate) {
          setError(t.errors.examDateRequired);
          return false;
        }
        const selectedDate = new Date(formData.examDate);
        if (isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
          setError(t.errors.examDateRequired);
          return false;
        }
        
        // Check if there's enough time before exam
        const currentDate = new Date();
        const daysLeft = Math.ceil((selectedDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 1) {
          setError(t.errors.insufficientTime);
          return false;
        }
        
        // Verify that calculated study time is reasonable
        if (calculatedStudyTime.totalMinutes === 0) {
          setError('Unable to calculate study time. Please ensure you have selected topics.');
          return false;
        }
        
        break;
    }
    return true;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };
  
  const handlePrevious = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Algorithm to generate study sessions from study plan
  const generateStudySessions = (studyPlan: StudyPlan): StudySession[] => {
    const sessions: StudySession[] = [];
    const startDate = new Date();
    const examDate = new Date(studyPlan.examDate);
    const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const topicsPerDay = Math.ceil(studyPlan.topicsToCover.length / Math.max(1, totalDays - 7));
    
    // Generate questions for each topic
    const generateQuestionsForTopic = (topic: string, count: number = 5): Question[] => {
      const questionTypes: Question['type'][] = ['multiple-choice', 'short-answer', 'problem-solving'];
      const difficulties: Question['difficulty'][] = ['easy', 'medium', 'hard'];
      
      return Array.from({ length: count }, (_, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        text: `${topic} - Question ${i + 1}`,
        type: questionTypes[i % questionTypes.length],
        difficulty: difficulties[i % difficulties.length],
        topic,
        completed: false
      }));
    };
    
    let topicIndex = 0;
    for (let day = 0; day < Math.min(totalDays, MAX_STUDY_DAYS); day++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + day);
      
      const dayNames = true 
        ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        : ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      
      const monthNames = true
        ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        : ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      
      const dayName = dayNames[sessionDate.getDay()];
      const formattedDate = true 
        ? `${dayName}, ${monthNames[sessionDate.getMonth()]} ${sessionDate.getDate()}`
        : `${dayName}، ${sessionDate.getDate()} ${monthNames[sessionDate.getMonth()]}`;
      
      const sessionTopics = studyPlan.topicsToCover.slice(topicIndex, topicIndex + topicsPerDay);
      if (sessionTopics.length === 0) break;
      
      const questions = sessionTopics.flatMap(topic => generateQuestionsForTopic(topic, 3));
      
      sessions.push({
        id: Math.random().toString(36).substr(2, 9),
        date: sessionDate.toISOString(),
        dayName: formattedDate,
        studyTime: studyPlan.dailyStudyTime,
        subject: studyPlan.subject,
        topics: sessionTopics,
        questions,
        status: day === 0 ? 'planned' : 'planned',
        studyPlanId: studyPlan.id
      });
      
      topicIndex += topicsPerDay;
    }
    
    return sessions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    
    // Check if table structure is ready
    if (availableColumns.length === 0) {
      console.log('Table structure not ready, checking again...');
      await checkTableStructure();
      
      if (availableColumns.length === 0) {
        setError('Table structure not ready. Please wait or refresh the page.');
        return;
      }
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Import the study plans service
      const { studyPlansService } = await import('../utils/supabase/services');
      
      // Get current authenticated user from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No active session. Please log in again.');
      }
      
      const authUser = session.user;
      console.log('Supabase session result:', { session, sessionError });
      console.log('Supabase auth user:', authUser);
      
      if (!authUser) {
        throw new Error('User not authenticated. Please log in again.');
      }
      
      // Calculate study time if not already calculated
      if (calculatedStudyTime.totalMinutes === 0) {
        calculateStudyTime(formData.examDate);
      }
      
      // Create study plan data for database - only include columns that exist
      let studyPlanData: any = {
        user_id: authUser.id, // Use authenticated user ID from Supabase
        study_date: new Date().toISOString().split('T')[0], // Current date
        study_time_minutes: calculatedStudyTime.totalMinutes, // Use calculated time
        total_topics: formData.topicsToCover.length,
        topics_done: 0,
        exam_date: formData.examDate
      };
      
      console.log('Current user context:', { user });
      console.log('Supabase auth user:', authUser);
      console.log('User ID being sent:', studyPlanData.user_id);
      
      // Only add columns that exist in the table
      if (availableColumns.includes('subject')) {
        studyPlanData.subject = formData.subject;
      }
      
      if (availableColumns.includes('topics_to_cover')) {
        studyPlanData.topics_to_cover = formData.topicsToCover;
      }
      
      if (availableColumns.includes('plan_name')) {
        studyPlanData.plan_name = formData.planName;
      } else if (availableColumns.includes('name')) {
        studyPlanData.name = formData.planName;
      } else if (availableColumns.includes('title')) {
        studyPlanData.title = formData.planName;
      }
      
      if (availableColumns.includes('status')) {
        studyPlanData.status = 'active';
      }
      
      console.log('Study plan data being sent:', studyPlanData);
      console.log('Available columns in table:', availableColumns);
      
      // Save to database
      const { data: savedPlan, error } = await studyPlansService.createStudyPlan(studyPlanData);
      
      if (error) {
        console.error('Database error details:', error);
        throw new Error(`Failed to save study plan: ${error.message || 'Unknown error'}`);
      }
      
      // Update local state
      const newStudyPlan: StudyPlan = {
        plan_id: savedPlan.plan_id,
        user_id: savedPlan.user_id,
        study_date: savedPlan.study_date,
        study_time_minutes: savedPlan.study_time_minutes,
        total_topics: savedPlan.total_topics,
        topics_done: savedPlan.topics_done,
        topics_left: savedPlan.topics_left,
        exam_date: savedPlan.exam_date,
        // Optional fields - only include if they exist
        ...(savedPlan.subject && { subject: savedPlan.subject }),
        ...(savedPlan.topics_to_cover && { topics_to_cover: savedPlan.topics_to_cover }),
        ...(savedPlan.plan_name && { plan_name: savedPlan.plan_name }),
        ...(savedPlan.status && { status: savedPlan.status }),
        ...(savedPlan.created_at && { created_at: savedPlan.created_at }),
        ...(savedPlan.updated_at && { updated_at: savedPlan.updated_at })
      };
      
      setStudyPlans([...studyPlans, newStudyPlan]);
      setSuccess(true);
      
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating study plan:', error);
      setError(`Failed to create study plan: ${(error as any)?.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const availableSubjects = getSubjects();
  
  // Calculate statistics
  const totalTopics = availableTopics.length;
  const selectedTopics = formData.topicsToCover.length;
  const completedTopics = formData.topicsCompleted.length;
  const estimatedDays = formData.examDate ? 
    Math.ceil((new Date(formData.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Show loading state while checking table structure
  if (loadingTableStructure) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking database structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30">
      {/* Enhanced Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" showText={true} />
              <Separator orientation="vertical" className="mx-4 h-6" />
              <div className="hidden md:flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-teal-medium" />
                <span className="text-sm font-medium text-gray-700">{t.title}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-width container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToDashboard}
            </Button>
            
            {/* Progress indicator */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      currentStep >= step
                        ? "bg-gradient-to-r from-teal-medium to-emerald text-white shadow-md"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {currentStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {t.stepOf.replace('{current}', currentStep.toString())}
              </div>
            </div>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6">{t.subtitle}</p>
            
            {/* Progress bar */}
            <div className="max-w-md mx-auto">
              <Progress value={(currentStep / 3) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800">
              <Sparkles className="h-5 w-5" />
              <AlertDescription className="text-lg font-medium">{t.success}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>
                {error}
                {error.includes('table does not exist') && (
                  <div className="mt-2">
                    <p className="text-sm">Please run this SQL in your Supabase SQL Editor:</p>
                    <code className="block mt-1 p-2 bg-red-100 rounded text-xs">
                      CREATE TABLE IF NOT EXISTS public.study_plans (
                        plan_id smallint NOT NULL,
                        user_id smallint NOT NULL,
                        study_date date NOT NULL,
                        study_time_minutes integer NOT NULL,
                        total_topics integer NOT NULL,
                        topics_done integer NULL DEFAULT 0,
                        topics_left integer GENERATED ALWAYS AS (total_topics - topics_done) STORED NULL,
                        exam_date date NOT NULL,
                        subject text DEFAULT 'businessStudies',
                        topics_to_cover text[] DEFAULT '{}',
                        plan_name text,
                        status text DEFAULT 'active',
                        created_at timestamp with time zone DEFAULT NOW(),
                        updated_at timestamp with time zone DEFAULT NOW(),
                        CONSTRAINT study_plans_pkey PRIMARY KEY (plan_id)
                      );
                    </code>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Form Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-2xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center mr-3">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      {t.basicInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="planName" className="text-base font-medium">{t.planName}</Label>
                      <Input
                        id="planName"
                        type="text"
                        placeholder={t.planNamePlaceholder}
                        value={formData.planName}
                        onChange={(e) => handleInputChange('planName', e.target.value)}
                        disabled={isLoading}
                        className="h-12 bg-white/80 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                      />
                      <p className="text-sm text-gray-500">{t.tips.planName}</p>
                    </div>

                    <div>
                      <Label className="text-lg font-medium flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                        {t.subject}
                      </Label>
                      <p className="text-gray-600 mt-1">{t.subjectDesc}</p>
                      <p className="text-sm text-gray-500 mt-2">{t.tips.subject}</p>
                    </div>
                    
                    <div>
                      <select
                        value={formData.subject}
                        onChange={(e) => {
                          handleInputChange('subject', e.target.value);
                          handleInputChange('topicsToCover', []);
                          handleInputChange('topicsCompleted', []);
                        }}
                        disabled={isLoading}
                        className="h-12 w-full bg-white/80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{t.selectSubject}</option>
                        {availableSubjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Topics Management */}
              {currentStep === 2 && formData.subject && (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-2xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      {t.topicsSection}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Topics to Cover */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg font-medium flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-orange-500" />
                          {t.topicsToCover}
                        </Label>
                        <p className="text-gray-600 mt-1">{t.topicsToCoverDesc}</p>
                        <p className="text-sm text-gray-500 mt-2">{t.tips.topics}</p>
                      </div>
                      
                      {loadingTopics ? (
                        <div className="col-span-2 text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
                          <p className="text-gray-600">Loading Business Studies topics...</p>
                        </div>
                      ) : availableTopics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableTopics.map((topic) => {
                            const isCompleted = formData.topicsCompleted.includes(topic);
                            const isSelected = formData.topicsToCover.includes(topic);
                            
                            return (
                              <div 
                                key={`cover-${topic}`}
                                className={cn(
                                  "flex items-center space-x-3 p-4 rounded-lg border transition-all",
                                  isSelected
                                    ? "border-teal-300 bg-teal-50"
                                    : isCompleted
                                    ? "border-gray-200 bg-gray-50 opacity-60"
                                    : "border-gray-200 bg-white hover:border-teal-200"
                                )}
                              >
                                <Checkbox
                                  id={`cover-${topic}`}
                                  checked={isSelected}
                                  onCheckedChange={() => !isCompleted && handleTopicToggle(topic, 'toCover')}
                                  disabled={isLoading || isCompleted}
                                  className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                                />
                                <Label 
                                  htmlFor={`cover-${topic}`}
                                  className={cn(
                                    "cursor-pointer flex-1",
                                    isCompleted && "text-gray-400 line-through"
                                  )}
                                >
                                  {topic}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-gray-500">No topics available for Business Studies</p>
                        </div>
                      )}
                      
                      {formData.topicsToCover.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {formData.topicsToCover.map((topic) => (
                            <Badge key={`badge-cover-${topic}`} className="bg-teal-100 text-teal-800 hover:bg-teal-200">
                              {topic}
                              <button
                                type="button"
                                onClick={() => handleTopicToggle(topic, 'toCover')}
                                className="ml-2 hover:text-teal-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Topics Already Completed */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg font-medium flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          {t.topicsCompleted}
                        </Label>
                        <p className="text-gray-600 mt-1">{t.topicsCompletedDesc}</p>
                      </div>
                      
                      {loadingTopics ? (
                        <div className="col-span-2 text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                          <p className="text-gray-600">Loading Business Studies topics...</p>
                        </div>
                      ) : availableTopics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableTopics.map((topic) => {
                            const isCompleted = formData.topicsCompleted.includes(topic);
                            const isSelected = formData.topicsToCover.includes(topic);
                            
                            return (
                              <div 
                                key={`completed-${topic}`}
                                className={cn(
                                  "flex items-center space-x-3 p-4 rounded-lg border transition-all",
                                  isCompleted
                                    ? "border-green-300 bg-green-50"
                                    : isSelected
                                    ? "border-gray-200 bg-gray-50 opacity-60"
                                    : "border-gray-200 bg-white hover:border-green-200"
                                )}
                              >
                                <Checkbox
                                  id={`completed-${topic}`}
                                  checked={isCompleted}
                                  onCheckedChange={() => !isSelected && handleTopicToggle(topic, 'completed')}
                                  disabled={isLoading || isSelected}
                                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <Label 
                                  htmlFor={`completed-${topic}`}
                                  className={cn(
                                    "cursor-pointer flex-1",
                                    isSelected && "text-gray-400"
                                  )}
                                >
                                  {topic}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-gray-500">No topics available for Business Studies</p>
                        </div>
                      )}
                      
                      {formData.topicsCompleted.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {formData.topicsCompleted.map((topic) => (
                            <Badge key={`badge-completed-${topic}`} className="bg-green-100 text-green-800 hover:bg-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {topic}
                              <button
                                type="button"
                                onClick={() => handleTopicToggle(topic, 'completed')}
                                className="ml-2 hover:text-green-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Schedule & Timeline */}
              {currentStep === 3 && (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-2xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      {t.scheduleSection}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {/* Exam Date */}
                      <div className="space-y-3">
                        <Label htmlFor="examDate" className="text-base font-medium">{t.examDate}</Label>
                        <div className="relative">
                          <Input
                            id="examDate"
                            type="date"
                            value={formData.examDate}
                            onChange={(e) => handleInputChange('examDate', e.target.value)}
                            disabled={isLoading}
                            className="h-12 bg-white/80 border-gray-300 focus:border-orange-500 focus:ring-orange-500 pl-12"
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                    {/* Calculated Study Time Display */}
                    {calculatedStudyTime.totalMinutes > 0 && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold text-blue-800">{t.calculatedStudyTime}</Label>
                            <p className="text-xs text-blue-600">
                              Based on your {formData.topicsToCover.filter(t => !formData.topicsCompleted.includes(t)).length} topics remaining
                            </p>
                      </div>
                    </div>
                    
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                            <div className="text-4xl font-bold text-blue-600">{calculatedStudyTime.hours}</div>
                            <div className="text-sm text-gray-600 mt-1">{t.hours}</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                            <div className="text-4xl font-bold text-indigo-600">{calculatedStudyTime.minutes}</div>
                            <div className="text-sm text-gray-600 mt-1">{t.minutes}</div>
                          </div>
                        </div>
                        
                        {formData.examDate && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <p className="text-sm text-gray-700">
                              {t.formulaNote
                                .replace('{topicsLeft}', formData.topicsToCover.filter(t => !formData.topicsCompleted.includes(t)).length.toString())
                                .replace('{daysLeft}', Math.ceil((new Date(formData.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)).toString())
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!formData.examDate && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                        <p className="text-sm text-gray-700">Please select your exam date to calculate recommended study time</p>
                    </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isLoading}
                  className="px-6 py-3"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.previous}
                </Button>
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                  >
                    {t.next}
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {t.createPlan}
                      </div>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        {t.createPlan}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar with Statistics and Tips */}
          <div className="lg:col-span-4 space-y-6">
            {/* Statistics Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
                  Study Plan Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalTopics}</div>
                    <div className="text-sm text-gray-600">{t.totalTopics}</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{selectedTopics}</div>
                    <div className="text-sm text-gray-600">{t.selectedTopics}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completedTopics}</div>
                    <div className="text-sm text-gray-600">{t.completedTopics}</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{estimatedDays}</div>
                    <div className="text-sm text-gray-600">{t.estimatedDays}</div>
                  </div>
                </div>
                
                {selectedTopics > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round((selectedTopics / totalTopics) * 100)}%</span>
                    </div>
                    <Progress value={(selectedTopics / totalTopics) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-teal-50/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  AI Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Break large topics into smaller, manageable chunks for better retention.
                  </p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Plan review sessions before your exam date to reinforce learning.
                  </p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Use active recall and spaced repetition for maximum effectiveness.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {formData.subject && selectedTopics > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Plan Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subject:</span>
                      <span className="text-sm font-medium">{formData.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Topics:</span>
                      <span className="text-sm font-medium">{selectedTopics} topics</span>
                    </div>
                    {formData.examDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Exam Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(formData.examDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {calculatedStudyTime.totalMinutes > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Daily Time:</span>
                        <span className="text-sm font-medium">
                          {calculatedStudyTime.hours}h {calculatedStudyTime.minutes}m
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}