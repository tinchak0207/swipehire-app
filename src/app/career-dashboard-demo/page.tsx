'use client';

import React, { useState } from 'react';
import CareerDashboard from '@/components/career-ai/CareerDashboard';

// Sample user data for different career stages
const sampleUserProfiles = {
  earlyCareer: {
    education: 'Bachelor in Computer Science',
    experience: ['Junior Developer at StartupXYZ (1 year)', 'Intern at TechCorp (6 months)'],
    skills: ['JavaScript', 'React', 'HTML/CSS', 'Git'],
    interests: ['Web Development', 'Mobile Apps', 'UI/UX Design'],
    values: ['Learning', 'Innovation', 'Work-life balance'],
    careerExpectations: 'Software Engineer'
  },
  midCareer: {
    education: 'Master in Software Engineering',
    experience: [
      'Senior Software Engineer at TechCorp (3 years)',
      'Software Engineer at StartupXYZ (2 years)',
      'Junior Developer at WebAgency (1.5 years)'
    ],
    skills: ['TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'System Design'],
    interests: ['Architecture', 'Team Leadership', 'Mentoring', 'AI/ML'],
    values: ['Impact', 'Growth', 'Team collaboration', 'Technical excellence'],
    careerExpectations: 'Engineering Manager'
  },
  lateCareer: {
    education: 'PhD in Computer Science',
    experience: [
      'VP of Engineering at ScaleupCorp (4 years)',
      'Engineering Director at TechGiant (5 years)',
      'Senior Engineering Manager at StartupUnicorn (3 years)',
      'Principal Engineer at TechCorp (2 years)'
    ],
    skills: [
      'Strategic Planning', 'Team Building', 'Architecture', 'Product Strategy',
      'Stakeholder Management', 'Budget Planning', 'Hiring', 'Mentoring'
    ],
    interests: ['Strategic Leadership', 'Industry Speaking', 'Board Advisory', 'Investing'],
    values: ['Vision', 'Legacy', 'Industry impact', 'Mentoring next generation'],
    careerExpectations: 'Chief Technology Officer'
  },
  transition: {
    education: 'MBA + Bachelor in Engineering',
    experience: [
      'Product Manager at TechCorp (2 years)',
      'Senior Software Engineer at StartupXYZ (4 years)',
      'Software Engineer at WebAgency (3 years)'
    ],
    skills: [
      'Product Management', 'Software Engineering', 'Data Analysis',
      'User Research', 'Agile', 'Stakeholder Management'
    ],
    interests: ['Product Strategy', 'User Experience', 'Market Research', 'Entrepreneurship'],
    values: ['User impact', 'Innovation', 'Cross-functional collaboration'],
    careerExpectations: 'Senior Product Manager'
  }
};

export default function CareerDashboardDemo() {
  const [selectedProfile, setSelectedProfile] = useState<keyof typeof sampleUserProfiles>('midCareer');
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileChange = (profile: keyof typeof sampleUserProfiles) => {
    setIsLoading(true);
    setSelectedProfile(profile);
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 500);
  };

  const profileLabels = {
    earlyCareer: 'Early Career (1-3 years)',
    midCareer: 'Mid Career (4-8 years)',
    lateCareer: 'Late Career (10+ years)',
    transition: 'Career Transition'
  };

  const profileDescriptions = {
    earlyCareer: 'Recent graduate starting their tech career',
    midCareer: 'Experienced engineer considering leadership roles',
    lateCareer: 'Senior executive with extensive experience',
    transition: 'Engineer transitioning to product management'
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-primary-content">
              Career Dashboard Demo
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto text-primary-content">
              Explore how our AI-powered career dashboard adapts to different career stages and provides personalized insights.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Selector */}
        <div className="card bg-base-200 shadow-xl mb-8 border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6 text-base-content">
              <svg className="w-8 h-8 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Choose a Career Profile to Explore
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(profileLabels).map(([key, label]) => (
                <div
                  key={key}
                  className={`
                    card cursor-pointer transition-all duration-300 hover:shadow-lg border
                    ${selectedProfile === key 
                      ? 'bg-primary text-primary-content ring-2 ring-primary border-primary' 
                      : 'bg-base-100 hover:bg-base-300 text-base-content border-base-300 hover:border-primary/50'
                    }
                  `}
                  onClick={() => handleProfileChange(key as keyof typeof sampleUserProfiles)}
                >
                  <div className="card-body p-4 text-center">
                    <h3 className={`font-bold text-sm mb-2 ${selectedProfile === key ? 'text-primary-content' : 'text-base-content'}`}>
                      {label}
                    </h3>
                    <p className={`
                      text-xs
                      ${selectedProfile === key 
                        ? 'text-primary-content opacity-90' 
                        : 'text-base-content opacity-70'
                      }
                    `}>
                      {profileDescriptions[key as keyof typeof profileDescriptions]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Profile Info */}
            <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
              <h3 className="font-semibold text-base-content mb-2">
                Current Profile: {profileLabels[selectedProfile]}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-base-content">
                <div>
                  <span className="font-medium text-base-content">Experience:</span>
                  <ul className="list-disc list-inside ml-2 text-base-content opacity-80">
                    {sampleUserProfiles[selectedProfile].experience.slice(0, 2).map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                    {sampleUserProfiles[selectedProfile].experience.length > 2 && (
                      <li>+ {sampleUserProfiles[selectedProfile].experience.length - 2} more...</li>
                    )}
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-base-content">Key Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sampleUserProfiles[selectedProfile].skills.slice(0, 4).map((skill, i) => (
                      <span key={i} className="badge badge-info badge-sm">{skill}</span>
                    ))}
                    {sampleUserProfiles[selectedProfile].skills.length > 4 && (
                      <span className="badge badge-outline badge-sm text-base-content">
                        +{sampleUserProfiles[selectedProfile].skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-4 text-base-content opacity-70">Loading career insights...</p>
            </div>
          </div>
        )}

        {/* Career Dashboard */}
        {!isLoading && (
          <div className="animate-fadeIn">
            <CareerDashboard userData={sampleUserProfiles[selectedProfile]} />
          </div>
        )}

        {/* Features Showcase */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="card-title justify-center text-base-content mb-2">AI-Powered Paths</h3>
              <p className="text-base-content opacity-80">
                Get personalized career recommendations based on your experience, skills, and goals.
              </p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="card-title justify-center text-base-content mb-2">Goal Tracking</h3>
              <p className="text-base-content opacity-80">
                Set and track short-term, mid-term, and long-term career goals with visual progress indicators.
              </p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="card-title justify-center text-base-content mb-2">Progress Analytics</h3>
              <p className="text-base-content opacity-80">
                Monitor your career development with detailed analytics and skill gap analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 text-base-content">
              <svg className="w-8 h-8 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Technical Implementation
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-base-content">Technologies Used</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="badge badge-primary badge-sm">React 18</span>
                    <span className="text-sm text-base-content">Modern React with hooks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="badge badge-secondary badge-sm">TypeScript</span>
                    <span className="text-sm text-base-content">Strict type safety</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="badge badge-accent badge-sm">DaisyUI</span>
                    <span className="text-sm text-base-content">Component library</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="badge badge-info badge-sm">TailwindCSS</span>
                    <span className="text-sm text-base-content">Utility-first styling</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-base-content">Key Features</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-base-content">Responsive design for all devices</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-base-content">Accessibility-first development</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-base-content">Error handling and loading states</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-base-content">Performance optimized</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}