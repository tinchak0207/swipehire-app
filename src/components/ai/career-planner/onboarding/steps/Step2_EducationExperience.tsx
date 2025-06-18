import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EducationLevel } from '@/lib/types'; // Assuming this enum is available
import { CareerOnboardingData } from '../types';

interface StepEducationExperienceProps {
  data: Pick<CareerOnboardingData, 'educationLevel' | 'workExperienceSummary'>;
  updateData: (data: Partial<Pick<CareerOnboardingData, 'educationLevel' | 'workExperienceSummary'>>) => void;
  // errors?: any; // For future validation display
}

const Step2_EducationExperience: React.FC<StepEducationExperienceProps> = ({ data, updateData }) => {
  const educationLevels = Object.values(EducationLevel).filter(value => value !== EducationLevel.UNSPECIFIED);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-1">
          Highest Education Level
        </Label>
        <Select
          value={data.educationLevel || ''}
          onValueChange={(value) => updateData({ educationLevel: value })}
        >
          <SelectTrigger id="educationLevel">
            <SelectValue placeholder="Select your education level" />
          </SelectTrigger>
          <SelectContent>
            {educationLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {/* Basic formatting */}
              </SelectItem>
            ))}
            <SelectItem value={EducationLevel.UNSPECIFIED}>Prefer not to say / Not applicable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="workExperienceSummary" className="block text-sm font-medium text-gray-700 mb-1">
          Work Experience Summary
        </Label>
        <Textarea
          id="workExperienceSummary"
          rows={5}
          placeholder="Briefly summarize your key work experiences, roles, and responsibilities. Highlight significant achievements if possible."
          value={data.workExperienceSummary || ''}
          onChange={(e) => updateData({ workExperienceSummary: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          You can provide more details later or link to your full resume.
        </p>
      </div>
    </div>
  );
};

export default Step2_EducationExperience;
