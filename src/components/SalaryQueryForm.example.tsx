/**
 * Example usage of the SalaryQueryForm component
 *
 * This file demonstrates how to integrate the SalaryQueryForm component
 * into a page or application.
 */

'use client';

import type React from 'react';
import { useState } from 'react';
import SalaryQueryForm, { type SalaryQueryFormData } from './SalaryQueryForm';

export const SalaryQueryFormExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<SalaryQueryFormData | null>(null);

  const handleFormSubmit = async (data: SalaryQueryFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      console.log('Submitting salary query:', data);

      // In a real application, you would call your salary data service here
      // const results = await salaryDataService.querySalaryData(data);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmittedData(data);
    } catch (error) {
      console.error('Error submitting salary query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initialData = {
    jobTitle: 'Software Engineer',
    industry: 'technology',
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-4 font-bold text-3xl">Salary Query Example</h1>
        <p className="text-base-content/70">
          This example demonstrates the SalaryQueryForm component with form validation, loading
          states, and accessibility features.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form Section */}
        <div>
          <SalaryQueryForm
            loading={isLoading}
            initialData={initialData}
            onSubmitAction={handleFormSubmit}
          />
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">Form State</h2>

          {isLoading && (
            <div className="alert alert-info">
              <span className="loading loading-spinner loading-sm" />
              <span>Searching for salary data...</span>
            </div>
          )}

          {submittedData && !isLoading && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">Last Submitted Data</h3>
                <div className="space-y-2">
                  <div>
                    <strong>Job Title:</strong> {submittedData.jobTitle}
                  </div>
                  <div>
                    <strong>Industry:</strong> {submittedData.industry}
                  </div>
                  <div>
                    <strong>Region:</strong> {submittedData.region}
                  </div>
                  <div>
                    <strong>Experience:</strong> {submittedData.experience}
                  </div>
                  <div>
                    <strong>Education:</strong> {submittedData.education}
                  </div>
                  <div>
                    <strong>Company Size:</strong> {submittedData.companySize}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!submittedData && !isLoading && (
            <div className="alert alert-warning">
              <span>Fill out and submit the form to see the results here.</span>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12">
        <h2 className="mb-4 font-semibold text-2xl">Component Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">Form Validation</h3>
              <p className="text-sm">
                Client-side validation using Zod schema with real-time error feedback.
              </p>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">Accessibility</h3>
              <p className="text-sm">
                WCAG 2.1 AA compliant with proper ARIA attributes and keyboard navigation.
              </p>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">Loading States</h3>
              <p className="text-sm">
                Proper loading indicators and disabled states during form submission.
              </p>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">DaisyUI Styling</h3>
              <p className="text-sm">
                Consistent styling using DaisyUI components and TailwindCSS utilities.
              </p>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">TypeScript</h3>
              <p className="text-sm">
                Fully typed with TypeScript interfaces and strict type checking.
              </p>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">Responsive Design</h3>
              <p className="text-sm">
                Mobile-first responsive design that works on all screen sizes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryQueryFormExample;
