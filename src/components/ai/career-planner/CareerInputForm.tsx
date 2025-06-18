'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface CareerInputFormProps {
  initialData?: {
    careerGoals?: string;
    careerInterests?: string[];
    careerValues?: string[];
  };
  onSubmit: (data: CareerFormData) => void;
  isLoading: boolean;
}

const formSchema = z.object({
  careerGoals: z.string().min(10, 'Career goals must be at least 10 characters long.').max(2000, 'Career goals must be at most 2000 characters long.'),
  careerInterests: z.string().optional(), // Comma-separated string
  careerValues: z.string().optional(), // Comma-separated string
});

export type CareerFormData = {
  careerGoals: string;
  careerInterests: string[];
  careerValues: string[];
};

export const CareerInputForm: React.FC<CareerInputFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      careerGoals: initialData?.careerGoals || '',
      careerInterests: initialData?.careerInterests?.join(', ') || '',
      careerValues: initialData?.careerValues?.join(', ') || '',
    },
  });

  React.useEffect(() => {
    reset({
      careerGoals: initialData?.careerGoals || '',
      careerInterests: initialData?.careerInterests?.join(', ') || '',
      careerValues: initialData?.careerValues?.join(', ') || '',
    });
  }, [initialData, reset]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({
      careerGoals: data.careerGoals,
      careerInterests: data.careerInterests ? data.careerInterests.split(',').map(item => item.trim()).filter(item => item) : [],
      careerValues: data.careerValues ? data.careerValues.split(',').map(item => item.trim()).filter(item => item) : [],
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Define Your Career Aspirations</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="careerGoals">Career Goals</Label>
            <Controller
              name="careerGoals"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="careerGoals"
                  {...field}
                  placeholder="Describe your long-term career aspirations, what you hope to achieve, and your ideal future role or position."
                  rows={5}
                  className={errors.careerGoals ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
              )}
            />
            {errors.careerGoals && <p className="text-sm text-red-500">{errors.careerGoals.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="careerInterests">Career Interests</Label>
            <Controller
              name="careerInterests"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="careerInterests"
                  {...field}
                  placeholder="List your specific career-related interests and passions, separated by commas (e.g., machine learning, sustainable energy, project management)."
                  rows={3}
                  className={errors.careerInterests ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
              )}
            />
            {errors.careerInterests && <p className="text-sm text-red-500">{errors.careerInterests.message}</p>}
             <p className="text-xs text-gray-500">Separate multiple interests with commas.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="careerValues">Career Values</Label>
            <Controller
              name="careerValues"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="careerValues"
                  {...field}
                  placeholder="List your important work-related values, separated by commas (e.g., work-life balance, innovation, stability, leadership)."
                  rows={3}
                  className={errors.careerValues ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
              )}
            />
            {errors.careerValues && <p className="text-sm text-red-500">{errors.careerValues.message}</p>}
            <p className="text-xs text-gray-500">Separate multiple values with commas.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Generating Plan...' : 'Generate Career Plan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
