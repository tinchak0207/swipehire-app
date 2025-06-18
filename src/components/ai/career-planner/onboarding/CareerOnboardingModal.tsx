'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CareerOnboardingData, ProcessedCareerOnboardingData } from './types';

import Step1_Welcome from './steps/Step1_Welcome';
import Step2_EducationExperience from './steps/Step2_EducationExperience';
import Step3_Skills from './steps/Step3_Skills';
import Step4_InterestsValues from './steps/Step4_InterestsValues';
import Step5_Expectations from './steps/Step5_Expectations';
import Step6_SummaryReview from './steps/Step6_SummaryReview';

interface CareerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: ProcessedCareerOnboardingData) => void;
  initialData?: Partial<CareerOnboardingData>; // Optional initial data to prefill
}

const TOTAL_STEPS = 6;

export const CareerOnboardingModal: React.FC<CareerOnboardingModalProps> = ({ isOpen, onClose, onComplete, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CareerOnboardingData>({
    educationLevel: '',
    workExperienceSummary: '',
    skillsString: '',
    interestsString: '',
    valuesString: '',
    initialCareerExpectations: '',
    ...initialData, // Spread initialData to prefill if provided
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => { // Reset to step 1 when modal is reopened, unless initial data is present
    if (isOpen && !initialData) {
      setCurrentStep(1);
      setFormData({
        educationLevel: '',
        workExperienceSummary: '',
        skillsString: '',
        interestsString: '',
        valuesString: '',
        initialCareerExpectations: '',
      });
    } else if (isOpen && initialData) {
         setCurrentStep(1); // Start from step 1 even with initial data for review/confirmation
    }
  }, [isOpen, initialData]);


  const updateData = (stepData: Partial<CareerOnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const processAndComplete = () => {
    const processedData: ProcessedCareerOnboardingData = {
      ...formData,
      interestsArray: formData.interestsString ? formData.interestsString.split(',').map(s => s.trim()).filter(s => s) : [],
      valuesArray: formData.valuesString ? formData.valuesString.split(',').map(s => s.trim()).filter(s => s) : [],
    };
    onComplete(processedData);
  };

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_Welcome />;
      case 2:
        return <Step2_EducationExperience data={formData} updateData={updateData} />;
      case 3:
        return <Step3_Skills data={formData} updateData={updateData} />;
      case 4:
        return <Step4_InterestsValues data={formData} updateData={updateData} />;
      case 5:
        return <Step5_Expectations data={formData} updateData={updateData} />;
      case 6:
        return <Step6_SummaryReview data={formData} />;
      default:
        return <p>Unknown step</p>;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Career Planner Onboarding (Step {currentStep} of {TOTAL_STEPS})</DialogTitle>
          <DialogDescription>
            Help us understand your career profile and goals.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progressValue} className="w-full my-4 h-2" />

        <div className="overflow-y-auto p-1 pr-2 flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
         {renderStepContent()}
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {currentStep < TOTAL_STEPS && (
            <Button onClick={handleNext} className="ml-auto">
              Next
            </Button>
          )}
          {currentStep === TOTAL_STEPS && (
            <Button onClick={processAndComplete} className="ml-auto">
              Finish & Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
