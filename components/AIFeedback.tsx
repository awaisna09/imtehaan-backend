import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useApp } from '../App';
import { ArrowLeft, RefreshCw, ArrowRight, TrendingUp, Brain } from 'lucide-react';
import { feedbackTranslations } from './constants/feedback-translations';
import { ScoreCard } from './AIFeedback/ScoreCard';
import { CategoryBreakdown } from './AIFeedback/CategoryBreakdown';
import { FeedbackList } from './AIFeedback/FeedbackList';

export function AIFeedback() {
  const { setCurrentPage } = useApp();
  const t = feedbackTranslations[language];
  const overallScore = 73;
  const totalQuestions = 12;
  const correctAnswers = 9;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('practice')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToPractice}
              </Button>
              <h1 className="text-xl font-semibold">{t.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overall Score */}
            <ScoreCard 
              title={t.overallScore}
              score={overallScore}
              totalQuestions={totalQuestions}
              correctAnswers={correctAnswers}
              language={language}
            />

            {/* Category Breakdown */}
            <CategoryBreakdown 
              title={t.breakdown}
              categories={t.categories}
              language={language}
            />

            {/* Strengths */}
            <FeedbackList 
              title={t.strengths}
              items={t.strengthItems}
              type="strengths"
            />

            {/* Weaknesses */}
            <FeedbackList 
              title={t.weaknesses}
              items={t.weaknessItems}
              type="weaknesses"
            />

            {/* AI Recommendations */}
            <FeedbackList 
              title={t.recommendations}
              items={t.recommendationItems}
              type="recommendations"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.accuracy}</span>
                    <span className="font-bold text-[#FF4A10]">{overallScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.timeSpent}</span>
                    <span className="font-bold">7:30</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.confidence}</span>
                    <span className="font-bold text-green-600">
                      {'High'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-3">
                <Button 
                  className="w-full bg-[#FF4A10] hover:bg-[#E63E0E] text-white"
                  onClick={() => setCurrentPage('practice')}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.retryQuestions}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentPage('practice')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t.nextPractice}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentPage('analytics')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {'View Progress'}
                </Button>
              </CardContent>
            </Card>

            {/* AI Insight */}
            <Card className="border-0 shadow-lg bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">
                    {'AI Insight'}
                  </span>
                </div>
                <p className="text-blue-700 text-sm">
                  {t.wellDone} {t.keepPracticing}
                </p>
              </CardContent>
            </Card>

            {/* Quick Navigation */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setCurrentPage('dashboard')}
                >
                  {'Back to Dashboard'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setCurrentPage('flashcards')}
                >
                  {'Practice Flashcards'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}