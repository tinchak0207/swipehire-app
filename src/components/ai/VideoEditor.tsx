
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { editVideo, type EditVideoInput } from '@/ai/flows/video-editor';
import { Loader2, Clapperboard, Info, Scissors, Type, Sparkles, WandWielding, Film } from 'lucide-react'; // Added new icons
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from '@/components/ui/textarea'; // Added Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { Separator } from '@/components/ui/separator'; // Added Separator

const FormSchema = z.object({
  videoFile: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, {
      message: "Please upload a video file.",
    }).optional()
    .refine(files => !files || files.length === 0 || files?.[0]?.size <= 10 * 1024 * 1024, `Max file size is 10MB.`)
    .refine(files => !files || files.length === 0 || files?.[0]?.type.startsWith("video/"), "Please upload a valid video file (e.g., MP4, WebM).")
});

type FormValues = {
  videoFile?: FileList;
};

interface VideoEditorProps {
  initialVideoDataUri?: string;
}

export function VideoEditor({ initialVideoDataUri }: VideoEditorProps) {
  const [editedVideoDataUri, setEditedVideoDataUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialVideoDataUri || null);
  const { toast } = useToast();

  const [subtitleText, setSubtitleText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

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
        setPreviewUrl(initialVideoDataUri || null);
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
      setPreviewUrl(initialVideoDataUri || null);
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

    let videoDataUriToProcess: string | null = null;

    if (videoFile) {
      videoDataUriToProcess = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(videoFile);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    } else if (initialVideoDataUri) {
      videoDataUriToProcess = initialVideoDataUri;
    }

    if (!videoDataUriToProcess) {
      toast({ title: "Error reading video data", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const result = await editVideo({ videoDataUri: videoDataUriToProcess });
      setEditedVideoDataUri(result.editedVideoDataUri);
      setAnalysis(result.analysis);
      toast({ title: "Video Processed!", description: "Your video has been analyzed." });
    } catch (error) {
      console.error("Error processing video:", error);
      toast({ title: "Error Analyzing Video", description: "Failed to analyze video. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormSubmittable = form.formState.isValid || (!!initialVideoDataUri && !form.watch('videoFile')?.[0]);

  const handleConceptualEditAction = (actionName: string) => {
    toast({
      title: "Conceptual Action",
      description: `${actionName} feature is planned. This is a UI placeholder.`,
      variant: "default"
    });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Clapperboard className="mr-2 h-6 w-6 text-primary" />
          AI Video Studio
        </CardTitle>
        <CardDescription>
          Upload your video resume. Our AI will analyze it and suggest optimizations. You can also explore conceptual editing tools. (Demo: Max 10MB video)
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {!initialVideoDataUri && (
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

            {previewUrl && (
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">Video Preview:</h4>
                <video controls src={previewUrl} className="w-full max-w-md rounded-md shadow-md" data-ai-hint="video player">
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            <Separator className="my-6" />

            {/* Conceptual Editing Tools Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center text-primary">
                <WandWielding className="mr-2 h-5 w-5" /> Conceptual Editing Tools (UI Placeholders)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button variant="outline" onClick={() => handleConceptualEditAction("Trim Video")} disabled={!previewUrl}>
                  <Scissors className="mr-2 h-4 w-4" /> Trim Video
                </Button>
                <Button variant="outline" onClick={() => handleConceptualEditAction("Merge Clips")} disabled={!previewUrl}>
                  <Film className="mr-2 h-4 w-4" /> Splice/Merge
                </Button>
                 <Button variant="outline" onClick={() => handleConceptualEditAction("Video Templates")} disabled={!previewUrl}>
                  <Sparkles className="mr-2 h-4 w-4" /> Templates
                </Button>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="subtitles" className="flex items-center"><Type className="mr-2 h-4 w-4" /> Add Subtitles (Conceptual)</Label>
                <Textarea 
                  id="subtitles" 
                  placeholder="Enter subtitle text here, line by line..." 
                  value={subtitleText}
                  onChange={(e) => setSubtitleText(e.target.value)}
                  className="min-h-[80px]"
                  disabled={!previewUrl}
                />
                <Button variant="outline" size="sm" onClick={() => handleConceptualEditAction("Apply Subtitles")} disabled={!previewUrl || !subtitleText.trim()}>
                  Apply Subtitles
                </Button>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="filters" className="flex items-center"><Sparkles className="mr-2 h-4 w-4" /> Apply Filter (Conceptual)</Label>
                <Select value={selectedFilter} onValueChange={setSelectedFilter} disabled={!previewUrl}>
                  <SelectTrigger id="filters"><SelectValue placeholder="Select a filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="brighten">Brighten</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => handleConceptualEditAction("Apply Filter")} disabled={!previewUrl || !selectedFilter || selectedFilter === "none"}>
                  Apply Filter
                </Button>
              </div>
            </div>
            
            <Separator className="my-6" />

            {/* AI Analysis Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center text-primary"><Info className="mr-2 h-5 w-5" /> AI Video Analysis</h3>
                <Alert variant="default" className="text-sm border-primary/30 bg-primary/5">
                  <Info className="h-4 w-4 text-primary/80" />
                  <AlertTitle className="font-medium text-primary/90 text-xs">How AI Analysis Works</AlertTitle>
                  <AlertDescription className="text-xs text-foreground/70">
                    Our AI analyzes your video for aspects like speech clarity, visual presentation, and content flow, then provides suggestions for improvement. It does not automatically edit the video.
                  </AlertDescription>
                </Alert>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-40 bg-muted/30 rounded-md">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                    <p className="text-muted-foreground">AI is analyzing your video... this can take a moment.</p>
                  </div>
                )}
                {analysis && !isLoading && (
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-primary">AI Analysis & Suggestions:</h3>
                    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-3 border rounded-md bg-muted/50 text-foreground">
                      <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                  </div>
                )}
            </div>
             {editedVideoDataUri && !isLoading && ( 
              <div className="pt-4 border-t mt-4">
                <h3 className="text-lg font-semibold mb-1.5 text-primary">Analyzed Video (Original):</h3>
                 <video controls src={editedVideoDataUri} className="w-full max-w-md rounded-md shadow-md mb-2" data-ai-hint="video player">
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button type="submit" disabled={isLoading || !isFormSubmittable} size="lg" className="w-full sm:w-auto">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Clapperboard className="mr-2 h-5 w-5" />
                    )}
                    Get AI Analysis
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

    