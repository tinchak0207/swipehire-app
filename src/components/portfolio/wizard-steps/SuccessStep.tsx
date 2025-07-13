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
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Portfolio Created!</h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Your portfolio has been successfully created and published. You can view it now or
          continue editing later.
        </p>
      </motion.div>

      {portfolioId && (
        <div className="flex flex-col items-center space-y-4">
          <Button asChild variant="default" className="bg-green-500 hover:bg-green-600">
            <Link href={`/portfolio/${portfolioId}`} target="_blank">
              <ExternalLink className="w-5 h-5 mr-2" />
              View Portfolio
            </Link>
          </Button>

          <p className="text-white/60 text-sm text-center">
            Share your portfolio with anyone using this link
          </p>
        </div>
      )}

      {onComplete && (
        <div className="flex justify-center pt-6">
          <Button type="button" onClick={onComplete} className="bg-blue-500 hover:bg-blue-600">
            <Rocket className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>
      )}
    </div>
  );
};

export default SuccessStep;
