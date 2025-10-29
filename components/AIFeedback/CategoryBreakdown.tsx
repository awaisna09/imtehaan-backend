import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Target } from 'lucide-react';

interface Category {
  name: string;
  score: number;
  total: number;
  correct: number;
}

interface CategoryBreakdownProps {
  title: string;
  categories: Category[];
  language: 'en';
}

export function CategoryBreakdown({ title, categories }: CategoryBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-[#FF4A10]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{category.name}</span>
                <Badge className={getScoreBadgeColor(category.score)}>
                  {category.score}%
                </Badge>
              </div>
              <Progress value={category.score} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {true 
                    ? `${category.correct}/${category.total} correct`
                    : `${category.correct}/${category.total} صحيح`
                  }
                </span>
                <span className={getScoreColor(category.score)}>
                  {category.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}