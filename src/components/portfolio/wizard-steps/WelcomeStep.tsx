'use client';

import { motion } from 'framer-motion';
import { Sparkles, Star, Trophy, Zap } from 'lucide-react';
import type React from 'react';

interface WelcomeStepProps {
  onNext: () => void;
}

/**
 * Welcome Step Component
 *
 * Introduces users to the portfolio creation process with:
 * - Animated feature highlights
 * - Engaging visual elements
 * - Clear value proposition
 * - Smooth entrance animations
 */
const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Create your portfolio in under 5 minutes',
    },
    {
      icon: Star,
      title: 'Professional Design',
      description: 'Beautiful themes crafted by designers',
    },
    {
      icon: Trophy,
      title: 'Stand Out',
      description: 'Impress employers and clients',
    },
  ];

  return (
    <div className="space-y-8 text-center">
      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="-top-4 -right-4 absolute text-blue-400/50"
          >
            <Sparkles className="h-8 w-8" />
          </motion.div>
          <h2 className="mb-4 font-bold text-3xl text-blue-600 md:text-4xl">
            Ready to showcase your amazing work?
          </h2>
        </div>

        <p className="mx-auto max-w-2xl text-black text-xl leading-relaxed">
          Join thousands of professionals who've built stunning portfolios with our intuitive
          wizard. No design skills required – just your passion and creativity.
        </p>
      </motion.div>

      {/* Features grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 grid gap-6 md:grid-cols-3"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            className="group rounded-2xl border border-gray-200/50 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition-transform duration-300 group-hover:scale-110">
              <feature.icon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 font-semibold text-lg text-blue-600">{feature.title}</h3>
            <p className="text-sm text-black">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="pt-8"
      >
        <button
          onClick={onNext}
          className="group inline-flex items-center space-x-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-12 py-4 font-bold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-blue-600 hover:to-blue-700"
        >
          <span>Let's Get Started</span>
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Sparkles className="h-5 w-5 transition-colors duration-300" />
          </motion.div>
        </button>

        <p className="mt-4 text-sm text-black">
          Takes less than 5 minutes • No credit card required
        </p>
      </motion.div>

      {/* Floating elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-blue-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WelcomeStep;
