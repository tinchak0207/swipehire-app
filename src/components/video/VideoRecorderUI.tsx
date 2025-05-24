
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, Zap, Lightbulb, AlertTriangle, CheckCircle, RefreshCw, PlayCircle, TimerIcon, HelpCircle } from 'lucide-react'; // Added HelpCircle
import { useToast } from '@/hooks/use-toast';

export function VideoRecorderUI() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  // Timer state (conceptual for now)
  const [elapsedTime, setElapsedTime] = useState(0);
  const recordingDuration = 60; // 1 minute

  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not supported in this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access. Please try a modern browser like Chrome, Firefox, or Safari.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error: any) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        let description = 'Please enable camera permissions in your browser settings to use this feature.';
        if (error.name === 'NotAllowedError') {
            description = 'Camera access was denied. You need to allow camera access in your browser settings for this site.';
        } else if (error.name === 'NotFoundError') {
            description = 'No camera was found. Please ensure a camera is connected and enabled.';
        } else if (error.name === 'NotReadableError') {
            description = 'The camera is currently in use by another application or a hardware error occurred. Please close other apps and try again.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Camera Access Problem',
          description: description,
          duration: 7000,
        });
      }
    };

    getCameraPermission();

    // Cleanup function to stop media tracks when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Conceptual timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && elapsedTime < recordingDuration) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (elapsedTime >= recordingDuration && isRecording) {
      setIsRecording(false); // Auto-stop recording
      toast({ title: "Recording Finished", description: "Time limit reached." });
    }
    return () => clearInterval(interval);
  }, [isRecording, elapsedTime, recordingDuration, toast]);


  const handleStartRecording = () => {
    if (!hasCameraPermission) {
      toast({ title: "Camera Permission Needed", description: "Cannot start recording without camera access. Please check the guidance above.", variant: "destructive" });
      return;
    }
    setIsRecording(true);
    setElapsedTime(0);
    toast({ title: "Recording Started", description: "The conceptual recording has begun." });
    // Actual MediaRecorder logic would go here
  };

  const handleStopOrReRecord = () => {
    setIsRecording(false);
    setElapsedTime(0);
    // If actual recording was happening, stop MediaRecorder and reset video source if needed
    toast({ title: isRecording ? "Recording Stopped" : "Ready to Re-record", description: "Video input has been reset." });
  };

  const handleConfirm = () => {
    if (isRecording) {
        toast({ title: "Stop Recording First", description: "Please stop the recording before confirming.", variant: "destructive"});
        return;
    }
    // In a real app, this would take the recorded video data.
    // For now, it's a conceptual step.
    toast({
      title: "Video Confirmed (Conceptual)",
      description: "Next, you could send this video for AI analysis and editing suggestions.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <Video className="mr-3 h-6 w-6 text-primary" />
          Video Resume Recorder
        </CardTitle>
        <CardDescription className="text-sm">
          <span className="font-semibold text-primary">Question:</span> Take 1 minute to introduce your core strengths.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2 bg-muted rounded-lg overflow-hidden shadow-inner aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline // Important for iOS
              data-ai-hint="camera feed preview"
            />
            {hasCameraPermission === null && ( // Initial loading state for camera
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                <Video className="h-12 w-12 mb-2" />
                <p>Accessing camera...</p>
              </div>
            )}
          </div>

          <div className="space-y-3 p-3 border rounded-lg bg-background">
            <h3 className="font-semibold text-md flex items-center text-primary">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" /> Recording Tips:
            </h3>
            <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
              <li>Include specific examples or data.</li>
              <li>Highlight skills relevant to the position.</li>
              <li>Exhibit a positive attitude.</li>
              <li>Look directly at the camera.</li>
              <li>Ensure good lighting and clear audio.</li>
            </ul>
          </div>
        </div>

        {hasCameraPermission === false && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Camera Access Problem</AlertTitle>
            <AlertDescription className="space-y-1">
              <p>We couldn't access your camera. Please try these steps:</p>
              <ul className="list-disc list-inside pl-4 text-sm">
                <li><strong>Check browser permissions:</strong> Ensure this website has permission to access your camera. You can usually find this in your browser's address bar (look for a camera icon) or site settings.</li>
                <li><strong>Close other apps:</strong> Make sure no other applications (e.g., Zoom, Skype, other browser tabs) are currently using your camera.</li>
                <li><strong>Check physical connection:</strong> If using an external camera, ensure it's properly connected.</li>
                <li><strong>Restart your browser:</strong> Sometimes a simple restart can resolve issues.</li>
                <li><strong>System permissions:</strong> Ensure your operating system allows apps to access the camera (check System Preferences on Mac or Privacy settings on Windows).</li>
              </ul>
              <p className="mt-2">If the problem persists, you might need to try a different browser or check your camera hardware.</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-3 pt-4 border-t">
          <div className="text-lg font-mono text-primary p-2 rounded-md bg-muted shadow-sm">
            <TimerIcon className="inline h-5 w-5 mr-1.5 align-text-bottom" />
            {formatTime(elapsedTime)} / {formatTime(recordingDuration)}
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Button onClick={isRecording ? handleStopOrReRecord : handleStartRecording} variant={isRecording ? "destructive" : "default"} size="lg" disabled={hasCameraPermission !== true}>
              {isRecording ? <RefreshCw className="mr-2 h-5 w-5" /> : <PlayCircle className="mr-2 h-5 w-5" />}
              {isRecording ? 'Stop & Reset' : 'Start Recording'}
            </Button>
            <Button onClick={handleStopOrReRecord} variant="outline" size="lg" disabled={isRecording || hasCameraPermission !== true}>
              <RefreshCw className="mr-2 h-5 w-5" /> Re-record
            </Button>
            <Button onClick={handleConfirm} variant="default" size="lg" className="bg-green-600 hover:bg-green-700" disabled={isRecording || hasCameraPermission !== true}>
              <CheckCircle className="mr-2 h-5 w-5" /> Confirm
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 p-3 text-center border-t">
        <p className="text-xs text-muted-foreground w-full">
          <Zap className="inline h-4 w-4 mr-1 text-yellow-500" />
          Keep smiling and maintain eye contact with the camera for best results!
        </p>
      </CardFooter>
    </Card>
  );
}

