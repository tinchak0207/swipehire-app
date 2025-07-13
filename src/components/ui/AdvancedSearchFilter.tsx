'use client';

import { format } from 'date-fns';
import { Calendar, ChevronDown, Filter, Search, SortAsc, SortDesc, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

/**
 * TypeScript interfaces for advanced search and filtering
 */
export interface FilterOption {
  readonly id: string;
  readonly label: string;
  readonly value: string | number | boolean;
  readonly count?: number;
  readonly category?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterGroup {
  readonly id: string;
  readonly label: string;
  readonly type: 'checkbox' | 'radio' | 'range' | 'date' | 'select' | 'multiselect';
  readonly options?: readonly FilterOption[];
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly collapsible?: boolean;
  readonly defaultCollapsed?: boolean;
}

export interface SortOption {
  readonly id: string;
  readonly label: string;
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export interface SearchFilters {
  readonly query: string;
  readonly filters: Record<string, unknown>;
  readonly sort: SortOption | null;
  readonly dateRange: {
    readonly from: Date | null;
    readonly to: Date | null;
  };
}

export interface AdvancedSearchFilterProps {
  readonly placeholder?: string;
  readonly filterGroups: readonly FilterGroup[];
  readonly sortOptions: readonly SortOption[];
  readonly onFiltersChange: (filters: SearchFilters) => void;
  readonly initialFilters?: Partial<SearchFilters>;
  readonly showResultCount?: boolean;
  readonly resultCount?: number;
  readonly loading?: boolean;
  readonly className?: string;
  readonly compact?: boolean;
  readonly showSaveSearch?: boolean;
  readonly savedSearches?: readonly { id: string; name: string; filters: SearchFilters }[];
  readonly onSaveSearch?: (name: string, filters: SearchFilters) => void;
  readonly onLoadSearch?: (filters: SearchFilters) => void;
  readonly ariaLabel?: string;
}

/**
 * Custom hook for managing search state with debouncing
 */
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}

const useSearchState = (
  initialFilters: Partial<SearchFilters>,
  onFiltersChange: (filters: SearchFilters) => void,
  debounceMs = 300
) => {
  const [searchState, setSearchState] = useState<SearchFilters>({
    query: '',
    filters: {},
    sort: null,
    dateRange: { from: null, to: null },
    ...initialFilters,
  });

  const debouncedOnFiltersChange = useMemo(
    () => debounce(onFiltersChange, debounceMs),
    [onFiltersChange, debounceMs]
  );

  useEffect(() => {
    debouncedOnFiltersChange(searchState);
  }, [searchState, debouncedOnFiltersChange]);

  return [searchState, setSearchState] as const;
};

/**
 * Filter group component with accessibility features
 */
const FilterGroupComponent: React.FC<{
  group: FilterGroup;
  value: unknown;
  onChange: (value: unknown) => void;
}> = ({ group, value, onChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(group.defaultCollapsed ?? false);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  const renderFilterContent = () => {
    switch (group.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            {group.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter((v) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={option.id} className="flex items-center gap-2 text-sm">
                  {option.icon && <option.icon className="h-4 w-4" />}
                  {option.label}
                  {option.count !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {option.count}
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {group.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option.id}
                  name={group.id}
                  value={option.value.toString()}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor={option.id} className="flex items-center gap-2 text-sm">
                  {option.icon && <option.icon className="h-4 w-4" />}
                  {option.label}
                  {option.count !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {option.count}
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'range': {
        const rangeValue = Array.isArray(value) ? value : [group.min ?? 0, group.max ?? 100];
        return (
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={rangeValue}
                onValueChange={onChange}
                min={group.min ?? 0}
                max={group.max ?? 100}
                step={group.step ?? 1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-muted-foreground text-sm">
              <span>{rangeValue[0]}</span>
              <span>{rangeValue[1]}</span>
            </div>
          </div>
        );
      }

      case 'select':
        return (
          <Select value={value?.toString() || ''} onValueChange={(value) => onChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder={group.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {group.options?.map((option) => (
                <SelectItem key={option.id} value={option.value.toString()}>
                  <div className="flex items-center gap-2">
                    {option.icon && <option.icon className="h-4 w-4" />}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="mb-2 flex flex-wrap gap-1">
              {selectedValues.map((val) => {
                const option = group.options?.find((opt) => opt.value === val);
                return option ? (
                  <Badge key={val.toString()} variant="secondary" className="text-xs">
                    {option.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0"
                      onClick={() => {
                        onChange(selectedValues.filter((v) => v !== val));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
            <Select
              onValueChange={(newValue) => {
                if (!selectedValues.includes(newValue)) {
                  onChange([...selectedValues, newValue]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={group.placeholder || 'Select options...'} />
              </SelectTrigger>
              <SelectContent>
                {group.options
                  ?.filter((option) => !selectedValues.includes(option.value))
                  .map((option) => (
                    <SelectItem key={option.id} value={option.value.toString()}>
                      <div className="flex items-center gap-2">
                        {option.icon && <option.icon className="h-4 w-4" />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      case 'date':
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {value ? format(value as Date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={value as Date}
                  onSelect={onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {group.collapsible ? (
        <Button
          variant="ghost"
          className="h-auto w-full justify-between p-0"
          onClick={handleToggleCollapse}
        >
          <span className="font-medium text-sm">{group.label}</span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')}
          />
        </Button>
      ) : (
        <h4 className="font-medium text-sm">{group.label}</h4>
      )}

      {(!group.collapsible || !isCollapsed) && (
        <div className="space-y-2">{renderFilterContent()}</div>
      )}
    </div>
  );
};

/**
 * Main Advanced Search Filter Component
 */
export const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  placeholder = 'Search...',
  filterGroups,
  sortOptions,
  onFiltersChange,
  initialFilters = {},
  showResultCount = true,
  resultCount = 0,
  loading = false,
  className,
  compact = false,
  showSaveSearch = false,
  savedSearches = [],
  onSaveSearch,
  onLoadSearch,
  ariaLabel,
}) => {
  const [searchState, setSearchState] = useSearchState(initialFilters, onFiltersChange);
  const [showFilters, setShowFilters] = useState(!compact);
  const [saveSearchName, setSaveSearchName] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filterPanelRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchState.query) count++;
    if (searchState.sort) count++;
    if (searchState.dateRange.from || searchState.dateRange.to) count++;
    count += Object.keys(searchState.filters).length;
    return count;
  }, [searchState]);

  const handleQueryChange = useCallback(
    (query: string) => {
      setSearchState((prev) => ({ ...prev, query }));
    },
    [setSearchState]
  );

  const handleFilterChange = useCallback(
    (groupId: string, value: unknown) => {
      setSearchState((prev) => ({
        ...prev,
        filters: { ...prev.filters, [groupId]: value },
      }));
    },
    [setSearchState]
  );

  const handleSortChange = useCallback(
    (sortId: string) => {
      const sort = sortOptions.find((s) => s.id === sortId) || null;
      setSearchState((prev) => ({ ...prev, sort }));
    },
    [sortOptions, setSearchState]
  );

  const handleClearFilters = useCallback(() => {
    setSearchState({
      query: '',
      filters: {},
      sort: null,
      dateRange: { from: null, to: null },
    });
    searchInputRef.current?.focus();
  }, [setSearchState]);

  const handleSaveSearch = useCallback(() => {
    if (saveSearchName.trim() && onSaveSearch) {
      onSaveSearch(saveSearchName.trim(), searchState);
      setSaveSearchName('');
    }
  }, [saveSearchName, onSaveSearch, searchState]);

  const handleLoadSearch = useCallback(
    (filters: SearchFilters) => {
      setSearchState(filters);
      onLoadSearch?.(filters);
    },
    [setSearchState, onLoadSearch]
  );

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <div className={cn('space-y-4', className)} aria-label={ariaLabel}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder={placeholder}
            defaultValue={searchState.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-10"
            aria-label="Search input"
          />
        </div>

        <Button
          variant="outline"
          onClick={toggleFilters}
          className={cn('relative', activeFilterCount > 0 && 'border-primary')}
          aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center p-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Sort Dropdown */}
        <Select value={searchState.sort?.id || ''} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48">
            <div className="flex items-center">
              {searchState.sort?.direction === 'asc' ? (
                <SortAsc className="mr-2 h-4 w-4" />
              ) : (
                <SortDesc className="mr-2 h-4 w-4" />
              )}
              <SelectValue placeholder="Sort by..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <div className="flex items-center">
                  {option.direction === 'asc' ? (
                    <SortAsc className="mr-2 h-4 w-4" />
                  ) : (
                    <SortDesc className="mr-2 h-4 w-4" />
                  )}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {showResultCount && (
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>{loading ? 'Searching...' : `${resultCount} results found`}</span>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card ref={filterPanelRef}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              <div className="flex items-center gap-2">
                {showSaveSearch && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Save search as..."
                      value={saveSearchName}
                      onChange={(e) => setSaveSearchName(e.target.value)}
                      className="w-40"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveSearch();
                        }
                      }}
                    />
                    <Button size="sm" onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                      Save
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFilters}
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Saved Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {savedSearches.map((search) => (
                    <Button
                      key={search.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadSearch(search.filters)}
                      className="text-xs"
                    >
                      {search.name}
                    </Button>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* Filter Groups */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterGroups.map((group) => (
                <FilterGroupComponent
                  key={group.id}
                  group={group}
                  value={searchState.filters[group.id]}
                  onChange={(value) => handleFilterChange(group.id, value)}
                />
              ))}
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Date Range</h4>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {searchState.dateRange.from
                        ? format(searchState.dateRange.from, 'PPP')
                        : 'From date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={searchState.dateRange.from || undefined}
                      onSelect={(date) =>
                        setSearchState((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, from: date || null },
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {searchState.dateRange.to
                        ? format(searchState.dateRange.to, 'PPP')
                        : 'To date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={searchState.dateRange.to || undefined}
                      onSelect={(date) =>
                        setSearchState((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: date || null },
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearchFilter;
