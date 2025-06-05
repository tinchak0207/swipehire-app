
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { StarRatingInput } from './StarRatingInput';
import { submitCompanyReview } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, ShieldQuestion, Clock, MessageSquareHeart, Briefcase } from 'lucide-react';
import type { CompanyReview } from '@/lib/types';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

const reviewSchema = z.object({
  responsivenessRating: z.number().min(1, "Rating required").max(5),
  attitudeRating: z.number().min(1, "Rating required").max(3), // Max 3 for attitude
  processExperienceRating: z.number().min(1, "Rating required").max(5),
  comments: z.string().min(10, "Please provide at least 10 characters for your comments.").max(1000, "Comments too long."),
  isAnonymous: z.boolean().default(false),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface CompanyReviewFormProps {
  companyId: string;
  companyName: string;
  jobId?: string;
  jobTitle?: string;
  onReviewSubmitted?: () => void;
}

export function CompanyReviewForm({
  companyId,
  companyName,
  jobId,
  jobTitle,
  onReviewSubmitted,
}: CompanyReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      responsivenessRating: 0,
      attitudeRating: 0,
      processExperienceRating: 0,
      comments: "",
      isAnonymous: false,
    },
  });

  const onSubmit: SubmitHandler<ReviewFormValues> = async (data) => {
    if (!mongoDbUserId) {
      toast({ title: "Error", description: "You must be logged in to submit a review.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const reviewPayload: Omit<CompanyReview, 'id' | 'timestamp' | 'reviewerUserId'> = {
        companyId,
        jobId,
        responsivenessRating: data.responsivenessRating,
        attitudeRating: data.attitudeRating,
        processExperienceRating: data.processExperienceRating,
        comments: data.comments,
        isAnonymous: data.isAnonymous,
      };
      await submitCompanyReview(mongoDbUserId, reviewPayload);
      toast({
        title: 'Review Submitted!',
        description: `Thank you for your feedback on ${companyName}.`,
      });
      form.reset();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      toast({
        title: 'Submission Error',
        description: error.message || 'Could not submit your review.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
      <div>
        <h3 className="text-lg font-medium text-foreground">Reviewing: {companyName}</h3>
        {jobTitle && <p className="text-sm text-muted-foreground">Regarding role: {jobTitle}</p>}
      </div>

      <div className="space-y-3">
        <div>
          <Label className="mb-1.5 flex items-center text-sm font-medium text-foreground">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            Responsiveness & Timeliness (1-5 Stars)
          </Label>
          <StarRatingInput
            rating={form.watch('responsivenessRating')}
            onRatingChange={(rating) => form.setValue('responsivenessRating', rating, { shouldValidate: true })}
            maxRating={5}
          />
          {form.formState.errors.responsivenessRating && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.responsivenessRating.message}</p>
          )}
        </div>

        <div>
          <Label className="mb-1.5 flex items-center text-sm font-medium text-foreground">
            <MessageSquareHeart className="mr-2 h-4 w-4 text-primary" />
            Attitude & Professionalism (1-3 Stars)
          </Label>
          <StarRatingInput
            rating={form.watch('attitudeRating')}
            onRatingChange={(rating) => form.setValue('attitudeRating', rating, { shouldValidate: true })}
            maxRating={3} // Set maxRating to 3 for attitude
          />
          {form.formState.errors.attitudeRating && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.attitudeRating.message}</p>
          )}
        </div>

        <div>
          <Label className="mb-1.5 flex items-center text-sm font-medium text-foreground">
            <Briefcase className="mr-2 h-4 w-4 text-primary" />
            Overall Recruitment Process Experience (1-5 Stars)
          </Label>
          <StarRatingInput
            rating={form.watch('processExperienceRating')}
            onRatingChange={(rating) => form.setValue('processExperienceRating', rating, { shouldValidate: true })}
            maxRating={5}
          />
          {form.formState.errors.processExperienceRating && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.processExperienceRating.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="comments" className="text-sm font-medium text-foreground">Your Comments</Label>
        <Textarea
          id="comments"
          placeholder="Share your experience in detail. What went well? What could be improved?"
          {...form.register('comments')}
          className="min-h-[100px]"
        />
        {form.formState.errors.comments && (
          <p className="text-xs text-destructive mt-1">{form.formState.errors.comments.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isAnonymous"
          checked={form.watch('isAnonymous')}
          onCheckedChange={(checked) => form.setValue('isAnonymous', !!checked)}
        />
        <Label htmlFor="isAnonymous" className="text-sm font-normal text-muted-foreground flex items-center">
          <ShieldQuestion className="mr-1.5 h-4 w-4" />
          Submit Anonymously (your name will not be shown with the review)
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

