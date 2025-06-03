
"use client";

import React, { useState, useEffect, useCallback, type ChangeEvent, type KeyboardEvent } from 'react';
import type { CompanyJobOpening, Company } from '@/lib/types';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { fetchRecruiterJobs, updateRecruiterJob, deleteRecruiterJob } from '@/services/jobService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle as ShadCardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Edit3, Trash2, PlusCircle, Loader2, Eye, MapPin, Building, DollarSign, Tag, UploadCloud, X, Lock, Code2, CalendarDays, Percent, Sparkles, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { WorkExperienceLevel, JobType } from '@/lib/types';

const JobFormSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(5, "Job title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  salaryRange: z.string().min(1, "Please specify compensation or prize."),
  tags: z.string().optional(),
  actualTags: z.array(z.string().min(1).max(20).regex(/^[a-zA-Z0-9-]+$/)).optional().default([]),
  location: z.string().optional(),
  videoOrImageUrl: z.string().url().optional().or(z.literal('')), 
  jobType: z.string().optional(),
  requiredExperienceLevel: z.string().optional(),
});

type JobFormValues = z.infer<typeof JobFormSchema>;

interface ManageJobPostingsPageProps {
  isGuestMode?: boolean;
}

const CircularProgressBarPreview = ({ percentage, size = 80, displayText }: { percentage: number, size?: number, displayText?: string }) => {
  const radius = size / 2;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const effectivePercentage = displayText === "?" ? 0 : percentage;
  const strokeDashoffset = circumference - (effectivePercentage / 100) * circumference;

  return (
    <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      <circle className="fill-transparent stroke-white/20" strokeWidth={strokeWidth} r={normalizedRadius} cx={radius} cy={radius} />
      {effectivePercentage > 0 && (
        <circle
          className="fill-transparent" stroke="url(#previewProgressGradientCompanyCard)" strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, strokeLinecap: 'round', transition: 'stroke-dashoffset 0.35s ease-out' }}
          r={normalizedRadius} cx={radius} cy={radius}
        />
      )}
      <defs>
        <linearGradient id="previewProgressGradientCompanyCard" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" /> 
          <stop offset="100%" stopColor="#6366F1" /> 
        </linearGradient>
      </defs>
      <text x="50%" y={displayText ? "50%" : "48%"} dy=".3em" textAnchor="middle" className={cn("font-bold fill-white transform rotate-90 origin-center", size >= 80 ? "text-xl" : "text-lg" )}>
        {displayText ? displayText : `${Math.round(percentage)}%`}
      </text>
      {!displayText && (
        <text x="50%" y="62%" dy=".3em" textAnchor="middle" className={cn("fill-white/80 transform rotate-90 origin-center", size >= 80 ? "text-xs" : "text-[10px]")}>
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

  const { mongoDbUserId, fullBackendUser } = useUserPreferences();
  const { toast } = useToast();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: {
      title: "", description: "", salaryRange: "", tags: "", actualTags: [], location: "", videoOrImageUrl: "", jobType: "", requiredExperienceLevel: ""
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
      toast({ title: "Error Loading Jobs", description: error.message, variant: "destructive" });
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
        salaryRange: editingJob.salaryRange || "",
        tags: editingJob.tags?.join(', ') || "",
        actualTags: editingJob.tags || [],
        location: editingJob.location || "",
        videoOrImageUrl: editingJob.videoOrImageUrl || "",
        jobType: editingJob.jobType || "",
        requiredExperienceLevel: editingJob.requiredExperienceLevel || "",
      });
      setCurrentTags(editingJob.tags || []);
    } else {
      form.reset({ title: "", description: "", salaryRange: "", tags: "", actualTags: [], location: "", videoOrImageUrl: "", jobType: "", requiredExperienceLevel: "" });
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
      toast({ title: "Job Deleted", description: `"${jobToDelete.title}" has been removed.` });
      loadJobs(); 
    } catch (error: any) {
      toast({ title: "Error Deleting Job", description: error.message, variant: "destructive" });
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
        location: data.location,
        videoOrImageUrl: data.videoOrImageUrl || undefined,
        jobType: data.jobType as JobType || undefined,
        requiredExperienceLevel: data.requiredExperienceLevel as WorkExperienceLevel || undefined,
    };

    try {
      await updateRecruiterJob(mongoDbUserId, (editingJob as any)._id, jobDataToUpdate);
      toast({ title: "Job Updated", description: `"${data.title}" has been successfully updated.` });
      setIsEditModalOpen(false);
      setEditingJob(null);
      loadJobs(); 
    } catch (error: any) {
      toast({ title: "Error Updating Job", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTagInEdit = () => {
    const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (newTag && newTag.length <= 20 && /^[a-zA-Z0-9-]+$/.test(newTag) && !currentTags.includes(newTag) && currentTags.length < 10) {
      setCurrentTags([...currentTags, newTag]);
    } else if (currentTags.length >= 10) {
        toast({ title: "Tag Limit Reached", description: "Max 10 tags.", variant: "default"});
    } else if (newTag) {
        toast({ title: "Invalid Tag", description: "Tags: max 20 chars, letters, numbers, hyphens.", variant: "destructive"});
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
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };

  const handlePreviewJob = (job: CompanyJobOpening) => {
    setPreviewingJob(job);
    setIsPreviewModalOpen(true);
  };

  if (isGuestMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-background">
        <Lock className="mr-2 h-16 w-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-red-500 mb-3">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          Managing job postings is a feature for registered recruiters. Please sign in.
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
            <ShadCardTitle className="text-3xl md:text-4xl font-bold tracking-tight flex items-center">
              <Briefcase className="mr-3 h-8 w-8 text-primary" /> Manage Your Job Postings
            </ShadCardTitle>
            <CardDescription className="text-muted-foreground mt-1">View, edit, or delete your active job listings.</CardDescription>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-10 bg-card shadow rounded-lg">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
          <Button onClick={() => { /* TODO: navigate to create job page if separate */ } } className="mt-4" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={(job as any)._id} className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <ShadCardTitle className="text-xl text-primary">{job.title}</ShadCardTitle>
                    <CardDescription className="text-sm">
                      {job.location || 'Not specified'} - {job.jobType || 'Not specified'}
                      <span className="text-xs text-muted-foreground/80 block mt-0.5">
                        Posted: {formatDistanceToNow(new Date(job.postedAt || Date.now()), { addSuffix: true })}
                      </span>
                    </CardDescription>
                  </div>
                   <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handlePreviewJob(job)}>
                      <Eye className="mr-1.5 h-4 w-4" /> Preview
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                      <Edit3 className="mr-1.5 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => { setJobToDelete(job); setIsAlertOpen(true); }}>
                        <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                {job.tags && job.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {job.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
          setIsEditModalOpen(isOpen);
          if (!isOpen) setEditingJob(null);
      }}>
        <DialogContent className="sm:max-w-lg flex flex-col max-h-[calc(100vh-8rem)]">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary" /> Edit Job Posting</DialogTitle>
            <DialogDescription>Make changes to your job posting details below.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto min-h-0 pr-2 -mr-4 pl-1">
            <Form {...form}>
              <form id="editJobForm" onSubmit={form.handleSubmit(onSubmitEditForm)} className="space-y-4 py-2 pr-1">
                  <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4 text-muted-foreground" />Job Title</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4 text-muted-foreground" />Description</FormLabel> <FormControl><Textarea {...field} className="min-h-[100px]" /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Location</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="jobType" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />Job Type</FormLabel> <FormControl><Input {...field} placeholder="e.g., Full-time, Contract" /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="requiredExperienceLevel" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />Required Experience</FormLabel> <FormControl><Input {...field} placeholder="e.g., 3-5 years, Senior" /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="salaryRange" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />Compensation</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                  
                  <FormItem>
                    <FormLabel className="flex items-center"><Tag className="mr-2 h-4 w-4 text-muted-foreground" />Tags</FormLabel>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {currentTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs py-0.5 px-1.5">
                          {tag}
                          <Button type="button" variant="ghost" size="icon" className="h-3 w-3 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveTagInEdit(tag)}><X className="h-2.5 w-2.5" /></Button>
                        </Badge>
                      ))}
                    </div>
                    <FormField control={form.control} name="tags" render={({ field }) => (
                        <div className="flex items-center gap-2">
                        <Input placeholder="Type a tag and press Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagInputKeyDownInEdit} className="flex-grow"/>
                        <Button type="button" onClick={handleAddTagInEdit} variant="outline" size="sm" disabled={currentTags.length >= 10}>Add</Button>
                        </div>
                    )}/>
                    <FormMessage>{form.formState.errors.actualTags?.message || form.formState.errors.actualTags?.root?.message}</FormMessage>
                  </FormItem>
                   <FormField control={form.control} name="videoOrImageUrl" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><UploadCloud className="mr-2 h-4 w-4 text-muted-foreground" />Image/Video URL (Optional)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
              </form>
            </Form>
          </div>
          <DialogFooter className="shrink-0 border-t pt-4 mt-auto">
            <DialogClose asChild><Button type="button" variant="outline" onClick={() => {setIsEditModalOpen(false); setEditingJob(null);}}>Cancel</Button></DialogClose>
            <Button type="submit" form="editJobForm" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <ShadAlertDialogTitle>Are you sure?</ShadAlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting titled "{jobToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setJobToDelete(null); setIsAlertOpen(false); }} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJobConfirm} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewingJob && (
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl p-0 !rounded-2xl overflow-hidden">
            <DialogHeader className="p-4 sm:p-5 bg-slate-800 text-white rounded-t-2xl">
              <DialogTitle className="flex items-center text-lg"><Eye className="mr-2 h-5 w-5" />Job Posting Preview</DialogTitle>
            </DialogHeader>
            
            <div className="p-0 bg-gradient-to-br from-purple-500 via-indigo-500 to-sky-500 text-white">
              <div className="aspect-[10/13] flex flex-col"> 
                <div className="p-4 pt-5 text-center relative">
                  <Badge className="absolute top-3 left-3 bg-white/10 text-white border border-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs shadow-md font-medium">
                    {fullBackendUser?.companyIndustryForJobs || previewingJob.companyIndustryForJob || 'General'}
                  </Badge>
                  <div className="w-[64px] h-[64px] rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 mx-auto mt-8">
                    {fullBackendUser?.profileAvatarUrl ? (
                      <NextImage src={fullBackendUser.profileAvatarUrl.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000'}${fullBackendUser.profileAvatarUrl}` : fullBackendUser.profileAvatarUrl} alt={fullBackendUser.companyNameForJobs || fullBackendUser.name || 'Company'} width={36} height={36} className="object-contain" data-ai-hint="company logo" unoptimized={fullBackendUser.profileAvatarUrl?.startsWith(process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000') || fullBackendUser.profileAvatarUrl?.startsWith('http://localhost')} />
                    ) : (<Code2 className="text-white h-7 w-7" />)}
                  </div>
                </div>

                <div className="p-4 pt-2 text-center flex-grow flex flex-col">
                  <p className="text-purple-200 text-lg font-semibold uppercase tracking-wider mt-4">{fullBackendUser?.companyNameForJobs || previewingJob.companyNameForJob || fullBackendUser?.name || 'Your Company'}</p>
                  <h1 className="text-white text-3xl sm:text-4xl font-bold mt-1 leading-tight break-words">
                    {previewingJob.title.split('(')[0].trim()}
                    {previewingJob.title.includes('(') && (<span className="block text-2xl font-bold">{`(${previewingJob.title.split('(')[1]}`}</span>)}
                  </h1>
                  <div className="text-white/90 text-base mt-3 flex justify-center items-center gap-x-1.5">
                    {previewingJob.location && (<span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-white/70" /> {previewingJob.location}</span>)}
                    {previewingJob.location && previewingJob.jobType && <span className="text-white/50 mx-0.5">•</span>}
                    {previewingJob.jobType && (<span className="flex items-center"><Briefcase className="h-4 w-4 mr-1 text-white/70" /> {previewingJob.jobType.replace(/_/g, ' ')}</span>)}
                  </div>
                  
                  <div className="my-4 mx-auto flex flex-col items-center justify-center group transition-all duration-300 ease-in-out min-h-[110px] w-[110px] relative">
                     <CircularProgressBarPreview percentage={85} displayText="?" size={110} />
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-full p-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="h-8 w-8 mb-1 text-yellow-300" />
                        <p className="text-xs font-semibold text-white text-center leading-tight">AI Fit Preview</p>
                      </div>
                  </div>

                  {previewingJob.requiredExperienceLevel && previewingJob.requiredExperienceLevel !== WorkExperienceLevel.UNSPECIFIED && (
                    <p className="text-xs italic text-white/70 mt-2">
                      {previewingJob.requiredExperienceLevel.replace(/_/g, ' ')} experience preferred
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4"> 
                    <p className="text-purple-200 text-sm font-semibold uppercase tracking-wider mt-6">TOP SKILLS</p>
                    <div className="flex flex-wrap justify-center gap-2.5 mt-2.5">
                      {previewingJob.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} className="bg-purple-200/80 text-purple-800 text-base px-5 py-2.5 rounded-full font-semibold shadow-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600" onClick={() => {setIsPreviewModalOpen(false); setPreviewingJob(null);}}>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
    

    