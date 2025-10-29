import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import pandaImage from '../ChatGPT Image Aug 16, 2025, 01_26_07 AM.png';
import { useApp } from '../App';
import { useAuth } from '../utils/supabase/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Globe,
  Chrome,
  User,
  GraduationCap
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const translations = {
  en: {
    title: "Create Your Account",
    subtitle: "",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",

    signUp: "Create Account",
    signUpWithGoogle: "Sign up with Google",
    orContinueWith: "or continue with",
    haveAccount: "Already have an account?",
    signInHere: "Sign in here",
    backToHome: "Back to Home",
    fullNamePlaceholder: "Enter your full name",
    emailPlaceholder: "Enter your email address",
    passwordPlaceholder: "Create a password (min. 8 characters)",
    confirmPasswordPlaceholder: "Confirm your password",
    agreeToTerms: "I agree to the Terms of Service and Privacy Policy",
    newsletterOptIn: "Send me updates about new features and study tips",

    errors: {
      nameRequired: "Full name is required",
      emailRequired: "Email address is required",
      passwordRequired: "Password is required",
      passwordTooShort: "Password must be at least 8 characters",
      passwordMismatch: "Passwords do not match",
      termsRequired: "You must agree to the terms",
      emailExists: "Email already exists"
    }
  },};

export function SignUpPage() {
  const {setCurrentPage, setUser} = useApp();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    newsletterOptIn: false
  });

  const t = translations.en;

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError(t.errors.nameRequired);
      return false;
    }
    if (!formData.email.trim()) {
      setError(t.errors.emailRequired);
      return false;
    }
    if (!formData.password) {
      setError(t.errors.passwordRequired);
      return false;
    }
    if (formData.password.length < 8) {
      setError(t.errors.passwordTooShort);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t.errors.passwordMismatch);
      return false;
    }

    if (!formData.agreeToTerms) {
      setError(t.errors.termsRequired);
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Sign up with metadata for users table
      const metadata = {
        full_name: formData.fullName,
        user_type: 'student',
        curriculum: 'igcse',
        grade: 'Year 10',
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        preferences: {
          language: 'en',
          notifications: formData.newsletterOptIn,
          darkMode: false,
          theme: 'light',
          autoPlayFlashcards: true,
          showHints: true,
          soundEffects: true,
          studyReminders: true,
          dailyGoal: 60
        }
      };
      
      const { data, error } = await signUp(formData.email, formData.password, metadata);

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Set flag to show success message on login page
        sessionStorage.setItem('justSignedUp', 'true');
        setCurrentPage('login');
      }
    } catch (error) {
      setError(t.errors.emailExists);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // For Google OAuth, we'll need to handle this differently
      // For now, we'll use a mock approach
      const mockUser = {
        id: 'google-123',
        name: 'Google User',
        email: 'user@gmail.com',
        type: 'student' as const,
        curriculum: 'igcse' as const,
        grade: 'Year 10',
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        preferences: {
          language: 'en',
          notifications: true,
          darkMode: false,
          theme: 'light' as const,
          autoPlayFlashcards: true,
          showHints: true,
          soundEffects: true,
          studyReminders: true,
          dailyGoal: 60
        }
      };
      // Set flag to show success message on login page
      sessionStorage.setItem('justSignedUp', 'true');
      setCurrentPage('login');
    } catch (error) {
      setError('Google sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-light/20">
      {/* Main content container */}
      <div className="flex h-full">
        {/* Left side - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl text-black mb-2">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>

            {/* Sign Up Card */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-teal-50/30 rounded-2xl"></div>
              <div className="relative z-10">
                <CardHeader className="space-y-1 pb-4 bg-gradient-to-r from-teal-50/50 to-blue-50/50 border-b border-teal-100/50">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentPage('landing')}
                      className="text-gray-600 hover:text-teal-600 hover:bg-teal-50/50 p-2 rounded-lg transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t.backToHome}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                  {error && (
                    <Alert className="border-red-200/50 text-red-700 bg-red-50/80 backdrop-blur-sm rounded-xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSignUp} className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">{t.fullName}</Label>
                      <div className="relative group">
                        <Input
                          id="fullName"
                          type="text"
                          placeholder={t.fullNamePlaceholder}
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          disabled={isLoading}
                          className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">{t.email}</Label>
                      <div className="relative group">
                        <Input
                          id="email"
                          type="email"
                          placeholder={t.emailPlaceholder}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isLoading}
                          className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">{t.password}</Label>
                      <div className="relative group">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t.passwordPlaceholder}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          disabled={isLoading}
                          className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 pr-10"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">{t.confirmPassword}</Label>
                      <div className="relative group">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t.confirmPasswordPlaceholder}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          disabled={isLoading}
                          className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 pr-10"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-200"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms and Newsletter */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-teal-200 transition-all duration-200">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked === true)}
                          className="text-teal-600 border-gray-300 hover:border-teal-400 focus:ring-teal-200"
                        />
                        <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                          {t.agreeToTerms}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-teal-200 transition-all duration-200">
                        <Checkbox
                          id="newsletter"
                          checked={formData.newsletterOptIn}
                          onCheckedChange={(checked) => handleInputChange('newsletterOptIn', checked === true)}
                          className="text-teal-600 border-gray-300 hover:border-teal-400 focus:ring-teal-200"
                        />
                        <Label htmlFor="newsletter" className="text-sm text-gray-600 cursor-pointer">
                          {t.newsletterOptIn}
                        </Label>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:via-teal-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t.signUp}
                        </div>
                      ) : (
                        t.signUp
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-gray-500 font-medium">{t.orContinueWith}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    className="w-full border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 text-gray-700 hover:text-teal-700 rounded-xl py-3 transition-all duration-200 group"
                  >
                    <Chrome className="h-4 w-4 mr-2 group-hover:text-teal-600 transition-colors duration-200" />
                    {t.signUpWithGoogle}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    {t.haveAccount}{' '}
                    <button
                      onClick={() => setCurrentPage('login')}
                      className="text-teal-600 hover:text-teal-700 underline font-medium hover:no-underline transition-all duration-200"
                    >
                      {t.signInHere}
                    </button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

        {/* Right side - Panda Image */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <img 
              src={pandaImage} 
              alt="Studious Panda with Imtehaan.ai" 
              className="w-full max-w-md mx-auto"
            />
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {'Start Your Learning Journey'}
              </h2>
              <p className="text-gray-600">
                Join our AI-powered platform and discover a new way to excel in your studies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
