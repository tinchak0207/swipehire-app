
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI-Powered Portfolio Builder | Create & Manage Professional Portfolios | SwipeHire',
  description:
    'Build and manage stunning, professional portfolios with SwipeHire’s AI-powered builder. Showcase your projects, skills, and experience to attract top employers and clients. Start for free!',
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
