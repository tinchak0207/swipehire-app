/**
 * Resume Analysis Integration Test Page
 * Demonstrates Task 17: Integrate with Backend API for Analysis Request
 */

import React from 'react';
import { AnalysisTestComponent } from '@/components/resume-optimizer/AnalysisTestComponent';

export default function ResumeAnalysisTestPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <AnalysisTestComponent />
    </div>
  );
}

export const metadata = {
  title: 'Resume Analysis Integration Test | SwipeHire',
  description:
    'Test the backend AI integration for resume analysis with various scenarios and error handling.',
};
