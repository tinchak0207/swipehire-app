'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ActionItem } from '@/lib/types';

interface ActionItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { text: string }) => void; // Only text is submitted for add/edit
  initialData?: Partial<ActionItem>; // For editing, might include _id and text
  isLoading?: boolean;
}

const actionItemFormSchema = z.object({
  text: z.string().min(3, 'Action item text must be at least 3 characters.').max(200, 'Action item text must be at most 200 characters.'),
});

export type ActionItemFormData = z.infer<typeof actionItemFormSchema>;

export const ActionItemFormModal: React.FC<ActionItemFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ActionItemFormData>({
    resolver: zodResolver(actionItemFormSchema),
    defaultValues: {
      text: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        text: initialData?.text || '',
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = (data: ActionItemFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData?._id ? 'Edit Action Item' : 'Add New Action Item'}</DialogTitle>
          <DialogDescription>
            Define a specific, actionable step for your goal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="actionItemText" className="sr-only">Action Item Description</Label>
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="actionItemText"
                  {...field}
                  rows={3}
                  placeholder="e.g., Research online courses for X skill, Network with 2 professionals in Y field"
                  className={errors.text ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.text && <p className="text-sm text-red-500 mt-1">{errors.text.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (initialData?._id ? 'Saving...' : 'Adding...') : (initialData?._id ? 'Save Action Item' : 'Add Action Item')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
