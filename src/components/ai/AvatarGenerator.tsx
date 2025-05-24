
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAvatar, type AvatarGeneratorInput } from '@/ai/flows/avatar-generator';
import Image from 'next/image';
import { Loader2, UserSquare2, Smile, Briefcase, PersonStanding, ImageIcon, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "unspecified", label: "Unspecified / Skip" },
];

const ageRangeOptions = [
  { value: "young_adult", label: "Young Adult (20s)" },
  { value: "adult", label: "Adult (30s-40s)" },
  { value: "middle_aged", label: "Middle-Aged (50s+)" },
  { value: "unspecified", label: "Unspecified / Skip" },
];

const professionalImageStyleOptions = [
  { value: "business_formal", label: "Business Formal (e.g., suit, tie)" },
  { value: "casual_business", label: "Casual Business (e.g., smart shirt, chinos)" },
  { value: "creative_trend", label: "Creative/Trendy (e.g., stylish, expressive)" },
  { value: "tech_geek", label: "Tech/Startup (e.g., modern, comfortable)" },
  { value: "general_professional", label: "General Professional (versatile)" },
];

const animationExpressionOptions = [
  { value: "neutral", label: "Neutral Expression" },
  { value: "friendly_smile", label: "Friendly Smile" },
  { value: "thoughtful_gaze", label: "Thoughtful Gaze" },
  { value: "confident_look", label: "Confident Look" },
  { value: "subtle_gesture", label: "Subtle Hand Gesture (e.g. slight wave, pointing)"}
];

const backgroundEnvironmentOptions = [
  { value: "office", label: "Office Setting" },
  { value: "cafe", label: "Cafe / Casual Workspace" },
  { value: "modern_workspace", label: "Modern Co-working Space" },
  { value: "home_office", label: "Home Office" },
  { value: "neutral_studio", label: "Neutral Studio (plain background)" },
  { value: "abstract_gradient", label: "Abstract Gradient Background" },
  { value: "outdoor_urban", label: "Outdoor Urban Setting" },
  { value: "outdoor_nature", label: "Outdoor Nature Setting" },
];

// Define Zod enums for validation, matching the backend
const GenderEnum = z.enum(["male", "female", "non-binary", "unspecified"]);
const AgeRangeEnum = z.enum(["young_adult", "adult", "middle_aged", "unspecified"]);
const ProfessionalImageStyleEnum = z.enum(["business_formal", "casual_business", "creative_trend", "tech_geek", "general_professional"]);
const AnimationExpressionEnum = z.enum(["neutral", "friendly_smile", "thoughtful_gaze", "confident_look", "subtle_gesture"]);
const BackgroundEnvironmentEnum = z.enum(["office", "cafe", "modern_workspace", "home_office", "neutral_studio", "abstract_gradient", "outdoor_urban", "outdoor_nature"]);


const FormSchema = z.object({
  appearanceDetails: z.string().min(10, "Please provide appearance details (at least 10 characters).").max(300, "Appearance details too long."),
  gender: GenderEnum.optional(),
  ageRange: AgeRangeEnum.optional(),
  professionalImageStyle: ProfessionalImageStyleEnum.optional(),
  animationExpression: AnimationExpressionEnum.optional(),
  backgroundEnvironment: BackgroundEnvironmentEnum.optional(),
  jobTypeHint: z.string().max(50, "Job type hint too long.").optional(),
});

export function AvatarGenerator() {
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AvatarGeneratorInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      appearanceDetails: "",
      gender: "unspecified",
      ageRange: "unspecified",
      professionalImageStyle: "general_professional",
      animationExpression: "neutral",
      backgroundEnvironment: "neutral_studio",
      jobTypeHint: "",
    },
  });

  const onSubmit: SubmitHandler<AvatarGeneratorInput> = async (data) => {
    setIsLoading(true);
    setAvatarDataUri(null);
    try {
      // Ensure optional fields that are "unspecified" are not sent or handled as such by the backend
      const payload: AvatarGeneratorInput = {
        ...data,
        gender: data.gender === "unspecified" ? undefined : data.gender,
        ageRange: data.ageRange === "unspecified" ? undefined : data.ageRange,
      };
      const result = await generateAvatar(payload);
      setAvatarDataUri(result.avatarDataUri);
      toast({
        title: "Avatar Generated!",
        description: "Your virtual avatar is ready.",
      });
    } catch (error: any) {
      console.error("Error generating avatar:", error);
      toast({
        title: "Error Generating Avatar",
        description: error.message || "Failed to generate avatar. The AI might be unable to fulfill this request. Please try a different description or simplify your request.",
        variant: "destructive",
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
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="appearanceDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <Palette className="mr-2 h-5 w-5 text-muted-foreground" /> Specific Appearance Details
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center"><PersonStanding className="mr-2 h-5 w-5 text-muted-foreground" />Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {genderOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
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
                    <FormLabel className="text-base flex items-center"><User className="mr-2 h-5 w-5 text-muted-foreground" />Age Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select age range" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {ageRangeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
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
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" /> Professional Image & Clothing Style
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select professional style" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {professionalImageStyleOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="animationExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center"><Smile className="mr-2 h-5 w-5 text-muted-foreground" />Expression / Pose</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select expression/pose" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {animationExpressionOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
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
                    <FormLabel className="text-base flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" />Background Environment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select background" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {backgroundEnvironmentOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
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
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" /> (Optional) Job Type Hint for Style
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
              <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-md">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating your detailed avatar... this may take a moment.</p>
              </div>
            )}
            {avatarDataUri && !isLoading && (
              <div className="mt-6 flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-3 text-primary">Generated Avatar:</h3>
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-2 border-primary rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src={avatarDataUri} 
                    alt="Generated Avatar" 
                    layout="fill"
                    objectFit="cover" 
                    data-ai-hint="generated avatar professional"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UserSquare2 className="mr-2 h-5 w-5" />
              )}
              Generate Avatar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
