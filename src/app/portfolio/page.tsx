'use client';

import { EyeIcon, PencilIcon, PlusIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeletePortfolio, usePortfolios } from '@/hooks/usePortfolio';
import type { Portfolio } from '@/lib/types/portfolio';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete: (id: string) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio, onDelete }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/portfolio/view/${portfolio.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Portfolio link has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this portfolio? This action cannot be undone.'
      )
    ) {
      onDelete(portfolio.id);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="card-title text-lg font-semibold">{portfolio.title}</h2>
            <p className="text-base-content/70 text-sm mt-1 line-clamp-2">
              {portfolio.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {portfolio.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge badge-outline badge-sm">
                  {tag}
                </span>
              ))}
              {portfolio.tags.length > 3 && (
                <span className="badge badge-ghost badge-sm">
                  +{portfolio.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-4 h-4 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link href={`/portfolio/view/${portfolio.id}`} className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4" />
                  View Portfolio
                </Link>
              </li>
              <li>
                <Link href={`/portfolio/edit/${portfolio.id}`} className="flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  Edit Portfolio
                </Link>
              </li>
              <li>
                <button onClick={handleShare} className="flex items-center gap-2">
                  <ShareIcon className="w-4 h-4" />
                  Share Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-error hover:bg-error hover:text-error-content"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete Portfolio
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="stats stats-horizontal mt-4">
          <div className="stat py-2 px-3">
            <div className="stat-title text-xs">Views</div>
            <div className="stat-value text-sm">{portfolio.stats.views}</div>
          </div>
          <div className="stat py-2 px-3">
            <div className="stat-title text-xs">Likes</div>
            <div className="stat-value text-sm">{portfolio.stats.likes}</div>
          </div>
          <div className="stat py-2 px-3">
            <div className="stat-title text-xs">Projects</div>
            <div className="stat-value text-sm">{portfolio.projects.length}</div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <div className={`badge ${portfolio.isPublished ? 'badge-success' : 'badge-warning'}`}>
              {portfolio.isPublished ? 'Published' : 'Draft'}
            </div>
            <span className="text-xs text-base-content/50">
              Updated {new Date(portfolio.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PortfolioDashboard: React.FC = () => {
  const { data: portfolios, isLoading, error } = usePortfolios();
  const deletePortfolioMutation = useDeletePortfolio();
  const { toast } = useToast();

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      await deletePortfolioMutation.mutateAsync(portfolioId);
      toast({
        title: 'Portfolio deleted',
        description: 'Your portfolio has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete portfolio. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-12 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={`skeleton-${i}`} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="skeleton h-6 w-3/4 mb-2" />
                <div className="skeleton h-4 w-full mb-1" />
                <div className="skeleton h-4 w-2/3 mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="skeleton h-6 w-16" />
                  <div className="skeleton h-6 w-20" />
                </div>
                <div className="skeleton h-16 w-full" />
              </div>
            </div>
          ))}
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
            className="stroke-current shrink-0 h-6 w-6"
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
          <span>Error loading portfolios. Please try again later.</span>
        </div>
      </div>
    );
  }

  const publishedPortfolios = portfolios?.filter((p: Portfolio) => p.isPublished) || [];
  const draftPortfolios = portfolios?.filter((p: Portfolio) => !p.isPublished) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Portfolios</h1>
          <p className="text-base-content/70 mt-1">
            Create and manage your professional portfolios
          </p>
        </div>
        <Link href="/portfolio/new" className="btn btn-primary gap-2">
          <PlusIcon className="w-5 h-5" />
          Create New Portfolio
        </Link>
      </div>

      {/* Summary Stats */}
      {portfolios && Array.isArray(portfolios) && portfolios.length > 0 && (
        <div className="stats stats-horizontal shadow mb-8 w-full">
          <div className="stat">
            <div className="stat-title">Total Portfolios</div>
            <div className="stat-value text-primary">{portfolios.length}</div>
            <div className="stat-desc">
              {publishedPortfolios.length} published, {draftPortfolios.length} drafts
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Views</div>
            <div className="stat-value text-secondary">
              {portfolios.reduce((sum: number, p: Portfolio) => sum + p.stats.views, 0)}
            </div>
            <div className="stat-desc">Across all portfolios</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Likes</div>
            <div className="stat-value text-accent">
              {portfolios.reduce((sum: number, p: Portfolio) => sum + p.stats.likes, 0)}
            </div>
            <div className="stat-desc">From your audience</div>
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {portfolios && Array.isArray(portfolios) && portfolios.length > 0 ? (
        <div className="space-y-8">
          {/* Published Portfolios */}
          {publishedPortfolios.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="badge badge-success">Published</span>
                Published Portfolios ({publishedPortfolios.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedPortfolios.map((portfolio: Portfolio) => (
                  <PortfolioCard
                    key={portfolio.id}
                    portfolio={portfolio}
                    onDelete={handleDeletePortfolio}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Draft Portfolios */}
          {draftPortfolios.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="badge badge-warning">Draft</span>
                Draft Portfolios ({draftPortfolios.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftPortfolios.map((portfolio: Portfolio) => (
                  <PortfolioCard
                    key={portfolio.id}
                    portfolio={portfolio}
                    onDelete={handleDeletePortfolio}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-base-content/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-base-content mb-2">No portfolios yet</h3>
            <p className="text-base-content/70 mb-6">
              Get started by creating your first portfolio to showcase your work and projects.
            </p>
            <Link href="/portfolio/new" className="btn btn-primary gap-2">
              <PlusIcon className="w-5 h-5" />
              Create Your First Portfolio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDashboard;
