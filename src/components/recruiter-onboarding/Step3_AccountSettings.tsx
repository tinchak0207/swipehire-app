'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Info, Phone, User, Users } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserPreferences } from '@/contexts/UserPreferencesContext'; // To get user's name/email
import type { RecruiterOnboardingData } from '@/lib/types';

const AccountSettingsSchema = z.object({
  recruiterFullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Name too long.'),
  recruiterJobTitle: z
    .string()
    .min(2, 'Job title must be at least 2 characters.')
    .max(50, 'Job title too long.'),
  recruiterContactPhone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
      message: 'Please enter a valid phone number (e.g., +1234567890).',
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
      recruiterFullName: initialData?.recruiterFullName || fullBackendUser?.name || '',
      recruiterJobTitle: initialData?.recruiterJobTitle || '',
      recruiterContactPhone: initialData?.recruiterContactPhone || '',
    },
  });

  const internalFormSubmitHandler: SubmitHandler<AccountSettingsFormValues> = (data) => {
    onSubmit({ ...data, recruiterContactPhone: data.recruiterContactPhone || '' });
  };

  return (
    <Form {...form}>
      {/* Add id="step3Form" here */}
      <form
        id="step3Form"
        onSubmit={form.handleSubmit(internalFormSubmitHandler)}
        className="animate-fadeInPage space-y-6"
      >
        <Alert variant="default" className="border-blue-200 bg-blue-50 text-blue-700">
          <Info className="!text-blue-600 h-5 w-5" />
          <AlertTitle className="font-semibold text-blue-800">
            Step 3: Your Account Details
          </AlertTitle>
          <AlertDescription className="text-blue-700/90">
            Provide your contact information as the primary representative for this company account.
          </AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="recruiterFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                Your Full Name
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recruiterJobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                Your Job Title / Role
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., Hiring Manager, Talent Acquisition Lead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recruiterContactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                Contact Phone (Optional)
              </FormLabel>
              <FormControl>
                <Input type="tel" placeholder="e.g., +1 555-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4">
          <Label className="flex items-center font-semibold text-base">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            Team Management (Conceptual)
          </Label>
          <p className="mt-1 mb-2 text-muted-foreground text-sm">
            Features for inviting team members and assigning roles will be available after
            onboarding.
          </p>
          <Button variant="outline" disabled>
            Invite Team Members (Coming Soon)
          </Button>
        </div>
        {/* No separate submit button here; parent's button will submit this form via its id */}
      </form>
    </Form>
  );
}
