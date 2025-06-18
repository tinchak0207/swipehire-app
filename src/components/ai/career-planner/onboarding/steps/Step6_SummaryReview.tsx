import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CareerOnboardingData } from '../types';
import { EducationLevel } from '@/lib/types';

interface StepSummaryReviewProps {
  data: CareerOnboardingData;
}

const Step6_SummaryReview: React.FC<StepSummaryReviewProps> = ({ data }) => {
  const formatArrayToString = (arr?: string[] | string) => {
    if (Array.isArray(arr)) return arr.join(', ');
    if (typeof arr === 'string' && arr.trim() !== '') return arr; // Already a comma-separated string or single item
    return 'Not provided';
  };

  const formatEducationLevel = (level?: string) => {
    if (!level || level === EducationLevel.UNSPECIFIED) return 'Not provided / Not applicable';
    return level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle>Review Your Information</CardTitle>
        <CardDescription>
          Please review the information you've provided. If anything is incorrect, you can go back to previous steps to edit.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-3 text-sm">
        <div>
          <h3 className="font-semibold text-gray-800">Education & Experience:</h3>
          <p><strong className="font-medium text-gray-600">Highest Education Level:</strong> {formatEducationLevel(data.educationLevel)}</p>
          <p><strong className="font-medium text-gray-600">Work Experience Summary:</strong> {data.workExperienceSummary || 'Not provided'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Skills:</h3>
          <p>{formatArrayToString(data.skillsString)}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Career Interests:</h3>
          <p>{formatArrayToString(data.interestsString)}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Work Values:</h3>
          <p>{formatArrayToString(data.valuesString)}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Initial Career Expectations:</h3>
          <p>{data.initialCareerExpectations || 'Not provided'}</p>
        </div>
      </CardContent>
    </div>
  );
};

export default Step6_SummaryReview;
