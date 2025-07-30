
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Career Planning Assistant | Personalized Career Advice | Smart Career Transition',
  description: 'Navigate your career path with our AI Career Assistant. Get personalized advice, explore career transitions, and build a roadmap for your professional growth.',
};

export default function CareerAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
