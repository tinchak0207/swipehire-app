'use client';

import {
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApplicationTemplates } from '@/hooks/useApplicationTemplates';
import {
  type ApplicationTemplate,
  CATEGORY_LABELS,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type TemplateFilters,
} from '@/lib/types/application-templates';
import TemplateCard from './TemplateCard';
import TemplateFilterPanel from './TemplateFilterPanel';
import TemplatePreviewModal from './TemplatePreviewModal';

interface TemplateLibraryProps {
  className?: string;
  initialCategory?: TemplateCategory;
  onTemplateSelect?: (template: ApplicationTemplate) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  className,
  initialCategory,
  onTemplateSelect,
}) => {
  const router = useRouter();
  const [filters, setFilters] = useState<TemplateFilters>(() => {
    const initial: TemplateFilters = {
      tags: [],
      search: '',
    };
    if (initialCategory) {
      initial.category = initialCategory;
    }
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: templateData,
    isLoading,
    error,
    refetch: searchTemplates,
  } = useApplicationTemplates({
    page,
    limit: 12,
    filters: {
      ...filters,
      search: searchQuery || filters.search || '',
    },
    sortBy: 'popularity',
  });

  const { data: popularTemplateData } = useApplicationTemplates({
    page: 1,
    limit: 6,
    sortBy: 'popularity',
  });

  const templates = templateData?.templates || [];
  const pagination = templateData?.pagination || { page: 1, limit: 12, total: 0, pages: 1 };
  const popularTemplates = popularTemplateData?.templates || [];

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPage(1);
      searchTemplates();
    },
    [searchTemplates]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<TemplateFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setPage(1);
      searchTemplates();
    },
    [searchTemplates]
  );

  const handleCategoryChange = useCallback(
    (category: TemplateCategory) => {
      setFilters((prev) => ({ ...prev, category }));
      setPage(1);
      searchTemplates();
    },
    [searchTemplates]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({ tags: [], search: '' });
    setSearchQuery('');
    setPage(1);
    searchTemplates();
  }, [searchTemplates]);

  const handleTemplateClick = useCallback(
    (template: ApplicationTemplate) => {
      if (onTemplateSelect) {
        onTemplateSelect(template);
      } else {
        setSelectedTemplate(template);
        setShowPreview(true);
      }
    },
    [onTemplateSelect]
  );

  const handleCreateFromTemplate = useCallback(
    (template: ApplicationTemplate) => {
      router.push(`/applications/new?template=${template.id}`);
    },
    [router]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      searchTemplates();
    },
    [searchTemplates]
  );

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full" />
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-300 border-dashed p-12 text-center">
      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 font-medium text-gray-900 text-sm">No templates found</h3>
      <p className="mt-1 text-gray-500 text-sm">
        Try adjusting your search or filters to find what you're looking for.
      </p>
      <div className="mt-6">
        <Button onClick={handleClearFilters}>
          <XMarkIcon className="-ml-1 mr-2 h-5 w-5" />
          Clear Filters
        </Button>
      </div>
    </div>
  );

  const memoizedTemplateList = useMemo(() => {
    return templates.map((template) => (
      <TemplateCard
        key={template.id}
        template={template}
        onPreview={() => handleTemplateClick(template)}
        onCreate={() => handleCreateFromTemplate(template)}
      />
    ));
  }, [templates, handleTemplateClick, handleCreateFromTemplate]);

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <header className="mb-8">
        <h1 className="font-bold text-4xl text-gray-900 tracking-tight">Template Library</h1>
        <p className="mt-2 text-gray-600 text-lg">
          Browse our collection of professionally designed application templates to kickstart your
          job search.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="mr-2 h-5 w-5" />
            Filters
          </Button>
          <Button>
            <SparklesIcon className="mr-2 h-5 w-5" />
            Create Your Own
          </Button>
        </div>
      </div>

      <Tabs
        value={filters.category || 'all'}
        onValueChange={handleCategoryChange as (value: string) => void}
        className="mb-8"
      >
        <TabsList>
          {TEMPLATE_CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {showFilters && (
        <TemplateFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      <div className="mb-8">
        <h2 className="font-semibold text-2xl">Popular Templates</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => handleTemplateClick(template)}
              onCreate={() => handleCreateFromTemplate(template)}
            />
          ))}
        </div>
      </div>

      <main>
        <h2 className="mb-4 font-semibold text-2xl">All Templates</h2>
        {isLoading ? (
          renderSkeleton()
        ) : error ? (
          <div className="text-red-500">Error loading templates: {error.message}</div>
        ) : templates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {memoizedTemplateList}
            </div>
            <div className="mt-8 flex justify-center">
              <div className="join">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button
                    key={i}
                    className={`join-item btn ${pagination.page === i + 1 ? 'btn-active' : ''}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          renderEmptyState()
        )}
      </main>

      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onCreate={() => handleCreateFromTemplate(selectedTemplate)}
        />
      )}
    </div>
  );
};

export default TemplateLibrary;
