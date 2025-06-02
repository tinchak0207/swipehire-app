
"use client";

import React, { useState, useEffect, useCallback, type ChangeEvent, type KeyboardEvent } from 'react';
import type { CompanyJobOpening } from '@/lib/types';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { fetchRecruiterJobs, updateRecruiterJob, deleteRecruiterJob } from '@/services/jobService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Edit3, Trash2, PlusCircle, Loader2, Search, Settings, FileText, DollarSign, Tag, UploadCloud, X, Lock, Eye, MapPin, Building } from 'lucide-react'; // Added Eye, MapPin, Building
import { formatDistanceToNow } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollArea } from '../ui/scroll-area';

const JobFormSchema = z.object({
  _id: z.string().optional(), // For identifying existing job
  title: z.string().min(5, "Job title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  salaryRange: z.string().min(1, "Please specify compensation or prize."),
  tags: z.string().optional(), // User types into this
  actualTags: z.array(z.string().min(1).max(20).regex(/^[a-zA-Z0-9-]+$/)).optional().default([]),
  location: z.string().optional(),
  videoOrImageUrl: z.string().url().optional().or(z.literal('')), 
});

type JobFormValues = z.infer<typeof JobFormSchema>;

interface ManageJobPostingsPageProps {
  isGuestMode?: boolean;
}

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

  const { mongoDbUserId, fullBackendUser } = useUserPreferences(); // Added fullBackendUser
  const { toast } = useToast();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: {
      title: "", description: "", salaryRange: "", tags: "", actualTags: [], location: "", videoOrImageUrl: ""
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
      });
      setCurrentTags(editingJob.tags || []);
    } else {
      form.reset({ title: "", description: "", salaryRange: "", tags: "", actualTags: [], location: "", videoOrImageUrl: "" });
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
        <Lock className="h-16 w-16 text-red-400 mb-6" />
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
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center">
              <Settings className="mr-3 h-8 w-8 text-primary" /> Manage Your Job Postings
            </h1>
            <p className="text-muted-foreground mt-1">View, edit, or delete your active job listings.</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-10 bg-card shadow rounded-lg">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
          <Button onClick={() => {/* TODO: navigate to create job page if separate */} } className="mt-4" variant="outline">
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
                    <CardTitle className="text-xl text-primary">{job.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {job.location || 'Not specified'} - {job.jobType || 'Not specified'}
                      <span className="text-xs text-muted-foreground/80 block mt-0.5">
                        Posted: {formatDistanceToNow(new Date(job.postedAt || Date.now()), { addSuffix: true })}
                      </span>
                    </CardDescription>
                  </div>
                   <div className="flex gap-2">
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary" /> Edit Job Posting</DialogTitle>
            <DialogDescription>Make changes to your job posting details below.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEditForm)}>
              <ScrollArea className="max-h-[60vh] p-1 pr-3 -mr-2 mb-4">
                <div className="space-y-4 py-2 pr-1">
                  <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4 text-muted-foreground" />Job Title</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4 text-muted-foreground" />Description</FormLabel> <FormControl><Textarea {...field} className="min-h-[100px]" /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Location</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
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
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="outline" onClick={() => {setIsEditModalOpen(false); setEditingJob(null);}}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />Job Posting Preview</DialogTitle>
              <DialogDescription>This is how your job posting might appear to candidates.</DialogDescription>
            </DialogHeader>
            <Card className="shadow-none border-none">
              <CardHeader className="p-4">
                <div className="flex items-center space-x-3">
                  {fullBackendUser?.profileAvatarUrl || previewingJob.companyLogoForJob ? (
                    <img src={previewingJob.companyLogoForJob || fullBackendUser?.profileAvatarUrl} alt={previewingJob.companyNameForJob || fullBackendUser?.companyNameForJobs || fullBackendUser?.name} className="h-12 w-12 rounded-md object-contain bg-muted" data-ai-hint="company logo" />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                      <Building className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{previewingJob.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {previewingJob.companyNameForJob || fullBackendUser?.companyNameForJobs || fullBackendUser?.name || 'Your Company'}
                      {previewingJob.location && ` - ${previewingJob.location}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-sm">
                <p className="text-muted-foreground line-clamp-4">{previewingJob.description}</p>
                {previewingJob.salaryRange && (
                  <div className="flex items-center">
                    <DollarSign className="mr-1.5 h-4 w-4 text-green-600" /> 
                    <span className="font-medium">{previewingJob.salaryRange}</span>
                  </div>
                )}
                {previewingJob.tags && previewingJob.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {previewingJob.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => {setIsPreviewModalOpen(false); setPreviewingJob(null);}}>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

