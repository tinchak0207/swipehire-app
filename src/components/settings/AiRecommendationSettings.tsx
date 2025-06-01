
"use client";

import React, { useState, useEffect } from 'react';
import type { RecruiterPerspectiveWeights, JobSeekerPerspectiveWeights } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings2, AlertCircle } from 'lucide-react';

const defaultRecruiterWeights: RecruiterPerspectiveWeights = {
  skillsMatchScore: 40,
  experienceRelevanceScore: 30,
  cultureFitScore: 20,
  growthPotentialScore: 10,
};

const defaultJobSeekerWeights: JobSeekerPerspectiveWeights = {
  cultureFitScore: 35,
  jobRelevanceScore: 30,
  growthOpportunityScore: 20,
  jobConditionFitScore: 15,
};

interface AiRecommendationSettingsProps {
  initialRecruiterWeights: RecruiterPerspectiveWeights;
  initialJobSeekerWeights: JobSeekerPerspectiveWeights;
  onRecruiterWeightsChange: (weights: RecruiterPerspectiveWeights) => void;
  onJobSeekerWeightsChange: (weights: JobSeekerPerspectiveWeights) => void;
  isGuestMode?: boolean;
}

export function AiRecommendationSettings({
  initialRecruiterWeights,
  initialJobSeekerWeights,
  onRecruiterWeightsChange,
  onJobSeekerWeightsChange,
  isGuestMode,
}: AiRecommendationSettingsProps) {
  const [recruiterWeights, setRecruiterWeightsState] = useState<RecruiterPerspectiveWeights>(initialRecruiterWeights || defaultRecruiterWeights);
  const [jobSeekerWeights, setJobSeekerWeightsState] = useState<JobSeekerPerspectiveWeights>(initialJobSeekerWeights || defaultJobSeekerWeights);
  const [recruiterWeightsError, setRecruiterWeightsError] = useState<string | null>(null);
  const [jobSeekerWeightsError, setJobSeekerWeightsError] = useState<string | null>(null);

  useEffect(() => {
    setRecruiterWeightsState(initialRecruiterWeights || defaultRecruiterWeights);
  }, [initialRecruiterWeights]);

  useEffect(() => {
    setJobSeekerWeightsState(initialJobSeekerWeights || defaultJobSeekerWeights);
  }, [initialJobSeekerWeights]);

  const validateWeights = (weights: RecruiterPerspectiveWeights | JobSeekerPerspectiveWeights): boolean => {
    const sum = Object.values(weights).reduce((acc, weight) => acc + Number(weight || 0), 0);
    return Math.abs(sum - 100) < 0.01; // Allow for floating point inaccuracies
  };

  useEffect(() => {
    setRecruiterWeightsError(validateWeights(recruiterWeights) ? null : "Weights must sum to 100%.");
    onRecruiterWeightsChange(recruiterWeights);
  }, [recruiterWeights, onRecruiterWeightsChange]);

  useEffect(() => {
    setJobSeekerWeightsError(validateWeights(jobSeekerWeights) ? null : "Weights must sum to 100%.");
    onJobSeekerWeightsChange(jobSeekerWeights);
  }, [jobSeekerWeights, onJobSeekerWeightsChange]);

  const handleWeightChange = (
    perspective: 'recruiter' | 'jobSeeker',
    field: keyof RecruiterPerspectiveWeights | keyof JobSeekerPerspectiveWeights,
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    const val = isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue));

    if (perspective === 'recruiter') {
      setRecruiterWeightsState(prev => ({ ...prev, [field]: val }));
    } else {
      setJobSeekerWeightsState(prev => ({ ...prev, [field]: val }));
    }
  };

  if (isGuestMode) {
    return null; // Or a placeholder indicating feature is locked
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Settings2 className="mr-2 h-5 w-5 text-primary" />
          AI Recommendation Customization
        </CardTitle>
        <CardDescription>
          Adjust how our AI weighs different factors when matching candidates to jobs (for recruiters) or jobs to you (for job seekers). Ensure weights for each perspective sum to 100%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-md mb-2 text-foreground">Recruiter Perspective (Candidate to Job Fit)</h4>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(recruiterWeights) as Array<keyof RecruiterPerspectiveWeights>).map((key) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`recruiter-${key}`} className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').replace(' Score', '')}</Label>
                <Input
                  id={`recruiter-${key}`}
                  type="number"
                  min="0" max="100" step="5"
                  value={recruiterWeights[key]}
                  onChange={(e) => handleWeightChange('recruiter', key as keyof RecruiterPerspectiveWeights, e.target.value)}
                  className="text-sm"
                  disabled={isGuestMode}
                />
              </div>
            ))}
          </div>
          {recruiterWeightsError && <p className="text-xs text-destructive mt-2 flex items-center"><AlertCircle size={14} className="mr-1"/> {recruiterWeightsError}</p>}
        </div>

        <div>
          <h4 className="font-semibold text-md mb-2 text-foreground">Job Seeker Perspective (Job to Candidate Fit)</h4>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(jobSeekerWeights) as Array<keyof JobSeekerPerspectiveWeights>).map((key) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`jobseeker-${key}`} className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').replace(' Score', '')}</Label>
                <Input
                  id={`jobseeker-${key}`}
                  type="number"
                  min="0" max="100" step="5"
                  value={jobSeekerWeights[key]}
                  onChange={(e) => handleWeightChange('jobSeeker', key as keyof JobSeekerPerspectiveWeights, e.target.value)}
                  className="text-sm"
                  disabled={isGuestMode}
                />
              </div>
            ))}
          </div>
          {jobSeekerWeightsError && <p className="text-xs text-destructive mt-2 flex items-center"><AlertCircle size={14} className="mr-1"/> {jobSeekerWeightsError}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
