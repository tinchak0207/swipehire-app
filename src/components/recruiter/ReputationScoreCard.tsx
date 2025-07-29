'use client';

import { CheckCircle, Info, Star, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ReputationScoreCardProps {
  score: number;
  replyRate: number; // Percentage (0-100)
  effectiveReplyRate: number; // Percentage (0-100)
  boostStatus?: 'increased' | 'decreased' | null;
}

export function ReputationScoreCard({
  score,
  replyRate,
  effectiveReplyRate,
  boostStatus,
}: ReputationScoreCardProps) {
  const router = useRouter();

  const handleAIAssistantClick = () => {
    router.push('/ai-hr-assistant');
  };
  const getScoreIntensity = (value: number) => {
    if (value >= 80) return 'text-blue-700 font-bold';
    if (value >= 60) return 'text-gray-700 font-semibold';
    return 'text-gray-500 font-medium';
  };

  const getProgressBarStyle = (value: number) => {
    if (value >= 80) return '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600';
    if (value >= 60) return '[&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-500';
    return '[&>div]:bg-gradient-to-r [&>div]:from-gray-300 [&>div]:to-gray-400';
  };

  const getBoostAlert = () => {
    if (boostStatus === 'increased') {
      return (
        <Alert variant="default" className="mt-3 border-blue-200/50 bg-gradient-to-r from-blue-50/80 to-cyan-50/60 backdrop-blur-sm text-sm">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-semibold text-blue-700 text-xs">
            Push Priority Increased!
          </AlertTitle>
          <AlertDescription className="text-blue-600 text-xs">
            Congratulations! Your high reputation score has boosted your job posting visibility.
          </AlertDescription>
        </Alert>
      );
    }
    if (boostStatus === 'decreased') {
      return (
        <Alert variant="default" className="mt-3 border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-blue-50/30 backdrop-blur-sm text-sm">
          <TrendingDown className="h-4 w-4 text-gray-700" />
          <AlertTitle className="font-semibold text-gray-700 text-xs">Push Priority Decreased</AlertTitle>
          <AlertDescription className="text-gray-600 text-xs">
            Your reputation score has lowered your job posting visibility. Review improvement
            methods.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert variant="default" className="mt-3 border-blue-200/50 bg-gradient-to-r from-blue-50/80 to-cyan-50/60 backdrop-blur-sm text-sm">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="font-semibold text-blue-700 text-xs">Traffic Boost System</AlertTitle>
        <AlertDescription className="text-blue-600 text-xs">
          Your Reputation Score impacts your job posting visibility. A higher score increases
          priority and frequency in search results.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full border-gray-200/50 bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="border-gray-200/50 border-b bg-white/80 backdrop-blur-sm">
        <CardTitle className="flex items-center text-xl text-gray-800">
          <Star className="mr-3 h-6 w-6 fill-blue-100 text-blue-600 transition-colors duration-200" />
          Company Reputation Score
        </CardTitle>
        <CardDescription className="text-gray-600">
          Your score impacts job posting visibility. Higher scores lead to better reach.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
            <p className={cn('font-black text-6xl transition-all duration-300', getScoreIntensity(score))}>{score}</p>
            <p className="mt-2 font-medium text-gray-600 text-sm tracking-wide">out of 100</p>
            
            {/* AI Assistant Button */}
            <div className="mt-4">
              <Button
                onClick={handleAIAssistantClick}
                className={cn(
                  'group relative overflow-hidden rounded-xl px-6 py-3 transition-all duration-200',
                  'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
                  'hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:scale-105',
                  'focus:outline-none focus:ring-2 focus:ring-blue-200',
                  'border border-blue-500/30'
                )}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                  <span className="font-semibold text-sm">Increase in one click</span>
                </div>
                
                {/* Subtle glow effect */}
                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-400/20 to-blue-600/20 blur-xl transition-opacity duration-200 group-hover:opacity-100 opacity-0" />
              </Button>
            </div>
          </div>
        </div>

        {getBoostAlert()}

        <div className="space-y-4 rounded-xl border border-gray-200/50 bg-white/80 p-5 backdrop-blur-sm">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-gray-700">Reply Rate</span>
              <span className={cn('font-bold transition-colors duration-200', getScoreIntensity(replyRate))}>{replyRate}%</span>
            </div>
            <div className="rounded-full bg-gray-100 p-0.5">
              <Progress
                value={replyRate}
                className={cn("h-3 rounded-full", getProgressBarStyle(replyRate))}
              />
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-gray-700">Effective Reply Rate</span>
              <span className={cn('font-bold transition-colors duration-200', getScoreIntensity(effectiveReplyRate))}>
                {effectiveReplyRate}%
              </span>
            </div>
            <div className="rounded-full bg-gray-100 p-0.5">
              <Progress
                value={effectiveReplyRate}
                className={cn("h-3 rounded-full", getProgressBarStyle(effectiveReplyRate))}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-5 backdrop-blur-sm">
          <h4 className="mb-3 font-bold text-gray-800 text-base">
            Methods to Improve Reputation Score:
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-gray-700 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>Respond to candidate inquiries promptly.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>Provide relevant and helpful replies.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>Keep your job postings accurate and up-to-date.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>Engage respectfully with all candidates.</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
