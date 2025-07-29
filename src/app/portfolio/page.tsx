'use client';

import { 
  EyeIcon, 
  PencilIcon, 
  PlusIcon, 
  ShareIcon, 
  TrashIcon,
  SparklesIcon,
  FolderIcon,
  CalendarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  EyeIcon as EyeSolidIcon,
  FolderIcon as FolderSolidIcon
} from '@heroicons/react/24/solid';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeletePortfolio, usePortfolios } from '@/hooks/usePortfolio';
import type { Portfolio } from '@/lib/types/portfolio';
import { cn } from '@/lib/utils';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete: (id: string) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio, onDelete }) => {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/portfolio/view/${portfolio.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Portfolio link has been copied to clipboard.',
      });
      setIsMenuOpen(false);
    } catch (_error) {
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
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:shadow-xl">
      {/* Content */}
      <div className="relative z-10">
        {/* Header with actions */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FolderSolidIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-800 text-lg truncate group-hover:text-blue-700 transition-colors">
                {portfolio.title}
              </h3>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {portfolio.description || 'No description provided'}
            </p>
          </div>
          
          {/* Action menu */}
          <div className="relative ml-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 border border-gray-200 text-gray-600 transition-all duration-200 hover:bg-white hover:text-gray-800 hover:shadow-md hover:border-blue-300"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
            
            {isMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-xl backdrop-blur-sm">
                  <Link 
                    href={`/portfolio/view/${portfolio.id}`}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Portfolio
                  </Link>
                  <Link 
                    href={`/portfolio/edit/${portfolio.id}`}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit Portfolio
                  </Link>
                  <button 
                    onClick={handleShare}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <ShareIcon className="h-4 w-4" />
                    Share Portfolio
                  </button>
                  <div className="my-1 h-px bg-gray-200" />
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 text-sm transition-colors hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete Portfolio
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {portfolio.tags && portfolio.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {portfolio.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 font-semibold text-blue-700 text-xs"
              >
                {tag}
              </span>
            ))}
            {portfolio.tags.length > 3 && (
              <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 font-semibold text-gray-600 text-xs">
                +{portfolio.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white/60 p-3 transition-colors hover:bg-blue-50">
            <EyeSolidIcon className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-bold text-gray-800 text-sm">{portfolio.stats.views}</div>
              <div className="text-gray-600 text-xs">Views</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white/60 p-3 transition-colors hover:bg-red-50">
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
            <div>
              <div className="font-bold text-gray-800 text-sm">{portfolio.stats.likes}</div>
              <div className="text-gray-600 text-xs">Likes</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white/60 p-3 transition-colors hover:bg-green-50">
            <FolderSolidIcon className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-bold text-gray-800 text-sm">{portfolio.projects?.length || 0}</div>
              <div className="text-gray-600 text-xs">Projects</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {portfolio.isPublished ? (
              <div className="flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-3 py-1">
                <GlobeAltIcon className="h-3 w-3 text-green-600" />
                <span className="font-semibold text-green-700 text-xs">Published</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1">
                <LockClosedIcon className="h-3 w-3 text-yellow-600" />
                <span className="font-semibold text-yellow-700 text-xs">Draft</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <CalendarIcon className="h-3 w-3" />
            <span>
              {new Date(portfolio.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
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
    } catch (_error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete portfolio. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto px-6 py-8">
          {/* Header skeleton */}
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-white/80 border border-gray-200" />
              <div className="h-4 w-64 animate-pulse rounded-lg bg-white/60 border border-gray-200" />
            </div>
            <div className="h-12 w-40 animate-pulse rounded-xl bg-white/80 border border-gray-200" />
          </div>
          
          {/* Stats skeleton */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={`stats-skeleton-${i}`} className="h-24 animate-pulse rounded-xl bg-white/80 border border-gray-200 shadow-lg" />
            ))}
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={`card-skeleton-${i}`} className="h-80 animate-pulse rounded-xl bg-white/80 border border-gray-200 shadow-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto px-6 py-8">
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-lg">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 font-bold text-red-800 text-lg">Error Loading Portfolios</h3>
            <p className="text-red-600">Please try again later or contact support if the problem persists.</p>
          </div>
        </div>
      </div>
    );
  }

  const publishedPortfolios = portfolios?.filter((p: Portfolio) => p.isPublished) || [];
  const draftPortfolios = portfolios?.filter((p: Portfolio) => !p.isPublished) || [];
  const totalViews = portfolios?.reduce((sum: number, p: Portfolio) => sum + p.stats.views, 0) || 0;
  const totalLikes = portfolios?.reduce((sum: number, p: Portfolio) => sum + p.stats.likes, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-all duration-200',
                'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-xl'
              )}>
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-3xl">My Portfolios</h1>
                <p className="text-gray-600">Create and manage your professional portfolios</p>
              </div>
            </div>
          </div>
          <Link 
            href="/portfolio/new" 
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
            Create New Portfolio
          </Link>
        </div>

        {/* Summary Stats */}
        {portfolios && Array.isArray(portfolios) && portfolios.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                  <FolderSolidIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-2xl">{portfolios.length}</div>
                  <div className="text-gray-600 text-sm font-medium">Total Portfolios</div>
                  <div className="text-gray-500 text-xs">
                    {publishedPortfolios.length} published, {draftPortfolios.length} drafts
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg">
                  <EyeSolidIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-2xl">{totalViews.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm font-medium">Total Views</div>
                  <div className="text-gray-500 text-xs">Across all portfolios</div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-300 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg">
                  <HeartSolidIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-2xl">{totalLikes.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm font-medium">Total Likes</div>
                  <div className="text-gray-500 text-xs">From your audience</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Grid */}
        {portfolios && Array.isArray(portfolios) && portfolios.length > 0 ? (
          <div className="space-y-8">
            {/* Published Portfolios */}
            {publishedPortfolios.length > 0 && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-2 shadow-lg">
                    <GlobeAltIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-xl">Published Portfolios</h2>
                    <p className="text-gray-600 text-sm">{publishedPortfolios.length} portfolio{publishedPortfolios.length !== 1 ? 's' : ''} live and visible to the public</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 p-2 shadow-lg">
                    <LockClosedIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-xl">Draft Portfolios</h2>
                    <p className="text-gray-600 text-sm">{draftPortfolios.length} portfolio{draftPortfolios.length !== 1 ? 's' : ''} in progress</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="py-16 text-center">
            <div className="mx-auto max-w-md rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-8 shadow-lg">
              <div className="mb-6 flex justify-center">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg">
                  <FolderIcon className="h-16 w-16 text-white" />
                </div>
              </div>
              <h3 className="mb-3 font-bold text-gray-800 text-xl">No portfolios yet</h3>
              <p className="mb-6 text-gray-600 leading-relaxed">
                Get started by creating your first portfolio to showcase your work and projects to potential employers and clients.
              </p>
              <Link 
                href="/portfolio/new" 
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-xl"
              >
                <SparklesIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                Create Your First Portfolio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioDashboard;