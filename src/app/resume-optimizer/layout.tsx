import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Optimizer | ATS Compatibility Checker | Free Resume Review',
  description: 'Get a free AI-powered resume review. Our tool checks for ATS compatibility, optimizes keywords, and provides actionable feedback to help your resume stand out.',
};

export default function ResumeOptimizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
