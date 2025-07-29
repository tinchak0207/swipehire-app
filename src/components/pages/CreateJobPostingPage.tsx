'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Briefcase,
  DollarSign,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Lock,
  Tag,
  X,
} from 'lucide-react'; // Added Building2, ExternalLink
import Link from 'next/link'; // Added Link
import { type KeyboardEvent, useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CustomFileInput } from '@/components/ui/custom-file-input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { postJobToBackend } from '@/services/jobService';

const FormSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  compensation: z.string().min(1, 'Please specify compensation or prize.'),
  tags: z.string().optional(),
  actualTags: z
    .array(
      z
        .string()
        .min(1, 'Tag cannot be empty.')
        .max(20, 'Tag too long.')
        .regex(/^[a-zA-Z0-9-]+$/, 'Tag can only contain letters, numbers, and hyphens.')
    )
    .optional()
    .default([]),
  mediaFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 10 * 1024 * 1024, 'Max file size is 10MB.')
    .refine(
      (file) => !file || file.type.startsWith('image/') || file.type.startsWith('video/'),
      'Please upload a valid image or video file.'
    ),
  location: z.string().optional(),
  videoOrImageUrl: z
    .string()
    .url('Please enter a valid URL if not uploading a file.')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof FormSchema>;

interface CreateJobPostingPageProps {
  isGuestMode?: boolean;
}

function CreateJobPostingPage({ isGuestMode }: CreateJobPostingPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { mongoDbUserId, fullBackendUser } = useUserPreferences(); // Use context

  const [currentTagInput, setCurrentTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);

  // isPostingAllowed is now derived from context
  const isPostingAllowed =
    !isGuestMode &&
    !!mongoDbUserId &&
    !!fullBackendUser &&
    fullBackendUser.companyProfileComplete === true;

  // Debug logging
  useEffect(() => {
    console.log('[CreateJobPostingPage] Context state:', {
      isGuestMode,
      mongoDbUserId: !!mongoDbUserId,
      fullBackendUser: !!fullBackendUser,
      companyProfileComplete: fullBackendUser?.companyProfileComplete,
      selectedRole: fullBackendUser?.selectedRole,
      isPostingAllowed,
    });
  }, [isGuestMode, mongoDbUserId, fullBackendUser, isPostingAllowed]);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      compensation: '',
      tags: '',
      actualTags: [],
      location: '',
      mediaFile: undefined,
      videoOrImageUrl: '',
    },
  });

  const watchedMediaFile = form.watch('mediaFile');

  useEffect(() => {
    form.setValue('actualTags', tagList);
  }, [tagList, form]);

  const handleAddTag = () => {
    const newTag = currentTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (
      newTag &&
      newTag.length <= 20 &&
      /^[a-zA-Z0-9-]+$/.test(newTag) &&
      !tagList.includes(newTag) &&
      tagList.length < 10
    ) {
      setTagList([...tagList, newTag]);
    } else if (tagList.length >= 10) {
      toast({
        title: 'Tag Limit Reached',
        description: 'You can add up to 10 tags.',
        variant: 'default',
      });
    } else if (newTag && (newTag.length > 20 || !/^[a-zA-Z0-9-]+$/.test(newTag))) {
      toast({
        title: 'Invalid Tag',
        description: 'Tags must be max 20 chars, letters, numbers, or hyphens only.',
        variant: 'destructive',
      });
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
    const newTagList = tagList.filter((tag) => tag !== tagToRemove);
    setTagList(newTagList);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isGuestMode) {
      toast({
        title: 'Feature Locked',
        description: 'Please sign in as a recruiter to post jobs.',
        variant: 'default',
      });
      return;
    }
    if (!isPostingAllowed) {
      // Check the derived state
      toast({
        title: 'Profile Incomplete',
        description:
          'Please complete your recruiter company profile to post a job. You can do this via Settings or the Onboarding flow.',
        variant: 'destructive',
        duration: 7000,
      });
      return;
    }
    if (!mongoDbUserId) {
      toast({
        title: 'User Not Identified',
        description: 'Cannot post job. Please ensure you are fully logged in.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const jobDataForService = {
      title: data.title,
      description: data.description,
      salaryRange: data.compensation,
      actualTags: data.actualTags,
      location: data.location || '',
      videoOrImageUrl: data.mediaFile ? '' : data.videoOrImageUrl || '',
    };

    try {
      await postJobToBackend(mongoDbUserId, jobDataForService, data.mediaFile);
      toast({
        title: 'Job Posted!',
        description: `Your job "${data.title}" has been submitted. It will appear in the 'Find Jobs' section shortly.`,
      });
      form.reset();
      setTagList([]);
      setCurrentTagInput('');
    } catch (error: any) {
      console.error('Error posting job:', error);
      toast({
        title: 'Error Posting Job',
        description: error.message || 'Could not post the job. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isGuestMode) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-background p-6 text-center">
        <Lock className="mb-6 h-16 w-16 text-red-400" />
        <h2 className="mb-3 font-semibold text-2xl text-red-500">Access Restricted</h2>
        <p className="max-w-md text-muted-foreground">
          Posting jobs is a feature for registered recruiters. Please sign in or create a recruiter
          account to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Enhanced Header Section */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text font-bold text-4xl text-transparent md:text-5xl">
            Create Job Posting
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600 text-lg">
            Design your perfect job posting with our intuitive interface. Attract top talent with compelling descriptions and competitive offers.
          </p>
        </div>

        {!isPostingAllowed && !isGuestMode && (
          <Alert variant="destructive" className="mb-8 border-red-200/50 bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-red-700">Company Profile Incomplete to Post Jobs</AlertTitle>
            <AlertDescription className="text-red-600">
              Please complete your Company Profile.
              {fullBackendUser?.selectedRole === 'recruiter' &&
              fullBackendUser?.companyProfileComplete === false ? (
                <Link
                  href="/recruiter-onboarding"
                  className="ml-1 inline-flex items-center font-semibold text-red-700 hover:underline"
                >
                  Complete Onboarding Now <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </Link>
              ) : (
                ' You can typically do this via Settings or an onboarding flow if prompted.'
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card
          className={`w-full border-gray-200 bg-white/80 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl ${!isPostingAllowed ? 'pointer-events-none opacity-50' : ''}`}
        >
          <CardHeader className="rounded-t-xl border-b border-gray-200/50 bg-white/80 p-8 backdrop-blur-sm">
            <CardTitle className="flex items-center text-3xl font-bold text-gray-800 sm:text-4xl">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              Create New Job Posting
            </CardTitle>
            <CardDescription className="mt-3 text-gray-600 text-lg">
              Fill in the details below to post a new job, mission, or quest. Make it compelling to attract the best candidates.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 bg-white/80 p-8 backdrop-blur-sm">
              {/* Job Title Section */}
              <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:shadow-lg">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-3 flex items-center font-semibold text-gray-700 text-lg">
                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        Job Title / Mission Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Senior Software Engineer, Design a new Logo"
                          {...field}
                          disabled={!isPostingAllowed}
                          className="h-12 rounded-lg border-gray-200 bg-white/60 text-gray-800 placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Section */}
              <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:shadow-lg">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-3 flex items-center font-semibold text-gray-700 text-lg">
                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        Description & Requirements
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the role, responsibilities, required skills, and any specific quest objectives..."
                          className="min-h-[140px] resize-y rounded-lg border-gray-200 bg-white/60 text-gray-800 placeholder:text-gray-500 transition-all duration-200 focus:border-cyan-500 focus:bg-white/80 focus:ring-2 focus:ring-cyan-200"
                          {...field}
                          disabled={!isPostingAllowed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location & Compensation Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-3 flex items-center font-semibold text-gray-700 text-lg">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., San Francisco, CA or Remote (US)"
                            {...field}
                            disabled={!isPostingAllowed}
                            className="h-12 rounded-lg border-gray-200 bg-white/60 text-gray-800 placeholder:text-gray-500 transition-all duration-200 focus:border-purple-500 focus:bg-white/80 focus:ring-2 focus:ring-purple-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:shadow-lg">
                  <FormField
                    control={form.control}
                    name="compensation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-3 flex items-center font-semibold text-gray-700 text-lg">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                            <DollarSign className="h-4 w-4 text-white" />
                          </div>
                          Compensation / Prize
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., $100,000 - $120,000 per year, $500 for project completion"
                            {...field}
                            disabled={!isPostingAllowed}
                            className="h-12 rounded-lg border-gray-200 bg-white/60 text-gray-800 placeholder:text-gray-500 transition-all duration-200 focus:border-green-500 focus:bg-white/80 focus:ring-2 focus:ring-green-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 hover:shadow-lg">
                <FormItem>
                  <FormLabel className="mb-4 flex items-center font-semibold text-gray-700 text-lg">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                      <Tag className="h-4 w-4 text-white" />
                    </div>
                    Tags & Categories
                  </FormLabel>
                  
                  {/* Tag Display */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tagList.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 rounded-full border-blue-200 bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1.5 font-medium text-blue-700 text-sm transition-all duration-200 hover:shadow-md"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 text-blue-600 hover:bg-red-100 hover:text-red-600"
                          onClick={() => handleRemoveTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                          disabled={!isPostingAllowed}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  {/* Tag Input */}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <div className="flex items-center gap-3">
                        <Input
                          id="tags-input-field"
                          placeholder="Type a tag (e.g., react, javascript, remote) and press Enter"
                          value={currentTagInput}
                          onChange={(e) => {
                            setCurrentTagInput(e.target.value);
                            field.onChange(e);
                          }}
                          onKeyDown={handleTagInputKeyDown}
                          disabled={!isPostingAllowed || tagList.length >= 10}
                          className="h-12 flex-grow rounded-lg border-gray-200 bg-white/60 text-gray-800 placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
                        />
                        <Button
                          type="button"
                          onClick={handleAddTag}
                          variant="outline"
                          size="sm"
                          disabled={!isPostingAllowed || tagList.length >= 10}
                          className="h-12 rounded-lg border-gray-200 bg-white/80 px-6 font-medium text-gray-700 transition-all duration-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700 hover:shadow-md"
                        >
                          Add Tag
                        </Button>
                      </div>
                    )}
                  />
                  
                  <FormDescription className="mt-3 text-gray-600">
                    Help categorize your job posting. Add up to 10 relevant tags (letters, numbers, hyphens only, max 20 chars each).
                  </FormDescription>
                  <FormField control={form.control} name="actualTags" render={() => <FormItem />} />
                  <FormMessage>
                    {form.formState.errors.actualTags?.message ||
                      form.formState.errors.actualTags?.root?.message}
                  </FormMessage>
                </FormItem>
              </div>

              {/* Media Upload Section */}
              <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-lg">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-lg">Media Attachment</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="mediaFile"
                  render={({ field: { onChange, value, ...restField } }) => (
                    <div className="mb-4">
                      <CustomFileInput
                        id="jobMediaFile"
                        fieldLabel="Upload Picture or Video (Max 10MB)"
                        buttonText="Choose File"
                        buttonIcon={<ImageIcon className="mr-2 h-4 w-4" />}
                        selectedFileName={value?.name || null}
                        onFileSelected={(file) => onChange(file)}
                        inputProps={{ accept: 'image/*,video/*', ...restField }}
                        disabled={!isPostingAllowed || !!form.watch('videoOrImageUrl')}
                        className="rounded-lg border-gray-200 bg-white/60"
                      />
                    </div>
                  )}
                />
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-gray-500">OR</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="videoOrImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Enter Media URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.png or https://youtube.com/watch?v=..."
                          {...field}
                          disabled={!isPostingAllowed || !!watchedMediaFile}
                          className="h-12 rounded-lg border-gray-200 bg-white/60 text-gray-800 placeholder:text-gray-500 transition-all duration-200 focus:border-indigo-500 focus:bg-white/80 focus:ring-2 focus:ring-indigo-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="rounded-b-2xl border-t border-white/20 bg-gradient-to-r from-white/60 to-blue-50/60 p-8 backdrop-blur-sm">
              <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="font-medium text-gray-700 text-sm">Ready to find your perfect candidate?</p>
                  <p className="text-gray-500 text-xs">Your job posting will be reviewed and published within 24 hours.</p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !isPostingAllowed || !mongoDbUserId}
                  size="lg"
                  className="group relative overflow-hidden rounded-xl border-white/30 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 font-semibold text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-2xl focus:ring-2 focus:ring-blue-200/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Briefcase className="mr-3 h-5 w-5" />
                      Post Job
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default CreateJobPostingPage;
