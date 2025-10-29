import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Logo } from './Logo';
import pandaImage from '../ChatGPT Image Aug 16, 2025, 01_26_07 AM.png';
import { useApp } from '../App';
import { useAuth } from '../utils/supabase/AuthContext';
import { userService } from '../utils/supabase/services';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowLeft, 
  Globe,
  Chrome
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const translations = {
  en: {
    title: "Welcome Back",
    subtitle: "Sign in to continue your learning journey",
    email: "Email Address",
    password: "Password",
    forgotPassword: "Forgot your password?",
    signIn: "Sign In",
    signInWithGoogle: "Sign in with Google",
    orContinueWith: "or continue with",
    noAccount: "Don't have an account?",
    createAccount: "Create one here",
    backToHome: "Back to Home",
    emailPlaceholder: "Enter your email address",
    passwordPlaceholder: "Enter your password",
    switchToEmail: "Sign in with Email",
    errors: {
      emailRequired: "Email address is required",
      passwordRequired: "Password is required",
      invalidCredentials: "Invalid email or password"
    }
  },};

export function LoginPage() {
  const {setCurrentPage, setUser} = useApp();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const t = translations.en;

  // Show success message if user just signed up
  useEffect(() => {
    const justSignedUp = sessionStorage.getItem('justSignedUp');
    if (justSignedUp === 'true') {
      setShowSuccessMessage(true);
      sessionStorage.removeItem('justSignedUp');
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError(t.errors.emailRequired);
      return false;
    }
    if (!formData.password.trim()) {
      setError(t.errors.passwordRequired);
      return false;
    }
    return true;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to sign in with:', formData.email);
      const { data, error } = await signIn(formData.email, formData.password);
      console.log('Signin response:', { data, error });

      if (error) {
        console.error('Signin error:', error);
        setError(error.message || t.errors.invalidCredentials);
        setIsLoading(false);
        return;
      }

      if (!data) {
        console.error('No data returned from signin');
        setError('No data returned from signin');
        setIsLoading(false);
        return;
      }

      console.log('Processing signin data:', data);

      // Handle the new data structure from simplified AuthService
      let userProfile;
      
      if (data.auth && data.profile) {
        // New structure: { auth: authData, profile: profileData }
        userProfile = data.profile;
        console.log('Using profile data:', userProfile);
      } else if (data.user) {
        // Fallback for old structure or local auth
        userProfile = data.user;
        console.log('Using user data:', userProfile);
      } else if (data.auth?.user) {
        // Supabase auth data without profile
        userProfile = data.auth.user;
        console.log('Using auth user data:', userProfile);
      } else {
        // No user data found
        console.error('No user profile found in data:', data);
        setError('Authentication successful but no user data found');
        setIsLoading(false);
        return;
      }

      // Create user object from profile data
      const user = {
        id: userProfile.id,
        email: userProfile.email || '',
        full_name: userProfile.full_name || userProfile.name || userProfile.email?.split('@')[0] || 'User'
      };
      
      console.log('Created user object:', user);
      
      // Reset daily time spent on login
      console.log('🔄 LOGIN PAGE: User signed in, resetting daily time spent...');
      try {
        const { comprehensiveAnalyticsService } = await import('../utils/supabase/comprehensive-analytics-service');
        await comprehensiveAnalyticsService.resetDailyTimeSpent(user.id);
        console.log('✅ LOGIN PAGE: Daily time spent reset completed');
      } catch (error) {
        console.error('❌ LOGIN PAGE: Failed to reset daily time spent:', error);
      }
      
      setUser(user);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Signin exception:', error);
      setError(t.errors.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      // For Google OAuth, we'll need to handle this differently
      // For now, we'll use a mock approach
      const mockUser = {
        id: 'google-123',
        email: 'user@gmail.com',
        full_name: 'Google User'
      };
      setUser(mockUser);
      setCurrentPage('onboarding');
    } catch (error) {
      setError('Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-light/20">
      {/* Main content container */}
      <div className="flex h-full">
        {/* Left side - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl text-black mb-2">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>

            {/* Login Card */}
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

                  {showSuccessMessage && (
                    <Alert className="border-green-200/50 text-green-700 bg-green-50/80 backdrop-blur-sm rounded-xl">
                      <AlertDescription>
                        {true 
                          ? '✅ Signup successful! Please sign in to continue.' 
                          : '✅ تم التسجيل بنجاح! يرجى تسجيل الدخول للمتابعة.'
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleEmailSignIn} className="space-y-5">
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

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50/50 p-2 rounded-lg transition-all duration-200"
                      >
                        {t.forgotPassword}
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:via-teal-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t.signIn}
                        </div>
                      ) : (
                        t.signIn
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
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 text-gray-700 hover:text-teal-700 rounded-xl py-3 transition-all duration-200 group"
                  >
                    <Chrome className="h-4 w-4 mr-2 group-hover:text-teal-600 transition-colors duration-200" />
                    {t.signInWithGoogle}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    {t.noAccount}{' '}
                    <button
                      onClick={() => setCurrentPage('signup')}
                      className="text-teal-600 hover:text-teal-700 underline font-medium hover:no-underline transition-all duration-200"
                    >
                      {t.createAccount}
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
                {'Welcome to AI-Powered Learning'}
              </h2>
              <p className="text-gray-600">
                {true 
                  ? 'Join thousands of students excelling with our intelligent tutoring platform'
                  : 'انضم إلى آلاف الطلاب المتفوقين مع منصة التدريس الذكية لدينا'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}