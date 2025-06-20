'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  success: boolean;
  message?: string;
  tests?: any;
  error?: string;
  timestamp?: string;
}

export default function TestAIPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const { toast } = useToast();

  const runAITest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-ai');
      const result = await response.json();
      
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "AI Test Successful",
          description: "Mistral AI integration is working correctly!",
        });
      } else {
        toast({
          title: "AI Test Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        timestamp: new Date().toISOString(),
      };
      
      setTestResult(errorResult);
      toast({
        title: "Test Failed",
        description: "Could not connect to AI service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to test",
        variant: "destructive",
      });
      return;
    }

    setIsCustomLoading(true);
    setCustomResponse('');

    try {
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: customPrompt,
          model: 'mistral-small',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCustomResponse(result.response);
        toast({
          title: "Custom Test Successful",
          description: "AI responded to your prompt!",
        });
      } else {
        toast({
          title: "Custom Test Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not send custom prompt",
        variant: "destructive",
      });
    } finally {
      setIsCustomLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <Brain className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl font-bold tracking-tight">Mistral AI Integration Test</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Test the AI functionality to ensure everything is working correctly
        </p>
      </div>

      {/* Main Test Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            AI Service Test
          </CardTitle>
          <CardDescription>
            Run a comprehensive test of the Mistral AI integration including basic generation and profile recommendation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAITest} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Run AI Tests
              </>
            )}
          </Button>

          {testResult && (
            <div className="mt-6 p-4 border rounded-lg">
              <div className="flex items-center mb-3">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "Success" : "Failed"}
                </Badge>
              </div>

              {testResult.success && testResult.tests && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Basic Generation Test</h4>
                    <p className="text-sm text-muted-foreground mb-1">Response:</p>
                    <p className="text-sm bg-muted p-2 rounded">{testResult.tests.basicGeneration.response}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Model: {testResult.tests.basicGeneration.model} | 
                      Tokens: {testResult.tests.basicGeneration.usage?.totalTokens || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Profile Recommendation Test</h4>
                    <div className="text-sm space-y-1">
                      <p>Candidate ID: {testResult.tests.profileRecommendation.candidateId}</p>
                      <p>Match Score: {testResult.tests.profileRecommendation.matchScore}/100</p>
                      <p>Has Reasoning: {testResult.tests.profileRecommendation.hasReasoning ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Available Models</h4>
                    <div className="flex flex-wrap gap-1">
                      {testResult.tests.availableModels.map((model: string) => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!testResult.success && (
                <div>
                  <p className="text-sm text-red-600 mb-2">Error: {testResult.error}</p>
                  {testResult.error?.includes('MISTRAL_API_KEY') && (
                    <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded border">
                      <p className="font-semibold">Solution:</p>
                      <p>Add your Mistral API key to the .env.local file:</p>
                      <code className="block mt-1 bg-gray-100 p-1 rounded">
                        MISTRAL_API_KEY=your_actual_api_key_here
                      </code>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                Test completed at: {testResult.timestamp}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Prompt Test */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Prompt Test</CardTitle>
          <CardDescription>
            Test the AI with your own custom prompt to see how it responds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customPrompt">Your Prompt</Label>
            <Textarea
              id="customPrompt"
              placeholder="Enter your custom prompt here..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={testCustomPrompt} 
            disabled={isCustomLoading || !customPrompt.trim()}
            className="w-full sm:w-auto"
          >
            {isCustomLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Test Custom Prompt
              </>
            )}
          </Button>

          {customResponse && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">AI Response:</h4>
              <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                {customResponse}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>To use Mistral AI in your application:</p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Get your API key from <a href="https://console.mistral.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mistral AI Console</a></li>
            <li>Add it to your .env.local file: <code className="bg-gray-100 px-1 rounded">MISTRAL_API_KEY=your_key_here</code></li>
            <li>Restart your development server</li>
            <li>Run the tests above to verify everything is working</li>
          </ol>
          <p className="text-muted-foreground mt-3">
            The AI service will automatically use Mistral AI for all AI-powered features in your application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}