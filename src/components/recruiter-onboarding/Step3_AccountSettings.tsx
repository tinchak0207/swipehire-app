
"use client";

import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { RecruiterOnboardingData } from '@/lib/types';
import { User, Briefcase, Phone, Users, Info } from 'lucide-react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext'; // To get user's name/email

const AccountSettingsSchema = z.object({
  recruiterFullName: z.string().min(2, "Full name must be at least 2 characters.").max(100, "Name too long."),
  recruiterJobTitle: z.string().min(2, "Job title must be at least 2 characters.").max(50, "Job title too long."),
  recruiterContactPhone: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
    message: "Please enter a valid phone number (e.g., +1234567890).",
  }),
});

type AccountSettingsFormValues = z.infer<typeof AccountSettingsSchema>;

interface Step3Props {
  initialData?: Partial<RecruiterOnboardingData>;
  onSubmit: (data: Partial<RecruiterOnboardingData>) => void;
}

export function Step3_AccountSettings({ initialData, onSubmit }: Step3Props) {
  const { fullBackendUser } = useUserPreferences(); 

  const form = useForm<AccountSettingsFormValues>({
    resolver: zodResolver(AccountSettingsSchema),
    defaultValues: {
      recruiterFullName: initialData?.recruiterFullName || fullBackendUser?.name || "",
      recruiterJobTitle: initialData?.recruiterJobTitle || "",
      recruiterContactPhone: initialData?.recruiterContactPhone || "",
    },
  });

  const internalFormSubmitHandler: SubmitHandler<AccountSettingsFormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      {/* Add id="step3Form" here */}
      <form id="step3Form" onSubmit={form.handleSubmit(internalFormSubmitHandler)} className="space-y-6 animate-fadeInPage">
        <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
          <Info className="h-5 w-5 !text-blue-600" />
          <AlertTitle className="font-semibold text-blue-800">Step 3: Your Account Details</AlertTitle>
          <AlertDescription className="text-blue-700/90">
            Provide your contact information as the primary representative for this company account.
          </AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="recruiterFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />Your Full Name</FormLabel>
              <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recruiterJobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />Your Job Title / Role</FormLabel>
              <FormControl><Input placeholder="e.g., Hiring Manager, Talent Acquisition Lead" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recruiterContactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" />Contact Phone (Optional)</FormLabel>
              <FormControl><Input type="tel" placeholder="e.g., +1 555-123-4567" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 border-t">
            <Label className="text-base font-semibold flex items-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" />Team Management (Conceptual)</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
                Features for inviting team members and assigning roles will be available after onboarding.
            </p>
            <Button variant="outline" disabled>Invite Team Members (Coming Soon)</Button>
        </div>
        {/* No separate submit button here; parent's button will submit this form via its id */}
      </form>
    </Form>
  );
}
