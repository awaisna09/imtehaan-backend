import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface FeedbackListProps {
  title: string;
  items: string[];
  type: 'strengths' | 'weaknesses' | 'recommendations';
}

export function FeedbackList({ title, items, type }: FeedbackListProps) {
  const getIcon = () => {
    switch (type) {
      case 'strengths':
        return CheckCircle;
      case 'weaknesses':
        return XCircle;
      case 'recommendations':
        return Lightbulb;
      default:
        return CheckCircle;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'strengths':
        return 'text-green-600';
      case 'weaknesses':
        return 'text-red-600';
      case 'recommendations':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'strengths':
        return 'bg-green-50';
      case 'weaknesses':
        return 'bg-red-50';
      case 'recommendations':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  const Icon = getIcon();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon className={`h-5 w-5 mr-2 ${getIconColor()}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className={`p-3 rounded-lg ${getBgColor()}`}>
              <div className="flex items-start">
                <Icon className={`h-4 w-4 mr-3 mt-0.5 flex-shrink-0 ${getIconColor()}`} />
                <span className="text-gray-700">{item}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}