'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import PortfolioPreview from '@/components/portfolio/PortfolioPreview';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { Portfolio } from '@/lib/types/portfolio';

/**
 * Public Portfolio View Page `/portfolio/view/[id]`
 *
 * Displays a fully rendered (read-only) portfolio to external visitors. If the
 * portfolio does not exist or is not published we show an appropriate message.
 */
export default function PublicPortfolioPage() {
  const params = useParams();
  const portfolioId = params?.['id'] as string | undefined;

  // Fetch portfolio details
  const { data: portfolio, isLoading, error, refetch } = usePortfolio(portfolioId ?? '');

  // Increment view counter once on mount (fire-and-forget)
  useEffect(() => {
    if (!portfolioId) return;
    const base = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';
    fetch(`${base}/api/portfolios/${portfolioId}?incrementViews=true`).catch(() => undefined);
  }, [portfolioId]);

  /* ----------------------------- render states ---------------------------- */

  if (!portfolioId) {
    return (
      <ErrorState title="Invalid portfolio ID" message="Please check the URL and try again." />
    );
  }

  if (isLoading) {
    return (
      <CenteredSection>
        <span className="loading loading-spinner loading-lg text-primary" />
      </CenteredSection>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error loading portfolio"
        message="An unexpected error occurred. Please try again later."
        retry={refetch}
      />
    );
  }

  if (!portfolio || !(portfolio as Portfolio).isPublished) {
    return (
      <ErrorState
        title="Portfolio not found"
        message="The portfolio you are looking for does not exist or is not public."
      />
    );
  }

  /* ------------------------------ main render ----------------------------- */

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {/* back link for owner / visitors */}
        <Link
          href="/portfolio"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to portfolios
        </Link>

        <div className="rounded-xl border border-gray-200/60 bg-white/80 p-4 shadow backdrop-blur-sm sm:p-8">
          <PortfolioPreview portfolio={portfolio as unknown as any} />
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */

interface ErrorStateProps {
  title: string;
  message: string;
  retry?: () => void;
}

function ErrorState({ title, message, retry }: ErrorStateProps) {
  return (
    <CenteredSection>
      <div className="rounded-xl border border-red-200 bg-red-50/90 p-6 shadow-lg">
        <h2 className="mb-2 text-xl font-semibold text-red-800">{title}</h2>
        <p className="text-red-700">{message}</p>
        {retry && (
          <button className="btn mt-4" onClick={() => retry()}>
            Retry
          </button>
        )}
      </div>
    </CenteredSection>
  );
}

function CenteredSection({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 p-8">
      {children}
    </main>
  );
}
