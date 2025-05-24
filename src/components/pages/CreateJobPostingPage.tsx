
"use client";

import { useState, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, UploadCloud, Tag, DollarSign, FileText, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { JobPosting } from '@/lib/types'; // Assuming JobPosting type is defined

const FormSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  compensation: z.string().min(1, "Please specify compensation or prize."),
  tags: z.string().refine(value => {
    if (!value) return true; // Optional or handle as needed
    const tags = value.split(',').map(tag => tag.trim());
    return tags.every(tag => tag.length > 0 && tag.length <= 20 && !tag.includes(' '));
  }, "Tags should be comma-separated, no spaces within tags, max 20 chars each."),
  mediaFile: z.custom<FileList>((val) => val === undefined || (val instanceof FileList && val.length <= 1), "Only one file can be uploaded.")
    .refine(files => files === undefined || files.length === 0 || files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`) // Example: 5MB limit
    .refine(files => files === undefined || files.length === 0 || files?.[0]?.type.startsWith("image/") || files?.[0]?.type.startsWith("video/"), "Please upload a valid image or video file.")
    .optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function CreateJobPostingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

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
    setIsLoading(true);
    console.log("Job Posting Data:", data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you would:
    // 1. Upload mediaFile if present to a storage service and get its URL.
    // 2. Save the job posting data (including mediaUrl) to your backend.
    // 3. Potentially update mockData or a global state to make it appear in recommendations.

    const newJobPosting: Partial<JobPosting> = {
      id: `job-${Date.now()}`, // Temporary ID
      title: data.title,
      description: data.description,
      compensation: data.compensation,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      // mediaUrl: uploadedMediaUrl, // From storage service
      companyId: 'current-user-company-id', // Placeholder
      postedAt: new Date(),
    };
    
    console.log("Formatted Job Posting:", newJobPosting);

    toast({
      title: "Job Posted Successfully!",
      description: `Your job "${data.title}" is now live.`,
    });

    form.reset();
    setFileName(null);
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Card className="w-full shadow-xl">
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
                      <Input placeholder="e.g., Senior Software Engineer, Design a new Logo" {...field} />
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
                      <Input placeholder="e.g., $100,000 - $120,000 per year, $500 for project completion" {...field} />
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
                      <Input placeholder="e.g., react,full-time,design,urgent" {...field} />
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
                      />
                    </FormControl>
                    {fileName && <p className="text-sm text-muted-foreground mt-1">Selected file: {fileName}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
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
