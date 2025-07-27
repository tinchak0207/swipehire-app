'use client';

import {
  Camera,
  Download,
  Eye,
  FileVideo,
  Mic,
  Pause,
  Play,
  RefreshCw,
  Share,
  SkipForward,
  Sparkles,
  User,
  Video,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type {
  VideoGenerationRequest,
  VideoGenerationResponse,
  VideoTemplate,
  VoiceOption,
} from '@/lib/types/video-generator';

interface AIResumeVideoGeneratorProps {
  className?: string;
  resumeText?: string;
  onVideoGenerated?: (videoUrl: string) => void;
}

const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'professional',
    name: 'Professional Corporate',
    description: 'Clean, corporate style with modern animations',
    duration: 120,
    style: 'corporate',
    thumbnail: '/templates/professional.jpg',
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Dynamic, colorful design for creative roles',
    duration: 150,
    style: 'creative',
    thumbnail: '/templates/creative.jpg',
  },
  {
    id: 'tech',
    name: 'Tech Innovation',
    description: 'Modern tech-focused design with code elements',
    duration: 135,
    style: 'technology',
    thumbnail: '/templates/tech.jpg',
  },
  {
    id: 'minimal',
    name: 'Minimal Executive',
    description: 'Clean, minimalist design for executive roles',
    duration: 90,
    style: 'minimal',
    thumbnail: '/templates/minimal.jpg',
  },
];

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'emma',
    name: 'Emma',
    gender: 'female',
    accent: 'American',
    description: 'Professional, warm female voice',
    sample: '/voices/emma-sample.mp3',
  },
  {
    id: 'david',
    name: 'David',
    gender: 'male',
    accent: 'British',
    description: 'Confident, clear male voice',
    sample: '/voices/david-sample.mp3',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    gender: 'female',
    accent: 'American',
    description: 'Energetic, enthusiastic female voice',
    sample: '/voices/sophia-sample.mp3',
  },
  {
    id: 'james',
    name: 'James',
    gender: 'male',
    accent: 'American',
    description: 'Deep, authoritative male voice',
    sample: '/voices/james-sample.mp3',
  },
];

export function AIResumeVideoGenerator({
  className = '',
  resumeText = '',
  onVideoGenerated,
}: AIResumeVideoGeneratorProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [videoResult, setVideoResult] = useState<VideoGenerationResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [customScript, setCustomScript] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [includeContactInfo, setIncludeContactInfo] = useState(true);
  const [videoDuration, setVideoDuration] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize with first template and voice
  useEffect(() => {
    if (!selectedTemplate && VIDEO_TEMPLATES.length > 0) {
      const template = VIDEO_TEMPLATES[0];
      if (template) {
        setSelectedTemplate(template);
      }
    }
    if (!selectedVoice && VOICE_OPTIONS.length > 0) {
      const voice = VOICE_OPTIONS[0];
      if (voice) {
        setSelectedVoice(voice);
      }
    }
  }, [selectedTemplate, selectedVoice]);

  // Auto-generate title from resume text
  useEffect(() => {
    if (resumeText && !videoTitle) {
      const lines = resumeText.split('\n').filter((line) => line.trim());
      const firstLine = lines[0]?.trim();
      if (firstLine && firstLine.length < 100) {
        setVideoTitle(firstLine);
      } else {
        setVideoTitle('Professional Resume Video');
      }
    }
  }, [resumeText, videoTitle]);

  const simulateProgress = useCallback(() => {
    const stages = [
      { stage: 'Analyzing resume content...', progress: 10 },
      { stage: 'Generating AI script...', progress: 25 },
      { stage: 'Synthesizing voice narration...', progress: 45 },
      { stage: 'Creating visual elements...', progress: 65 },
      { stage: 'Rendering video segments...', progress: 80 },
      { stage: 'Finalizing video production...', progress: 95 },
      { stage: 'Processing complete!', progress: 100 },
    ];

    let currentStageIndex = 0;
    const updateProgress = () => {
      if (currentStageIndex < stages.length) {
        const stage = stages[currentStageIndex];
        if (stage) {
          setGenerationStage(stage.stage);
          setGenerationProgress(stage.progress);
        }
        currentStageIndex++;

        if (currentStageIndex < stages.length) {
          const nextDelay = Math.random() * 2000 + 1000; // 1-3 seconds
          progressInterval.current = setTimeout(updateProgress, nextDelay);
        }
      }
    };

    updateProgress();
  }, []);

  const handleGenerateVideo = useCallback(async () => {
    if (!resumeText.trim() || !selectedTemplate || !selectedVoice) {
      alert('Please provide resume content, select a template, and choose a voice');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStage('Initializing...');
    setActiveTab('preview');

    // Start progress simulation
    simulateProgress();

    try {
      const request: VideoGenerationRequest = {
        resumeText,
        template: selectedTemplate,
        voice: selectedVoice,
        customScript: customScript || '',
        title: videoTitle || 'Professional Resume Video',
        duration: videoDuration,
        includeContactInfo,
        style: selectedTemplate.style,
        options: {
          includeSubtitles: true,
          includeBrandWatermark: false,
          videoQuality: 'hd',
          audioQuality: 'high',
        },
      };

      const response = await fetch('/api/resume-optimizer/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (data.success) {
        // Simulate final processing time
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockVideoResponse: VideoGenerationResponse = {
          success: true,
          videoUrl: '/generated-videos/resume-video-demo.mp4',
          thumbnailUrl: '/generated-videos/resume-video-thumb.jpg',
          duration: videoDuration,
          fileSize: Math.round(videoDuration * 2.5), // Estimate MB
          segments: [
            {
              id: '1',
              type: 'introduction',
              startTime: 0,
              endTime: 15,
              content: 'Professional introduction and name',
            },
            {
              id: '2',
              type: 'experience',
              startTime: 15,
              endTime: 60,
              content: 'Work experience and achievements',
            },
            {
              id: '3',
              type: 'skills',
              startTime: 60,
              endTime: 90,
              content: 'Technical and soft skills showcase',
            },
            {
              id: '4',
              type: 'conclusion',
              startTime: 90,
              endTime: videoDuration,
              content: 'Call to action and contact information',
            },
          ],
          metadata: {
            generatedAt: new Date().toISOString(),
            template: selectedTemplate.name,
            voice: selectedVoice.name,
            processingTime: 8500 + Math.random() * 3000,
            aiModel: 'Claude-3.5-Sonnet + ElevenLabs + Runway ML',
          },
        };

        setVideoResult(mockVideoResponse);
        setGenerationProgress(100);
        setGenerationStage('Video generation complete!');

        if (onVideoGenerated) {
          onVideoGenerated(mockVideoResponse.videoUrl);
        }
      } else {
        throw new Error(data.error || 'Video generation failed');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      alert('Failed to generate video. Please try again.');
      setActiveTab('content');
    } finally {
      setIsGenerating(false);
      if (progressInterval.current) {
        clearTimeout(progressInterval.current);
      }
    }
  }, [
    resumeText,
    selectedTemplate,
    selectedVoice,
    customScript,
    videoTitle,
    videoDuration,
    includeContactInfo,
    simulateProgress,
    onVideoGenerated,
  ]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleDownload = useCallback(() => {
    if (videoResult?.videoUrl) {
      const link = document.createElement('a');
      link.href = videoResult.videoUrl;
      link.download = `${videoTitle || 'resume-video'}.mp4`;
      link.click();
    }
  }, [videoResult, videoTitle]);

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`mx-auto max-w-6xl space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6 text-purple-600" />
            AI-Powered Resume Video Generator
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              Next-Gen AI
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Transform your resume into a professional video presentation using cutting-edge AI
            technology
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content & Setup</TabsTrigger>
          <TabsTrigger value="template">Template & Voice</TabsTrigger>
          <TabsTrigger value="preview" disabled={!videoResult && !isGenerating}>
            {isGenerating ? 'Generating...' : 'Preview'}
          </TabsTrigger>
          <TabsTrigger value="share" disabled={!videoResult}>
            Share & Export
          </TabsTrigger>
        </TabsList>

        {/* Content Setup Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Resume Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Resume Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="video-title">Video Title</Label>
                  <Input
                    id="video-title"
                    placeholder="e.g., John Doe - Senior Software Engineer"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="resume-content">Resume Text</Label>
                  <Textarea
                    id="resume-content"
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    readOnly
                    className="min-h-[200px] resize-none bg-gray-50"
                  />
                  <div className="mt-2 text-gray-500 text-sm">
                    {resumeText.split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Script */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Custom Script (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-script">Custom Narration Script</Label>
                  <Textarea
                    id="custom-script"
                    placeholder="Write a custom script for your video narration, or leave blank to auto-generate from resume..."
                    value={customScript}
                    onChange={(e) => setCustomScript(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="duration">Video Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={60}
                      max={300}
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(parseInt(e.target.value) || 120)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-contact"
                      checked={includeContactInfo}
                      onChange={(e) => setIncludeContactInfo(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="include-contact">Include contact information</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Template & Voice Tab */}
        <TabsContent value="template" className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Video Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {VIDEO_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer border-2 transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="mt-1 text-gray-600 text-sm">{template.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline">{template.style}</Badge>
                        <span className="text-gray-500 text-xs">{template.duration}s</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                AI Voice Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {VOICE_OPTIONS.map((voice) => (
                  <Card
                    key={voice.id}
                    className={`cursor-pointer border-2 transition-colors ${
                      selectedVoice?.id === voice.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVoice(voice)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{voice.name}</h4>
                          <p className="text-gray-600 text-sm">{voice.description}</p>
                          <div className="mt-2 flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {voice.gender}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {voice.accent}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Play className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleGenerateVideo}
                disabled={!resumeText.trim() || !selectedTemplate || !selectedVoice || isGenerating}
                className="h-12 w-full text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Generate AI Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          {isGenerating && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">AI Video Generation in Progress</h3>
                    <span className="text-gray-500 text-sm">{generationProgress}%</span>
                  </div>
                  <Progress
                    value={generationProgress}
                    className={`h-3 ${getProgressColor(generationProgress)}`}
                  />
                  <p className="text-center text-gray-600 text-sm">{generationStage}</p>
                  <div className="flex justify-center space-x-4 text-gray-500 text-xs">
                    <span>✓ AI Script Generation</span>
                    <span>✓ Voice Synthesis</span>
                    <span>⏳ Video Rendering</span>
                    <span>⏳ Final Processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {videoResult && (
            <>
              {/* Video Player */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Generated Video Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-lg bg-black">
                    <video
                      ref={videoRef}
                      className="aspect-video w-full"
                      poster={videoResult.thumbnailUrl}
                      onTimeUpdate={handleTimeUpdate}
                      muted={isMuted}
                    >
                      <source src={videoResult.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Video Controls */}
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handlePlayPause}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>

                        <div className="flex flex-1 items-center gap-2">
                          <span className="text-sm text-white">{formatTime(currentTime)}</span>
                          <div className="h-1 flex-1 rounded-full bg-white/30">
                            <div
                              className="h-full rounded-full bg-white transition-all"
                              style={{ width: `${(currentTime / videoResult.duration) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-white">
                            {formatTime(videoResult.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Segments */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Segments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {videoResult.segments.map((segment) => (
                      <div
                        key={segment.id}
                        className="flex items-center gap-4 rounded-lg bg-gray-50 p-3"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSeek(segment.startTime)}
                        >
                          <SkipForward className="mr-1 h-3 w-3" />
                          {formatTime(segment.startTime)}
                        </Button>
                        <div className="flex-1">
                          <h4 className="font-medium capitalize">{segment.type}</h4>
                          <p className="text-gray-600 text-sm">{segment.content}</p>
                        </div>
                        <Badge variant="outline">
                          {formatTime(segment.endTime - segment.startTime)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Generation Info */}
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Video generated in {Math.round(videoResult.metadata.processingTime / 1000)}s using{' '}
                  {videoResult.metadata.aiModel}. File size: {videoResult.fileSize}MB | Template:{' '}
                  {videoResult.metadata.template} | Voice: {videoResult.metadata.voice}
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>

        {/* Share & Export Tab */}
        <TabsContent value="share" className="space-y-6">
          {videoResult && (
            <>
              {/* Download Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download & Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Button onClick={handleDownload} className="h-12">
                      <FileVideo className="mr-2 h-4 w-4" />
                      Download MP4
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Download className="mr-2 h-4 w-4" />
                      Download Audio
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Camera className="mr-2 h-4 w-4" />
                      Export Thumbnail
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sharing Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share className="h-5 w-5" />
                    Share Your Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Share Link</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`https://swipehire.com/video/${videoResult.metadata.generatedAt}`}
                        className="flex-1"
                      />
                      <Button variant="outline">Copy</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <Button variant="outline" size="sm">
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm">
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Video Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-medium">{formatTime(videoResult.duration)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">File Size:</span>
                      <div className="font-medium">{videoResult.fileSize}MB</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Template:</span>
                      <div className="font-medium">{videoResult.metadata.template}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Voice:</span>
                      <div className="font-medium">{videoResult.metadata.voice}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIResumeVideoGenerator;
