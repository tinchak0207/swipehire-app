import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CareerOnboardingData } from '../types';

interface StepInterestsValuesProps {
  data: Pick<CareerOnboardingData, 'interestsString' | 'valuesString'>;
  updateData: (data: Partial<Pick<CareerOnboardingData, 'interestsString' | 'valuesString'>>) => void;
}

const Step4_InterestsValues: React.FC<StepInterestsValuesProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="interestsString" className="block text-sm font-medium text-gray-700 mb-1">
          Career Interests & Passions
        </Label>
        <Textarea
          id="interestsString"
          rows={3}
          placeholder="What fields, industries, or types of work genuinely excite you? List them separated by commas (e.g., renewable energy, mobile app development, creative writing)."
          value={data.interestsString || ''}
          onChange={(e) => updateData({ interestsString: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Separate multiple interests with commas.
        </p>
      </div>

      <div>
        <Label htmlFor="valuesString" className="block text-sm font-medium text-gray-700 mb-1">
          Work Values
        </Label>
        <Textarea
          id="valuesString"
          rows={3}
          placeholder="What values are most important to you in a work environment? List them separated by commas (e.g., work-life balance, continuous learning, autonomy, teamwork, making an impact)."
          value={data.valuesString || ''}
          onChange={(e) => updateData({ valuesString: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Separate multiple values with commas.
        </p>
      </div>
    </div>
  );
};

export default Step4_InterestsValues;
