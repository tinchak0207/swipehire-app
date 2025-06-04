
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepsMeta = [
  { number: 1, title: "Your Input" },
  { number: 2, title: "Craft Script" },
  { number: 3, title: "Presentation" },
  { number: 4, title: "Review" },
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
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold border-2 transition-all duration-300",
                  currentStep > step.number ? "bg-green-500 border-green-600 text-white" :
                  currentStep === step.number ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg" :
                  "bg-muted border-border text-muted-foreground"
                )}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <p className={cn(
                "mt-1.5 text-xs sm:text-sm font-medium transition-colors duration-300",
                currentStep === step.number ? "text-primary" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
            </div>
            {index < totalSteps - 1 && (
              <div className={cn(
                "flex-1 h-1 mx-1 sm:mx-2 rounded transition-colors duration-300",
                currentStep > step.number ? "bg-green-500" : "bg-border"
              )}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

    