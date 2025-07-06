'use client';

import { Bot, Calculator, CheckCircle, Info, Sparkles } from 'lucide-react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';

export function AiHumanResourcesTab() {
  const { preferences, setPreferences } = useUserPreferences();
  const [estimatedReplies, setEstimatedReplies] = useState<number | string>('');
  const [calculatedCost, setCalculatedCost] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'per_reply' | 'monthly' | 'none'>(
    preferences.aiHumanResourcesTier || 'none'
  );
  const { toast } = useToast();

  const perReplyCost = 0.99;
  const monthlyCost = 49.99;

  const handleCalculateCost = () => {
    const replies = Number(estimatedReplies);
    if (Number.isNaN(replies) || replies <= 0) {
      setCalculatedCost('Please enter a valid number of replies.');
      return;
    }
    const costPerReply = replies * perReplyCost;
    setCalculatedCost(
      `Per-Reply Plan: $${costPerReply.toFixed(2)}. Monthly Plan: $${monthlyCost.toFixed(2)}. Choose the most effective plan.`
    );
  };

  const handleActivateFeature = async () => {
    if (selectedPlan === 'none') {
      toast({
        title: 'No Plan Selected',
        description: 'Please choose a payment plan to activate.',
        variant: 'destructive',
      });
      return;
    }
    // Simulate activation
    await setPreferences({
      hasAiHumanResourcesFeature: true,
      aiHumanResourcesTier: selectedPlan,
    });
    toast({
      title: 'AI Human Resources Activated!',
      description: `You've selected the ${selectedPlan === 'monthly' ? 'Monthly' : 'Per-Reply'} plan. (Conceptual)`,
      duration: 5000,
    });
  };

  const handleDeactivateFeature = async () => {
    await setPreferences({
      hasAiHumanResourcesFeature: false,
      aiHumanResourcesTier: 'none',
    });
    setSelectedPlan('none');
    toast({
      title: 'AI Human Resources Deactivated',
      description: 'The feature is now off. (Conceptual)',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Sparkles className="mr-2 h-6 w-6 text-primary" /> AI Human Resources Assistant
          </CardTitle>
          <CardDescription>
            Automate timely and effective replies to applicants using AI. Keep your reputation score
            high and streamline your workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-blue-200 bg-blue-50 text-blue-700">
            <Info className="!text-blue-600 h-5 w-5" />
            <AlertTitle className="font-semibold text-blue-800">How It Works</AlertTitle>
            <AlertDescription className="text-blue-700/90">
              When enabled, our AI can analyze applicant profiles and job details to draft
              personalized replies. You can review and send them, or (in future updates) allow fully
              automated replies for certain stages. This helps ensure you meet the 72-hour response
              SLA and maintain a high reputation score.
            </AlertDescription>
          </Alert>

          {preferences.hasAiHumanResourcesFeature ? (
            <Alert variant="default" className="border-green-200 bg-green-50 text-green-700">
              <CheckCircle className="!text-green-600 h-5 w-5" />
              <AlertTitle className="font-semibold text-green-800">
                AI Human Resources is ACTIVE!
              </AlertTitle>
              <AlertDescription className="text-green-700/90">
                You are currently on the{' '}
                {preferences.aiHumanResourcesTier === 'monthly'
                  ? 'Monthly Subscription'
                  : 'Per-Reply Plan'}
                . AI assistance is available for your replies.
              </AlertDescription>
              <Button
                onClick={handleDeactivateFeature}
                variant="destructive"
                size="sm"
                className="mt-3"
              >
                Deactivate Feature (Conceptual)
              </Button>
            </Alert>
          ) : (
            <Card className="bg-muted/30 p-4">
              <CardTitle className="mb-3 text-lg">Choose Your Plan</CardTitle>
              <RadioGroup
                value={selectedPlan}
                onValueChange={(value) => {
                  const newValue = value as 'per_reply' | 'monthly' | 'none';
                  if (newValue !== selectedPlan) {
                    setSelectedPlan(newValue);
                  }
                }}
                className="space-y-2"
              >
                <Label
                  htmlFor="plan-per-reply"
                  className="flex cursor-pointer items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-background has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                >
                  <RadioGroupItem value="per_reply"> </RadioGroupItem>
                  <div>
                    <span className="font-medium">Pay Per Reply</span>
                    <p className="text-muted-foreground text-xs">
                      ${perReplyCost.toFixed(2)} per AI-assisted reply. Ideal for lower volume.
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="plan-monthly"
                  className="flex cursor-pointer items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-background has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                >
                  <RadioGroupItem value="monthly"> </RadioGroupItem>
                  <div>
                    <span className="font-medium">Monthly Subscription</span>
                    <p className="text-muted-foreground text-xs">
                      ${monthlyCost.toFixed(2)} per month for unlimited AI replies. Best value for
                      active hiring.
                    </p>
                  </div>
                </Label>
              </RadioGroup>

              <div className="mt-4 border-t pt-4">
                <Label htmlFor="estimatedReplies" className="font-medium text-sm">
                  Estimate Your Costs (Optional)
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="estimatedReplies"
                    type="number"
                    placeholder="Avg. replies per month"
                    value={estimatedReplies}
                    onChange={(e) => setEstimatedReplies(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button onClick={handleCalculateCost} variant="outline" size="sm">
                    <Calculator className="mr-2 h-4 w-4" /> Calculate
                  </Button>
                </div>
                {calculatedCost && (
                  <p className="mt-1 text-muted-foreground text-xs">{calculatedCost}</p>
                )}
              </div>
            </Card>
          )}
        </CardContent>
        {!preferences.hasAiHumanResourcesFeature && (
          <CardFooter>
            <Button
              onClick={handleActivateFeature}
              size="lg"
              disabled={selectedPlan === 'none'}
              className="w-full"
            >
              <Bot className="mr-2 h-5 w-5" /> Activate AI Human Resources (Conceptual)
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
