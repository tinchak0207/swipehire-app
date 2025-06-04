
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ResumeData } from '@/components/pages/ResumeCreationFlowPage';
import type { ResumeProcessorInput } from '@/ai/flows/resume-processor-flow';
import { Loader2, Wand2, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge'; // Added Badge import
import { useToast } from '@/hooks/use-toast'; // Added useToast import

interface Step1Props {
  initialData?: Partial<ResumeData>;
  onSubmit: (data: Pick<ResumeProcessorInput, 'resumeText' | 'desiredWorkStyle' | 'toneAndStyle' | 'industryTemplate'>) => void;
  isProcessing?: boolean;
}

const toneAndStyleOptions: { value: ResumeProcessorInput['toneAndStyle'], label: string }[] = [
  { value: "professional", label: "Professional & Formal" },
  { value: "friendly", label: "Relaxed & Friendly" },
  { value: "technical", label: "Technology-Oriented" },
  { value: "sales", label: "Sales-Oriented" },
  { value: "general", label: "General (Versatile)"},
];

const industryTemplateOptions: { value: ResumeProcessorInput['industryTemplate'], label: string }[] = [
  { value: "general", label: "General / Other" },
  { value: "technology", label: "Technology Industry" },
  { value: "creative", label: "Creative Industry" },
  { value: "finance", label: "Financial Industry" },
  { value: "education", label: "Education Industry" },
];


export function Step1_ResumeInput({ initialData, onSubmit, isProcessing }: Step1Props) {
  const [resumeText, setResumeText] = useState(initialData?.resumeText || '');
  const [desiredWorkStyle, setDesiredWorkStyle] = useState(initialData?.desiredWorkStyle || '');
  const [toneAndStyle, setToneAndStyle] = useState<ResumeProcessorInput['toneAndStyle']>(initialData?.toneAndStyle || 'professional');
  const [industryTemplate, setIndustryTemplate] = useState<ResumeProcessorInput['industryTemplate']>(initialData?.industryTemplate || 'general');
  const { toast } = useToast();

  useEffect(() => {
    setResumeText(initialData?.resumeText || '');
    setDesiredWorkStyle(initialData?.desiredWorkStyle || '');
    setToneAndStyle(initialData?.toneAndStyle || 'professional');
    setIndustryTemplate(initialData?.industryTemplate || 'general');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeText.length < 50) {
        toast({
            title: "Resume Text Too Short",
            description: "Please provide at least 50 characters for your resume/experience highlights.",
            variant: "default" // Use default or warning, not destructive unless it's a critical error
        });
        return;
    }
    if (desiredWorkStyle.length < 5) {
        toast({
            title: "Work Style Too Short",
            description: "Please describe your desired work style in at least 5 characters.",
            variant: "default"
        });
        return;
    }
    onSubmit({ resumeText, desiredWorkStyle, toneAndStyle, industryTemplate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeInPage">
      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
        <Info className="h-5 w-5 !text-blue-600" />
        <AlertTitle className="font-semibold text-blue-800">Step 1: Tell Us About Yourself</AlertTitle>
        <AlertDescription className="text-blue-700/90">
          Paste your resume or key experience highlights below. Then, describe your ideal work style and choose a tone. 
          Our AI will use this to suggest skills and generate initial script ideas for your video resume.
          <br />
          <strong className="font-medium">Note:</strong> Direct PDF parsing is a future enhancement. For now, please paste text.
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="resumeText" className="block text-md font-semibold mb-1">Paste Resume / Core Experience</Label>
        <Textarea
          id="resumeText"
          placeholder="Paste your full resume here, or summarize your key experiences, achievements, and what you're passionate about..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="min-h-[150px] text-sm"
          required
          disabled={isProcessing}
        />
         <p className="text-xs text-muted-foreground mt-1">Minimum 50 characters required.</p>
      </div>

      <div>
        <Label htmlFor="desiredWorkStyle" className="block text-md font-semibold mb-1">Desired Work Style</Label>
        <Input
          id="desiredWorkStyle"
          placeholder="e.g., 'Remote, collaborative team', 'Fast-paced startup environment'"
          value={desiredWorkStyle}
          onChange={(e) => setDesiredWorkStyle(e.target.value)}
          className="text-sm"
          required
          disabled={isProcessing}
        />
        <p className="text-xs text-muted-foreground mt-1">Minimum 5 characters. Briefly describe your preferred work environment or style.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="toneAndStyle" className="block text-md font-semibold mb-1">Script Tone & Style</Label>
          <Select value={toneAndStyle} onValueChange={(value) => setToneAndStyle(value as ResumeProcessorInput['toneAndStyle'])} disabled={isProcessing}>
            <SelectTrigger id="toneAndStyle" className="text-sm"><SelectValue placeholder="Select tone" /></SelectTrigger>
            <SelectContent>
              {toneAndStyleOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="industryTemplate" className="block text-md font-semibold mb-1">Industry Focus</Label>
          <Select value={industryTemplate} onValueChange={(value) => setIndustryTemplate(value as ResumeProcessorInput['industryTemplate'])} disabled={isProcessing}>
            <SelectTrigger id="industryTemplate" className="text-sm"><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>
              {industryTemplateOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {initialData?.suggestedSkills && initialData.suggestedSkills.length > 0 && !isProcessing && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-sm font-semibold text-green-700 mb-1">AI Suggested Skills (from previous run):</h4>
            <div className="flex flex-wrap gap-1.5">
                {initialData.suggestedSkills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{skill}</Badge>
                ))}
            </div>
            <p className="text-xs text-green-600 mt-1">These can be edited in your main profile later.</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isProcessing || !resumeText.trim() || !desiredWorkStyle.trim() || resumeText.length < 50}>
          {isProcessing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-5 w-5" />
          )}
          {isProcessing ? 'Processing with AI...' : 'Generate Script Ideas'}
        </Button>
      </div>
    </form>
  );
}

    
