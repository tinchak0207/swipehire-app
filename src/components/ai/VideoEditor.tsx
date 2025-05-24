
"use client";

import { useState, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // No longer using Textarea for display
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { editVideo, type EditVideoInput } from '@/ai/flows/video-editor';
import { Loader2, Clapperboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

const FormSchema = z.object({
  videoFile: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, "Please upload a video file.")
    .refine(files => files?.[0]?.size <= 10 * 1024 * 1024, `Max file size is 10MB.`) // Example: 10MB limit
    .refine(files => files?.[0]?.type.startsWith("video/"), "Please upload a valid video file (e.g., MP4, WebM).")
});

type FormValues = {
  videoFile: FileList;
};

export function VideoEditor() {
  const [editedVideoDataUri, setEditedVideoDataUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({ title: "File too large", description: "Please upload a video smaller than 10MB.", variant: "destructive" });
        form.setValue("videoFile", new DataTransfer().files); // Clear the file input
        setPreviewUrl(null);
        return;
      }
      if (!file.type.startsWith("video/")) {
        toast({ title: "Invalid file type", description: "Please upload a valid video file.", variant: "destructive" });
        form.setValue("videoFile", new DataTransfer().files);
        setPreviewUrl(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const videoFile = data.videoFile[0];
    if (!videoFile) return;

    setIsLoading(true);
    setEditedVideoDataUri(null);
    setAnalysis(null);

    const reader = new FileReader();
    reader.readAsDataURL(videoFile);
    reader.onloadend = async () => {
      const videoDataUri = reader.result as string;
      try {
        const result = await editVideo({ videoDataUri });
        setEditedVideoDataUri(result.editedVideoDataUri);
        setAnalysis(result.analysis);
        toast({
          title: "Video Processed!",
          description: "Your video has been analyzed by AI.",
        });
      } catch (error) {
        console.error("Error editing video:", error);
        toast({
          title: "Error Analyzing Video",
          description: "Failed to analyze video. The AI might be unable to process this video, or it's too large/long. Please try a short, common format video.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast({ title: "Error reading file", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Clapperboard className="mr-2 h-6 w-6 text-primary" />
          AI Video Analysis
        </CardTitle>
        <CardDescription>
          Upload your video resume, and our AI will analyze and suggest optimizations to make it more engaging and professional. (Demo: Max 10MB video)
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="videoFile"
              render={({ field }) => {
                // Destructure field to separate value from other props
                // RHF's field.value for file inputs is the FileList, which should not be passed as 'value' prop to native input type="file"
                const { value: _fieldValue, onChange: fieldOnChange, ...restOfField } = field;
                return (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Upload Video</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="video/*"
                        {...restOfField} // Spreads name, ref, onBlur
                        onChange={(e) => {
                          fieldOnChange(e.target.files); // Update RHF state with FileList
                          handleFileChange(e); // Your custom handler for preview etc.
                        }}
                        className="file:text-primary file:font-semibold file:bg-primary/10 file:hover:bg-primary/20 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:border-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {previewUrl && !isLoading && (
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">Video Preview:</h4>
                <video controls src={previewUrl} className="w-full max-w-md rounded-md shadow-md" data-ai-hint="video player">
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-md">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing your video... this can take some time.</p>
              </div>
            )}

            {editedVideoDataUri && !isLoading && (
              <div className="pt-4 border-t mt-4">
                <h3 className="text-xl font-semibold mb-2 text-primary">Original Video (for reference):</h3>
                 <video controls src={editedVideoDataUri} className="w-full max-w-md rounded-md shadow-md mb-4" data-ai-hint="video player">
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {analysis && !isLoading && (
              <div className="pt-4 border-t mt-2">
                <h3 className="text-xl font-semibold mb-2 text-primary">AI Analysis & Suggestions:</h3>
                <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 border rounded-md bg-muted/50 text-foreground">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !form.formState.isValid} size="lg" className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Clapperboard className="mr-2 h-5 w-5" />
              )}
              Analyze Video
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
        
