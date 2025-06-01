
"use client";

import { useState, type ChangeEvent, useEffect, type KeyboardEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, Tag, DollarSign, FileText, Briefcase, AlertTriangle, Lock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CompanyJobOpening } from '@/lib/types'; 
import { postJobToBackend } from '@/services/jobService';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Badge } from '@/components/ui/badge'; // Added Badge

const FormSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  compensation: z.string().min(1, "Please specify compensation or prize."),
  // tags: z.string().refine(value => { // Old string validation
  //   if (!value) return true; 
  //   const tags = value.split(',').map(tag => tag.trim());
  //   return tags.every(tag => tag.length > 0 && tag.length <= 20 && !tag.includes(' '));
  // }, "Tags should be comma-separated, no spaces within tags, max 20 chars each."),
  tags: z.array(z.string().min(1, "Tag cannot be empty.").max(20, "Tag too long.").regex(/^[a-zA-Z0-9-]+$/, "Tag can only contain letters, numbers, and hyphens.")).optional(),
  mediaFile: z.custom<FileList>((val) => val === undefined || (val instanceof FileList && val.length <= 1), "Only one file can be uploaded.")
    .refine(files => files === undefined || files.length === 0 || files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`) 
    .refine(files => files === undefined || files.length === 0 || files?.[0]?.type.startsWith("image/") || files?.[0]?.type.startsWith("video/"), "Please upload a valid image or video file.")
    .optional(),
  location: z.string().optional(),
});

// Adjust FormValues to reflect tags as an array
type FormValues = Omit<z.infer<typeof FormSchema>, 'tags'> & {
  tags?: string; // Keep this for the input field itself
  actualTags?: string[]; // This will be used for the form submission
};


interface CreateJobPostingPageProps {
  isGuestMode?: boolean;
}

export function CreateJobPostingPage({ isGuestMode }: CreateJobPostingPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPostingAllowed, setIsPostingAllowed] = useState(false);
  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences();

  // State for tag input
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);


  useEffect(() => {
    if (typeof window !== 'undefined' && !isGuestMode) {
      const profileComplete = localStorage.getItem('recruiterProfileComplete') === 'true';
      setIsPostingAllowed(profileComplete);
    } else {
      setIsPostingAllowed(false); 
    }
  }, [isGuestMode]);

  const form = useForm<FormValues>({ // Use updated FormValues
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      compensation: "",
      tags: "", // This will be the string input, not directly used for submission of tags
      actualTags: [], // Initialize actualTags as an empty array
      location: "",
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  const handleAddTag = () => {
    const newTag = currentTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (newTag && newTag.length <= 20 && /^[a-zA-Z0-9-]+$/.test(newTag) && !tagList.includes(newTag) && tagList.length < 10) {
      setTagList([...tagList, newTag]);
      form.setValue('actualTags', [...tagList, newTag]); // Update RHF state for actualTags
    } else if (tagList.length >= 10) {
      toast({ title: "Tag Limit Reached", description: "You can add up to 10 tags.", variant: "default"});
    } else if (newTag && (newTag.length > 20 || !/^[a-zA-Z0-9-]+$/.test(newTag))) {
      toast({ title: "Invalid Tag", description: "Tags must be max 20 chars, letters, numbers, or hyphens only.", variant: "destructive"});
    }
    setCurrentTagInput('');
  };

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTagList = tagList.filter(tag => tag !== tagToRemove);
    setTagList(newTagList);
    form.setValue('actualTags', newTagList); // Update RHF state for actualTags
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isGuestMode) {
        toast({ title: "Feature Locked", description: "Please sign in as a recruiter to post jobs.", variant: "default" });
        return;
    }
    if (!isPostingAllowed) {
        toast({ title: "Profile Incomplete", description: "Please complete your recruiter profile in Settings to post a job.", variant: "destructive" });
        return;
    }
    if (!mongoDbUserId) {
        toast({ title: "User Not Identified", description: "Cannot post job. Please ensure you are fully logged in.", variant: "destructive"});
        return;
    }

    setIsLoading(true);

    const jobOpeningData: Omit<CompanyJobOpening, 'companyNameForJob' | 'companyLogoForJob' | 'companyIndustryForJob' | 'postedAt' | '_id'> = {
      title: data.title,
      description: data.description,
      salaryRange: data.compensation,
      tags: tagList, // Use the tagList state directly
      location: data.location || undefined,
      videoOrImageUrl: data.mediaFile && data.mediaFile.length > 0 ? 'https://placehold.co/600x400.png' : undefined,
      dataAiHint: data.mediaFile && data.mediaFile.length > 0 ? data.title.substring(0,20) || 'job media' : undefined,
    };
    
    try {
      await postJobToBackend(mongoDbUserId, jobOpeningData);
      toast({
        title: "Job Posted!",
        description: `Your job "${data.title}" has been submitted. It will appear in the 'Find Jobs' section shortly.`,
      });
      form.reset();
      setTagList([]); // Clear tag list
      form.setValue('actualTags', []); // Clear RHF tag list
      setFileName(null);
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        title: "Error Posting Job",
        description: error.message || "Could not post the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isGuestMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-background">
        <Lock className="h-16 w-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-red-500 mb-3">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          Posting jobs is a feature for registered recruiters. Please sign in or create a recruiter account to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {!isPostingAllowed && !isGuestMode && ( 
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Profile Incomplete to Post Jobs</AlertTitle>
          <AlertDescription>
            Please complete your Name and Email in the <strong>Settings</strong> page to enable job posting.
          </AlertDescription>
        </Alert>
      )}
      <Card className={`w-full shadow-xl ${!isPostingAllowed ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl sm:text-3xl">
            <Briefcase className="mr-3 h-7 w-7 text-primary" />
            Create New Job Posting
          </CardTitle>
          <CardDescription>
            Fill in the details below to post a new job, mission, or quest.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-muted-foreground" />Job Title / Mission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Software Engineer, Design a new Logo" {...field} disabled={!isPostingAllowed}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-muted-foreground" />Description & Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the role, responsibilities, required skills, and any specific quest objectives..."
                        className="resize-y min-h-[120px]"
                        {...field}
                        disabled={!isPostingAllowed}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-muted-foreground" />Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA or Remote (US)" {...field} disabled={!isPostingAllowed}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center"><DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />Compensation / Prize</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $100,000 - $120,000 per year, $500 for project completion" {...field} disabled={!isPostingAllowed}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Updated Tags Field */}
              <FormItem>
                <FormLabel className="text-lg flex items-center"><Tag className="mr-2 h-5 w-5 text-muted-foreground" />Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tagList.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-2">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        disabled={!isPostingAllowed}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="tags"
                    placeholder="Type a tag (e.g., react) and press Enter or comma"
                    value={currentTagInput}
                    onChange={(e) => setCurrentTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    disabled={!isPostingAllowed || tagList.length >= 10}
                    className="flex-grow"
                  />
                   <Button type="button" onClick={handleAddTag} variant="outline" size="sm" disabled={!isPostingAllowed || tagList.length >= 10}>Add Tag</Button>
                </div>
                <FormDescription>
                  Help categorize your job. Add up to 10 tags (letters, numbers, hyphens only, max 20 chars each).
                </FormDescription>
                 <FormField
                  control={form.control}
                  name="actualTags" // This is a hidden field for RHF to track the actual array for validation
                  render={({ field }) => ( <Input type="hidden" {...field} /> )}
                />
                <FormMessage>{form.formState.errors.tags?.message || form.formState.errors.actualTags?.message}</FormMessage>
              </FormItem>
              
              <FormField
                control={form.control}
                name="mediaFile"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center"><UploadCloud className="mr-2 h-5 w-5 text-muted-foreground" />Optional: Picture or Video (Max 5MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                            onChange(e.target.files);
                            handleFileChange(e);
                        }}
                        className="file:text-primary file:font-semibold file:bg-primary/10 file:hover:bg-primary/20 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:border-none"
                        {...rest}
                        disabled={!isPostingAllowed}
                      />
                    </FormControl>
                    {fileName && <p className="text-sm text-muted-foreground mt-1">Selected file: {fileName}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || !isPostingAllowed || !mongoDbUserId} size="lg" className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Briefcase className="mr-2 h-5 w-5" />
                )}
                Post Job
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
