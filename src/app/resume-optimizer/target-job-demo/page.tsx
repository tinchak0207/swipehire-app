'use client';

import { useState } from 'react';
import type { TargetJobFormData } from '@/components/resume-optimizer/TargetJobInputForm';
import TargetJobInputForm, {
  useTargetJobForm,
} from '@/components/resume-optimizer/TargetJobInputForm';

/**
 * Demo page for the Target Job Input Form component
 */
export default function TargetJobDemoPage() {
  const [submittedData, setSubmittedData] = useState<TargetJobFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { formData, isValid, handleChange, reset } = useTargetJobForm({
    title: 'Senior Software Engineer',
    keywords: 'React, TypeScript, Node.js',
  });

  const handleSubmit = async (data: TargetJobFormData) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSubmittedData(data);
    setIsLoading(false);
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl text-gray-900">Target Job Input Form Demo</h1>
          <p className="mx-auto max-w-2xl text-gray-600 text-xl">
            This component allows users to specify their target job information for resume
            optimization. It includes validation, real-time feedback, and accessibility features.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 font-bold text-2xl text-gray-900">Target Job Information</h2>

            <TargetJobInputForm
              initialData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              showSubmitButton
              submitButtonText="Analyze Resume"
              validateOnChange
              className="space-y-6"
            />

            {/* Reset Button */}
            <div className="mt-6 border-gray-200 border-t pt-6">
              <button onClick={handleReset} className="btn btn-outline btn-sm" disabled={isLoading}>
                Reset Form
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Current State */}
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <h3 className="mb-4 font-bold text-gray-900 text-xl">Current Form State</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Valid:</span>
                  <span className={`badge ${isValid ? 'badge-success' : 'badge-error'}`}>
                    {isValid ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Title:</span>
                  <span className="text-gray-600 text-sm">{formData.title || 'Not set'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Keywords:</span>
                  <span className="text-gray-600 text-sm">
                    {formData.keywords ? `${formData.keywords.split(',').length} items` : 'None'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Company:</span>
                  <span className="text-gray-600 text-sm">
                    {formData.company || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submitted Data */}
            {submittedData && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
                <h3 className="mb-4 font-bold text-green-900 text-xl">
                  ✅ Form Submitted Successfully!
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-green-800">Job Title:</span>
                    <p className="mt-1 text-green-700">{submittedData.title}</p>
                  </div>

                  {submittedData.keywords && (
                    <div>
                      <span className="font-medium text-green-800">Keywords:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {submittedData.keywords.split(',').map((keyword, index) => (
                          <span key={index} className="badge badge-success badge-sm">
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {submittedData.company && (
                    <div>
                      <span className="font-medium text-green-800">Company:</span>
                      <p className="mt-1 text-green-700">{submittedData.company}</p>
                    </div>
                  )}

                  {submittedData.description && (
                    <div>
                      <span className="font-medium text-green-800">Description:</span>
                      <p className="mt-1 text-green-700 text-sm">
                        {submittedData.description.substring(0, 100)}
                        {submittedData.description.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <h3 className="mb-4 font-bold text-gray-900 text-xl">Component Features</h3>

              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Real-time validation with error messages
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Keywords parsing with badge display
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Accessibility support with ARIA attributes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Loading states and disabled inputs
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Form summary with entered information
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Responsive design with DaisyUI components
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-12 rounded-2xl bg-gray-900 p-8 text-white">
          <h3 className="mb-4 font-bold text-xl">Usage Example</h3>
          <pre className="overflow-x-auto text-sm">
            <code>{`import TargetJobInputForm, { useTargetJobForm } from '@/components/resume-optimizer/TargetJobInputForm';

function MyComponent() {
  const { formData, isValid, handleChange } = useTargetJobForm();

  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
  };

  return (
    <TargetJobInputForm
      initialData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      showSubmitButton
      validateOnChange
    />
  );
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
