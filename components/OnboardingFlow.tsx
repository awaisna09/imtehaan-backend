import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useApp } from '../App';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Globe, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const translations = {
  en: {
    steps: {
      role: {
        title: "Welcome to Imtehaan!",
        subtitle: "Tell us about yourself to get started",
        student: "Student",
        studentDesc: "I'm here to learn and practice",
        parent: "Parent", 
        parentDesc: "I'm managing my child's education",
        teacher: "Teacher",
        teacherDesc: "I'm here to track student progress"
      },
      curriculum: {
        title: "Choose Your Curriculum",
        subtitle: "Select the curriculum you're studying or teaching",
        igcse: "IGCSE",
        igcseDesc: "Cambridge International General Certificate",
        alevel: "A-Level", 
        alevelDesc: "Cambridge International A-Level",
        ib: "IB Diploma",
        ibDesc: "International Baccalaureate Diploma Programme"
      },
      subjects: {
        title: "Select Your Subjects",
        subtitle: "Choose the subjects you want to focus on",
        continue: "Continue with selected subjects"
      },
      language: {
        title: "Choose Your Language",
        subtitle: "Select your preferred language for the interface",
        english: "English",
      },
      complete: {
        title: "You're All Set!",
        subtitle: "Your personalized dashboard is ready",
        dashboard: "Go to Dashboard"
      }
    },
    subjects: {
      mathematics: "Mathematics",
      physics: "Physics", 
      chemistry: "Chemistry",
      biology: "Biology",
      english: "English Language",
      literature: "English Literature",
      history: "History",
      geography: "Geography",
      economics: "Economics",
      business: "Business Studies",
      computer: "Computer Science",
      psychology: "Psychology"
    },
    common: {
      next: "Next",
      back: "Back",
      skip: "Skip for now"
    }
  },};

export function OnboardingFlow() {
  const {setCurrentPage, setUser} = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    role: 'student',
    curriculum: 'igcse',
    subjects: ['mathematics', 'physics', 'chemistry'] as string[],
    preferredLanguage: language
  });

  const t = translations.en;

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setUser({
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      name: "Student User",
      joinDate: new Date().toISOString()
    });
    setCurrentPage('dashboard');
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep ? 'bg-[#FF4A10]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of 2
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-black">{t.steps.role.title}</h1>
                  <p className="text-lg text-gray-600 max-w-md mx-auto">
                    {true 
                      ? 'Your AI-powered learning companion for exam success. Supporting IGCSE, O Levels, A Levels, Edexcel, and IB curricula.'
                      : 'رفيق التعلم المدعوم بالذكاء الاصطناعي لنجاح الامتحانات. يدعم مناهج الشهادة الدولية العامة والمستوى العادي والمستوى المتقدم وإدكسل والبكالوريا الدولية.'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 my-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {'Practice Questions'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {'AI Tutor'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {'Progress Tracking'}
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleNext} 
                  className="w-full bg-[#FF4A10] hover:bg-[#E63E0E] text-white"
                  size="lg"
                >
                  {'Get Started'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Choose Language */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-black">{t.steps.language.title}</h1>
                  <p className="text-gray-600">{t.steps.language.subtitle}</p>
                </div>

                <RadioGroup 
                  value={userData.preferredLanguage} 
                  onValueChange={(value) => setUserData(prev => ({ ...prev, preferredLanguage: value as 'en' }))}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="en" id="en" />
                    <Globe className="h-6 w-6 text-[#FF4A10]" />
                    <div className="flex-1">
                      <Label htmlFor="en" className="font-medium cursor-pointer">
                        {t.steps.language.english}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="ar" id="ar" />
                    <Globe className="h-6 w-6 text-[#FF4A10]" />
                    <div className="flex-1">
                      <Label htmlFor="ar" className="font-medium cursor-pointer">
                        {t.steps.language.arabic}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.common.back}
                  </Button>
                  <Button 
                    onClick={handleComplete} 
                    className="flex-1 bg-[#FF4A10] hover:bg-[#E63E0E] text-white"
                  >
                    {t.steps.complete.dashboard}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}