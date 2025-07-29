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
  data: Partial<WizardData>;
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

  const handleInputChange = (field: keyof WizardData, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleSkillsChange = (value: string) => {
    const skills = value
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
    onUpdate({ skills });
  };

  const handleCultureHighlightsChange = (value: string) => {
    const highlights = value
      .split(',')
      .map((highlight) => highlight.trim())
      .filter((highlight) => highlight.length > 0);
    onUpdate({ companyCultureHighlights: highlights });
  };

  const handleQuestionnaireSubmit = (questionnaireData: any) => {
    // Map questionnaire data to profile data
    const mappedData: Partial<WizardData> = {
      experienceSummary: questionnaireData.experience?.join('\n') || data.experienceSummary,
      skills: questionnaireData.skills || data.skills,
      // Add other mappings as needed
    };
    onUpdate(mappedData);
    setShowQuestionnaire(false);
  };

  const isJobSeeker = data.role === 'jobseeker';
  const isRecruiter = data.role === 'recruiter';

  // Validation
  /*const canProceed = isJobSeeker
    ? formData.headline &&
      formData.experienceSummary &&
      formData.skills &&
      formData.skills.length > 0
    : formData.companyName && formData.companyIndustry && formData.companyDescription;*/

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
              {/* Info box for job seekers */}
              <div className="mb-8 rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
                  <div className="mr-4 mb-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <svg
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-gray-800 text-lg">
                      Why we ask for this information
                    </h3>
                    <p className="text-gray-600">
                      This helps us match you with the most relevant opportunities and provide
                      personalized career recommendations. All information is kept confidential.
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowQuestionnaire(true)}
                    className="rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-gray-600 hover:to-gray-700 hover:shadow-xl"
                  >
                    Enhance with AI Career Analysis
                  </button>
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
                    value={data.headline || ''}
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
                    value={data.experienceSummary || ''}
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
                    value={data.skills?.join(', ') || ''}
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
                      value={data.workExperienceLevel || ''}
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
                      value={data.educationLevel || ''}
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
                      value={data.locationPreference || ''}
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
                      value={data.availability || ''}
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
                    value={data.desiredWorkStyle || ''}
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
                      value={data.salaryExpectationMin || ''}
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
                      value={data.salaryExpectationMax || ''}
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
                  value={data.companyName || ''}
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
                    value={data.companyIndustry || ''}
                    onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="mb-3 block">
                    <span className="font-semibold text-gray-800">Company Size</span>
                  </label>
                  <select
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-4 text-black backdrop-blur-sm transition-all duration-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    value={data.companyScale || ''}
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
                  value={data.companyDescription || ''}
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
                  value={data.companyCultureHighlights?.join(', ') || ''}
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
                  value={data.companyNeeds || ''}
                  onChange={(e) => handleInputChange('companyNeeds', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex items-center justify-between">
        <button onClick={onBack} className="btn btn-ghost gap-2" disabled={isLoading}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          disabled={isLoading}
          className="btn btn-primary btn-lg gap-2 rounded-lg"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
