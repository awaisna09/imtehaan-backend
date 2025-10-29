import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { BarChart3 } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  language: 'en';
}

export function ScoreCard({ title, score, totalQuestions, correctAnswers }: ScoreCardProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-[#FF4A10]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-[#FF4A10] mb-2">{score}%</div>
          <div className="text-gray-600">
            {true 
              ? `${correctAnswers} out of ${totalQuestions} questions correct`
              : `${correctAnswers} من ${totalQuestions} سؤال صحيح`
            }
          </div>
        </div>
        <Progress value={score} className="h-3 mb-4" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-gray-600">
              {'Correct'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
            <div className="text-sm text-gray-600">
              {'Incorrect'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">7:30</div>
            <div className="text-sm text-gray-600">
              {'Time'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}