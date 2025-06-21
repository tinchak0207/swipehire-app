'use client';

import React, { useState } from 'react';
import type { WizardData } from '../WizardContainer';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType, CompanyScale } from '@/lib/types';
import CareerQuestionnaire from '@/components/career-ai/CareerQuestionnaire';

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
  isLoading 
}: ProfileSetupStepProps) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [formData, setFormData] = useState(data.profileData);

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate({ profileData: updatedData });
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    handleInputChange('skills', skills);
  };

  const handleCultureHighlightsChange = (value: string) => {
    const highlights = value.split(',').map(highlight => highlight.trim()).filter(highlight => highlight.length > 0);
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
    ? formData.headline && formData.experienceSummary && formData.skills && formData.skills.length > 0
    : formData.companyName && formData.companyIndustry && formData.companyDescription;

  if (showQuestionnaire && isJobSeeker) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowQuestionnaire(false)}
            className="btn btn-ghost btn-sm"
          >
            ← Back to Manual Setup
          </button>
        </div>
        <CareerQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-base-content mb-2">
          {isJobSeeker ? 'Build Your Profile' : 'Company Information'}
        </h2>
        <p className="text-base-content/60">
          {isJobSeeker 
            ? 'Tell us about your background and career goals'
            : 'Help candidates learn about your company and opportunities'
          }
        </p>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          {isJobSeeker && (
            <>
              {/* Career Questionnaire Option */}
              <div className="mb-6 p-4 bg-info/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base-content mb-1">
                      🤖 AI-Powered Career Assessment
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Let our AI guide you through a comprehensive career questionnaire
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="btn btn-info btn-sm"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>

              <div className="divider">OR</div>

              {/* Manual Profile Setup for Job Seekers */}
              <div className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Professional Headline *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Software Engineer | Full-Stack Developer"
                    className="input input-bordered"
                    value={formData.headline || ''}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Experience Summary *</span>
                  </label>
                  <textarea
                    placeholder="Describe your professional background, key achievements, and what makes you unique..."
                    className="textarea textarea-bordered h-32"
                    value={formData.experienceSummary || ''}
                    onChange={(e) => handleInputChange('experienceSummary', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Skills *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="JavaScript, React, Node.js, Python, etc. (comma-separated)"
                    className="input input-bordered"
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                  />
                  <label className="label">
                    <span className="label-text-alt">Separate skills with commas</span>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Experience Level</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={formData.workExperienceLevel || ''}
                      onChange={(e) => handleInputChange('workExperienceLevel', e.target.value)}
                    >
                      <option value="">Select level</option>
                      {Object.values(WorkExperienceLevel).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Education Level</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={formData.educationLevel || ''}
                      onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                    >
                      <option value="">Select education</option>
                      {Object.values(EducationLevel).map(level => (
                        <option key={level} value={level}>{level.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Location Preference</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={formData.locationPreference || ''}
                      onChange={(e) => handleInputChange('locationPreference', e.target.value)}
                    >
                      <option value="">Select preference</option>
                      {Object.values(LocationPreference).map(pref => (
                        <option key={pref} value={pref}>{pref.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Availability</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={formData.availability || ''}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                    >
                      <option value="">Select availability</option>
                      {Object.values(Availability).map(avail => (
                        <option key={avail} value={avail}>{avail.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Desired Work Style</span>
                  </label>
                  <textarea
                    placeholder="Describe your ideal work environment, team dynamics, and work-life balance preferences..."
                    className="textarea textarea-bordered"
                    value={formData.desiredWorkStyle || ''}
                    onChange={(e) => handleInputChange('desiredWorkStyle', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Minimum Salary Expectation</span>
                    </label>
                    <input
                      type="number"
                      placeholder="50000"
                      className="input input-bordered"
                      value={formData.salaryExpectationMin || ''}
                      onChange={(e) => handleInputChange('salaryExpectationMin', parseInt(e.target.value) || undefined)}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Maximum Salary Expectation</span>
                    </label>
                    <input
                      type="number"
                      placeholder="80000"
                      className="input input-bordered"
                      value={formData.salaryExpectationMax || ''}
                      onChange={(e) => handleInputChange('salaryExpectationMax', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {isRecruiter && (
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Company Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Your company name"
                  className="input input-bordered"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Industry *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="input input-bordered"
                    value={formData.companyIndustry || ''}
                    onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Company Size</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.companyScale || ''}
                    onChange={(e) => handleInputChange('companyScale', e.target.value)}
                  >
                    <option value="">Select size</option>
                    {Object.values(CompanyScale).map(scale => (
                      <option key={scale} value={scale}>{scale}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Company Description *</span>
                </label>
                <textarea
                  placeholder="Describe your company's mission, values, and what makes it a great place to work..."
                  className="textarea textarea-bordered h-32"
                  value={formData.companyDescription || ''}
                  onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Culture Highlights</span>
                </label>
                <input
                  type="text"
                  placeholder="Innovation, Work-life balance, Remote-friendly, etc. (comma-separated)"
                  className="input input-bordered"
                  value={formData.companyCultureHighlights?.join(', ') || ''}
                  onChange={(e) => handleCultureHighlightsChange(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt">Separate highlights with commas</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Current Hiring Needs</span>
                </label>
                <textarea
                  placeholder="Describe the types of roles you're looking to fill and key requirements..."
                  className="textarea textarea-bordered"
                  value={formData.companyNeeds || ''}
                  onChange={(e) => handleInputChange('companyNeeds', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="btn btn-ghost"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Saving...
            </>
          ) : (
            <>
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}