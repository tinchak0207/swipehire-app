'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building, Info, Loader2, Palette, Wand2 } from 'lucide-react'; // Added Info
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  type GenerateVideoScriptInput,
  generateVideoScript,
} from '@/ai/flows/video-script-generator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert components
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Added Tooltip components
import { useToast } from '@/hooks/use-toast';

const toneAndStyleOptions = [
  { value: 'professional', label: 'Professional & Formal' },
  { value: 'friendly', label: 'Relaxed & Friendly' },
  { value: 'technical', label: 'Technology-Oriented' },
  { value: 'sales', label: 'Sales-Oriented' },
];

const industryTemplateOptions = [
  { value: 'general', label: 'General / Other' },
  { value: 'technology', label: 'Technology Industry' },
  { value: 'creative', label: 'Creative Industry' },
  { value: 'finance', label: 'Financial Industry' },
  { value: 'education', label: 'Education Industry' },
];

const FormSchema = z.object({
  experience: z.string().min(10, 'Please describe your experience in at least 10 characters.'),
  desiredWorkStyle: z
    .string()
    .min(5, 'Please describe your desired work style in at least 5 characters.'),
  toneAndStyle: z.enum(['professional', 'friendly', 'technical', 'sales', 'general']),
  industryTemplate: z.enum(['technology', 'creative', 'finance', 'education', 'general']),
});

export function VideoScriptGenerator() {
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateVideoScriptInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      experience: '',
      desiredWorkStyle: '',
      toneAndStyle: 'professional',
      industryTemplate: 'general',
    },
  });

  const onSubmit: SubmitHandler<GenerateVideoScriptInput> = async (data) => {
    setIsLoading(true);
    setGeneratedScript(null);
    try {
      const result = await generateVideoScript(data);
      setGeneratedScript(result.script);
      toast({
        title: 'Script Generated!',
        description: 'Your personalized video script is ready.',
      });
    } catch (error) {
      console.error('Error generating video script:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate video script. Please try again.',
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
          <Wand2 className="mr-2 h-6 w-6 text-primary" />
          AI Video Script Assistant
        </CardTitle>
        <CardDescription>
          Describe your experience, choose a tone and industry, and our AI will craft a compelling
          video script for you.
        </CardDescription>
        <Alert variant="default" className="mt-3 border-primary/30 bg-primary/5 text-sm">
          <Info className="h-4 w-4 text-primary/80" />
          <AlertTitle className="font-medium text-primary/90 text-xs">How it Works</AlertTitle>
          <AlertDescription className="text-foreground/70 text-xs">
            Our AI uses the information you provide to structure a general video resume script with
            common sections. You can then customize it with your specific achievements and personal
            details.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-lg">Your Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., '5 years of Python development experience, skilled in React and cloud platforms...'"
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desiredWorkStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-lg">Desired Work Style</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Seeking a remote role in a fast-paced startup, passionate about collaborative projects...'"
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toneAndStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center font-semibold text-lg">
                    <Palette className="mr-2 h-5 w-5 text-muted-foreground" />
                    Tone and Style
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tone and style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {toneAndStyleOptions.map((option) => (
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
              name="industryTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center font-semibold text-lg">
                    <Building className="mr-2 h-5 w-5 text-muted-foreground" />
                    Industry Template
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industryTemplateOptions.map((option) => (
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
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-5 w-5" />
                    )}
                    Generate Script
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI will suggest a script structure and placeholder content.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isLoading && !generatedScript && (
              <div className="mt-4 flex w-full flex-col items-center border-t pt-4">
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Crafting your script...</p>
              </div>
            )}
            {generatedScript && (
              <div className="mt-4 w-full border-t pt-4">
                <h3 className="mb-2 font-semibold text-primary text-xl">Generated Script:</h3>
                <Textarea
                  readOnly
                  value={generatedScript}
                  className="min-h-[200px] bg-muted/50 text-base text-foreground"
                  rows={15}
                />
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
