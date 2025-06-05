
"use client";

import { useState, type ChangeEvent, useEffect } from 'react'; // Added useEffect
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { editVideo, type EditVideoInput } from '@/ai/flows/video-editor';
import { Loader2, Clapperboard, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FormSchema = z.object({
  videoFile: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, {
      message: "Please upload a video file.",
    }).optional() // Make file optional
    .refine(files => !files || files.length === 0 || files?.[0]?.size <= 10 * 1024 * 1024, `Max file size is 10MB.`)
    .refine(files => !files || files.length === 0 || files?.[0]?.type.startsWith("video/"), "Please upload a valid video file (e.g., MP4, WebM).")
});

type FormValues = {
  videoFile?: FileList; // videoFile is now optional
};

interface VideoEditorProps {
  initialVideoDataUri?: string; // New prop
}

export function VideoEditor({ initialVideoDataUri }: VideoEditorProps) {
  const [editedVideoDataUri, setEditedVideoDataUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialVideoDataUri || null); // Use initial URI for preview
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (initialVideoDataUri) {
      setPreviewUrl(initialVideoDataUri);
    }
  }, [initialVideoDataUri]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload a video smaller than 10MB.", variant: "destructive" });
        form.resetField("videoFile");
        setPreviewUrl(initialVideoDataUri || null); // Revert to initial if new file is invalid
        return;
      }
      if (!file.type.startsWith("video/")) {
        toast({ title: "Invalid file type", description: "Please upload a valid video file.", variant: "destructive" });
        form.resetField("videoFile");
        setPreviewUrl(initialVideoDataUri || null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(initialVideoDataUri || null); // Revert to initial if file is cleared
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setEditedVideoDataUri(null);
    setAnalysis(null);

    const videoFile = data.videoFile?.[0];

    if (!videoFile && !initialVideoDataUri) {
      toast({ title: "No Video Provided", description: "Please upload a video or provide an initial one.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (videoFile) { // User uploaded a new file
      const reader = new FileReader();
      reader.readAsDataURL(videoFile);
      reader.onloadend = async () => {
        const videoDataUri = reader.result as string;
        try {
          const result = await editVideo({ videoDataUri });
          setEditedVideoDataUri(result.editedVideoDataUri); // This is the original URI
          setAnalysis(result.analysis);
          toast({ title: "Video Processed!", description: "Your video has been analyzed." });
        } catch (error) {
          console.error("Error editing video (with file):", error);
          toast({ title: "Error Analyzing Video", description: "Failed to analyze video. Please try again.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast({ title: "Error reading file", variant: "destructive" });
        setIsLoading(false);
      }
    } else if (initialVideoDataUri) { // Use initial URI
      try {
        const result = await editVideo({ videoDataUri: initialVideoDataUri });
        setEditedVideoDataUri(result.editedVideoDataUri); // This is the original URI
        setAnalysis(result.analysis);
        toast({ title: "Video Processed!", description: "Your video has been analyzed." });
      } catch (error) {
        console.error("Error editing video (with initial URI):", error);
        toast({ title: "Error Analyzing Video", description: "Failed to analyze video. Please try again.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Determine if form is valid for submission
  const isFormSubmittable = form.formState.isValid || (!!initialVideoDataUri && !form.watch('videoFile')?.[0]);


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Clapperboard className="mr-2 h-6 w-6 text-primary" />
          AI Video Analysis
        </CardTitle>
        <CardDescription>
          Upload your video resume, and our AI will analyze and suggest optimizations. (Demo: Max 10MB video)
        </CardDescription>
        <Alert variant="default" className="mt-3 text-sm border-primary/30 bg-primary/5">
          <Info className="h-4 w-4 text-primary/80" />
          <AlertTitle className="font-medium text-primary/90 text-xs">How it Works</AlertTitle>
          <AlertDescription className="text-xs text-foreground/70">
            Our AI analyzes your video for aspects like speech clarity, visual presentation, and content flow, then provides suggestions for improvement. It does not automatically edit the video.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {!initialVideoDataUri && ( // Only show file upload if no initial URI
              <FormField
                control={form.control}
                name="videoFile"
                render={({ field }) => {
                  const { value: _fieldValue, onChange: fieldOnChange, ...restOfField } = field;
                  return (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Upload Video</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="video/*"
                          {...restOfField}
                          onChange={(e) => {
                            fieldOnChange(e.target.files);
                            handleFileChange(e);
                          }}
                          className="file:text-primary file:font-semibold file:bg-primary/10 file:hover:bg-primary/20 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:border-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

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

            {editedVideoDataUri && !isLoading && ( // This will be the same as previewUrl if using initialVideoDataUri
              <div className="pt-4 border-t mt-4">
                <h3 className="text-xl font-semibold mb-2 text-primary">Analyzed Video (Original):</h3>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button type="submit" disabled={isLoading || !isFormSubmittable} size="lg" className="w-full sm:w-auto">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Clapperboard className="mr-2 h-5 w-5" />
                    )}
                    Analyze Video
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI will review your video and provide feedback.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
