'use client';

import { CheckCircle, Info } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step2Props {
  initialScript?: string;
  onSubmit: (finalScript: string) => void;
}

export function Step2_ScriptEditor({ initialScript, onSubmit }: Step2Props) {
  const [script, setScript] = useState(initialScript || '');

  useEffect(() => {
    // Update script if initialScript changes (e.g., if user goes back and regenerates)
    setScript(initialScript || '');
  }, [initialScript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(script);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fadeInPage space-y-6">
      <Alert variant="default" className="border-blue-200 bg-blue-50 text-blue-700">
        <Info className="!text-blue-600 h-5 w-5" />
        <AlertTitle className="font-semibold text-blue-800">Step 2: Craft Your Script</AlertTitle>
        <AlertDescription className="text-blue-700/90">
          Review the AI-generated script below. Feel free to edit it to perfectly match your voice
          and message. This script will be your guide for recording or for the avatar's
          text-to-speech.
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="videoScript" className="mb-1 block font-semibold text-md">
          Your Video Resume Script
        </Label>
        <Textarea
          id="videoScript"
          placeholder="Your AI-generated script will appear here. You can edit it as needed..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="min-h-[250px] bg-background text-sm"
          required
        />
        <p className="mt-1 text-muted-foreground text-xs">
          Aim for a script that's about 1 minute long when spoken (approx. 150 words).
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={!script.trim()}>
          <CheckCircle className="mr-2 h-5 w-5" /> Finalize Script & Choose Presentation
        </Button>
      </div>
    </form>
  );
}
