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
import { Badge } from '@/components/ui/badge';
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
  type TemplateSearchParams
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
    refetch: searchTemplates
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
    sortBy: 'popularity'
  });

  const templates = templateData?.templates || [];
  const pagination = templateData?.pagination || { page: 1, limit: 12, total: 0, pages: 1 };
  const popularTemplates = popularTemplateData?.templates || [];

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query
