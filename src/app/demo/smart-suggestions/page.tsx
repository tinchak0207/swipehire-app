/**
 * Smart Suggestions Engine Demo Page
 *
 * Interactive demo page to test the Smart Suggestions Engine component
 */

'use client';

import { useState } from 'react';
import type { SmartSuggestion } from '@/components/resume-optimizer/suggestions';
import { SmartSuggestionsEngine } from '@/components/resume-optimizer/suggestions';

export default function SmartSuggestionsDemo() {
  const [content, setContent] = useState(
    'I helped with various tasks and was responsible for managing projects. I worked on different initiatives and assisted team members with their work. I participated in meetings and contributed to team discussions.'
  );
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetIndustry, setTargetIndustry] = useState('technology');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior' | 'executive'>(
    'mid'
  );
  const [enableRealTime, setEnableRealTime] = useState(true);
  const [enableMLSuggestions, setEnableMLSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);

  const handleSuggestionGenerated = (newSuggestions: SmartSuggestion[]) => {
    setSuggestions(newSuggestions);
    console.log('Generated suggestions:', newSuggestions);
  };

  const handleSuggestionApplied = (suggestionId: string) => {
    console.log('Applied suggestion:', suggestionId);
  };

  const handleSuggestionDismissed = (suggestionId: string) => {
    console.log('Dismissed suggestion:', suggestionId);
  };

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent);
    console.log('Content updated:', newContent);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-bold text-4xl">Smart Suggestions Engine Demo</h1>
          <p className="text-base-content/70 text-lg">
            Test the AI-powered resume optimization suggestions in real-time
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="card mb-6 bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Configuration</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Target Role</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Industry</span>
                </label>
                <select
                  className="select select-bordered"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                >
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Experience Level</span>
                </label>
                <select
                  className="select select-bordered"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as typeof experienceLevel)}
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Settings</span>
                </label>
                <div className="space-y-2">
                  <label className="label cursor-pointer">
                    <span className="label-text">Real-time Analysis</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={enableRealTime}
                      onChange={(e) => setEnableRealTime(e.target.checked)}
                    />
                  </label>
                  <label className="label cursor-pointer">
                    <span className="label-text">ML Suggestions</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-secondary"
                      checked={enableMLSuggestions}
                      onChange={(e) => setEnableMLSuggestions(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4">Resume Content</h3>
              <textarea
                className="textarea textarea-bordered h-64 w-full resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your resume content here..."
              />
              <div className="mt-2 text-base-content/70 text-sm">
                Characters: {content.length} | Words: {content.split(/\s+/).filter(Boolean).length}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4">Suggestions Summary</h3>
              <div className="stats stats-vertical w-full">
                <div className="stat">
                  <div className="stat-title">Total Suggestions</div>
                  <div className="stat-value text-primary">{suggestions.length}</div>
                </div>

                <div className="stat">
                  <div className="stat-title">Critical Issues</div>
                  <div className="stat-value text-error">
                    {suggestions.filter((s) => s.priority === 'critical').length}
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-title">Auto-Applicable</div>
                  <div className="stat-value text-success">
                    {suggestions.filter((s) => s.canAutoApply).length}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="mb-2 font-semibold">Suggestion Types</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(suggestions.map((s) => s.type))).map((type) => (
                    <div key={type} className="badge badge-outline">
                      {type} ({suggestions.filter((s) => s.type === type).length})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Suggestions Engine */}
        <SmartSuggestionsEngine
          content={content}
          targetRole={targetRole}
          targetIndustry={targetIndustry}
          experienceLevel={experienceLevel}
          enableRealTime={enableRealTime}
          enableMLSuggestions={enableMLSuggestions}
          onSuggestionGenerated={handleSuggestionGenerated}
          onSuggestionApplied={handleSuggestionApplied}
          onSuggestionDismissed={handleSuggestionDismissed}
          onContentUpdate={handleContentUpdate}
        />

        {/* Sample Content Templates */}
        <div className="card mt-6 bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-4">Sample Content Templates</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <button
                className="btn btn-outline"
                onClick={() =>
                  setContent(
                    'I helped with coding tasks and assisted senior developers. I was responsible for testing and participated in team meetings. I worked on small features and learned new technologies.'
                  )
                }
              >
                Entry Level (Weak)
              </button>

              <button
                className="btn btn-outline"
                onClick={() =>
                  setContent(
                    'Led development teams and managed large projects. Improved system performance and reduced costs. Implemented new technologies and mentored junior developers.'
                  )
                }
              >
                Senior Level (No Metrics)
              </button>

              <button
                className="btn btn-outline"
                onClick={() =>
                  setContent(
                    '• Managed projects using special characters ◦ Worked with tëams on various initiativés • Delivered résults with 100% success rate'
                  )
                }
              >
                ATS Problematic
              </button>

              <button
                className="btn btn-outline"
                onClick={() =>
                  setContent(
                    'Managed investment portfolios and analyzed market trends. Developed financial models and prepared reports for senior management.'
                  )
                }
              >
                Finance Industry
              </button>

              <button
                className="btn btn-outline"
                onClick={() =>
                  setContent(
                    'Created marketing campaigns and managed social media accounts. Worked with design teams to develop creative content.'
                  )
                }
              >
                Marketing Industry
              </button>

              <button
                className="btn btn-outline"
                onClick={() =>
                  setContent(
                    'Spearheaded agile development of cloud-based microservices architecture, increasing system performance by 40% and reducing deployment time by 60%.'
                  )
                }
              >
                Optimized Content
              </button>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="card mt-6 bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-4">Debug Information</h3>
            <div className="mockup-code">
              <pre data-prefix="$">
                <code>
                  {JSON.stringify(
                    {
                      contentLength: content.length,
                      targetRole,
                      targetIndustry,
                      experienceLevel,
                      enableRealTime,
                      enableMLSuggestions,
                      suggestionsCount: suggestions.length,
                      lastUpdate: new Date().toISOString(),
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
