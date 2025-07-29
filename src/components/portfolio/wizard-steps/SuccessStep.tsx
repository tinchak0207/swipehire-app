'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink, Rocket } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/button';

interface SuccessStepProps {
  portfolioId?: string;
  onComplete?: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ portfolioId, onComplete }) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 text-center"
      >
        <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full border border-gray-200/50 bg-white/80 backdrop-blur-sm">
          <CheckCircle className="h-12 w-12 text-green-400" />
        </div>
        <h2 className="mb-2 font-bold text-3xl text-blue-600">Portfolio Created!</h2>
        <p className="mx-auto max-w-2xl text-black/80">
          Your portfolio has been successfully created and published. You can view it now or
          continue editing later.
        </p>
      </motion.div>

      {portfolioId && (
        <div className="flex flex-col items-center space-y-4">
          <Button asChild variant="default" className="bg-green-500 hover:bg-green-600">
            <Link href={`/portfolio/${portfolioId}`} target="_blank">
              <ExternalLink className="mr-2 h-5 w-5" />
              View Portfolio
            </Link>
          </Button>

          <p className="text-center text-sm text-black/60">
            Share your portfolio with anyone using this link
          </p>
        </div>
      )}

      {onComplete && (
        <div className="flex justify-center pt-6">
          <Button type="button" onClick={onComplete} className="bg-blue-500 hover:bg-blue-600">
            <Rocket className="mr-2 h-5 w-5" />
            Get Started
          </Button>
        </div>
      )}
    </div>
  );
};

export default SuccessStep;
