import { useState } from 'react';
import CareerQuestionnaire from '@/components/career-ai/CareerQuestionnaire';
import {
  Availability,
  CompanyScale,
  EducationLevel,
  LocationPreference,
  WorkExperienceLevel,
} from '@/lib/types';
import type { WizardData } from '../WizardContainer';

interface ProfileSetupStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function ProfileSetupStep({
  data,
  onUpdate,
  onNext,
  onBack,
  isLoading,
}: ProfileSetupStepProps) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [formData, setFormData] = useState(data.profileData);

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate({ profileData: updatedData });
  };

  const handleSkillsChange = (value: string) => {
    const skills = value
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
    handleInputChange('skills', skills);
  };

  const handleCultureHighlightsChange = (value: string) => {
    const highlights = value
      .split(',')
      .map((highlight) => highlight.trim())
      .filter((highlight) => highlight.length > 0);
    handleInputChange('companyCultureHighlights', highlights);
  };

  const handleQuestionnaireSubmit = (questionnaireData: any) => {
    // Map questionnaire data to profile data
    const mappedData = {
      ...formData,
      experienceSummary: questionnaireData.experience?.join('\n') || formData.experienceSummary,
      skills: questionnaireData.skills || formData.skills,
      // Add other mappings as needed
    };
    setFormData(mappedData);
    onUpdate({ profileData: mappedData });
    setShowQuestionnaire(false);
  };

  const isJobSeeker = data.userType === 'jobseeker';
  const isRecruiter = data.userType === 'recruiter';

  // Validation
  const canProceed = isJobSeeker
    ? formData.headline &&
      formData.experienceSummary &&
      formData.skills &&
      formData.skills.length > 0
    : formData.companyName && formData.companyIndustry && formData.companyDescription;

  if (showQuestionnaire && isJobSeeker) {
    return (
      <div className="mx-auto max-w-4xl animate-fade-in">
        <div className="mb-8">
          <button
            onClick={() => setShowQuestionnaire(false)}
            className="flex items-center font-medium text-gray-600 transition-colors duration-200 hover:text-gray-800"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back to Manual Setup
          </button>
        </div>
        <CareerQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-bold text-4xl text-gray-800">
          {isJobSeeker ? 'Build Your Profile' : 'Company Information'}
        </h2>
        <p className="text-gray-600 text-xl">
          {isJobSeeker
            ? 'Tell us about your background and career goals'
            : 'Help candidates learn about your company and opportunities'}
        </p>
      </div>

      <div className="rounded-3xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-sm">
        <div className="p-8 md:p-12">
          {isJobSeeker && (
            <>
              {/* Career Questionnaire Option */}
              <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-2 flex items-center font-bold text-gray-800 text-lg">
                      <span className="mr-2">🤖</span>
                      AI-Powered Career Assessment
                    </h3>
                    <p className="text-gray-600">
                      Let our AI guide you through a comprehensive career questionnaire
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-gray-200 border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 font-medium text-gray-500">OR</span>
                </div>
              </div>

              {/* Manual Profile Setup for Job Seekers */}
              <div className="space-y-8">
                <div className="form-control">
                  <label className="mb-3 block">
                    <span className="font-semibold text-gray-800 text-lg">
                      Professional Headline *
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Software Engineer | Full-Stack Developer"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    value={formData.headline || ''}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="mb-3 block">
                    <span className="font-semibold text-gray-800 text-lg">
                      Experience Summary *
                    </span>
                  </label>
                  <textarea
                    placeholder="Describe your professional background, key achievements, and what makes you unique..."
                    className="h-32 w-full resize-none rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    value={formData.experienceSummary || ''}
                    onChange={(e) => handleInputChange('experienceSummary', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="mb-3 block">
                    <span className="font-semibold text-gray-800 text-lg">Skills *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="JavaScript, React, Node.js, Python, etc. (comma-separated)"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                  />
                  <p className="mt-2 text-gray-500 text-sm">Separate skills with commas</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="form-control">
                    <label className="mb-3 block">
                      <span className="font-semibold text-gray-800">Experience Level</span>
                    </label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      value={formData.workExperienceLevel || ''}
                      onChange={(e) => handleInputChange('workExperienceLevel', e.target.value)}
                    >
                      <option value="">Select level</option>
                      {Object.values(WorkExperienceLevel).map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="mb-3 block">
                      <span className="font-semibold text-gray-800">Education Level</span>
                    </label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      value={formData.educationLevel || ''}
                      onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                    >
                      <option value="">Select education</option>
                      {Object.values(EducationLevel).map((level) => (
                        <option key={level} value={level}>
                          {level.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="form-control">
                    <label className="mb-3 block">
                      <span className="font-semibold text-gray-800">Location Preference</span>
                    </label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      value={formData.locationPreference || ''}
                      onChange={(e) => handleInputChange('locationPreference', e.target.value)}
                    >
                      <option value="">Select preference</option>
                      {Object.values(LocationPreference).map((pref) => (
                        <option key={pref} value={pref}>
                          {pref.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="mb-3 block">
                      <span className="font-semibold text-gray-800">Availability</span>
                    </label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      value={formData.availability || ''}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                    >
                      <option value="">Select availability</option>
                      {Object.values(Availability).map((avail) => (
                        <option key={avail} value={avail}>
                          {avail.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="mb-3 block">
                    <span className="font-semibold text-gray-800">Desired Work Style</span>
                  </label>
                  <textarea
                    placeholder="Describe your ideal work environment, team dynamics, and work-life balance preferences..."
                    className="h-24 w-full resize-none rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    value={formData.desiredWorkStyle || ''}
                    onChange={(e) => handleInputChange('desiredWorkStyle', e.target.value)}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="form-control">
                    <label className="mb-3 block">
                      <span className="font-semibold text-gray-800">
                        Minimum Salary Expectation
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="50000"
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      value={formData.salaryExpectationMin || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'salaryExpectationMin',
                          Number.parseInt(e.target.value) || undefined
                        )
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="mb-3 block">
                      <span className="font-semibold text-gray-800">
                        Maximum Salary Expectation
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="80000"
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      value={formData.salaryExpectationMax || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'salaryExpectationMax',
                          Number.parseInt(e.target.value) || undefined
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {isRecruiter && (
            <div className="space-y-8">
              <div className="form-control">
                <label className="mb-3 block">
                  <span className="font-semibold text-gray-800 text-lg">Company Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Your company name"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="form-control">
                  <label className="mb-3 block">
                    <span className="font-semibold text-gray-800 text-lg">Industry *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    value={formData.companyIndustry || ''}
                    onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="mb-3 block">
                    <span className="font-semibold text-gray-800">Company Size</span>
                  </label>
                  <select
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    value={formData.companyScale || ''}
                    onChange={(e) => handleInputChange('companyScale', e.target.value)}
                  >
                    <option value="">Select size</option>
                    {Object.values(CompanyScale).map((scale) => (
                      <option key={scale} value={scale}>
                        {scale}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="mb-3 block">
                  <span className="font-semibold text-gray-800 text-lg">Company Description *</span>
                </label>
                <textarea
                  placeholder="Describe your company's mission, values, and what makes it a great place to work..."
                  className="h-32 w-full resize-none rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  value={formData.companyDescription || ''}
                  onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="mb-3 block">
                  <span className="font-semibold text-gray-800">Culture Highlights</span>
                </label>
                <input
                  type="text"
                  placeholder="Innovation, Work-life balance, Remote-friendly, etc. (comma-separated)"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  value={formData.companyCultureHighlights?.join(', ') || ''}
                  onChange={(e) => handleCultureHighlightsChange(e.target.value)}
                />
                <p className="mt-2 text-gray-500 text-sm">Separate highlights with commas</p>
              </div>

              <div className="form-control">
                <label className="mb-3 block">
                  <span className="font-semibold text-gray-800">Current Hiring Needs</span>
                </label>
                <textarea
                  placeholder="Describe the types of roles you're looking to fill and key requirements..."
                  className="h-24 w-full resize-none rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  value={formData.companyNeeds || ''}
                  onChange={(e) => handleInputChange('companyNeeds', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center font-medium text-gray-600 transition-colors duration-200 hover:text-gray-800"
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={`rounded-xl px-8 py-4 font-bold text-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
            canProceed && !isLoading
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105 hover:from-green-600 hover:to-green-700'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          {isLoading ? (
            <>
              <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-white border-b-2" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <svg
                className="ml-2 inline h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
