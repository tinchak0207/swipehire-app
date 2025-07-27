'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { ApplicationTemplate, TemplateFilters } from '@/lib/types/application-templates';

interface TemplateFilterPanelProps {
  filters: TemplateFilters;
  onFilterChange: (filters: Partial<TemplateFilters>) => void;
  onClose: () => void;
  className?: string;
}

const AVAILABLE_TAGS = [
  'modern',
  'clean',
  'creative',
  'professional',
  'minimalist',
  'colorful',
  'corporate',
  'startup',
  'remote',
  'freelance',
  'executive',
  'entry-level',
  'senior',
  'technical',
  'artistic',
  'academic',
  'consulting',
  'sales',
  'marketing',
  'engineering',
];

const DIFFICULTY_OPTIONS: Array<{ value: ApplicationTemplate['difficulty']; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const TemplateFilterPanel: React.FC<TemplateFilterPanelProps> = ({
  filters,
  onFilterChange,
  onClose,
  className = '',
}) => {
  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];

    onFilterChange({ tags: newTags });
  };

  const handleDifficultyChange = (difficulty: ApplicationTemplate['difficulty']) => {
    const newFilters: Partial<TemplateFilters> = {};
    if (filters.difficulty === difficulty) {
      // Remove the difficulty filter by omitting it
      newFilters.tags = filters.tags;
      newFilters.search = filters.search;
      if (filters.minRating !== undefined) {
        newFilters.minRating = filters.minRating;
      }
      if (filters.category !== undefined) {
        newFilters.category = filters.category;
      }
    } else {
      newFilters.difficulty = difficulty;
    }
    onFilterChange(newFilters);
  };

  const handleRatingChange = (value: number[]) => {
    const firstValue = value[0];
    if (firstValue !== undefined) {
      const newRating = firstValue > 0 ? firstValue : undefined;
      if (newRating !== undefined) {
        onFilterChange({ minRating: newRating });
      }
    }
  };

  const clearAllFilters = () => {
    onFilterChange({
      tags: [],
      search: '',
    });
  };

  const hasActiveFilters =
    filters.tags.length > 0 || filters.difficulty !== undefined || filters.minRating !== undefined;

  return (
    <Card className={`mb-6 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tags Filter */}
        <div>
          <Label className="mb-3 block font-medium text-sm">Tags</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <Label className="mb-3 block font-medium text-sm">Difficulty Level</Label>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${option.value}`}
                  checked={filters.difficulty === option.value}
                  onCheckedChange={() => handleDifficultyChange(option.value)}
                />
                <Label
                  htmlFor={`difficulty-${option.value}`}
                  className="cursor-pointer font-normal text-sm"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <Label className="mb-3 block font-medium text-sm">
            Minimum Rating: {filters.minRating ? `${filters.minRating.toFixed(1)} stars` : 'Any'}
          </Label>
          <Slider
            value={[filters.minRating || 0]}
            onValueChange={handleRatingChange}
            max={5}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-gray-500 text-xs">
            <span>0 stars</span>
            <span>5 stars</span>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="border-t pt-4">
            <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full">
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2">
            <Label className="mb-2 block font-medium text-sm">Active Filters:</Label>
            <div className="flex flex-wrap gap-1">
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button onClick={() => handleTagToggle(tag)} className="ml-1 hover:text-red-500">
                    ×
                  </button>
                </Badge>
              ))}
              {filters.difficulty && (
                <Badge variant="secondary" className="text-xs">
                  {filters.difficulty}
                  <button
                    onClick={() => handleDifficultyChange(filters.difficulty!)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.minRating && (
                <Badge variant="secondary" className="text-xs">
                  {filters.minRating.toFixed(1)}+ stars
                  <button
                    onClick={() => onFilterChange({ tags: filters.tags, search: filters.search })}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateFilterPanel;
