
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Zap, Lightbulb, HelpCircle, CameraOff, CheckCircle, RefreshCw, PlayCircle, TimerIcon, Download, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function VideoRecorderUI() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const recordingDuration = 60; // 1 minute, can be adjusted

  const { toast } = useToast();

  const stopCameraStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const requestCameraPermission = useCallback(async () => {
    setHasCameraPermission(null); // Reset while requesting
    setRecordedVideoUrl(null);
    setIsRecordingComplete(false);

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
        videoRef.current.muted = true; // Mute preview to prevent feedback loop
        videoRef.current.play().catch(e => console.error("Error playing preview:", e));
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
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (elapsedTime >= recordingDuration && isRecording) {
      handleStopRecording(); 
      toast({ title: "Recording Finished", description: "Time limit reached." });
    }
    return () => clearInterval(interval);
  }, [isRecording, elapsedTime, recordingDuration, toast]);


  const handleStartRecording = async () => {
    if (!hasCameraPermission || !videoRef.current?.srcObject) {
      const canStart = await requestCameraPermission();
      if (!canStart) {
        toast({ title: "Camera Permission Needed", description: "Cannot start recording without camera access. Please check guidance.", variant: "destructive" });
        return;
      }
      // Wait a brief moment for stream to initialize if permission was just granted
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!videoRef.current?.srcObject) {
         toast({ title: "Camera Stream Error", description: "Could not initialize camera stream. Please try again.", variant: "destructive" });
         return;
      }
    }

    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    setIsRecordingComplete(false);
    setElapsedTime(0);

    try {
      const stream = videoRef.current!.srcObject as MediaStream;
      // Ensure audio tracks are enabled
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
          toast({title: "No Audio Track", description: "Microphone not detected or not providing audio.", variant: "destructive"});
          // Optionally, you could try to re-request with audio: true or alert user to check mic
      }
      audioTracks.forEach(track => track.enabled = true);


      const options = { mimeType: 'video/webm; codecs=vp9,opus' }; // Preferred for quality and compatibility
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.warn(`${options.mimeType} is not supported, trying default.`);
          // Fallback to default or another common type if needed
          // options.mimeType = 'video/webm'; // Simpler fallback
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
        setIsRecordingComplete(true);
        // stopCameraStream(); // Stop camera after recording is done and blob created.
        if (videoRef.current) { // Show preview of recorded video
            videoRef.current.srcObject = null; // Clear live stream
            videoRef.current.src = videoUrl;
            videoRef.current.muted = false; // Unmute for preview
            videoRef.current.controls = true;
            videoRef.current.loop = false;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Recording has begun." });
    } catch (e) {
        console.error("Error starting MediaRecorder:", e);
        toast({title: "Recording Error", description: "Could not start recording. Check console for details.", variant: "destructive"});
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    // Stop the timer immediately, actual processing happens in onstop
    setElapsedTime(prev => prev); // Keep current time for display
    toast({ title: "Recording Stopped", description: "Processing video..." });
  };
  
  const handleReRecord = async () => {
    setIsRecording(false);
    setIsRecordingComplete(false);
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    setElapsedTime(0);
    if (videoRef.current) {
        videoRef.current.controls = false; // Hide controls for live preview
        videoRef.current.loop = false;
    }
    stopCameraStream(); // Stop any existing stream first
    await requestCameraPermission(); // Re-request to ensure stream is fresh
    toast({ title: "Ready to Re-record", description: "Camera reset. Click Start Recording." });
  };

  const handleDownload = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `swipehire-recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(recordedVideoUrl); // Clean up
      toast({ title: "Download Started", description: "Your video is downloading." });
    } else {
      toast({ title: "No Recording Found", description: "Please record a video first.", variant: "destructive"});
    }
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
          <Film className="mr-3 h-6 w-6 text-primary" />
          Video Resume Recorder
        </CardTitle>
        <CardDescription className="text-sm">
          <span className="font-semibold text-primary">Prompt:</span> "Take up to 1 minute to introduce your core strengths and why you're a great fit."
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2 bg-muted rounded-lg overflow-hidden shadow-inner aspect-video relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline // Important for iOS
              data-ai-hint="camera feed preview"
            />
            {hasCameraPermission === null && ( 
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center">
                <Video className="h-12 w-12 mb-2 opacity-80" />
                <p className="font-semibold">Requesting camera access...</p>
                <p className="text-sm">Please check your browser for a permission prompt.</p>
              </div>
            )}
             {hasCameraPermission === false && !videoRef.current?.srcObject && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4 text-center">
                    <CameraOff className="h-12 w-12 mb-3" />
                    <p className="font-semibold text-lg">Camera Access Failed</p>
                    <p className="text-sm">Could not start video. Please check troubleshooting tips below.</p>
                </div>
            )}
            {isRecordingComplete && recordedVideoUrl && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    Previewing Recorded Video
                </div>
            )}
          </div>

          <div className="space-y-3 p-3 border rounded-lg bg-background">
            <h3 className="font-semibold text-md flex items-center text-primary">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" /> Recording Tips:
            </h3>
            <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
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
                <ul className="list-disc list-inside pl-4">
                    <li>Allow camera permission in browser settings.</li>
                    <li>Close other apps using the camera (Zoom, etc.).</li>
                    <li>Check camera connection & drivers.</li>
                    <li>Restart browser or computer.</li>
                </ul>
                <p className="mt-1">If issues continue, check system settings or camera hardware.</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-3 pt-4 border-t">
          <div className={`text-lg font-mono p-2 rounded-md shadow-sm ${isRecording ? 'text-destructive bg-destructive/10 animate-pulse' : 'text-primary bg-muted'}`}>
            <TimerIcon className="inline h-5 w-5 mr-1.5 align-text-bottom" />
            {formatTime(elapsedTime)} / {formatTime(recordingDuration)}
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {!isRecording && !isRecordingComplete && (
                <Button onClick={handleStartRecording} size="lg" disabled={hasCameraPermission !== true}>
                    <PlayCircle className="mr-2 h-5 w-5" /> Start Recording
                </Button>
            )}
            {isRecording && (
                <Button onClick={handleStopRecording} variant="destructive" size="lg">
                    <Video className="mr-2 h-5 w-5" /> Stop Recording
                </Button>
            )}

            {(isRecordingComplete || !isRecording) && (
                <Button onClick={handleReRecord} variant="outline" size="lg" disabled={isRecording || hasCameraPermission !== true}>
                  <RefreshCw className="mr-2 h-5 w-5" /> Re-record
                </Button>
            )}
            
            <Button onClick={handleDownload} variant="default" size="lg" className="bg-green-600 hover:bg-green-700" disabled={!isRecordingComplete || isRecording}>
              <Download className="mr-2 h-5 w-5" /> Download
            </Button>
          </div>
           {isRecordingComplete && recordedVideoUrl && (
             <p className="text-sm text-muted-foreground">Recording complete. You can now preview and download.</p>
           )}
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
