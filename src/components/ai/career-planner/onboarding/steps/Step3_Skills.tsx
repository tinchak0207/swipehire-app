import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CareerOnboardingData } from '../types';

interface StepSkillsProps {
  data: Pick<CareerOnboardingData, 'skillsString'>;
  updateData: (data: Partial<Pick<CareerOnboardingData, 'skillsString'>>) => void;
}

const Step3_Skills: React.FC<StepSkillsProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="skillsString" className="block text-sm font-medium text-gray-700">
        Skills
      </Label>
      <Textarea
        id="skillsString"
        rows={4}
        placeholder="List your key skills, separated by commas (e.g., JavaScript, Project Management, Data Analysis, Graphic Design)."
        value={data.skillsString || ''}
        onChange={(e) => updateData({ skillsString: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      />
      <p className="mt-1 text-xs text-gray-500">
        Please separate multiple skills with commas.
      </p>
    </div>
  );
};

export default Step3_Skills;
