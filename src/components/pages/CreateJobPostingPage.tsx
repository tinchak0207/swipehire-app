
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
import { Loader2, UploadCloud, Tag, DollarSign, FileText, Briefcase, AlertTriangle, Lock, X, Image as ImageIcon, Building2, ExternalLink } from 'lucide-react'; // Added Building2, ExternalLink
import { useToast } from '@/hooks/use-toast';
import type { CompanyJobOpening } from '@/lib/types';
import { postJobToBackend } from '@/services/jobService';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Badge } from '@/components/ui/badge';
import { CustomFileInput } from '@/components/ui/custom-file-input';
import Link from 'next/link'; // Added Link

const FormSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  compensation: z.string().min(1, "Please specify compensation or prize."),
  tags: z.string().optional(),
  actualTags: z.array(z.string().min(1, "Tag cannot be empty.").max(20, "Tag too long.").regex(/^[a-zA-Z0-9-]+$/, "Tag can only contain letters, numbers, and hyphens.")).optional().default([]),
  mediaFile: z.instanceof(File).optional()
    .refine(file => !file || file.size <= 10 * 1024 * 1024, `Max file size is 10MB.`)
    .refine(file => !file || file.type.startsWith("image/") || file.type.startsWith("video/"), "Please upload a valid image or video file."),
  location: z.string().optional(),
  videoOrImageUrl: z.string().url("Please enter a valid URL if not uploading a file.").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof FormSchema>;


interface CreateJobPostingPageProps {
  isGuestMode?: boolean;
}

export function CreateJobPostingPage({ isGuestMode }: CreateJobPostingPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { mongoDbUserId, fullBackendUser } = useUserPreferences(); // Use context

  const [currentTagInput, setCurrentTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);

  // isPostingAllowed is now derived from context
  const isPostingAllowed = !isGuestMode && !!mongoDbUserId && !!fullBackendUser && fullBackendUser.companyProfileComplete === true;


  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      compensation: "",
      tags: "",
      actualTags: [],
      location: "",
      mediaFile: undefined,
      videoOrImageUrl: "",
    },
  });

  const watchedMediaFile = form.watch('mediaFile');

  useEffect(() => {
    form.setValue('actualTags', tagList);
  }, [tagList, form]);

  const handleAddTag = () => {
    const newTag = currentTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (newTag && newTag.length <= 20 && /^[a-zA-Z0-9-]+$/.test(newTag) && !tagList.includes(newTag) && tagList.length < 10) {
      setTagList([...tagList, newTag]);
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
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isGuestMode) {
        toast({ title: "Feature Locked", description: "Please sign in as a recruiter to post jobs.", variant: "default" });
        return;
    }
    if (!isPostingAllowed) { // Check the derived state
        toast({ title: "Profile Incomplete", description: "Please complete your recruiter company profile to post a job. You can do this via Settings or the Onboarding flow.", variant: "destructive", duration: 7000 });
        return;
    }
    if (!mongoDbUserId) {
        toast({ title: "User Not Identified", description: "Cannot post job. Please ensure you are fully logged in.", variant: "destructive"});
        return;
    }

    setIsLoading(true);

    const jobDataForService = {
      title: data.title,
      description: data.description,
      salaryRange: data.compensation,
      actualTags: data.actualTags,
      location: data.location || undefined,
      videoOrImageUrl: data.mediaFile ? undefined : data.videoOrImageUrl,
    };

    try {
      await postJobToBackend(mongoDbUserId, jobDataForService, data.mediaFile);
      toast({
        title: "Job Posted!",
        description: `Your job "${data.title}" has been submitted. It will appear in the 'Find Jobs' section shortly.`,
      });
      form.reset();
      setTagList([]);
      setCurrentTagInput('');
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
          <AlertTitle>Company Profile Incomplete to Post Jobs</AlertTitle>
          <AlertDescription>
            Please complete your Company Profile.
            {fullBackendUser?.selectedRole === 'recruiter' && fullBackendUser?.companyProfileComplete === false ? (
              <Link href="/recruiter-onboarding" className="ml-1 text-destructive-foreground hover:underline font-semibold inline-flex items-center">
                Complete Onboarding Now <ExternalLink className="ml-1 h-3.5 w-3.5"/>
              </Link>
            ) : (
              " You can typically do this via Settings or an onboarding flow if prompted."
            )}
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
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                    <Input
                      id="tags-input-field"
                      placeholder="Type a tag (e.g., react) and press Enter or comma"
                      value={currentTagInput}
                      onChange={(e) => {
                        setCurrentTagInput(e.target.value);
                        field.onChange(e);
                      }}
                      onKeyDown={handleTagInputKeyDown}
                      disabled={!isPostingAllowed || tagList.length >= 10}
                      className="flex-grow"
                    />
                     <Button type="button" onClick={handleAddTag} variant="outline" size="sm" disabled={!isPostingAllowed || tagList.length >= 10}>Add Tag</Button>
                    </div>
                  )}
                />
                <FormDescription>
                  Help categorize your job. Add up to 10 tags (letters, numbers, hyphens only, max 20 chars each).
                </FormDescription>
                <FormField
                  control={form.control}
                  name="actualTags"
                  render={() => null}
                />
                <FormMessage>{form.formState.errors.actualTags?.message || form.formState.errors.actualTags?.root?.message}</FormMessage>
              </FormItem>

              <FormField
                control={form.control}
                name="mediaFile"
                render={({ field: { onChange, value, ...restField } }) => (
                  <CustomFileInput
                    id="jobMediaFile"
                    fieldLabel="Optional: Picture or Video (Max 10MB)"
                    buttonText="Upload Media"
                    buttonIcon={<ImageIcon className="mr-2 h-4 w-4"/>}
                    selectedFileName={value?.name}
                    onFileSelected={(file) => onChange(file)}
                    inputProps={{ accept: "image/*,video/*", ...restField }}
                    disabled={!isPostingAllowed || !!form.watch("videoOrImageUrl")}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="videoOrImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Or Enter Media URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.png or /video.mp4"
                        {...field}
                        disabled={!isPostingAllowed || !!watchedMediaFile}
                      />
                    </FormControl>
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
