import React, { createContext, useContext, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { StudentDashboard } from './components/StudentDashboard';
import { StudyPlanPage } from './components/StudyPlanPage';
import { PracticeMode } from './components/PracticeMode';
import { FlashcardSelection } from './components/FlashcardSelection';
import { FlashcardPage } from './components/FlashcardPage';
import { SubjectOverview } from './components/SubjectOverview';
import { AIFeedback } from './components/AIFeedback';
import { PricingPage } from './components/PricingPage';
import { AITutorPage } from './components/AITutorPage';
import { VisualLearning } from './components/VisualLearning';
import Analytics from './components/Analytics';
import { SettingsPage } from './components/SettingsPage';
import { MockExamPage } from './components/MockExamPage';
import { MockExamSelection } from './components/MockExamSelection';
import { MockExamP2 } from './components/MockExamP2';
import { TopicSelection } from './components/TopicSelection';
import { AITutorTopicSelection } from './components/AITutorTopicSelection';
import { ToastProvider } from './components/ui/toast';
import { AuthProvider, useAuth } from './utils/supabase/AuthContext';

// Types
export type Page = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'dashboard'
  | 'study-plan'
  | 'practice'
  | 'flashcard-selection'
  | 'flashcards'
  | 'subject'
  | 'feedback'
  | 'pricing'
  | 'ai-tutor'
  | 'ai-tutor-topic-selection'
  | 'visual-learning'
  | 'analytics'
  | 'settings'
  | 'mock-exam'
  | 'mock-exam-selection'
  | 'mock-exam-p2'
  | 'topic-selection';

export type Language = 'en' | 'ar';
export type Curriculum = 'igcse' | 'ib' | 'sat' | 'ap' | 'all';

export interface Subject {
  id: string;
  name: string;
  curriculum: Curriculum;
  grade: string;
  topics: any[];
  progress: number;
  color: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  duration: number;
  goals: string[];
  created_at: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  questions_answered: number;
  correct_answers: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

// App Context Type
interface AppContextType {
  // Core state
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  curriculum: Curriculum;
  setCurriculum: (curr: Curriculum) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Data state
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  currentSubject: Subject | null;
  setCurrentSubject: (subject: Subject | null) => void;
  
  // Study plan state
  studyPlans: StudyPlan[];
  setStudyPlans: (plans: StudyPlan[]) => void;
  
  // Study sessions state
  studySessions: StudySession[];
  setStudySessions: (sessions: StudySession[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  // Get the authenticated user from AuthContext
  const { user: authUser } = useAuth();
  
  // Core state
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [language, setLanguage] = useState<Language>('en');
  const [curriculum, setCurriculum] = useState<Curriculum>('igcse');
  const [user, setUser] = useState<User | null>(null);
  const [isContextReady, setIsContextReady] = useState(false);
  
  // Update user state when authUser changes
  React.useEffect(() => {
    if (authUser) {
      // Convert AuthContext User to App User type
      const appUser: User = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.name,
        avatar_url: undefined
      };
      setUser(appUser);
    } else {
      setUser(null);
    }
  }, [authUser]);
  
  // Data state
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Mathematics',
      curriculum: 'all',
      grade: 'IGCSE',
      topics: [],
      progress: 75,
      color: 'bg-blue-500'
    },
    {
      id: '2', 
      name: 'Physics',
      curriculum: 'all',
      grade: 'IGCSE',
      topics: [],
      progress: 60,
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Chemistry',
      curriculum: 'all',
      grade: 'IGCSE', 
      topics: [],
      progress: 85,
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Biology',
      curriculum: 'all',
      grade: 'IGCSE',
      topics: [],
      progress: 45,
      color: 'bg-orange-500'
    }
  ]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  
  // Study plan state
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  
  // Study sessions state
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  // Ensure context is ready
  React.useEffect(() => {
    setIsContextReady(true);
  }, []);

  const contextValue: AppContextType = {
    // Core state
    currentPage,
    setCurrentPage,
    language,
    setLanguage,
    curriculum,
    setCurriculum,
    user,
    setUser,
    
    // Data state
    subjects,
    setSubjects,
    currentSubject,
    setCurrentSubject,
    
    // Study plan state
    studyPlans,
    setStudyPlans,
    
    // Study sessions state
    studySessions,
    setStudySessions,
  };

  // Don't render until context is ready
  if (!isContextReady) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Define public pages that don't require authentication
  const publicPages: Page[] = ['landing', 'login', 'signup'];
  
  // Check if current page requires authentication
  const requiresAuth = !publicPages.includes(currentPage);
  
  // If page requires auth and user is not logged in, redirect to login
  if (requiresAuth && !user) {
    // Set the intended page to redirect back after login
    const intendedPage = currentPage;
    setCurrentPage('login');
  }

  // Render the appropriate page
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignUpPage />;
      case 'onboarding':
        return <OnboardingFlow />;
      case 'dashboard':
        return <StudentDashboard />;
      case 'study-plan':
        return <StudyPlanPage />;
      case 'practice':
        return <PracticeMode />;
      case 'flashcard-selection':
        return <FlashcardSelection />;
      case 'flashcards':
        return <FlashcardPage />;
      case 'subject':
        return <SubjectOverview />;
      case 'feedback':
        return <AIFeedback />;
      case 'pricing':
        return <PricingPage />;
      case 'ai-tutor':
        return <AITutorPage />;
      case 'ai-tutor-topic-selection':
        return <AITutorTopicSelection />;
      case 'visual-learning':
        return <VisualLearning />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage />;
      case 'mock-exam':
        return <MockExamPage />;
      case 'mock-exam-selection':
        return <MockExamSelection />;
      case 'mock-exam-p2':
        return <MockExamP2 />;
      case 'topic-selection':
        return <TopicSelection />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <ToastProvider>
        <div className={`min-h-screen bg-background text-foreground ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {renderPage()}
        </div>
      </ToastProvider>
    </AppContext.Provider>
  );
}