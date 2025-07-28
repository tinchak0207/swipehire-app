'use client';

import { useParams } from 'next/navigation';
import type React from 'react';
import PortfolioEditor from '@/components/portfolio/PortfolioEditor';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { PortfolioDraft } from '@/lib/types/portfolio';

/**
 * Edit Portfolio Page
 *
 * This page provides the interface for editing an existing portfolio.
 * It fetches the portfolio data and converts it to a draft format for editing.
 */
const EditPortfolioPage: React.FC = () => {
  const params = useParams();
  if (!params || !params['id']) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Invalid portfolio ID</span>
        </div>
      </div>
    );
  }
  const portfolioId = params['id'] as string;

  const { data: portfolio, isLoading, error } = usePortfolio(portfolioId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="skeleton mb-2 h-8 w-64" />
          <div className="skeleton h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="skeleton mb-4 h-6 w-32" />
                <div className="skeleton mb-4 h-10 w-full" />
                <div className="skeleton mb-4 h-24 w-full" />
                <div className="skeleton h-10 w-full" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="skeleton mb-4 h-6 w-24" />
                <div className="skeleton h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error loading portfolio. Please try again later.</span>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>Portfolio not found.</span>
        </div>
      </div>
    );
  }

  // Convert portfolio to draft format
  const portfolioDraft: PortfolioDraft = {
    id: portfolio.id,
    title: portfolio.title,
    description: portfolio.description,
    projects: portfolio.projects,
    layout: portfolio.layout,
    tags: portfolio.tags,
    isPublished: portfolio.isPublished,
    visibility: portfolio.visibility,
    url: portfolio.url,
    theme: portfolio.theme,
    customCss: portfolio.customCss,
    seoTitle: portfolio.seoTitle,
    seoDescription: portfolio.seoDescription,
    socialImage: portfolio.socialImage,
    isDirty: false,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Edit Portfolio</h1>
        <p className="mt-2 text-base-content/70">
          Update your portfolio to keep it fresh and engaging.
        </p>
      </div>

      <PortfolioEditor initialData={portfolioDraft} mode="edit" />
    </div>
  );
};

export default EditPortfolioPage;
