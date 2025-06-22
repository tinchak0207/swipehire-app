'use client';

import { type FormEvent, useState } from 'react';

interface QuestionnaireData {
  education: string;
  experience: string[];
  skills: string[];
  interests: string[];
  values: string[];
  careerExpectations: string;
}

export default function CareerQuestionnaire({
  onSubmit,
}: {
  onSubmit: (data: QuestionnaireData) => void;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<QuestionnaireData>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 6) {
      setStep(step + 1);
    } else {
      onSubmit(formData as QuestionnaireData);
    }
  };

  const handleChange = (field: keyof QuestionnaireData, value: any) => {
    setFormData((prev: Partial<QuestionnaireData>) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 1 && (
        <div>
          <h2 className="mb-4 font-bold text-2xl">Education Background</h2>
          <input
            type="text"
            value={formData.education || ''}
            onChange={(e) => handleChange('education', e.target.value)}
            placeholder="Your highest education level"
            className="w-full rounded border p-2"
            required
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-4 font-bold text-2xl">Work Experience</h2>
          <textarea
            value={formData.experience?.join('\n') || ''}
            onChange={(e) => handleChange('experience', e.target.value.split('\n'))}
            placeholder="List your work experience (one per line)"
            className="h-32 w-full rounded border p-2"
            required
          />
        </div>
      )}

      {/* Similar steps for skills, interests, values and career expectations */}

      <div className="flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded bg-gray-200 px-4 py-2"
          >
            Back
          </button>
        )}
        <button type="submit" className="ml-auto rounded bg-blue-500 px-4 py-2 text-white">
          {step === 6 ? 'Submit' : 'Next'}
        </button>
      </div>
    </form>
  );
}
