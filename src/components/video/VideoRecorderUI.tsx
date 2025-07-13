'use client';

import {
  CameraOff,
  Download,
  Film,
  HelpCircle,
  Lightbulb,
  Loader2,
  PlayCircle,
  RefreshCw,
  Save,
  TimerIcon,
  Video,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface VideoRecorderUIProps {
  onRecordingComplete?: (videoDataUrl: string) => void;
}

export function VideoRecorderUI({ onRecordingComplete }: VideoRecorderUIProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingCompleteState, setIsRecordingCompleteState] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const recordingDuration = 60;

  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const { mongoDbUserId, updateFullBackendUserFields } = useUserPreferences();

  const { toast } = useToast();

  const stopCameraStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const requestCameraPermission = useCallback(async () => {
    setHasCameraPermission(null);
    setRecordedVideoUrl(null);
    setIsRecordingCompleteState(false);

    // Reset video element to ensure it's ready for a live stream
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.removeAttribute('src');
      videoRef.current.controls = false;
      videoRef.current.loop = false;
      videoRef.current.muted = true; // Important for preview
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported in this browser.');
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access. Try a modern browser.',
      });
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch((e) => console.error('Error playing preview:', e));
      }
      return true;
    } catch (error: any) {
      console.error('Error accessing camera:', error.name, error.message);
      setHasCameraPermission(false);
      let title = 'Camera Problem';
      let description = 'Could not access camera. Please check permissions.';

      if (error.name === 'NotAllowedError') {
        title = 'Camera Access Denied';
        description = 'Please allow camera access in browser settings.';
      } else if (error.name === 'NotFoundError') {
        title = 'No Camera Found';
        description = 'Ensure camera is connected & enabled.';
      } else if (error.name === 'NotReadableError') {
        title = 'Camera In Use or Hardware Issue';
        description = 'Close other apps using camera, check connections/drivers, or restart.';
      } else if (error.name === 'AbortError') {
        title = 'Camera Access Aborted';
        description = 'Camera access interrupted. Please try again.';
      } else if (error.name === 'SecurityError') {
        title = 'Camera Access Blocked';
        description = 'Access blocked by browser/system security. Check settings.';
      } else if (error.name === 'TypeError') {
        title = 'Camera Configuration Error';
        description = 'Issue with camera setup on your device/browser.';
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
        duration: 7000,
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopCameraStream();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [requestCameraPermission, stopCameraStream]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && elapsedTime < recordingDuration) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (elapsedTime >= recordingDuration && isRecording) {
      handleStopRecording();
      toast({ title: 'Recording Finished', description: 'Time limit reached.' });
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, elapsedTime, toast, handleStopRecording]);

  const handleStartRecording = async () => {
    if (!hasCameraPermission || !videoRef.current?.srcObject) {
      const canStart = await requestCameraPermission();
      if (!canStart) {
        toast({
          title: 'Camera Permission Needed',
          description: 'Cannot start recording without camera access. Please check guidance.',
          variant: 'destructive',
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!videoRef.current?.srcObject) {
        toast({
          title: 'Camera Stream Error',
          description: 'Could not initialize camera stream. Please try again.',
          variant: 'destructive',
        });
        return;
      }
    }

    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    setIsRecordingCompleteState(false);
    setElapsedTime(0);

    try {
      const stream = videoRef.current?.srcObject as MediaStream;

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        toast({
          title: 'No Audio Track',
          description: 'Microphone not detected or not providing audio.',
          variant: 'destructive',
        });
      }
      audioTracks.forEach((track) => (track.enabled = true));

      const options = { mimeType: 'video/webm; codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} is not supported, trying default.`);
      }
      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(recordedChunks, { type: options.mimeType });
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedVideoUrl(videoUrl);
        setIsRecordingCompleteState(true);
        if (onRecordingComplete) {
          onRecordingComplete(videoUrl);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = videoUrl;
          videoRef.current.muted = false;
          videoRef.current.controls = true;
          videoRef.current.loop = false;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: 'Recording Started', description: 'Recording has begun.' });
    } catch (e) {
      console.error('Error starting MediaRecorder:', e);
      toast({
        title: 'Recording Error',
        description: 'Could not start recording. Check console for details.',
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);

    setElapsedTime((prev) => prev);
    toast({ title: 'Recording Stopped', description: 'Processing video...' });
  };

  const handleReRecord = async () => {
    setIsRecording(false);
    setIsRecordingCompleteState(false);
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    if (onRecordingComplete) {
      onRecordingComplete('');
    }
    setElapsedTime(0);

    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.removeAttribute('src');
      videoRef.current.controls = false;
      videoRef.current.loop = false;
      videoRef.current.muted = true;
    }

    stopCameraStream();

    const permissionGranted = await requestCameraPermission();
    if (permissionGranted) {
      toast({ title: 'Ready to Re-record', description: 'Camera reset. Click Start Recording.' });
    }
  };

  const handleDownload = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `swipehire-recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: 'Download Started', description: 'Your video is downloading.' });
    } else {
      toast({
        title: 'No Recording Found',
        description: 'Please record a video first.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveVideoResume = async () => {
    if (!recordedVideoUrl) {
      toast({ title: 'Error', description: 'No video recorded to save.', variant: 'destructive' });
      return;
    }
    if (!mongoDbUserId) {
      toast({
        title: 'User Not Identified',
        description: 'Please log in to save your video resume.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingVideo(true);
    try {
      const response = await fetch(recordedVideoUrl);
      const videoBlob = await response.blob();
      const videoFile = new File([videoBlob], `video-resume-${Date.now()}.webm`, {
        type: videoBlob.type,
      });

      const formData = new FormData();
      formData.append('videoResume', videoFile);

      const uploadResponse = await fetch(
        `${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/video-resume`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse
          .json()
          .catch(() => ({ message: `Failed to save video. Status: ${uploadResponse.status}` }));
        throw new Error(errorData.message);
      }

      const result = await uploadResponse.json();
      if (result.user?.profileVideoPortfolioLink) {
        updateFullBackendUserFields({
          profileVideoPortfolioLink: result.user.profileVideoPortfolioLink,
        });
      }
      toast({
        title: 'Video Saved!',
        description: 'Your video resume has been saved to your profile.',
      });
    } catch (error: any) {
      console.error('Error saving video resume:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save video resume.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingVideo(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <Film className="mr-3 h-6 w-6 text-primary" />
          Video Resume Recorder
        </CardTitle>
        <CardDescription className="text-sm">
          <span className="font-semibold text-primary">Prompt:</span> "Take up to 1 minute to
          introduce your core strengths and why you're a great fit."
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-4 md:p-6">
        <div className="grid items-start gap-4 md:grid-cols-3">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted shadow-inner md:col-span-2">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              data-ai-hint="camera preview"
            />
            {hasCameraPermission === null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center text-white">
                <Video className="mb-2 h-12 w-12 opacity-80" />
                <p className="font-semibold">Requesting camera access...</p>
                <p className="text-sm">Please check your browser for a permission prompt.</p>
              </div>
            )}
            {hasCameraPermission === false && !videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center text-white">
                <CameraOff className="mb-3 h-12 w-12" />
                <p className="font-semibold text-lg">Camera Access Failed</p>
                <p className="text-sm">
                  Could not start video. Please check troubleshooting tips below.
                </p>
              </div>
            )}
            {isRecordingCompleteState && recordedVideoUrl && (
              <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-white text-xs">
                Previewing Recorded Video
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-lg border bg-background p-3">
            <h3 className="flex items-center font-semibold text-md text-primary">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" /> Recording Tips:
            </h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground text-xs">
              <li>Clearly state your name and role.</li>
              <li>Highlight 1-2 key skills with examples.</li>
              <li>Show enthusiasm and professionalism.</li>
              <li>Look directly at the camera.</li>
              <li>Ensure good lighting and clear audio.</li>
              <li>Stay within the time limit.</li>
            </ul>
          </div>
        </div>

        {hasCameraPermission === false && (
          <Alert variant="default" className="mt-4">
            <HelpCircle className="h-5 w-5" />
            <AlertDescription className="space-y-1 text-sm">
              <p className="font-semibold">Need help with camera access? Try these steps:</p>
              <ul className="list-inside list-disc pl-4">
                <li>Allow camera permission in browser settings.</li>
                <li>Close other apps using the camera (Zoom, etc.).</li>
                <li>Check camera connection & drivers.</li>
                <li>Restart browser or computer.</li>
              </ul>
              <p className="mt-1">If issues continue, check system settings or camera hardware.</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-3 border-t pt-4">
          <div
            className={`rounded-md p-2 font-mono text-lg shadow-sm ${isRecording ? 'animate-pulse bg-destructive/10 text-destructive' : 'bg-muted text-primary'}`}
          >
            <TimerIcon className="mr-1.5 inline h-5 w-5 align-text-bottom" />
            {formatTime(elapsedTime)} / {formatTime(recordingDuration)}
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {!isRecording && !isRecordingCompleteState && (
              <Button
                onClick={handleStartRecording}
                size="lg"
                disabled={hasCameraPermission !== true}
              >
                <PlayCircle className="mr-2 h-5 w-5" /> Start Recording
              </Button>
            )}
            {isRecording && (
              <Button onClick={handleStopRecording} variant="destructive" size="lg">
                <Video className="mr-2 h-5 w-5" /> Stop Recording
              </Button>
            )}

            {(isRecordingCompleteState || !isRecording) && (
              <Button
                onClick={handleReRecord}
                variant="outline"
                size="lg"
                disabled={isRecording || hasCameraPermission !== true}
              >
                <RefreshCw className="mr-2 h-5 w-5" /> Re-record
              </Button>
            )}

            <Button
              onClick={handleDownload}
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              disabled={!isRecordingCompleteState || isRecording}
            >
              <Download className="mr-2 h-5 w-5" /> Download
            </Button>

            {isRecordingCompleteState && recordedVideoUrl && (
              <Button
                onClick={handleSaveVideoResume}
                variant="default"
                size="lg"
                disabled={isSavingVideo || !mongoDbUserId}
              >
                {isSavingVideo ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                Save Video Resume
              </Button>
            )}
          </div>
          {isRecordingCompleteState && recordedVideoUrl && (
            <p className="text-muted-foreground text-sm">
              Recording complete. You can now preview, download, or save to your profile.
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/50 p-3 text-center">
        <p className="w-full text-muted-foreground text-xs">
          <Zap className="mr-1 inline h-4 w-4 text-yellow-500" />
          Keep smiling and maintain eye contact with the camera for best results!
        </p>
      </CardFooter>
    </Card>
  );
}
