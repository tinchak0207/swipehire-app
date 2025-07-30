
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Interview Prep Tool | Mock Interview Practice | Interview Skills Guide',
  description: 'Ace your next interview with our AI-powered Interview Guide. Practice with mock interviews, get instant feedback, and learn key strategies for technical and behavioral questions.',
};

export default function InterviewGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
