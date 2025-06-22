'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Clapperboard, Film, Info, Loader2, Scissors, Sparkles, Type, Wand } from 'lucide-react'; // Changed WandWielding to Wand
import { type ChangeEvent, useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { z } from 'zod';
import { editVideo } from '@/ai/flows/video-editor';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  videoFile: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, {
      message: 'Please upload a video file.',
    })
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files?.[0]?.size <= 10 * 1024 * 1024,
      'Max file size is 10MB.'
    )
    .refine(
      (files) => !files || files.length === 0 || files?.[0]?.type.startsWith('video/'),
      'Please upload a valid video file (e.g., MP4, WebM).'
    ),
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

  const [subtitleText, setSubtitleText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

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
        toast({
          title: 'File too large',
          description: 'Please upload a video smaller than 10MB.',
          variant: 'destructive',
        });
        form.resetField('videoFile');
        setPreviewUrl(initialVideoDataUri || null);
        return;
      }
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a valid video file.',
          variant: 'destructive',
        });
        form.resetField('videoFile');
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
      toast({
        title: 'No Video Provided',
        description: 'Please upload a video or provide an initial one.',
        variant: 'destructive',
      });
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
      toast({ title: 'Error reading video data', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      const result = await editVideo({ videoDataUri: videoDataUriToProcess });
      setEditedVideoDataUri(result.editedVideoDataUri);
      setAnalysis(result.analysis);
      toast({ title: 'Video Processed!', description: 'Your video has been analyzed.' });
    } catch (error) {
      console.error('Error processing video:', error);
      toast({
        title: 'Error Analyzing Video',
        description: 'Failed to analyze video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormSubmittable =
    form.formState.isValid || (!!initialVideoDataUri && !form.watch('videoFile')?.[0]);

  const handleConceptualEditAction = (actionName: string) => {
    toast({
      title: 'Conceptual Action',
      description: `${actionName} feature is planned. This is a UI placeholder.`,
      variant: 'default',
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
          Upload your video resume. Our AI will analyze it and suggest optimizations. You can also
          explore conceptual editing tools. (Demo: Max 10MB video)
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
                      <FormLabel className="font-semibold text-lg">Upload Video</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="video/*"
                          {...restOfField}
                          onChange={(e) => {
                            fieldOnChange(e.target.files);
                            handleFileChange(e);
                          }}
                          className="file:mr-3 file:rounded-md file:border-none file:bg-primary/10 file:px-3 file:py-1.5 file:font-semibold file:text-primary file:hover:bg-primary/20"
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
                <h4 className="mb-2 font-semibold text-md">Video Preview:</h4>
                <video
                  controls
                  src={previewUrl}
                  className="w-full max-w-md rounded-md shadow-md"
                  data-ai-hint="video player"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <Separator className="my-6" />

            {/* Conceptual Editing Tools Section */}
            <div className="space-y-4">
              <h3 className="flex items-center font-semibold text-lg text-primary">
                <Wand className="mr-2 h-5 w-5" /> Conceptual Editing Tools (UI Placeholders)
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Button
                  variant="outline"
                  onClick={() => handleConceptualEditAction('Trim Video')}
                  disabled={!previewUrl}
                >
                  <Scissors className="mr-2 h-4 w-4" /> Trim Video
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleConceptualEditAction('Merge Clips')}
                  disabled={!previewUrl}
                >
                  <Film className="mr-2 h-4 w-4" /> Splice/Merge
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleConceptualEditAction('Video Templates')}
                  disabled={!previewUrl}
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Templates
                </Button>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="subtitles" className="flex items-center">
                  <Type className="mr-2 h-4 w-4" /> Add Subtitles (Conceptual)
                </Label>
                <Textarea
                  id="subtitles"
                  placeholder="Enter subtitle text here, line by line..."
                  value={subtitleText}
                  onChange={(e) => setSubtitleText(e.target.value)}
                  className="min-h-[80px]"
                  disabled={!previewUrl}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConceptualEditAction('Apply Subtitles')}
                  disabled={!previewUrl || !subtitleText.trim()}
                >
                  Apply Subtitles
                </Button>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="filters" className="flex items-center">
                  <Sparkles className="mr-2 h-4 w-4" /> Apply Filter (Conceptual)
                </Label>
                <Select
                  value={selectedFilter}
                  onValueChange={setSelectedFilter}
                  disabled={!previewUrl}
                >
                  <SelectTrigger id="filters">
                    <SelectValue placeholder="Select a filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="brighten">Brighten</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConceptualEditAction('Apply Filter')}
                  disabled={!previewUrl || !selectedFilter || selectedFilter === 'none'}
                >
                  Apply Filter
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* AI Analysis Section */}
            <div className="space-y-4">
              <h3 className="flex items-center font-semibold text-lg text-primary">
                <Info className="mr-2 h-5 w-5" /> AI Video Analysis
              </h3>
              <Alert variant="default" className="border-primary/30 bg-primary/5 text-sm">
                <Info className="h-4 w-4 text-primary/80" />
                <AlertTitle className="font-medium text-primary/90 text-xs">
                  How AI Analysis Works
                </AlertTitle>
                <AlertDescription className="text-foreground/70 text-xs">
                  Our AI analyzes your video for aspects like speech clarity, visual presentation,
                  and content flow, then provides suggestions for improvement. It does not
                  automatically edit the video.
                </AlertDescription>
              </Alert>
              {isLoading && (
                <div className="flex h-40 flex-col items-center justify-center rounded-md bg-muted/30">
                  <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    AI is analyzing your video... this can take a moment.
                  </p>
                </div>
              )}
              {analysis && !isLoading && (
                <div className="pt-2">
                  <h3 className="mb-1.5 font-semibold text-lg text-primary">
                    AI Analysis & Suggestions:
                  </h3>
                  <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none rounded-md border bg-muted/50 p-3 text-foreground">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            {editedVideoDataUri && !isLoading && (
              <div className="mt-4 border-t pt-4">
                <h3 className="mb-1.5 font-semibold text-lg text-primary">
                  Analyzed Video (Original):
                </h3>
                <video
                  controls
                  src={editedVideoDataUri}
                  className="mb-2 w-full max-w-md rounded-md shadow-md"
                  data-ai-hint="video player"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    disabled={isLoading || !isFormSubmittable}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
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
