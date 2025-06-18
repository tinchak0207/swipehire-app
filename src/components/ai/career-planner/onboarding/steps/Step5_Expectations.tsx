import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CareerOnboardingData } from '../types';

interface StepExpectationsProps {
  data: Pick<CareerOnboardingData, 'initialCareerExpectations'>;
  updateData: (data: Partial<Pick<CareerOnboardingData, 'initialCareerExpectations'>>) => void;
}

const Step5_Expectations: React.FC<StepExpectationsProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="initialCareerExpectations" className="block text-sm font-medium text-gray-700">
        Initial Career Expectations & Goals
      </Label>
      <Textarea
        id="initialCareerExpectations"
        rows={5}
        placeholder="Briefly describe your current career expectations. What are your immediate goals or what do you hope to achieve in the near future? This will also serve as your primary career goal for the AI planner if you haven't set one separately."
        value={data.initialCareerExpectations || ''}
        onChange={(e) => updateData({ initialCareerExpectations: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      />
      <p className="mt-1 text-xs text-gray-500">
        This information will help tailor the career plan to your current outlook.
      </p>
    </div>
  );
};

export default Step5_Expectations;
