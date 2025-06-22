'use client';

import { CheckCircle, Info, Star, TrendingDown, TrendingUp } from 'lucide-react'; // Added BarChart3
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBoostAlert = () => {
    if (boostStatus === 'increased') {
      return (
        <Alert variant="default" className="mt-3 border-green-500/30 bg-green-500/5 text-sm">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertTitle className="font-medium text-green-700 text-xs">
            Push Priority Increased!
          </AlertTitle>
          <AlertDescription className="text-green-600/80 text-xs">
            Congratulations! Your high reputation score has boosted your job posting visibility.
          </AlertDescription>
        </Alert>
      );
    }
    if (boostStatus === 'decreased') {
      return (
        <Alert variant="destructive" className="mt-3 text-sm">
          <TrendingDown className="h-4 w-4" />
          <AlertTitle className="font-medium text-xs">Push Priority Decreased</AlertTitle>
          <AlertDescription className="text-xs">
            Your reputation score has lowered your job posting visibility. Review improvement
            methods.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert variant="default" className="mt-3 border-blue-500/30 bg-blue-500/5 text-sm">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="font-medium text-blue-700 text-xs">Traffic Boost System</AlertTitle>
        <AlertDescription className="text-blue-600/80 text-xs">
          Your Reputation Score impacts your job posting visibility. A higher score increases
          priority and frequency in search results.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Star className="mr-2 h-5 w-5 fill-yellow-400 text-yellow-400" />
          Company Reputation Score
        </CardTitle>
        <CardDescription>
          Your score impacts job posting visibility. Higher scores lead to better reach.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className={cn('font-bold text-5xl', getScoreColor(score))}>{score}</p>
          <p className="text-muted-foreground text-xs">out of 100</p>
        </div>

        {getBoostAlert()}

        <div className="space-y-3 pt-2">
          <div>
            <div className="mb-0.5 flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Reply Rate</span>
              <span className={cn('font-semibold', getScoreColor(replyRate))}>{replyRate}%</span>
            </div>
            <Progress
              value={replyRate}
              className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-600"
            />
          </div>
          <div>
            <div className="mb-0.5 flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Effective Reply Rate</span>
              <span className={cn('font-semibold', getScoreColor(effectiveReplyRate))}>
                {effectiveReplyRate}%
              </span>
            </div>
            <Progress
              value={effectiveReplyRate}
              className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-sky-400 [&>div]:to-sky-600"
            />
          </div>
        </div>

        <div className="pt-3">
          <h4 className="mb-1.5 font-semibold text-foreground text-sm">
            Methods to Improve Reputation Score:
          </h4>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground text-xs">
            <li>
              <CheckCircle className="mr-1 inline h-3.5 w-3.5 text-green-500" /> Respond to
              candidate inquiries promptly.
            </li>
            <li>
              <CheckCircle className="mr-1 inline h-3.5 w-3.5 text-green-500" /> Provide relevant
              and helpful replies.
            </li>
            <li>
              <CheckCircle className="mr-1 inline h-3.5 w-3.5 text-green-500" /> Keep your job
              postings accurate and up-to-date.
            </li>
            <li>
              <CheckCircle className="mr-1 inline h-3.5 w-3.5 text-green-500" /> Engage respectfully
              with all candidates.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
