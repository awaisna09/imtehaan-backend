import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import { 
  Check, 
  ArrowRight, 
  Star, 
  Users, 
  Building, 
  Crown,
  Zap,
  Globe,
  ArrowLeft
} from 'lucide-react';

const translations = {
  en: {
    title: "Choose Your Plan",
    subtitle: "Affordable pricing for every learner",
    monthly: "Monthly",
    yearly: "Yearly",
    save: "Save 20%",
    mostPopular: "Most Popular",
    getStarted: "Get Started",
    backToHome: "Back to Home",
    individual: {
      title: "Individual Student",
      price: "$12",
      period: "/month",
      yearlyPrice: "$120",
      yearlyPeriod: "/year",
      description: "Perfect for individual students",
      features: [
        "Access to all subjects",
        "AI-powered feedback",
        "Practice questions & mock exams",
        "Visual learning materials",
        "Progress tracking",
        "Bilingual support",
        "Mobile app access"
      ]
    },
    premium: {
      title: "Premium Student",
      price: "$20",
      period: "/month", 
      yearlyPrice: "$200",
      yearlyPeriod: "/year",
      description: "Enhanced learning experience",
      features: [
        "Everything in Individual",
        "1-on-1 AI tutoring sessions",
        "Advanced analytics",
        "Priority support",
        "Offline content access",
        "Custom study plans",
        "Unlimited practice tests"
      ]
    },
    school: {
      title: "School License",
      price: "QAR 300-500",
      period: "/student/year",
      description: "For educational institutions",
      features: [
        "Bulk student accounts",
        "Teacher dashboard",
        "Class management tools",
        "Custom branding",
        "Advanced reporting",
        "Admin panel access",
        "Dedicated support"
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "Can I switch between plans?",
          answer: "Yes, you can upgrade or downgrade your plan at any time."
        },
        {
          question: "Is there a free trial?",
          answer: "Yes, we offer a 7-day free trial for all plans."
        },
        {
          question: "What subjects are covered?",
          answer: "We cover all IGCSE, A-Level, and IB subjects including Math, Science, Languages, and more."
        }
      ]
    }
  },};

export function PricingPage() {
  const { setCurrentPage } = useApp();
  const [isYearly, setIsYearly] = React.useState(false);
  const t = translations.en;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('landing')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToHome}
              </Button>
              <div className="flex items-center">
                <span className="text-xl font-bold text-black">امتحان</span>
                <span className="text-xl font-bold text-[#FF4A10] ml-1">Imtehaan</span>
              </div>
            </div>
            
            <Button onClick={() => setCurrentPage('onboarding')}>
              {t.getStarted}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 mb-8">{t.subtitle}</p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`${!isYearly ? 'text-black font-medium' : 'text-gray-600'}`}>
              {t.monthly}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-[#FF4A10]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`${isYearly ? 'text-black font-medium' : 'text-gray-600'}`}>
              {t.yearly}
            </span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-800 ml-2">{t.save}</Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Individual Plan */}
          <Card className="border-2 border-gray-200 hover:border-[#FF4A10]/50 transition-colors">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-[#FF4A10]" />
              </div>
              <CardTitle className="text-2xl">{t.individual.title}</CardTitle>
              <p className="text-gray-600">{t.individual.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-black">
                  {isYearly ? t.individual.yearlyPrice : t.individual.price}
                </span>
                <span className="text-gray-600">
                  {isYearly ? t.individual.yearlyPeriod : t.individual.period}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {t.individual.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-[#FF4A10] hover:bg-[#E63E0E] text-white"
                onClick={() => setCurrentPage('onboarding')}
              >
                {t.getStarted}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-[#FF4A10] relative shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-[#FF4A10] text-white px-4 py-1">
                <Crown className="h-3 w-3 mr-1" />
                {t.mostPopular}
              </Badge>
            </div>
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-[#FF4A10]" />
              </div>
              <CardTitle className="text-2xl">{t.premium.title}</CardTitle>
              <p className="text-gray-600">{t.premium.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-black">
                  {isYearly ? t.premium.yearlyPrice : t.premium.price}
                </span>
                <span className="text-gray-600">
                  {isYearly ? t.premium.yearlyPeriod : t.premium.period}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {t.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-[#FF4A10] hover:bg-[#E63E0E] text-white"
                onClick={() => setCurrentPage('onboarding')}
              >
                {t.getStarted}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* School Plan */}
          <Card className="border-2 border-gray-200 hover:border-[#FF4A10]/50 transition-colors">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-[#FF4A10]" />
              </div>
              <CardTitle className="text-2xl">{t.school.title}</CardTitle>
              <p className="text-gray-600">{t.school.description}</p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-black">
                  {t.school.price}
                </span>
                <div className="text-gray-600 text-sm">
                  {t.school.period}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {t.school.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline"
                className="w-full border-[#FF4A10] text-[#FF4A10] hover:bg-[#FF4A10] hover:text-white"
                onClick={() => setCurrentPage('onboarding')}
              >
                {'Request Demo'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            {'Why Choose Imtehaan?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF4A10]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-[#FF4A10]" />
              </div>
              <h3 className="font-semibold mb-2">
                {'AI-Powered Learning'}
              </h3>
              <p className="text-gray-600">
                {true 
                  ? 'Personalized feedback and adaptive learning paths'
                  : 'ملاحظات شخصية ومسارات تعلم تكيفية'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF4A10]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-[#FF4A10]" />
              </div>
              <h3 className="font-semibold mb-2">
                {'Bilingual Support'}
              </h3>
              <p className="text-gray-600">
                {true
                  ? 'Learn in English or Arabic with seamless switching'
                  : 'Learn in English'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF4A10]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#FF4A10]" />
              </div>
              <h3 className="font-semibold mb-2">
                {'Proven Results'}
              </h3>
              <p className="text-gray-600">
                {true
                  ? '85% of students improve their grades by at least one level'
                  : '85% من الطلاب يحسنون درجاتهم بمستوى واحد على الأقل'
                }
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">{t.faq.title}</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {t.faq.items.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">
            {'Ready to Start Learning?'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {true 
              ? 'Join thousands of students improving their grades with Imtehaan'
              : 'انضم إلى آلاف الطلاب الذين يحسنون درجاتهم مع امتحان'
            }
          </p>
          <Button 
            size="lg"
            className="bg-[#FF4A10] hover:bg-[#E63E0E] text-white px-8 py-4"
            onClick={() => setCurrentPage('onboarding')}
          >
            {'Start Free Trial'}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}