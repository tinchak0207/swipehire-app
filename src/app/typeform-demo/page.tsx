'use client';

import { useState } from 'react';
import type { SalaryQueryFormData } from '@/components/TypeformSalaryQuery';
import { TypeformSalaryQuery } from '@/components/TypeformSalaryQuery';

/**
 * Demo page showcasing the Typeform-style salary query component
 */
export default function TypeformDemoPage() {
  const [submittedData, setSubmittedData] = useState<SalaryQueryFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: SalaryQueryFormData) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSubmittedData(data);
    setIsLoading(false);
  };

  const handleReset = () => {
    setSubmittedData(null);
    setIsLoading(false);
  };

  if (submittedData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/50 to-indigo-900/30 p-4">
        <div className="mx-auto max-w-2xl space-y-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl">🎉</div>
            <h1 className="font-bold text-4xl text-white">Thank you!</h1>
            <p className="text-white/80 text-xl">We've received your salary query information.</p>
          </div>

          <div className="card border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm">
            <div className="card-body">
              <h2 className="card-title mb-4 text-white">Your Submission:</h2>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-white/70">Job Title:</span>
                  <span className="font-medium text-white">{submittedData.jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Industry:</span>
                  <span className="font-medium text-white">{submittedData.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Region:</span>
                  <span className="font-medium text-white">{submittedData.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Experience:</span>
                  <span className="font-medium text-white">{submittedData.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Education:</span>
                  <span className="font-medium text-white">{submittedData.education}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Company Size:</span>
                  <span className="font-medium text-white">{submittedData.companySize}</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleReset} className="btn btn-primary btn-lg">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return <TypeformSalaryQuery onSubmitAction={handleFormSubmit} loading={isLoading} />;
}
