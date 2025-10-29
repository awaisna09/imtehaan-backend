import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Logo } from './Logo';
import { useApp } from '../App';
import { 
  BookOpen, 
  Brain, 
  Globe, 
  Trophy, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  Languages,
  Zap,
  Target,
  MessageCircle,
  Play,
  ChevronDown,
  Shield,
  Clock,
  TrendingUp,
  Award,
  BookMarked,
  Lightbulb,
  Sparkles,
  GraduationCap,
  Calendar,
  CheckCircle2,
  X,
  Menu
} from 'lucide-react';

const translations = {
  en: {
    hero: {
      title: "Master IGCSE, O/A Levels, Edexcel & IB with AI-Powered Learning",
      subtitle: "Affordable, exam-centered education with personalized feedback, gamified experiences, and 24/7 AI tutoring",
      cta: "Start Learning Now",
      watchDemo: "Watch Demo",
      askAI: "Try AI Tutor",
      scrollDown: "Scroll to explore"
    },
    features: {
      title: "Why Choose Imtehaan?",
      subtitle: "Everything you need to excel in your exams",
      items: [
        {
          icon: Brain,
          title: "AI-Powered Practice",
          description: "Get instant feedback and personalized recommendations based on your performance",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        },
        {
          icon: BookOpen,
          title: "Paper-Specific Support",
          description: "Practice with real past papers from IGCSE, A-Level, and IB curricula",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        },
        {
          icon: Languages,
          title: "Bilingual Interface",
          description: "Learn in English or Arabic with seamless language switching",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200"
        },
        {
          icon: Target,
          title: "Visual Learning",
          description: "Interactive diagrams, animations, and visual explanations for complex concepts",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        },
        {
          icon: Trophy,
          title: "Gamification",
          description: "Earn badges, track streaks, and compete with peers to stay motivated",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200"
        },
        {
          icon: MessageCircle,
          title: "24/7 AI Tutor",
          description: "Ask questions anytime and get instant, personalized explanations from our AI assistant",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        }
      ]
    },
    howItWorks: {
      title: "How Imtehaan Works",
      subtitle: "Get started in minutes, see results in weeks",
      steps: [
        {
          number: "01",
          title: "Choose Your Subject",
          description: "Select from 25+ subjects across IGCSE, A-Level, Edexcel & IB curricula",
          icon: BookMarked
        },
        {
          number: "02",
          title: "AI Assessment",
          description: "Our AI analyzes your current level and creates a personalized study plan",
          icon: Brain
        },
        {
          number: "03",
          title: "Practice & Learn",
          description: "Access interactive lessons, past papers, and 24/7 AI tutoring support",
          icon: Lightbulb
        },
        {
          number: "04",
          title: "Track Progress",
          description: "Monitor your improvement with detailed analytics and performance insights",
          icon: TrendingUp
        }
      ]
    },
    testimonials: {
      title: "Trusted by Students Worldwide",
      subtitle: "Join thousands of successful learners",
      items: [
        {
          name: "Sarah Ahmed",
          role: "A-Level Student",
          content: "The AI tutor helped me understand calculus concepts I struggled with for months. It's like having a personal teacher available 24/7!",
          rating: 5,
          subject: "Mathematics",
          improvement: "B → A*"
        },
        {
          name: "Mohammed Al-Rashid", 
          role: "IB Student",
          content: "I love how I can ask questions in Arabic and get detailed explanations. The AI tutor adapts to my learning style perfectly!",
          rating: 5,
          subject: "Physics",
          improvement: "C → A"
        },
        {
          name: "Emma Johnson",
          role: "IGCSE Student", 
          content: "The AI tutor is incredibly smart and patient. It explains things in different ways until I understand completely!",
          rating: 5,
          subject: "Biology",
          improvement: "B → A*"
        }
      ]
    },
    stats: {
      improvement: "92%",
      improvementLabel: "Grade Improvement",
      subjects: "IGCSE",
      subjectsLabel: "Courses Available",
      satisfaction: "98%",
      satisfactionLabel: "Student Satisfaction"
    },
    cta: {
      title: "Ready to Transform Your Learning?",
      subtitle: "Join thousands of students who have improved their grades with AI-powered tutoring",
      button: "Get Started Now",
      tryAI: "Try AI Tutor Now",
      noCreditCard: "Start learning today • Join our community"
    }
  }
};

export function LandingPage() {
  const { setCurrentPage } = useApp();
  const t = translations.en;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTryAITutor = () => {
    setCurrentPage('login');
  };

  const handleNavigation = () => {
    setCurrentPage('login');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" showText={true} />
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => scrollToSection('features')}
                  className="text-gray-600 hover:text-black px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-50"
                >
                  {'Features'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-600 hover:text-black px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-50"
                >
                  {'How It Works'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleTryAITutor}
                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {'AI Tutor'}
                </Button>
              </div>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setCurrentPage('login')} className="transition-all duration-200 hover:bg-gray-50">
                {'Sign In'}
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setCurrentPage('signup')}
              >
                {t.hero.cta}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left"
                onClick={() => { scrollToSection('features'); setIsMobileMenuOpen(false); }}
              >
                {'Features'}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left"
                onClick={() => { scrollToSection('how-it-works'); setIsMobileMenuOpen(false); }}
              >
                {'How It Works'}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left"
                onClick={() => { handleTryAITutor(); setIsMobileMenuOpen(false); }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {'AI Tutor'}
              </Button>
              <div className="pt-4 border-t border-gray-100">
                <Button variant="ghost" className="w-full justify-start text-left" onClick={() => setCurrentPage('login')}>
                  {'Sign In'}
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => setCurrentPage('signup')}
                >
                  {t.hero.cta}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden relative">
        {/* Simplified Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium shadow-lg">
                  <Zap className="h-4 w-4 mr-2" />
                  {'AI-Powered Learning'}
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
                  {t.hero.title}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  {t.hero.subtitle}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
                  onClick={handleNavigation}
                >
                  {t.hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-4 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all duration-200"
                  onClick={handleTryAITutor}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t.hero.askAI}
                </Button>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">{t.stats.improvement}</div>
                  <div className="text-sm text-gray-600">{t.stats.improvementLabel}</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">{t.stats.subjects}</div>
                  <div className="text-sm text-gray-600">{t.stats.subjectsLabel}</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">{t.stats.satisfaction}</div>
                  <div className="text-sm text-gray-600">{t.stats.satisfactionLabel}</div>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="flex justify-center pt-8">
                <div className="flex flex-col items-center space-y-2 text-gray-500">
                  <span className="text-sm">{t.hero.scrollDown}</span>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Enhanced Hero Visual */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="p-8 bg-white shadow-lg border-0 rounded-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {'AI Tutor Session'}
                      </h3>
                      <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {'Online'}
                      </Badge>
                    </div>
                    
                    {/* Enhanced conversation */}
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl rounded-br-none max-w-[80%] shadow-lg">
                          <p className="text-sm">
                            "Can you explain quadratic equations?"
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-start">
                        <div className="bg-gray-50 p-4 rounded-2xl rounded-bl-none max-w-[80%] shadow-lg border border-gray-100">
                          <p className="text-sm text-gray-700">
                            "Absolutely! Let me break down quadratic equations step by step..."
                          </p>
                          <div className="mt-3 flex gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t border-gray-100">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span>
                        {'Available 24/7 • Responds in seconds'}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={handleTryAITutor}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {t.hero.askAI}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Simplified background decoration */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-50 rounded-full opacity-40"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-50 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => (
              <Card 
                key={index} 
                className="p-8 hover:shadow-lg transition-shadow duration-200 border-0 bg-white group cursor-pointer"
              >
                <div className="space-y-6">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center transition-colors duration-200 border ${feature.borderColor}`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-black group-hover:text-blue-600 transition-colors duration-200">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  {feature.icon === MessageCircle && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTryAITutor}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 group-hover:border-blue-700 group-hover:text-blue-700 transition-all duration-200"
                    >
                      {'Try Now'}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.howItWorks.steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                    {index < t.howItWorks.steps.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform translate-x-4"></div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-black">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              {t.testimonials.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.testimonials.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.testimonials.items.map((testimonial, index) => (
              <Card key={index} className="p-8 bg-white border-0 shadow-lg hover:shadow-md transition-shadow duration-200">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {testimonial.improvement}
                    </Badge>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="space-y-2">
                    <div className="font-semibold text-black text-lg">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.subject}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned Modern Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About Section */}
            <div className="space-y-6 lg:col-span-1">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  {'Imtehaan.ai'}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  AI-powered learning platform revolutionizing education for IGCSE, O/A Levels, Edexcel & IB students worldwide.
                </p>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                <div className="group w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/50">
                  <Globe className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="group w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-500/50">
                  <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="group w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/50">
                  <Users className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
            
            {/* Product Section */}
            <div>
              <h4 className="font-bold mb-6 text-white text-lg flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-400" />
                {'Product'}
              </h4>
              <div className="space-y-3">
                <div>
                  <button onClick={handleNavigation} className="text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Pricing Plans'}
                  </button>
                </div>
                <div>
                  <button onClick={handleNavigation} className="text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Student Dashboard'}
                  </button>
                </div>
                <div>
                  <button onClick={handleTryAITutor} className="text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'AI Tutor'}
                  </button>
                </div>
                <div>
                  <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Features'}
                  </button>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div>
              <h4 className="font-bold mb-6 text-white text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-400" />
                {'Support'}
              </h4>
              <div className="space-y-3">
                <div>
                  <button onClick={handleTryAITutor} className="text-gray-400 hover:text-green-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Ask AI Tutor'}
                  </button>
                </div>
                <div>
                  <a href="mailto:support@imtehaan.ai" className="text-gray-400 hover:text-green-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Contact Support'}
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Help Center'}
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Documentation'}
                  </a>
                </div>
              </div>
            </div>

            {/* Legal Section */}
            <div>
              <h4 className="font-bold mb-6 text-white text-lg flex items-center">
                <BookMarked className="h-5 w-5 mr-2 text-purple-400" />
                {'Legal'}
              </h4>
              <div className="space-y-3">
                <div>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Privacy Policy'}
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Terms of Service'}
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'Cookie Policy'}
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-200 text-sm hover:translate-x-1 inline-flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {'License'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800/50 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-400" />
                &copy; 2025 Imtehaan.ai. {'All rights reserved.'}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{'AI Systems Active'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}