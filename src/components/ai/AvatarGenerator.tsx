'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Briefcase,
  ImageIcon,
  Info,
  Loader2,
  Palette,
  PersonStanding,
  Smile,
  User,
  UserSquare2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { type AvatarGeneratorInput, generateAvatar } from '@/ai/flows/avatar-generator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'unspecified', label: 'Unspecified / Skip' },
];

const ageRangeOptions = [
  { value: 'young_adult', label: 'Young Adult (20s)' },
  { value: 'adult', label: 'Adult (30s-40s)' },
  { value: 'middle_aged', label: 'Middle-Aged (50s+)' },
  { value: 'unspecified', label: 'Unspecified / Skip' },
];

const professionalImageStyleOptions = [
  { value: 'business_formal', label: 'Business Formal (e.g., suit, tie)' },
  { value: 'casual_business', label: 'Casual Business (e.g., smart shirt, chinos)' },
  { value: 'creative_trend', label: 'Creative/Trendy (e.g., stylish, expressive)' },
  { value: 'tech_geek', label: 'Tech/Startup (e.g., modern, comfortable)' },
  { value: 'general_professional', label: 'General Professional (versatile)' },
];

const animationExpressionOptions = [
  { value: 'neutral', label: 'Neutral Expression' },
  { value: 'friendly_smile', label: 'Friendly Smile' },
  { value: 'thoughtful_gaze', label: 'Thoughtful Gaze' },
  { value: 'confident_look', label: 'Confident Look' },
  { value: 'subtle_gesture', label: 'Subtle Hand Gesture (e.g. slight wave, pointing)' },
];

const backgroundEnvironmentOptions = [
  { value: 'office', label: 'Office Setting' },
  { value: 'cafe', label: 'Cafe / Casual Workspace' },
  { value: 'modern_workspace', label: 'Modern Co-working Space' },
  { value: 'home_office', label: 'Home Office' },
  { value: 'neutral_studio', label: 'Neutral Studio (plain background)' },
  { value: 'abstract_gradient', label: 'Abstract Gradient Background' },
  { value: 'outdoor_urban', label: 'Outdoor Urban Setting' },
  { value: 'outdoor_nature', label: 'Outdoor Nature Setting' },
];

const GenderEnum = z.enum(['male', 'female', 'non-binary', 'unspecified']);
const AgeRangeEnum = z.enum(['young_adult', 'adult', 'middle_aged', 'unspecified']);
const ProfessionalImageStyleEnum = z.enum([
  'business_formal',
  'casual_business',
  'creative_trend',
  'tech_geek',
  'general_professional',
]);
const AnimationExpressionEnum = z.enum([
  'neutral',
  'friendly_smile',
  'thoughtful_gaze',
  'confident_look',
  'subtle_gesture',
]);
const BackgroundEnvironmentEnum = z.enum([
  'office',
  'cafe',
  'modern_workspace',
  'home_office',
  'neutral_studio',
  'abstract_gradient',
  'outdoor_urban',
  'outdoor_nature',
]);

const FormSchema = z.object({
  appearanceDetails: z
    .string()
    .min(10, 'Please provide appearance details (at least 10 characters).')
    .max(300, 'Appearance details too long.'),
  gender: GenderEnum.optional(),
  ageRange: AgeRangeEnum.optional(),
  professionalImageStyle: ProfessionalImageStyleEnum.optional(),
  animationExpression: AnimationExpressionEnum.optional(),
  backgroundEnvironment: BackgroundEnvironmentEnum.optional(),
  jobTypeHint: z.string().max(50, 'Job type hint too long.').optional(),
});

interface AvatarGeneratorProps {
  onAvatarGenerated?: (avatarDataUri: string) => void;
}

export function AvatarGenerator({ onAvatarGenerated }: AvatarGeneratorProps) {
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AvatarGeneratorInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      appearanceDetails: '',
      gender: 'unspecified',
      ageRange: 'unspecified',
      professionalImageStyle: 'general_professional',
      animationExpression: 'neutral',
      backgroundEnvironment: 'neutral_studio',
      jobTypeHint: '',
    },
  });

  const onSubmit: SubmitHandler<AvatarGeneratorInput> = async (data) => {
    setIsLoading(true);
    setAvatarDataUri(null);
    try {
      const payload: AvatarGeneratorInput = {
        ...data,
        gender: data.gender === 'unspecified' ? undefined : data.gender,
        ageRange: data.ageRange === 'unspecified' ? undefined : data.ageRange,
      };
      const result = await generateAvatar(payload);
      setAvatarDataUri(result.avatarDataUri);
      if (onAvatarGenerated) {
        onAvatarGenerated(result.avatarDataUri);
      }
      toast({
        title: 'Avatar Generated!',
        description: 'Your virtual avatar is ready.',
      });
    } catch (error: any) {
      console.error('Error generating avatar:', error);
      toast({
        title: 'Error Generating Avatar',
        description:
          error.message ||
          'Failed to generate avatar. The AI might be unable to fulfill this request. Please try a different description or simplify your request.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UserSquare2 className="mr-2 h-6 w-6 text-primary" />
          AI Virtual Avatar Generator
        </CardTitle>
        <CardDescription>
          Customize your professional virtual avatar using the options below.
        </CardDescription>
        <Alert variant="default" className="mt-3 border-primary/30 bg-primary/5 text-sm">
          <Info className="h-4 w-4 text-primary/80" />
          <AlertTitle className="font-medium text-primary/90 text-xs">How it Works</AlertTitle>
          <AlertDescription className="text-foreground/70 text-xs">
            The AI generates an image based on your textual description and selected style options.
            Results can vary, and multiple attempts or refined descriptions might be needed for the
            desired outcome. This is an experimental feature.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="appearanceDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center font-semibold text-lg">
                    <Palette className="mr-2 h-5 w-5 text-muted-foreground" /> Specific Appearance
                    Details
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Long curly brown hair, light olive skin, wearing a navy blue blazer, and a friendly expression. Holding a tablet.'"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-base">
                      <PersonStanding className="mr-2 h-5 w-5 text-muted-foreground" />
                      Gender
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-base">
                      <User className="mr-2 h-5 w-5 text-muted-foreground" />
                      Age Range
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ageRangeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="professionalImageStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center font-semibold text-lg">
                    <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" /> Professional Image
                    & Clothing Style
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select professional style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionalImageStyleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="animationExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-base">
                      <Smile className="mr-2 h-5 w-5 text-muted-foreground" />
                      Expression / Pose
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expression/pose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {animationExpressionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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
                name="backgroundEnvironment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-base">
                      <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                      Background Environment
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select background" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {backgroundEnvironmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobTypeHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center font-semibold text-lg">
                    <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" /> (Optional) Job Type
                    Hint for Style
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'Software Engineer', 'Marketing Manager', 'Graphic Designer'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoading && (
              <div className="flex h-64 flex-col items-center justify-center rounded-md bg-muted/30">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Generating your detailed avatar... this may take a moment.
                </p>
              </div>
            )}
            {avatarDataUri && !isLoading && (
              <div className="mt-6 flex flex-col items-center">
                <h3 className="mb-3 font-semibold text-primary text-xl">Generated Avatar:</h3>
                <div className="relative h-64 w-64 overflow-hidden rounded-lg border-2 border-primary shadow-md sm:h-80 sm:w-80">
                  <Image
                    src={avatarDataUri}
                    alt="Generated Avatar"
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint="professional avatar"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <UserSquare2 className="mr-2 h-5 w-5" />
                    )}
                    Generate Avatar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI will create an image. This process can take a few moments.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
