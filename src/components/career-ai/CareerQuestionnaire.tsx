'use client'

import { FormEvent, useState } from 'react'

interface QuestionnaireData {
  education: string
  experience: string[]
  skills: string[]
  interests: string[]
  values: string[]
  careerExpectations: string
}

export default function CareerQuestionnaire({ onSubmit }: { onSubmit: (data: QuestionnaireData) => void }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<QuestionnaireData>>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (step < 6) {
      setStep(step + 1)
    } else {
      onSubmit(formData as QuestionnaireData)
    }
  }

  const handleChange = (field: keyof QuestionnaireData, value: any) => {
    setFormData((prev: Partial<QuestionnaireData>) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Education Background</h2>
          <input
            type="text"
            value={formData.education || ''}
            onChange={(e) => handleChange('education', e.target.value)}
            placeholder="Your highest education level"
            className="w-full p-2 border rounded"
            required
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Work Experience</h2>
          <textarea
            value={formData.experience?.join('\n') || ''}
            onChange={(e) => handleChange('experience', e.target.value.split('\n'))}
            placeholder="List your work experience (one per line)"
            className="w-full p-2 border rounded h-32"
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
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded ml-auto"
        >
          {step === 6 ? 'Submit' : 'Next'}
        </button>
      </div>
    </form>
  )
}
