'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Star, Trophy } from 'lucide-react';

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
    <div className="text-center space-y-8">
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
            className="absolute -top-4 -right-4 text-white/30"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to showcase your amazing work?
          </h2>
        </div>
        
        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Join thousands of professionals who've built stunning portfolios with our intuitive wizard. 
          No design skills required – just your passion and creativity.
        </p>
      </motion.div>

      {/* Features grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid md:grid-cols-3 gap-6 mt-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-white/70 text-sm">
              {feature.description}
            </p>
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
          className="inline-flex items-center space-x-3 px-12 py-4 bg-white text-gray-900 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
        >
          <span>Let's Get Started</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 group-hover:text-purple-600 transition-colors duration-300" />
          </motion.div>
        </button>
        
        <p className="text-white/50 text-sm mt-4">
          Takes less than 5 minutes • No credit card required
        </p>
      </motion.div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
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