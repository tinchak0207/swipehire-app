'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepsMeta = [
  { number: 1, title: 'Company Info' },
  { number: 2, title: 'Verification' },
  { number: 3, title: 'Your Account' },
  { number: 4, title: 'Get Started' },
];

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="w-full px-2 sm:px-0">
      <div className="flex items-center justify-between">
        {stepsMeta.slice(0, totalSteps).map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-300 sm:h-10 sm:w-10 sm:text-base',
                  currentStep > step.number
                    ? 'border-green-600 bg-green-500 text-white'
                    : currentStep === step.number
                      ? 'scale-110 border-primary bg-primary text-primary-foreground shadow-lg'
                      : 'border-border bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <p
                className={cn(
                  'mt-1.5 font-medium text-xs transition-colors duration-300 sm:text-sm',
                  currentStep === step.number ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'mx-1 h-1 flex-1 rounded transition-colors duration-300 sm:mx-2',
                  currentStep > step.number ? 'bg-green-500' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
