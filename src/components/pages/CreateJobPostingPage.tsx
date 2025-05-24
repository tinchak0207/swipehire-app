
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, Tag, DollarSign, FileText, Briefcase, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Company, CompanyJobOpening } from '@/lib/types'; 

const FormSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  compensation: z.string().min(1, "Please specify compensation or prize."),
  tags: z.string().refine(value => {
    if (!value) return true; 
    const tags = value.split(',').map(tag => tag.trim());
    return tags.every(tag => tag.length > 0 && tag.length <= 20 && !tag.includes(' '));
  }, "Tags should be comma-separated, no spaces within tags, max 20 chars each."),
  mediaFile: z.custom<FileList>((val) => val === undefined || (val instanceof FileList && val.length <= 1), "Only one file can be uploaded.")
    .refine(files => files === undefined || files.length === 0 || files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`) 
    .refine(files => files === undefined || files.length === 0 || files?.[0]?.type.startsWith("image/") || files?.[0]?.type.startsWith("video/"), "Please upload a valid image or video file.")
    .optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function CreateJobPostingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPostingAllowed, setIsPostingAllowed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profileComplete = localStorage.getItem('recruiterProfileComplete') === 'true';
      setIsPostingAllowed(profileComplete);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      compensation: "",
      tags: "",
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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!isPostingAllowed) {
        toast({
            title: "Profile Incomplete",
            description: "Please complete your profile in Settings to post a job.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);

    // Construct CompanyJobOpening from form data
    const newJobOpening: CompanyJobOpening = {
      title: data.title,
      description: data.description,
      salaryRange: data.compensation,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      // videoOrImageUrl: For this demo, we won't handle file uploads to a persistent URL.
      // If data.mediaFile exists, you might generate a temporary ObjectURL or DataURL for immediate preview,
      // but it won't persist in localStorage well or be shareable.
    };

    // Wrap the job opening in a new Company object
    const newCompanyForJob: Company = {
      id: `user-posted-comp-${Date.now()}`, // Unique ID for the new company wrapper
      name: "Community Job Post", // Generic name for these kinds of listings
      industry: 'Various',
      description: `A new opportunity: ${data.title}. This job was posted directly by a recruiter.`, // Company-level description
      cultureHighlights: [],
      logoUrl: 'https://placehold.co/300x200.png?text=New+Job', // Generic logo
      dataAiHint: 'job post',
      jobOpenings: [newJobOpening], // The actual job details
    };
    
    try {
      const existingUserCompaniesString = localStorage.getItem('userPostedCompanies');
      const existingUserCompanies: Company[] = existingUserCompaniesString ? JSON.parse(existingUserCompaniesString) : [];
      // Add new job to the beginning of the list so it appears first
      localStorage.setItem('userPostedCompanies', JSON.stringify([newCompanyForJob, ...existingUserCompanies]));

      toast({
        title: "Job Posted!",
        description: `Your job "${data.title}" has been submitted and is now visible in the 'Find Jobs' section (for this demo).`,
      });

      form.reset();
      setFileName(null);
    } catch (error) {
      console.error("Error saving job to localStorage:", error);
      toast({
        title: "Error",
        description: "Could not save the job posting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {!isPostingAllowed && (
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

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center"><Tag className="mr-2 h-5 w-5 text-muted-foreground" />Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., react,full-time,design,urgent" {...field} disabled={!isPostingAllowed}/>
                    </FormControl>
                     <FormDescription>
                      Help categorize your job. Use commas to separate tags (e.g., engineering,remote,full-stack).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              <Button type="submit" disabled={isLoading || !isPostingAllowed} size="lg" className="w-full sm:w-auto">
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
