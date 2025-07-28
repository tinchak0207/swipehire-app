'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formatDistanceToNow } from 'date-fns';
import {
  Archive,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Code2,
  DollarSign,
  Edit3,
  Eye,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  Lock,
  MapPin,
  Pause,
  Play,
  PlusCircle,
  PowerOff,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import NextImage from 'next/image';
import { type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { ReputationScoreCard } from '@/components/recruiter/ReputationScoreCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as ShadAlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle as ShadCardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Added Select
import { Textarea } from '@/components/ui/textarea';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import type { CompanyJobOpening } from '@/lib/types';
import { type JobType, WorkExperienceLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { deleteRecruiterJob, fetchRecruiterJobs, updateRecruiterJob } from '@/services/jobService';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

const JobStatusEnum = z.enum(['draft', 'active', 'paused', 'expired', 'filled', 'closed']);

const JobFormSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(5, 'Job title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  salaryRange: z.string().min(1, 'Please specify compensation or prize.'),
  tags: z.string().optional(),
  actualTags: z
    .array(
      z
        .string()
        .min(1)
        .max(20)
        .regex(/^[a-zA-Z0-9-]+$/)
    )
    .optional()
    .default([]),
  location: z.string().optional(),
  videoOrImageUrl: z
    .string()
    .url('Invalid URL format, or leave empty if not applicable.')
    .optional()
    .or(z.literal('')),
  jobType: z.string().optional(),
  requiredExperienceLevel: z.string().optional(),
  status: JobStatusEnum.optional(), // Added status to form schema
});

type JobFormValues = z.infer<typeof JobFormSchema>;

interface ManageJobPostingsPageProps {
  isGuestMode?: boolean;
}

const CircularProgressBarPreview = ({
  percentage,
  size = 80,
  displayText,
}: {
  percentage: number;
  size?: number;
  displayText?: string;
}) => {
  const radius = size / 2;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const effectivePercentage = displayText === '?' ? 0 : percentage;
  const strokeDashoffset = circumference - (effectivePercentage / 100) * circumference;

  return (
    <svg
      height={size}
      width={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90 transform"
    >
      <circle
        className="fill-transparent stroke-white/20"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {effectivePercentage > 0 && (
        <circle
          className="fill-transparent"
          stroke="url(#previewProgressGradientCompanyCard)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 0.35s ease-out',
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      )}
      <defs>
        <linearGradient id="previewProgressGradientCompanyCard" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y={displayText ? '50%' : '48%'}
        dy=".3em"
        textAnchor="middle"
        className={cn(
          'origin-center rotate-90 transform fill-white font-bold',
          size >= 80 ? 'text-xl' : 'text-lg'
        )}
      >
        {displayText ? displayText : `${Math.round(percentage)}%`}
      </text>
      {!displayText && (
        <text
          x="50%"
          y="62%"
          dy=".3em"
          textAnchor="middle"
          className={cn(
            'origin-center rotate-90 transform fill-white/80',
            size >= 80 ? 'text-xs' : 'text-[10px]'
          )}
        >
          match
        </text>
      )}
    </svg>
  );
};

export function ManageJobPostingsPage({ isGuestMode }: ManageJobPostingsPageProps) {
  const [jobs, setJobs] = useState<CompanyJobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingJob, setEditingJob] = useState<CompanyJobOpening | null>(null);
  const [jobToDelete, setJobToDelete] = useState<CompanyJobOpening | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  const [previewingJob, setPreviewingJob] = useState<CompanyJobOpening | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [reputationScore, _setReputationScore] = useState(82);
  const [replyRate, _setReplyRate] = useState(90);
  const [effectiveReplyRate, _setEffectiveReplyRate] = useState(95);
  const [boostStatus, _setBoostStatus] = useState<'increased' | 'decreased' | null>('increased');

  const { mongoDbUserId, fullBackendUser } = useUserPreferences();
  const { toast } = useToast();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      salaryRange: '',
      tags: '',
      actualTags: [],
      location: '',
      videoOrImageUrl: '',
      jobType: '',
      requiredExperienceLevel: '',
      status: 'active',
    },
  });

  const loadJobs = useCallback(async () => {
    if (isGuestMode || !mongoDbUserId) {
      setJobs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedJobs = await fetchRecruiterJobs(mongoDbUserId);
      setJobs(fetchedJobs);
    } catch (error: any) {
      toast({ title: 'Error Loading Jobs', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [mongoDbUserId, toast, isGuestMode]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (editingJob) {
      form.reset({
        _id: (editingJob as any)._id,
        title: editingJob.title,
        description: editingJob.description,
        salaryRange: editingJob.salaryRange || '',
        tags: editingJob.tags?.join(', ') || '',
        actualTags: editingJob.tags || [],
        location: editingJob.location || '',
        videoOrImageUrl: editingJob.videoOrImageUrl || '',
        jobType: editingJob.jobType || '',
        requiredExperienceLevel: editingJob.requiredExperienceLevel || '',
        status: editingJob.status || 'active',
      });
      setCurrentTags(editingJob.tags || []);
    } else {
      form.reset({
        title: '',
        description: '',
        salaryRange: '',
        tags: '',
        actualTags: [],
        location: '',
        videoOrImageUrl: '',
        jobType: '',
        requiredExperienceLevel: '',
        status: 'active',
      });
      setCurrentTags([]);
    }
  }, [editingJob, form]);

  useEffect(() => {
    form.setValue('actualTags', currentTags);
  }, [currentTags, form]);

  const handleEditJob = (job: CompanyJobOpening) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleDeleteJobConfirm = async () => {
    if (!jobToDelete || !mongoDbUserId || !(jobToDelete as any)._id) return;
    setIsSubmitting(true);
    try {
      await deleteRecruiterJob(mongoDbUserId, (jobToDelete as any)._id);
      toast({ title: 'Job Deleted', description: `"${jobToDelete.title}" has been removed.` });
      loadJobs();
    } catch (error: any) {
      toast({ title: 'Error Deleting Job', description: error.message, variant: 'destructive' });
    } finally {
      setJobToDelete(null);
      setIsAlertOpen(false);
      setIsSubmitting(false);
    }
  };

  const onSubmitEditForm: SubmitHandler<JobFormValues> = async (data) => {
    if (!editingJob || !mongoDbUserId || !(editingJob as any)._id) return;

    setIsSubmitting(true);

    const jobDataToUpdate: Partial<CompanyJobOpening> = {
      title: data.title,
      description: data.description,
      salaryRange: data.salaryRange,
      tags: data.actualTags,
      location: data.location || '',
      videoOrImageUrl: data.videoOrImageUrl || '',
      jobType: (data.jobType as JobType) || undefined,
      requiredExperienceLevel: (data.requiredExperienceLevel as WorkExperienceLevel) || undefined,
      status: data.status || 'active',
    };

    try {
      await updateRecruiterJob(mongoDbUserId, (editingJob as any)._id, jobDataToUpdate);
      toast({
        title: 'Job Updated',
        description: `"${data.title}" has been successfully updated.`,
      });
      setIsEditModalOpen(false);
      setEditingJob(null);
      loadJobs();
    } catch (error: any) {
      toast({ title: 'Error Updating Job', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeJobStatus = async (jobId: string, newStatus: CompanyJobOpening['status']) => {
    if (!mongoDbUserId || !jobId) return;
    setIsSubmitting(true); // Can use a more specific loading state if needed
    try {
      await updateRecruiterJob(mongoDbUserId, jobId, { status: newStatus || 'active' });
      toast({ title: 'Job Status Updated', description: `Job status changed to ${newStatus}.` });
      loadJobs();
    } catch (error: any) {
      toast({ title: 'Error Updating Status', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTagInEdit = () => {
    const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (
      newTag &&
      newTag.length <= 20 &&
      /^[a-zA-Z0-9-]+$/.test(newTag) &&
      !currentTags.includes(newTag) &&
      currentTags.length < 10
    ) {
      setCurrentTags([...currentTags, newTag]);
    } else if (currentTags.length >= 10) {
      toast({ title: 'Tag Limit Reached', description: 'Max 10 tags.', variant: 'default' });
    } else if (newTag) {
      toast({
        title: 'Invalid Tag',
        description: 'Tags: max 20 chars, letters, numbers, hyphens.',
        variant: 'destructive',
      });
    }
    setTagInput('');
  };

  const handleTagInputKeyDownInEdit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTagInEdit();
    }
  };

  const handleRemoveTagInEdit = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter((tag) => tag !== tagToRemove));
  };

  const handlePreviewJob = (job: CompanyJobOpening) => {
    setPreviewingJob(job);
    setIsPreviewModalOpen(true);
  };

  const getMediaType = (url?: string): 'image' | 'video' | 'unknown' => {
    if (!url) return 'unknown';
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return 'image';
    if (/\.(mp4|webm|ogv|mov)$/i.test(url)) return 'video';
    return 'unknown';
  };

  const getStatusBadgeClasses = (status?: CompanyJobOpening['status']): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'paused':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'filled':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'expired':
      case 'closed':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'draft':
        return 'bg-gray-400 hover:bg-gray-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  if (isGuestMode) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-background p-6 text-center">
        <Lock className="mr-2 mb-6 h-16 w-16 text-red-400" />
        <h2 className="mb-3 font-semibold text-2xl text-red-500">Access Restricted</h2>
        <p className="max-w-md text-muted-foreground">
          Managing job postings is a feature for registered recruiters. Please sign in.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-center sm:text-left">
          <ShadCardTitle className="flex items-center font-bold text-3xl tracking-tight md:text-4xl">
            <Briefcase className="mr-3 h-8 w-8 text-primary" /> Manage Your Job Postings
          </ShadCardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            View, edit, or delete your active job listings.
          </CardDescription>
        </div>
      </div>

      <ReputationScoreCard
        score={reputationScore}
        replyRate={replyRate}
        effectiveReplyRate={effectiveReplyRate}
        boostStatus={boostStatus}
      />

      {jobs.length === 0 ? (
        <div className="rounded-lg bg-card py-10 text-center shadow">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
          <Button
            onClick={() => {
              /* TODO: navigate to create job page if separate */
            }}
            className="mt-4"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const mediaType = getMediaType(job.videoOrImageUrl);
            const fullMediaUrl = job.videoOrImageUrl?.startsWith('/uploads/')
              ? `${CUSTOM_BACKEND_URL}${job.videoOrImageUrl}`
              : job.videoOrImageUrl;

            return (
              <Card key={(job as any)._id} className="shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2">
                        <ShadCardTitle className="truncate text-primary text-xl" title={job.title}>
                          {job.title}
                        </ShadCardTitle>
                        <Badge
                          className={cn('text-xs capitalize', getStatusBadgeClasses(job.status))}
                        >
                          {job.status || 'Unknown'}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {job.location || 'Not specified'} - {job.jobType || 'Not specified'}
                        <span className="mt-0.5 block text-muted-foreground/80 text-xs">
                          Posted:{' '}
                          {formatDistanceToNow(new Date(job.postedAt || Date.now()), {
                            addSuffix: true,
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewJob(job)}>
                        <Eye className="mr-1.5 h-4 w-4" /> Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                        <Edit3 className="mr-1.5 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setJobToDelete(job);
                          setIsAlertOpen(true);
                        }}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-start gap-4 text-sm">
                  {fullMediaUrl && (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24">
                      {mediaType === 'image' ? (
                        <NextImage
                          src={fullMediaUrl}
                          alt={job.title}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                          data-ai-hint={job.dataAiHint || 'job post image'}
                          unoptimized={
                            !!(
                              fullMediaUrl?.startsWith(CUSTOM_BACKEND_URL) ||
                              fullMediaUrl?.startsWith('http://localhost')
                            )
                          }
                        />
                      ) : mediaType === 'video' ? (
                        <Film className="h-10 w-10 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div className="flex-grow">
                    <p className="line-clamp-2 text-muted-foreground">{job.description}</p>
                    {job.tags && job.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 pb-3">
                  <Select
                    value={job.status || 'active'}
                    onValueChange={(newStatus: string) =>
                      handleChangeJobStatus(
                        (job as any)._id,
                        newStatus as CompanyJobOpening['status']
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9 w-full text-xs sm:w-[200px]">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <Play className="mr-1.5 inline h-3.5 w-3.5 text-green-500" />
                        Active
                      </SelectItem>
                      <SelectItem value="paused">
                        <Pause className="mr-1.5 inline h-3.5 w-3.5 text-yellow-500" />
                        Paused
                      </SelectItem>
                      <SelectItem value="filled">
                        <CheckCircle className="mr-1.5 inline h-3.5 w-3.5 text-blue-500" />
                        Filled
                      </SelectItem>
                      <SelectItem value="closed">
                        <PowerOff className="mr-1.5 inline h-3.5 w-3.5 text-red-500" />
                        Closed
                      </SelectItem>
                      <SelectItem value="draft" disabled>
                        <Edit3 className="mr-1.5 inline h-3.5 w-3.5 text-gray-400" />
                        Draft (soon)
                      </SelectItem>
                      <SelectItem value="expired" disabled>
                        <Archive className="mr-1.5 inline h-3.5 w-3.5 text-gray-400" />
                        Expired (auto)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(isOpen) => {
          setIsEditModalOpen(isOpen);
          if (!isOpen) setEditingJob(null);
        }}
      >
        <DialogContent className="flex max-h-[calc(100vh-8rem)] flex-col sm:max-w-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center">
              <Edit3 className="mr-2 h-5 w-5 text-primary" /> Edit Job Posting
            </DialogTitle>
            <DialogDescription>Make changes to your job posting details below.</DialogDescription>
          </DialogHeader>
          <div className="-mr-4 min-h-0 flex-grow overflow-y-auto pr-2 pl-1">
            <Form {...form}>
              <form
                id="editJobForm"
                onSubmit={form.handleSubmit(onSubmitEditForm)}
                className="space-y-4 py-2 pr-1"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        Job Title
                      </FormLabel>{' '}
                      <FormControl>
                        <Input {...field} />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        Description
                      </FormLabel>{' '}
                      <FormControl>
                        <Textarea {...field} className="min-h-[100px]" />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        Location
                      </FormLabel>{' '}
                      <FormControl>
                        <Input {...field} />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        Job Type
                      </FormLabel>{' '}
                      <FormControl>
                        <Input {...field} placeholder="e.g., Full-time, Contract" />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiredExperienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                        Required Experience
                      </FormLabel>{' '}
                      <FormControl>
                        <Input {...field} placeholder="e.g., 3-5 years, Senior" />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                        Compensation
                      </FormLabel>{' '}
                      <FormControl>
                        <Input {...field} />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        Job Status
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="filled">Filled</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                    Tags
                  </FormLabel>
                  <div className="mb-1 flex flex-wrap gap-1">
                    {currentTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-1.5 py-0.5 text-xs"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveTagInEdit(tag)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Type a tag and press Enter"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDownInEdit}
                          className="flex-grow"
                        />
                        <Button
                          type="button"
                          onClick={handleAddTagInEdit}
                          variant="outline"
                          size="sm"
                          disabled={currentTags.length >= 10}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  />
                  <FormMessage>
                    {form.formState.errors.actualTags?.message ||
                      form.formState.errors.actualTags?.root?.message}
                  </FormMessage>
                </FormItem>
                <FormField
                  control={form.control}
                  name="videoOrImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel className="flex items-center">
                        <UploadCloud className="mr-2 h-4 w-4 text-muted-foreground" />
                        Image/Video URL (Optional)
                      </FormLabel>{' '}
                      <FormControl>
                        <Input {...field} />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <DialogFooter className="mt-auto shrink-0 border-t pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingJob(null);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" form="editJobForm" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <ShadAlertDialogTitle>Are you sure?</ShadAlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting titled "
              {jobToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setJobToDelete(null);
                setIsAlertOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJobConfirm}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewingJob && (
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="!rounded-2xl overflow-hidden p-0 sm:max-w-md md:max-w-lg lg:max-w-xl">
            <DialogHeader className="rounded-t-2xl bg-slate-800 p-4 text-white sm:p-5">
              <DialogTitle className="flex items-center text-lg">
                <Eye className="mr-2 h-5 w-5" />
                Job Posting Preview
              </DialogTitle>
            </DialogHeader>

            <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-sky-500 p-0 text-white">
              <div className="flex aspect-[10/13] flex-col">
                <div className="relative p-4 pt-5 text-center">
                  <Badge className="absolute top-3 left-3 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-medium text-white text-xs shadow-md backdrop-blur-sm">
                    {fullBackendUser?.companyIndustryForJobs ||
                      previewingJob.companyIndustryForJob ||
                      'General'}
                  </Badge>
                  <div className="mx-auto mt-8 flex h-[64px] w-[64px] items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-md">
                    {previewingJob.companyLogoForJob || fullBackendUser?.profileAvatarUrl ? (
                      <NextImage
                        src={
                          (
                            previewingJob.companyLogoForJob || fullBackendUser?.profileAvatarUrl
                          )?.startsWith('/uploads/')
                            ? `${CUSTOM_BACKEND_URL}${previewingJob.companyLogoForJob || fullBackendUser?.profileAvatarUrl}`
                            : previewingJob.companyLogoForJob || fullBackendUser?.profileAvatarUrl!
                        }
                        alt={
                          fullBackendUser?.companyNameForJobs ||
                          previewingJob.companyNameForJob ||
                          fullBackendUser?.name ||
                          'Company'
                        }
                        width={36}
                        height={36}
                        className="object-contain"
                        data-ai-hint="company logo"
                        unoptimized={
                          !!(
                            (
                              previewingJob.companyLogoForJob || fullBackendUser?.profileAvatarUrl
                            )?.startsWith(CUSTOM_BACKEND_URL) ||
                            (
                              previewingJob.companyLogoForJob || fullBackendUser?.profileAvatarUrl
                            )?.startsWith('http://localhost')
                          )
                        }
                      />
                    ) : (
                      <Code2 className="h-7 w-7 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex flex-grow flex-col p-4 pt-2 text-center">
                  <p className="mt-4 font-semibold text-custom-light-purple-text text-lg uppercase tracking-wider">
                    {fullBackendUser?.companyNameForJobs ||
                      previewingJob.companyNameForJob ||
                      fullBackendUser?.name ||
                      'Your Company'}
                  </p>
                  <h1 className="mt-1 break-words font-bold text-3xl text-white leading-tight sm:text-4xl">
                    {previewingJob?.title?.split('(')[0]?.trim() ?? ''}
                    {previewingJob?.title?.includes('(') && (
                      <span className="block font-bold text-2xl">{`(${(previewingJob?.title ?? '').split('(')[1] || ''}`}</span>
                    )}
                  </h1>
                  <div className="mt-3 flex items-center justify-center gap-x-1.5 text-base text-white/90">
                    {previewingJob.location && (
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4 text-white/70" /> {previewingJob.location}
                      </span>
                    )}
                    {previewingJob.location && previewingJob.jobType && (
                      <span className="mx-0.5 text-white/50">•</span>
                    )}
                    {previewingJob.jobType && (
                      <span className="flex items-center">
                        <Briefcase className="mr-1 h-4 w-4 text-white/70" />{' '}
                        {previewingJob.jobType.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="group relative mx-auto my-4 flex min-h-[110px] w-[110px] flex-col items-center justify-center transition-all duration-300 ease-in-out">
                    <CircularProgressBarPreview percentage={85} displayText="?" size={110} />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/30 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <Sparkles className="mb-1 h-8 w-8 text-yellow-300" />
                      <p className="text-center font-semibold text-white text-xs leading-tight">
                        AI Fit Preview
                      </p>
                    </div>
                  </div>

                  {previewingJob.requiredExperienceLevel &&
                    previewingJob.requiredExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && (
                      <p className="mt-2 text-white/70 text-xs italic">
                        {previewingJob.requiredExperienceLevel.replace(/_/g, ' ')} experience
                        preferred
                      </p>
                    )}

                  <div className="mt-auto pt-4">
                    <p className="mt-6 font-semibold text-custom-light-purple-text text-sm uppercase tracking-wider">
                      TOP SKILLS
                    </p>
                    <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
                      {previewingJob.tags?.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          className="rounded-full bg-purple-200/80 px-5 py-2.5 font-semibold text-base text-purple-800 shadow-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="rounded-b-2xl border-slate-700 border-t bg-slate-800 p-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    setPreviewingJob(null);
                  }}
                >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
