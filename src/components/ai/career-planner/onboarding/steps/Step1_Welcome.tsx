import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface StepWelcomeProps {
  // No data to collect or update in this step
}

const Step1_Welcome: React.FC<StepWelcomeProps> = () => {
  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle>Welcome to Your AI Career Planner Onboarding!</CardTitle>
        <CardDescription>
          Let's gather some information to help us understand your current standing and aspirations.
          This will enable our AI to provide you with a personalized career plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <p className="text-sm text-gray-700">
          This short questionnaire will cover:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
          <li>Your education and experience</li>
          <li>Your skills</li>
          <li>Your career interests and values</li>
          <li>Your initial career expectations</li>
        </ul>
        <p className="text-sm text-gray-700 mt-4">
          Click "Next" to begin.
        </p>
      </CardContent>
    </div>
  );
};

export default Step1_Welcome;
