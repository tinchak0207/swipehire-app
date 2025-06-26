'use client';

import { useState } from 'react';
import type { ResumeAnalysisResponse, TargetJobInfo } from '@/lib/types/resume-optimizer';

interface EmbeddedResumeOptimizerProps {
  initialResumeText?: string;
  targetJob?: TargetJobInfo;
  onAnalysisComplete?: (result: ResumeAnalysisResponse) => void;
  className?: string;
}

/**
 * Embedded Resume Optimizer Component
 * A simplified version of the resume optimizer for embedding in other pages
 */
export function EmbeddedResumeOptimizer({
  initialResumeText = '',
  targetJob,
  onAnalysisComplete,
  className = '',
}: EmbeddedResumeOptimizerProps) {
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    try {
      // Mock analysis for now - replace with actual API call
      const mockResult: ResumeAnalysisResponse = {
        id: `analysis-${Date.now()}`,
        overallScore: 75,
        atsScore: 70,
        keywordAnalysis: {
          score: 65,
          totalKeywords: 10,
          matchedKeywords: [],
          missingKeywords: [],
          keywordDensity: {},
          recommendations: ['Include more industry-specific keywords', 'Optimize keyword density'],
        },
        suggestions: [
          {
            id: 'suggestion-1',
            type: 'keyword',
            title: 'Add Missing Keywords',
            description: 'Include relevant industry keywords to improve ATS compatibility',
            impact: 'high',
            suggestion: 'Add keywords like "project management", "team leadership"',
            section: 'experience',
            priority: 1,
            estimatedScoreImprovement: 10,
            category: 'content',
          },
        ],
        grammarCheck: {
          score: 85,
          totalIssues: 2,
          issues: [],
          overallReadability: 80,
        },
        formatAnalysis: {
          score: 80,
          atsCompatibility: 75,
          issues: [],
          recommendations: ['Use consistent formatting', 'Ensure proper section headers'],
          sectionStructure: [
            {
              name: 'Contact Information',
              present: true,
              order: 1,
              recommended: true,
            },
            {
              name: 'Professional Summary',
              present: false,
              order: 2,
              recommended: true,
            },
          ],
        },
        quantitativeAnalysis: {
          score: 60,
          achievementsWithNumbers: 1,
          totalAchievements: 5,
          suggestions: [],
          impactWords: [],
        },
        strengths: ['Clear contact information'],
        weaknesses: ['Missing quantified achievements'],
        createdAt: new Date().toISOString(),
        processingTime: 1500,
        metadata: {
          analysisDate: new Date().toISOString(),
          targetJobTitle: targetJob?.title || 'General Position',
          targetCompany: targetJob?.company,
          wordCount: resumeText.split(' ').length,
          processingTime: 1500,
        },
      };

      setAnalysisResult(mockResult);
      onAnalysisComplete?.(mockResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resume Optimizer</h3>
        
        <div className="space-y-2">
          <label htmlFor="resume-text" className="block text-sm font-medium">
            Resume Text
          </label>
          <textarea
            id="resume-text"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!resumeText.trim() || isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>

      {analysisResult && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold">Analysis Results</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysisResult.overallScore}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysisResult.atsScore}%
              </div>
              <div className="text-sm text-gray-600">ATS Score</div>
            </div>
          </div>
          
          {analysisResult.strengths.length > 0 && (
            <div>
              <h5 className="font-medium text-green-700">Strengths:</h5>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {analysisResult.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.weaknesses.length > 0 && (
            <div>
              <h5 className="font-medium text-red-700">Areas for Improvement:</h5>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {analysisResult.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmbeddedResumeOptimizer;