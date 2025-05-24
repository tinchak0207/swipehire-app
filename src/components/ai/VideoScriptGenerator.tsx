"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateVideoScript, type GenerateVideoScriptInput } from '@/ai/flows/video-script-generator';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  experience: z.string().min(10, "Please describe your experience in at least 10 characters."),
  desiredWorkStyle: z.string().min(5, "Please describe your desired work style in at least 5 characters."),
});

export function VideoScriptGenerator() {
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateVideoScriptInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      experience: "",
      desiredWorkStyle: "",
    },
  });

  const onSubmit: SubmitHandler<GenerateVideoScriptInput> = async (data) => {
    setIsLoading(true);
    setGeneratedScript(null);
    try {
      const result = await generateVideoScript(data);
      setGeneratedScript(result.script);
      toast({
        title: "Script Generated!",
        description: "Your video script is ready.",
      });
    } catch (error) {
      console.error("Error generating video script:", error);
      toast({
        title: "Error",
        description: "Failed to generate video script. Please try again.",
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
          <Wand2 className="mr-2 h-6 w-6 text-primary" />
          AI Video Script Assistant
        </CardTitle>
        <CardDescription>
          Describe your experience and desired work style, and our AI will craft a compelling video script for you.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Your Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., '5 years of Python development experience, skilled in React and cloud platforms...'"
                      className="resize-y min-h-[100px]"
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
                  <FormLabel className="text-lg font-semibold">Desired Work Style</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Seeking a remote role in a fast-paced startup, passionate about collaborative projects...'"
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Generate Script
            </Button>
            {generatedScript && (
              <div className="w-full pt-4 border-t mt-4">
                <h3 className="text-xl font-semibold mb-2 text-primary">Generated Script:</h3>
                <Textarea
                  readOnly
                  value={generatedScript}
                  className="min-h-[200px] bg-muted/50 text-foreground text-base"
                  rows={10}
                />
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
