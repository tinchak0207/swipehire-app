"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateAvatar, type AvatarGeneratorInput } from '@/ai/flows/avatar-generator';
import Image from 'next/image';
import { Loader2, UserSquare2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  description: z.string().min(10, "Please provide a description of at least 10 characters."),
});

export function AvatarGenerator() {
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AvatarGeneratorInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
    },
  });

  const onSubmit: SubmitHandler<AvatarGeneratorInput> = async (data) => {
    setIsLoading(true);
    setAvatarDataUri(null);
    try {
      const result = await generateAvatar(data);
      setAvatarDataUri(result.avatarDataUri);
      toast({
        title: "Avatar Generated!",
        description: "Your virtual avatar is ready.",
      });
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast({
        title: "Error",
        description: "Failed to generate avatar. The AI might be unable to fulfill this request. Please try a different description.",
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
          Describe your desired virtual avatar, and our AI will create a professional image for you.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Avatar Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'Professional woman, mid-30s, friendly smile, business casual attire, blurred office background'"
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
                <p className="text-muted-foreground">Generating your avatar... this may take a moment.</p>
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
                    data-ai-hint="generated avatar"
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
