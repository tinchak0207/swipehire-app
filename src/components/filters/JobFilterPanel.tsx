
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WorkExperienceLevel, EducationLevel, LocationPreference, JobType, type JobFilters } from '@/lib/types';
import { X } from 'lucide-react';

interface JobFilterPanelProps {
  activeFilters: JobFilters;
  onFilterChange: <K extends keyof JobFilters>(
    filterType: K,
    value: JobFilters[K] extends Set<infer T> ? T : never,
    isChecked: boolean
  ) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void; // To close the sheet
}

const experienceOptions = Object.values(WorkExperienceLevel).filter(v => v !== WorkExperienceLevel.UNSPECIFIED);
const educationOptions = Object.values(EducationLevel).filter(v => v !== EducationLevel.UNSPECIFIED);
const locationOptions = Object.values(LocationPreference).filter(v => v !== LocationPreference.UNSPECIFIED);
const jobTypeOptions = Object.values(JobType).filter(v => v !== JobType.UNSPECIFIED);

// Helper to format enum values for display
const formatEnumLabel = (value: string) => {
  if (!value) return "";
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function JobFilterPanel({
  activeFilters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}: JobFilterPanelProps) {
  
  const createCheckboxGroup = <T extends string>(
    title: string,
    options: T[],
    selectedValues: Set<T>,
    filterType: keyof JobFilters
  ) => (
    <div className="space-y-3">
      <h4 className="text-md font-semibold text-foreground">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 transition-colors">
            <Checkbox
              id={`${filterType}-${option}`}
              checked={selectedValues.has(option)}
              onCheckedChange={(checked) => onFilterChange(filterType, option as any, !!checked)}
            />
            <Label htmlFor={`${filterType}-${option}`} className="text-sm font-normal cursor-pointer flex-grow">
              {formatEnumLabel(option)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <h3 className="text-lg font-semibold text-primary">Filter Job Postings</h3>
      </header>
      <ScrollArea className="flex-grow p-4 space-y-6">
        {createCheckboxGroup('Required Experience', experienceOptions, activeFilters.experienceLevels, 'experienceLevels')}
        <Separator className="my-6" />
        {createCheckboxGroup('Required Education', educationOptions, activeFilters.educationLevels, 'educationLevels')}
        <Separator className="my-6" />
        {createCheckboxGroup('Work Location Type', locationOptions, activeFilters.workLocationTypes, 'workLocationTypes')}
        <Separator className="my-6" />
        {createCheckboxGroup('Job Type', jobTypeOptions, activeFilters.jobTypes, 'jobTypes')}
      </ScrollArea>
      <footer className="p-4 border-t sticky bottom-0 bg-background z-10 flex justify-between items-center">
        <Button variant="outline" onClick={onClearFilters} className="text-destructive hover:text-destructive">
          <X className="mr-2 h-4 w-4" /> Clear All
        </Button>
        <Button onClick={onApplyFilters}>Apply Filters</Button>
      </footer>
    </div>
  );
}
