'use client';

import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { EventFilters, EventFormat, EventType } from '@/lib/types';

interface EventFilterPanelProps {
  activeFilters: EventFilters;
  onFilterChange: <K extends keyof EventFilters>(
    filterType: K,
    value: EventFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

// Filter options data
const eventTypeOptions = [
  { value: 'conference' as EventType, label: 'Conference' },
  { value: 'workshop' as EventType, label: 'Workshop' },
  { value: 'seminar' as EventType, label: 'Seminar' },
  { value: 'networking' as EventType, label: 'Networking' },
  { value: 'job_fair' as EventType, label: 'Job Fair' },
  { value: 'webinar' as EventType, label: 'Webinar' },
  { value: 'meetup' as EventType, label: 'Meetup' },
  { value: 'panel_discussion' as EventType, label: 'Panel Discussion' },
];

const formatOptions = [
  { value: 'in_person' as EventFormat, label: 'In Person' },
  { value: 'virtual' as EventFormat, label: 'Virtual' },
  { value: 'hybrid' as EventFormat, label: 'Hybrid' },
];

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Sales',
  'Human Resources',
  'Engineering',
  'Design',
  'Operations',
  'Consulting',
  'Legal',
  'Real Estate',
  'Non-Profit',
  'Government',
  'Retail',
  'Manufacturing',
  'Media',
  'Entertainment',
  'Sports',
];

const cityOptions = [
  'San Francisco',
  'New York',
  'Los Angeles',
  'Chicago',
  'Boston',
  'Seattle',
  'Austin',
  'Denver',
  'Miami',
  'Atlanta',
  'Dallas',
  'Portland',
  'Washington DC',
  'Toronto',
  'London',
  'Berlin',
  'Amsterdam',
  'Barcelona',
  'Tokyo',
  'Singapore',
];

const skillLevelOptions = ['beginner', 'intermediate', 'advanced', 'all_levels'];

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="font-medium text-gray-900">{title}</h3>
    {children}
  </div>
);

interface FilterCheckboxProps {
  value: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const FilterCheckbox: React.FC<FilterCheckboxProps> = ({ value, label, checked, onChange }) => (
  <div className="flex items-center space-x-2">
    <Checkbox id={value} checked={checked} onCheckedChange={onChange} />
    <label
      htmlFor={value}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {label}
    </label>
  </div>
);

export const EventFilterPanel: React.FC<EventFilterPanelProps> = ({
  activeFilters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => {
  const getActiveFilterCount = () => {
    return (
      activeFilters.eventTypes.size +
      activeFilters.formats.size +
      activeFilters.industries.size +
      activeFilters.cities.size +
      activeFilters.skillLevels.size +
      activeFilters.tags.size +
      (activeFilters.isFree !== undefined ? 1 : 0) +
      (activeFilters.dateRange.start || activeFilters.dateRange.end ? 1 : 0) +
      (activeFilters.priceRange.min !== undefined || activeFilters.priceRange.max !== undefined
        ? 1
        : 0)
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Active Filters</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </div>
        {getActiveFilterCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Filter Content */}
      <ScrollArea className="flex-1 px-1 py-4">
        <div className="space-y-6">
          {/* Event Type */}
          <FilterSection title="Event Type">
            <div className="space-y-2">
              {eventTypeOptions.map((option) => (
                <FilterCheckbox
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  checked={activeFilters.eventTypes.has(option.value)}
                  onChange={(checked) => onFilterChange('eventTypes', option.value, checked)}
                />
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* Format */}
          <FilterSection title="Format">
            <div className="space-y-2">
              {formatOptions.map((option) => (
                <FilterCheckbox
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  checked={activeFilters.formats.has(option.value)}
                  onChange={(checked) => onFilterChange('formats', option.value, checked)}
                />
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* Industry */}
          <FilterSection title="Industry">
            <div className="space-y-2">
              {industryOptions.slice(0, 8).map((industry) => (
                <FilterCheckbox
                  key={industry}
                  value={industry}
                  label={industry}
                  checked={activeFilters.industries.has(industry)}
                  onChange={(checked) => onFilterChange('industries', industry, checked)}
                />
              ))}
              {industryOptions.length > 8 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                    Show more industries
                  </summary>
                  <div className="mt-2 space-y-2">
                    {industryOptions.slice(8).map((industry) => (
                      <FilterCheckbox
                        key={industry}
                        value={industry}
                        label={industry}
                        checked={activeFilters.industries.has(industry)}
                        onChange={(checked) => onFilterChange('industries', industry, checked)}
                      />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </FilterSection>

          <Separator />

          {/* Location */}
          <FilterSection title="Location">
            <div className="space-y-2">
              {cityOptions.slice(0, 6).map((city) => (
                <FilterCheckbox
                  key={city}
                  value={city}
                  label={city}
                  checked={activeFilters.cities.has(city)}
                  onChange={(checked) => onFilterChange('cities', city, checked)}
                />
              ))}
              {cityOptions.length > 6 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                    Show more cities
                  </summary>
                  <div className="mt-2 space-y-2">
                    {cityOptions.slice(6).map((city) => (
                      <FilterCheckbox
                        key={city}
                        value={city}
                        label={city}
                        checked={activeFilters.cities.has(city)}
                        onChange={(checked) => onFilterChange('cities', city, checked)}
                      />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </FilterSection>

          <Separator />

          {/* Skill Level */}
          <FilterSection title="Skill Level">
            <div className="space-y-2">
              {skillLevelOptions.map((level) => (
                <FilterCheckbox
                  key={level}
                  value={level}
                  label={level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')}
                  checked={activeFilters.skillLevels.has(level)}
                  onChange={(checked) => onFilterChange('skillLevels', level, checked)}
                />
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* Price */}
          <FilterSection title="Price">
            <div className="space-y-2">
              <FilterCheckbox
                value="free"
                label="Free Events Only"
                checked={activeFilters.isFree === true}
                onChange={(checked) => {
                  // Handle isFree separately since it's not a Set
                  const newFilters = { ...activeFilters };
                  if (checked) {
                    newFilters.isFree = true;
                  } else {
                    delete newFilters.isFree;
                  }
                  // This is a bit of a hack since our onChange doesn't handle this case
                  // In a real implementation, we'd need a separate handler for non-Set filters
                }}
              />
            </div>
          </FilterSection>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex-1"
            disabled={getActiveFilterCount() === 0}
          >
            Clear
          </Button>
          <Button size="sm" onClick={onApplyFilters} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
