'use client';

import { signOut } from 'firebase/auth';
import {
  Brain,
  Calculator,
  CalendarDays,
  CheckCircle,
  DollarSign,
  Info,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  type GenerateCompanyReplyStyleInput,
  generateCompanyReplyStyle,
} from '@/ai/flows/company-reply-style-flow';
import { AppHeader } from '@/components/AppHeader';
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
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const perReplyCost = 0.99;
const monthlyCost = 29.99;

export default function AiHrPaymentPage() {
  const { currentUser, fullBackendUser, preferences, setPreferences, mongoDbUserId } =
    useUserPreferences();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoadingAiStyle, setIsLoadingAiStyle] = useState(true);
  const [companyStyleAnalysis, setCompanyStyleAnalysis] = useState('');
  const [suggestedGuidelines, setSuggestedGuidelines] = useState<string[]>([]);

  const [typedStyle, setTypedStyle] = useState('');
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);

  const [estimatedReplies, setEstimatedReplies] = useState<number | string>('');
  const [calculatedPerReplyTotal, setCalculatedPerReplyTotal] = useState<number | null>(null);
  const [savingsPercentage, setSavingsPercentage] = useState<number | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<'per_reply' | 'monthly' | 'none'>(
    preferences.aiHumanResourcesTier || 'none'
  );
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState<'per_reply' | 'monthly' | null>(null);

  // Define constants that might be used in useEffect dependencies or early
  const isAuthenticated = !!currentUser && !!mongoDbUserId;
  const userName = fullBackendUser?.name || currentUser?.displayName || null;
  let userPhotoURL = currentUser?.photoURL || null;
  if (fullBackendUser?.profileAvatarUrl) {
    if (fullBackendUser.profileAvatarUrl.startsWith('/uploads/')) {
      const CUSTOM_BACKEND_URL =
        process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';
      userPhotoURL = `${CUSTOM_BACKEND_URL}${fullBackendUser.profileAvatarUrl}`;
    } else {
      userPhotoURL = fullBackendUser.profileAvatarUrl;
    }
  }
  const isGuestMode = !currentUser && !mongoDbUserId;

  useEffect(() => {
    async function fetchCompanyStyle() {
      if (preferences.isLoading) {
        setIsLoadingAiStyle(true);
        return;
      }

      if (!isAuthenticated) {
        setIsLoadingAiStyle(false);
        setCompanyStyleAnalysis('Please log in to generate an AI communication style.');
        setSuggestedGuidelines([]);
        return;
      }

      if (!fullBackendUser) {
        // This case might occur if Firebase auth is resolved but backend user data is still fetching.
        setIsLoadingAiStyle(false); // Or true if you want to show loading until fullBackendUser is ready
        setCompanyStyleAnalysis(
          'Your user profile is still loading. Please wait a moment and try again, or ensure your profile is complete.'
        );
        setSuggestedGuidelines([]);
        return;
      }

      if (fullBackendUser.selectedRole !== 'recruiter') {
        setIsLoadingAiStyle(false);
        setCompanyStyleAnalysis(
          "This feature is for recruiters. Please ensure your role is set to 'Recruiter' in your settings to generate an AI communication style."
        );
        setSuggestedGuidelines([]);
        return;
      }

      if (!fullBackendUser.companyName || fullBackendUser.companyName.trim() === '') {
        setIsLoadingAiStyle(false);
        setCompanyStyleAnalysis(
          'Please complete your company profile with a company name to generate an AI communication style. You can do this via Settings or the Recruiter Onboarding flow.'
        );
        setSuggestedGuidelines([]);
        return;
      }

      setIsLoadingAiStyle(true);
      try {
        const input: GenerateCompanyReplyStyleInput = {
          companyName: fullBackendUser.companyName,
          companyIndustry: fullBackendUser.companyIndustry || 'General Business',
          companyDescription:
            fullBackendUser.companyDescription || 'A dynamic company focused on growth.',
          companyCultureHighlights: fullBackendUser.companyCultureHighlights || [
            'innovative',
            'collaborative',
          ],
          currentNeeds: fullBackendUser.companyNeeds || 'Seeking talented individuals.',
        };
        const result = await generateCompanyReplyStyle(input);
        setCompanyStyleAnalysis(result.styleAnalysis);
        setSuggestedGuidelines(result.suggestedGuidelines);
      } catch (error) {
        console.error('Error fetching company reply style:', error);
        setCompanyStyleAnalysis(
          'Could not generate company reply style at this time. Please try again later.'
        );
        setSuggestedGuidelines([]);
        toast({
          title: 'AI Style Generation Failed',
          description: "There was an issue generating the company's communication style.",
          variant: 'destructive',
        });
      } finally {
        setIsLoadingAiStyle(false);
      }
    }

    fetchCompanyStyle();
  }, [fullBackendUser, toast, isAuthenticated, preferences.isLoading]);

  useEffect(() => {
    if (companyStyleAnalysis && currentTypingIndex < companyStyleAnalysis.length) {
      const timeoutId = setTimeout(() => {
        setTypedStyle((prev) => prev + companyStyleAnalysis[currentTypingIndex]);
        setCurrentTypingIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeoutId);
    }
    if (companyStyleAnalysis && currentTypingIndex >= companyStyleAnalysis.length) {
      setIsTypewriterComplete(true);
    }
  }, [companyStyleAnalysis, currentTypingIndex]);

  useEffect(() => {
    if (
      !isLoadingAiStyle &&
      (!companyStyleAnalysis ||
        companyStyleAnalysis.trim() === '' ||
        currentTypingIndex >= companyStyleAnalysis.length)
    ) {
      setIsTypewriterComplete(true);
    }
  }, [isLoadingAiStyle, companyStyleAnalysis, currentTypingIndex]);

  // Loading state check based on context - MUST BE AFTER ALL HOOKS
  if (preferences.isLoading && !currentUser && !mongoDbUserId) {
    return (
      <div className="ai-hr-payment-gradient flex min-h-screen flex-col items-center justify-center text-white">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (currentUser && (preferences.isLoading || !mongoDbUserId || !fullBackendUser)) {
    return (
      <div className="ai-hr-payment-gradient flex min-h-screen flex-col text-white">
        <AppHeader
          isAuthenticated={false}
          isGuestMode={true}
          onLoginRequest={() => router.push('/')}
          onLogout={() => {}}
          searchTerm=""
          onSearchTermChange={() => {}}
          userName={null}
          userPhotoURL={null}
        />
        <main className="flex flex-grow flex-col items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p className="mt-4 text-slate-300">Loading payment options and user session...</p>
        </main>
      </div>
    );
  }

  const handleLoginRequest = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
      toast({ title: 'Logout Failed', description: 'Could not sign out.', variant: 'destructive' });
    }
  };

  const handleCalculateCost = () => {
    const replies = Number(estimatedReplies);
    if (Number.isNaN(replies) || replies <= 0) {
      setCalculatedPerReplyTotal(null);
      setSavingsPercentage(null);
      setRecommendedPlan(null);
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid number of replies.',
        variant: 'default',
      });
      return;
    }
    const costPerReplyCalc = replies * perReplyCost;
    setCalculatedPerReplyTotal(costPerReplyCalc);

    if (costPerReplyCalc > monthlyCost) {
      const saved = ((costPerReplyCalc - monthlyCost) / costPerReplyCalc) * 100;
      setSavingsPercentage(Number.parseFloat(saved.toFixed(1)));
      setRecommendedPlan('monthly');
    } else {
      setSavingsPercentage(null);
      setRecommendedPlan('per_reply');
    }
  };

  const handlePlanSelectionAndConceptualPayment = async (plan: 'per_reply' | 'monthly') => {
    setSelectedPlan(plan);
    setIsSubmittingPayment(true);

    console.log(`Redirecting to Stripe for ${plan} plan (conceptual)`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await setPreferences({
      hasAiHumanResourcesFeature: true,
      aiHumanResourcesTier: plan,
    });

    setIsSubmittingPayment(false);
    toast({
      title: 'AI Human Resources Activated!',
      description: `You've selected the ${plan === 'monthly' ? 'Monthly Subscription' : 'Pay Per Reply'} plan. This is a conceptual payment flow. No actual payment was processed.`,
      duration: 8000,
    });
  };

  const isPerReplyRecommended = recommendedPlan === 'per_reply';
  const isMonthlyRecommended = recommendedPlan === 'monthly';

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        isAuthenticated={isAuthenticated}
        isGuestMode={isGuestMode}
        onLoginRequest={handleLoginRequest}
        onLogout={handleLogout}
        searchTerm=""
        onSearchTermChange={() => {}}
        userName={userName}
        userPhotoURL={userPhotoURL}
      />
      <main className="ai-hr-payment-gradient flex flex-grow animate-fadeInPage flex-col items-center justify-center p-4 pt-20 text-white sm:p-8 md:pt-24">
        <div className="container mx-auto max-w-4xl space-y-10">
          <div className="text-center">
            <Brain className="mx-auto mb-4 h-16 w-16 text-purple-400" />
            <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight sm:text-5xl">
              AI Human Resources Assistant
            </h1>
            <p className="mt-3 text-lg text-slate-300">
              Unlock AI-powered replies tailored to your company's voice.
            </p>
          </div>

          <Card className="border-purple-700/50 bg-slate-800/70 shadow-2xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-purple-300">
                <Sparkles className="mr-2 h-6 w-6" /> Your Company's AI Communication Style
              </CardTitle>
              <CardDescription className="text-slate-400">
                Our AI has analyzed your company details to suggest an optimal communication style
                for automated replies:
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[100px]">
              {isLoadingAiStyle ? (
                <div className="flex items-center justify-center text-slate-400">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating your company's
                  communication style...
                </div>
              ) : (
                <p className="whitespace-pre-line text-lg text-slate-200 leading-relaxed">
                  {typedStyle}
                  {currentTypingIndex < companyStyleAnalysis.length && (
                    <span className="typing-cursor" />
                  )}
                </p>
              )}
              {suggestedGuidelines.length > 0 && !isLoadingAiStyle && (
                <div className="mt-4 border-slate-700 border-t pt-3">
                  <h4 className="mb-1.5 font-semibold text-purple-400">
                    Suggested AI Reply Guidelines:
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-slate-300 text-sm">
                    {suggestedGuidelines.map((guideline, index) => (
                      <li key={`guideline-${index}-${guideline.slice(0, 20)}`}>{guideline}</li>
                    ))}
                  </ul>
>>
                </div>
              )}
            </CardContent>
          </Card>

          {isTypewriterComplete && (
            <div className="animate-fadeInPage space-y-10">
              <div className="text-center">
                <h2 className="font-bold text-3xl text-slate-100">Choose Your Plan</h2>
                <p className="mt-1 text-slate-400">
                  Select a plan that best suits your hiring volume.
                </p>
              </div>

              <div className="grid items-stretch gap-6 md:grid-cols-2">
                <Card
                  className={cn(
                    'flex flex-col border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition-all duration-300',
                    recommendedPlan && !isPerReplyRecommended && 'opacity-50 grayscale',
                    isPerReplyRecommended &&
                      'scale-105 shadow-purple-500/30 ring-2 ring-purple-500',
                    !recommendedPlan && 'hover:shadow-purple-500/20'
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-300 text-xl">
                      <DollarSign className="mr-2 h-5 w-5" /> Pay Per Reply
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Ideal for occasional hiring or lower reply volumes. Flexible and targeted.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="font-bold text-4xl text-white">${perReplyCost.toFixed(2)}</p>
                    <p className="text-slate-500">per AI-assisted reply</p>
                    <ul className="mt-4 space-y-1 text-slate-300 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" /> Pay only for what
                        you use.
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" /> Full AI
                        customization.
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handlePlanSelectionAndConceptualPayment('per_reply')}
                      className="w-full transform bg-purple-600 py-3 text-md text-white transition-transform duration-200 hover:scale-105 hover:bg-purple-500"
                      disabled={
                        isSubmittingPayment ||
                        preferences.aiHumanResourcesTier === 'per_reply' ||
                        !isAuthenticated
                      }
                    >
                      {isSubmittingPayment && selectedPlan === 'per_reply' ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      {preferences.aiHumanResourcesTier === 'per_reply'
                        ? 'Current Plan'
                        : 'Choose Pay Per Reply'}
                    </Button>
                  </CardFooter>
                </Card>

                <Card
                  className={cn(
                    'flex flex-col border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition-all duration-300',
                    recommendedPlan && !isMonthlyRecommended && 'opacity-50 grayscale',
                    isMonthlyRecommended && 'scale-105 shadow-purple-500/30 ring-2 ring-purple-500',
                    !recommendedPlan && 'hover:shadow-purple-500/20'
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-300 text-xl">
                      <CalendarDays className="mr-2 h-5 w-5" /> Monthly Subscription
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Best value for active hiring and frequent use. Unlimited AI replies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="font-bold text-4xl text-white">${monthlyCost.toFixed(2)}</p>
                    <p className="text-slate-500">per month</p>
                    <ul className="mt-4 space-y-1 text-slate-300 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" /> Unlimited
                        AI-assisted replies.
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" /> Priority AI
                        processing (conceptual).
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handlePlanSelectionAndConceptualPayment('monthly')}
                      className="w-full transform bg-purple-600 py-3 text-md text-white transition-transform duration-200 hover:scale-105 hover:bg-purple-500"
                      disabled={
                        isSubmittingPayment ||
                        preferences.aiHumanResourcesTier === 'monthly' ||
                        !isAuthenticated
                      }
                    >
                      {isSubmittingPayment && selectedPlan === 'monthly' ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      {preferences.aiHumanResourcesTier === 'monthly'
                        ? 'Current Plan'
                        : 'Choose Monthly Plan'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card className="border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-300 text-xl">
                    <Calculator className="mr-2 h-5 w-5" /> Smart Cost Savings
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Estimate your monthly replies to see which plan saves you more.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="estimatedReplies"
                      className="font-medium text-slate-300 text-sm"
                    >
                      Estimated AI replies per month:
                    </Label>
                    <Input
                      id="estimatedReplies"
                      type="number"
                      placeholder="e.g., 150"
                      value={estimatedReplies}
                      onChange={(e) => setEstimatedReplies(e.target.value)}
                      className="mt-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <Button
                    onClick={handleCalculateCost}
                    className="w-full transform bg-pink-500 text-white transition-transform duration-200 hover:scale-105 hover:bg-pink-600 sm:w-auto"
                  >
                    Calculate Cost
                  </Button>
                  {calculatedPerReplyTotal !== null && (
                    <p className="pt-2 text-slate-400 text-sm">
                      Pay Per Reply Total: $${calculatedPerReplyTotal.toFixed(2)}. Monthly Plan: $$
                      {monthlyCost.toFixed(2)}.
                    </p>
                  )}
                  {savingsPercentage !== null && isMonthlyRecommended && (
                    <Alert
                      variant="default"
                      className="border-green-500/50 bg-green-600/20 text-green-200"
                    >
                      <Sparkles className="!text-green-300 h-5 w-5" />
                      <AlertTitle className="font-semibold text-green-100">
                        Smart Choice!
                      </AlertTitle>
                      <AlertDescription className="text-green-200/90">
                        The Monthly Plan saves you ${savingsPercentage}% based on your estimate!
                      </AlertDescription>
                    </Alert>
                  )}
                  {calculatedPerReplyTotal !== null &&
                    isPerReplyRecommended &&
                    !savingsPercentage && (
                      <Alert
                        variant="default"
                        className="border-blue-500/50 bg-blue-600/20 text-blue-200"
                      >
                        <Info className="!text-blue-300 h-5 w-5" />
                        <AlertTitle className="font-semibold text-blue-100">
                          Consider This!
                        </AlertTitle>
                        <AlertDescription className="text-blue-200/90">
                          Based on your estimate, the Pay Per Reply plan is more cost-effective.
                        </AlertDescription>
                      </Alert>
                    )}
                </CardContent>
              </Card>

              {preferences.hasAiHumanResourcesFeature && (
                <Alert
                  variant="default"
                  className="border-green-500/50 bg-green-600/20 text-green-200"
                >
                  <CheckCircle className="!text-green-300 h-5 w-5" />
                  <AlertTitle className="font-semibold text-green-100">
                    AI Human Resources is ACTIVE!
                  </AlertTitle>
                  <AlertDescription className="text-green-200/90">
                    You are currently on the $
                    {preferences.aiHumanResourcesTier === 'monthly'
                      ? 'Monthly Subscription'
                      : 'Pay Per Reply Plan'}
                    . You can manage this in Settings.
                    <Link href="/?tab=settings" className="ml-2 underline hover:text-green-100">
                      Go to Settings
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              <p className="pt-4 text-center text-slate-500 text-xs">
                All payment processing is conceptual and would be handled securely by Stripe (not
                actually implemented in this prototype). You can change or cancel your plan anytime
                from your account settings.
              </p>
            </div>
          )}
        </div>
      </main>
      <style jsx global>{`
        .ai-hr-payment-gradient {
          background: linear-gradient(to bottom right, theme('colors.slate.900'), theme('colors.purple.900'), theme('colors.slate.900'));
        }
        .typing-cursor::after {
          content: '|';
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          from, to { color: transparent; }
          50% { color: inherit; } 
        }
      `}</style>
    </div>
  );
}
