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

// --- Helper Components ---

function PageLoader() {
  return (
    <div className="ai-hr-payment-gradient flex min-h-screen flex-col items-center justify-center text-white">
      <Loader2 className="h-12 w-12 animate-spin" />
    </div>
  );
}

function SessionLoader() {
  const router = useRouter();
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

function CompanyStyleCard({
  isLoading,
  typedStyle,
  isTyping,
  suggestedGuidelines,
}: {
  isLoading: boolean;
  typedStyle: string;
  isTyping: boolean;
  suggestedGuidelines: string[];
}) {
  return (
    <Card className="border-purple-700/50 bg-slate-800/70 shadow-2xl backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-purple-300">
          <Sparkles className="mr-2 h-6 w-6" /> Your Company's AI Communication Style
        </CardTitle>
        <CardDescription className="text-slate-400">
          Our AI has analyzed your company details to suggest an optimal communication style for
          automated replies:
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading ? (
          <div className="flex items-center justify-center text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating your company's
            communication style...
          </div>
        ) : (
          <p className="whitespace-pre-line text-lg text-slate-200 leading-relaxed">
            {typedStyle}
            {isTyping && <span className="typing-cursor" />}
          </p>
        )}
        {suggestedGuidelines.length > 0 && !isLoading && (
          <div className="mt-4 border-slate-700 border-t pt-3">
            <h4 className="mb-1.5 font-semibold text-purple-400">Suggested AI Reply Guidelines:</h4>
            <ul className="list-inside list-disc space-y-1 text-slate-300 text-sm">
              {suggestedGuidelines.map((guideline) => (
                <li key={guideline}>{guideline}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlanCard({
  planType,
  title,
  description,
  price,
  pricePeriod,
  features,
  isSelected,
  isRecommended,
  isDisabled,
  isSubmitting,
  onClick,
}: {
  planType: 'per_reply' | 'monthly';
  title: string;
  description: string;
  price: number;
  pricePeriod: string;
  features: string[];
  isSelected: boolean;
  isRecommended: boolean | null;
  isDisabled: boolean;
  isSubmitting: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        'flex flex-col border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition-all duration-300',
        isRecommended === false && 'opacity-50 grayscale',
        isRecommended === true && 'scale-105 shadow-purple-500/30 ring-2 ring-purple-500',
        !isRecommended && 'hover:shadow-purple-500/20'
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center text-purple-300 text-xl">
          {planType === 'per_reply' ? (
            <DollarSign className="mr-2 h-5 w-5" />
          ) : (
            <CalendarDays className="mr-2 h-5 w-5" />
          )}
          {title}
        </CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-bold text-4xl text-white">${price.toFixed(2)}</p>
        <p className="text-slate-500">{pricePeriod}</p>
        <ul className="mt-4 space-y-1 text-slate-300 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-400" /> {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onClick}
          className="w-full transform bg-purple-600 py-3 text-md text-white transition-transform duration-200 hover:scale-105 hover:bg-purple-500"
          disabled={isDisabled || isSelected}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {isSelected ? 'Current Plan' : `Choose ${title}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

function CostCalculatorCard({
  onCalculate,
  calculatedCost,
  savingsPercentage,
  recommendedPlan,
}: {
  onCalculate: (replies: number) => void;
  calculatedCost: number | null;
  savingsPercentage: number | null;
  recommendedPlan: 'per_reply' | 'monthly' | null;
}) {
  const [estimatedReplies, setEstimatedReplies] = useState<number | string>('');
  const { toast } = useToast();

  const handleCalculate = () => {
    const replies = Number(estimatedReplies);
    if (Number.isNaN(replies) || replies <= 0) {
      toast({ title: 'Invalid Input', description: 'Please enter a valid number of replies.' });
      return;
    }
    onCalculate(replies);
  };

  return (
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
          <Label htmlFor="estimatedReplies" className="font-medium text-slate-300 text-sm">
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
          onClick={handleCalculate}
          className="w-full transform bg-pink-500 text-white transition-transform duration-200 hover:scale-105 hover:bg-pink-600 sm:w-auto"
        >
          Calculate Cost
        </Button>
        {calculatedCost !== null && (
          <p className="pt-2 text-slate-400 text-sm">
            Pay Per Reply Total: ${calculatedCost.toFixed(2)}. Monthly Plan: ${' '}
            {monthlyCost.toFixed(2)}.
          </p>
        )}
        {savingsPercentage !== null && recommendedPlan === 'monthly' && (
          <Alert variant="default" className="border-green-500/50 bg-green-600/20 text-green-200">
            <Sparkles className="!text-green-300 h-5 w-5" />
            <AlertTitle className="font-semibold text-green-100">Smart Choice!</AlertTitle>
            <AlertDescription className="text-green-200/90">
              The Monthly Plan saves you {savingsPercentage}% based on your estimate!
            </AlertDescription>
          </Alert>
        )}
        {calculatedCost !== null && recommendedPlan === 'per_reply' && !savingsPercentage && (
          <Alert variant="default" className="border-blue-500/50 bg-blue-600/20 text-blue-200">
            <Info className="!text-blue-300 h-5 w-5" />
            <AlertTitle className="font-semibold text-blue-100">Consider This!</AlertTitle>
            <AlertDescription className="text-blue-200/90">
              Based on your estimate, the Pay Per Reply plan is more cost-effective.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// --- Custom Hooks ---

function useCompanyStyle() {
  const { fullBackendUser, preferences, mongoDbUserId } = useUserPreferences();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [guidelines, setGuidelines] = useState<string[]>([]);
  const [typedStyle, setTypedStyle] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isAuthenticated = !!auth.currentUser && !!mongoDbUserId;

  useEffect(() => {
    const fetchCompanyStyle = async () => {
      if (preferences.isLoading) return;

      if (!isAuthenticated || !fullBackendUser?.companyName) {
        setIsLoading(false);
        setAnalysis(
          !isAuthenticated
            ? 'Please log in to generate an AI communication style.'
            : 'Please complete your recruiter profile (including company name) to generate an AI style.'
        );
        return;
      }

      setIsLoading(true);
      try {
        const input: GenerateCompanyReplyStyleInput = {
          companyName: fullBackendUser.companyName,
          companyIndustry: fullBackendUser.companyIndustry || 'General Business',
          companyDescription: fullBackendUser.companyDescription || 'A dynamic company.',
          companyCultureHighlights: fullBackendUser.companyCultureHighlights || ['innovative'],
          currentNeeds: fullBackendUser.companyNeeds || 'Seeking talented individuals.',
        };
        const result = await generateCompanyReplyStyle(input);
        setAnalysis(result.styleAnalysis);
        setGuidelines(result.suggestedGuidelines);
      } catch (error) {
        console.error('Error fetching company reply style:', error);
        setAnalysis('Could not generate company reply style.');
        toast({ title: 'AI Style Generation Failed', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyStyle();
  }, [fullBackendUser, toast, isAuthenticated, preferences.isLoading]);

  useEffect(() => {
    if (analysis) {
      setIsTyping(true);
      setTypedStyle('');
      let i = 0;
      const timer = setInterval(() => {
        setTypedStyle((prev) => prev + analysis.charAt(i));
        i++;
        if (i >= analysis.length) {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, 50);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [analysis]);

  return { isLoading, typedStyle, isTyping, guidelines, isReady: !isLoading && !!analysis };
}

// --- Main Page Component ---

export default function AiHrPaymentPage() {
  const { fullBackendUser, preferences, setPreferences, mongoDbUserId } = useUserPreferences();
  const { toast } = useToast();
  const router = useRouter();

  const { isLoading, typedStyle, isTyping, guidelines, isReady } = useCompanyStyle();

  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [savings, setSavings] = useState<number | null>(null);
  const [recommendedPlan, setRecommendedPlan] = useState<'per_reply' | 'monthly' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(preferences.aiHumanResourcesTier || 'none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = !!auth.currentUser && !!mongoDbUserId;
  const userName = fullBackendUser?.name || auth.currentUser?.displayName || null;
  let userPhotoURL = auth.currentUser?.photoURL || null;
  if (fullBackendUser?.profileAvatarUrl) {
    if (fullBackendUser.profileAvatarUrl.startsWith('/uploads/')) {
      const CUSTOM_BACKEND_URL =
        process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';
      userPhotoURL = `${CUSTOM_BACKEND_URL}${fullBackendUser.profileAvatarUrl}`;
    } else {
      userPhotoURL = fullBackendUser.profileAvatarUrl;
    }
  }

  if (preferences.isLoading && !auth.currentUser && !mongoDbUserId) {
    return <PageLoader />;
  }

  if (auth.currentUser && (preferences.isLoading || !mongoDbUserId || !fullBackendUser)) {
    return <SessionLoader />;
  }

  const handleCalculate = (replies: number) => {
    const cost = replies * perReplyCost;
    setCalculatedCost(cost);
    if (cost > monthlyCost) {
      setSavings(Number.parseFloat((((cost - monthlyCost) / cost) * 100).toFixed(1)));
      setRecommendedPlan('monthly');
    } else {
      setSavings(null);
      setRecommendedPlan('per_reply');
    }
  };

  const handlePayment = async (plan: 'per_reply' | 'monthly') => {
    setIsSubmitting(true);
    setSelectedPlan(plan);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      await setPreferences({ hasAiHumanResourcesFeature: true, aiHumanResourcesTier: plan });
      toast({
        title: 'AI Human Resources Activated!',
        description: `You've selected the ${plan === 'monthly' ? 'Monthly' : 'Pay Per Reply'} plan.`,
      });
    } catch (_error) {
      toast({ title: 'Payment Failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        isAuthenticated={isAuthenticated}
        isGuestMode={!isAuthenticated}
        onLoginRequest={() => router.push('/')}
        onLogout={async () => {
          await signOut(auth);
          router.push('/');
        }}
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

          <CompanyStyleCard
            isLoading={isLoading}
            typedStyle={typedStyle}
            isTyping={isTyping}
            suggestedGuidelines={guidelines}
          />

          {isReady && (
            <div className="animate-fadeInPage space-y-10">
              <div className="text-center">
                <h2 className="font-bold text-3xl text-slate-100">Choose Your Plan</h2>
                <p className="mt-1 text-slate-400">
                  Select a plan that best suits your hiring volume.
                </p>
              </div>

              <div className="grid items-stretch gap-6 md:grid-cols-2">
                <PlanCard
                  planType="per_reply"
                  title="Pay Per Reply"
                  description="Ideal for occasional hiring or lower reply volumes."
                  price={perReplyCost}
                  pricePeriod="per AI-assisted reply"
                  features={['Pay only for what you use', 'Full AI customization']}
                  isSelected={selectedPlan === 'per_reply'}
                  isRecommended={recommendedPlan === 'per_reply'}
                  isDisabled={!isAuthenticated}
                  isSubmitting={isSubmitting && selectedPlan === 'per_reply'}
                  onClick={() => handlePayment('per_reply')}
                />
                <PlanCard
                  planType="monthly"
                  title="Monthly Subscription"
                  description="Best value for active hiring and frequent use."
                  price={monthlyCost}
                  pricePeriod="per month"
                  features={['Unlimited AI-assisted replies', 'Priority AI processing']}
                  isSelected={selectedPlan === 'monthly'}
                  isRecommended={recommendedPlan === 'monthly'}
                  isDisabled={!isAuthenticated}
                  isSubmitting={isSubmitting && selectedPlan === 'monthly'}
                  onClick={() => handlePayment('monthly')}
                />
              </div>

              <CostCalculatorCard
                onCalculate={handleCalculate}
                calculatedCost={calculatedCost}
                savingsPercentage={savings}
                recommendedPlan={recommendedPlan}
              />

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
                    You are on the {preferences.aiHumanResourcesTier} plan.
                    <Link href="/?tab=settings" className="ml-2 underline hover:text-green-100">
                      Go to Settings
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              <p className="pt-4 text-center text-slate-500 text-xs">
                All payment processing is conceptual and would be handled securely by Stripe.
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
