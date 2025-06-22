'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building, Globe, Info, Link as LinkIcon, MapPin, Users } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
// Button removed as submit is handled by parent
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RecruiterOnboardingData } from '@/lib/types';
import { CompanyScale } from '@/lib/types';

const companyScaleOptions = Object.values(CompanyScale).map((value) => ({
  value,
  label: value === CompanyScale.UNSPECIFIED ? 'Select Scale' : value,
}));

const BasicInfoSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters.')
    .max(100, 'Company name too long.'),
  companyIndustry: z
    .string()
    .min(2, 'Industry must be at least 2 characters.')
    .max(50, 'Industry too long.'),
  companyScale: z
    .nativeEnum(CompanyScale)
    .refine((val) => val !== CompanyScale.UNSPECIFIED, { message: 'Please select company scale.' }),
  companyAddress: z
    .string()
    .min(5, 'Address must be at least 5 characters.')
    .max(150, 'Address too long.'),
  companyWebsite: z
    .string()
    .url('Please enter a valid URL (e.g., https://example.com)')
    .optional()
    .or(z.literal('')),
});

type BasicInfoFormValues = z.infer<typeof BasicInfoSchema>;

interface Step1Props {
  initialData?: Partial<RecruiterOnboardingData>;
  onSubmit: (data: Partial<RecruiterOnboardingData>) => void;
}

export function Step1_BasicInfoForm({ initialData, onSubmit }: Step1Props) {
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: {
      companyName: initialData?.companyName || '',
      companyIndustry: initialData?.companyIndustry || '',
      companyScale: initialData?.companyScale || CompanyScale.UNSPECIFIED,
      companyAddress: initialData?.companyAddress || '',
      companyWebsite: initialData?.companyWebsite || '',
    },
  });

  // This 'internalFormSubmitHandler' is called when the form is submitted
  // (e.g., by the parent's button with type="submit" and form="step1Form")
  const internalFormSubmitHandler: SubmitHandler<BasicInfoFormValues> = (data) => {
    onSubmit(data); // This will call handleStep1Submit in the parent
  };

  return (
    <Form {...form}>
      {/* Add id="step1Form" here */}
      <form
        id="step1Form"
        onSubmit={form.handleSubmit(internalFormSubmitHandler)}
        className="animate-fadeInPage space-y-6"
      >
        <Alert variant="default" className="border-blue-200 bg-blue-50 text-blue-700">
          <Info className="!text-blue-600 h-5 w-5" />
          <AlertTitle className="font-semibold text-blue-800">
            Step 1: Company Information
          </AlertTitle>
          <AlertDescription className="text-blue-700/90">
            Tell us about the company you represent. This information will help job seekers
            understand your organization.
          </AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                Company Name
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., Innovatech Solutions Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyIndustry"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                Industry
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., SaaS Technology, Marketing, Healthcare" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyScale"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                Company Scale
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company scale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companyScaleOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.value === CompanyScale.UNSPECIFIED}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                Company Full Address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 123 Innovation Drive, Tech City, CA 94000, USA"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-base">
                <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Company Website (Optional)
              </FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://www.yourcompany.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* No separate submit button here; parent's button will submit this form via its id */}
      </form>
    </Form>
  );
}
