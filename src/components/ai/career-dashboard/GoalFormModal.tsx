'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserGoal } from '@/lib/types'; // Assuming UserGoal type is available

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: GoalFormData) => void;
  initialData?: Partial<UserGoal>;
  goalCategory: 'short-term' | 'mid-term' | 'long-term';
  isLoading?: boolean;
}

// Schema for form validation
const goalFormSchema = z.object({
  text: z.string().min(3, 'Goal text must be at least 3 characters.').max(300, 'Goal text must be at most 300 characters.'),
  targetDate: z.string().optional(), // Stored as YYYY-MM-DD string from date input
  isCompleted: z.boolean().optional(),
});

export type GoalFormData = {
  text: string;
  category: 'short-term' | 'mid-term' | 'long-term';
  targetDate?: string; // YYYY-MM-DD
  isCompleted?: boolean;
  _id?: string; // For editing
};

export const GoalFormModal: React.FC<GoalFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, goalCategory, isLoading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      text: '',
      targetDate: '',
      isCompleted: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      const targetDateStr = initialData?.targetDate
        ? new Date(initialData.targetDate).toISOString().split('T')[0]
        : '';
      reset({
        text: initialData?.text || '',
        targetDate: targetDateStr,
        isCompleted: initialData?.isCompleted || false,
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = (data: z.infer<typeof goalFormSchema>) => {
    onSubmit({
      ...data,
      category: goalCategory, // Add category from props
      _id: initialData?._id, // Include _id if editing
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{initialData?._id ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          <DialogDescription>
            Define your {goalCategory.replace('-', ' ')} goal. Make it specific and measurable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="text">Goal Description</Label>
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="text"
                  {...field}
                  rows={4}
                  placeholder="e.g., Complete a certification, Launch a personal project"
                  className={errors.text ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.text && <p className="text-sm text-red-500 mt-1">{errors.text.message}</p>}
          </div>

          <div>
            <Label htmlFor="targetDate">Target Date (Optional)</Label>
            <Controller
              name="targetDate"
              control={control}
              render={({ field }) => (
                <Input
                  id="targetDate"
                  type="date"
                  {...field}
                  className={errors.targetDate ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.targetDate && <p className="text-sm text-red-500 mt-1">{errors.targetDate.message}</p>}
          </div>

          {initialData?._id && ( // Only show completion toggle for existing goals
            <div className="flex items-center space-x-2">
               <Controller
                name="isCompleted"
                control={control}
                render={({ field }) => (
                    <input
                        type="checkbox"
                        id="isCompleted"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                )}
                />
              <Label htmlFor="isCompleted" className="text-sm font-medium">Mark as Completed</Label>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (initialData?._id ? 'Saving...' : 'Adding...') : (initialData?._id ? 'Save Changes' : 'Add Goal')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
