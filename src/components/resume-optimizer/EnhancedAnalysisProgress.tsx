'use client';

import {
  ChartBarIcon,
  CheckBadgeIcon,
  ClockIcon,
  CpuChipIcon,
  DocumentTextIcon,
  EyeIcon,
  LightBulbIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface EnhancedAnalysisProgressProps {
  isAnalyzing: boolean;
  onComplete?: (actualTime: number) => void;
}

interface AgentMessage {
  id: string;
  agent: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  duration: number;
}

interface EmotionalMessage {
  message: string;
  icon: string;
  color: string;
}

const agentMessages: AgentMessage[] = [
  {
    id: '1',
    agent: 'Structure Analyzer',
    message: 'Analyzing resume structure and formatting...',
    icon: <DocumentTextIcon className="h-5 w-5" />,
    color: 'text-blue-600',
    duration: 2500, // Optimized for 20s total analysis
  },
  {
    id: '2',
    agent: 'Keyword Specialist',
    message: 'Extracting and matching keywords with job requirements...',
    icon: <SparklesIcon className="h-5 w-5" />,
    color: 'text-purple-600',
    duration: 3000, // Optimized for 20s total analysis
  },
  {
    id: '3',
    agent: 'ATS Compatibility Expert',
    message: 'Checking ATS compatibility and parsing accuracy...',
    icon: <CpuChipIcon className="h-5 w-5" />,
    color: 'text-green-600',
    duration: 2500, // Optimized for 20s total analysis
  },
  {
    id: '4',
    agent: 'Content Evaluator',
    message: 'Evaluating content quality and impact statements...',
    icon: <EyeIcon className="h-5 w-5" />,
    color: 'text-orange-600',
    duration: 3000, // Optimized for 20s total analysis
  },
  {
    id: '5',
    agent: 'Skills Matcher',
    message: 'Matching your skills with industry requirements...',
    icon: <CheckBadgeIcon className="h-5 w-5" />,
    color: 'text-indigo-600',
    duration: 2500, // Optimized for 20s total analysis
  },
  {
    id: '6',
    agent: 'Optimization Engine',
    message: 'Generating personalized optimization suggestions...',
    icon: <LightBulbIcon className="h-5 w-5" />,
    color: 'text-yellow-600',
    duration: 2500, // Optimized for 20s total analysis
  },
  {
    id: '7',
    agent: 'Performance Analyzer',
    message: 'Calculating performance scores and benchmarks...',
    icon: <ChartBarIcon className="h-5 w-5" />,
    color: 'text-red-600',
    duration: 2000, // Optimized for 20s total analysis
  },
];

const emotionalMessages: EmotionalMessage[] = [
  {
    message: 'Our AI is working hard for you! ☕ Take a sip of coffee and relax',
    icon: '☕',
    color: 'text-amber-600',
  },
  {
    message: 'Great things take time! 🌟 Your perfect resume is being crafted',
    icon: '🌟',
    color: 'text-yellow-600',
  },
  {
    message: 'Almost there! 🚀 Our AI agents are putting finishing touches',
    icon: '🚀',
    color: 'text-blue-600',
  },
  {
    message: 'Quality analysis in progress! 💎 Every detail matters',
    icon: '💎',
    color: 'text-purple-600',
  },
  {
    message: "Your career deserves the best! 💪 We're making it happen",
    icon: '💪',
    color: 'text-green-600',
  },
  {
    message: 'Patience pays off! 🎯 Precision analysis takes time',
    icon: '🎯',
    color: 'text-red-600',
  },
  {
    message: 'Deep learning in action! 🧠 AI is understanding your potential',
    icon: '🧠',
    color: 'text-indigo-600',
  },
];

export function EnhancedAnalysisProgress({
  isAnalyzing,
  onComplete,
}: EnhancedAnalysisProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentAgent, setCurrentAgent] = useState(agentMessages[0]);
  const [currentEmotional, setCurrentEmotional] = useState(emotionalMessages[0]);
  const [agentIndex, setAgentIndex] = useState(0);
  const [emotionalIndex, setEmotionalIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Stopwatch timer with decimal precision
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAnalyzing) {
      setElapsedTime(0);
      setIsVisible(true);
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100); // Update every 100ms for decimal precision
    } else {
      // Call onComplete with the final time BEFORE resetting
      if (elapsedTime > 0 && onComplete) {
        console.log('EnhancedAnalysisProgress: Calling onComplete with time:', elapsedTime);
        onComplete(elapsedTime);
      }
      setIsVisible(false);
      // Reset after a short delay to ensure callback is processed
      setTimeout(() => setElapsedTime(0), 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, onComplete]);

  // Agent message rotation
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isAnalyzing && agentIndex < agentMessages.length) {
      const currentAgentMsg = agentMessages[agentIndex];
      setCurrentAgent(currentAgentMsg);

      timeout = setTimeout(() => {
        setAgentIndex((prev) => (prev + 1) % agentMessages.length);
      }, currentAgentMsg?.duration);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAnalyzing, agentIndex]);

  // Emotional message rotation
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isAnalyzing) {
      timeout = setTimeout(() => {
        setEmotionalIndex((prev) => (prev + 1) % emotionalMessages.length);
        setCurrentEmotional(emotionalMessages[(emotionalIndex + 1) % emotionalMessages.length]);
      }, 8000); // Change every 8 seconds for 20s analysis (better for user engagement)
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAnalyzing, emotionalIndex]);

  // Reset agent states when analysis stops
  useEffect(() => {
    if (!isAnalyzing) {
      setAgentIndex(0);
      setEmotionalIndex(0);
      setCurrentAgent(agentMessages[0]);
      setCurrentEmotional(emotionalMessages[0]);
    }
  }, [isAnalyzing]);

  const formatTime = (seconds: number): string => {
    return `${seconds.toFixed(1)}s`;
  };

  const getProgressPercentage = (): number => {
    // Simulate progress based on elapsed time and agent progress - optimized for 20-second analysis
    const baseProgress = Math.min((elapsedTime / 20) * 85, 85); // 85% max based on 20 seconds
    const agentProgress = (agentIndex / agentMessages.length) * 15; // 15% based on agent completion
    return Math.min(baseProgress + agentProgress, 95); // Cap at 95% until actual completion
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6 animate-in fade-in duration-500">
        {/* Header with Stopwatch */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <ClockIcon className="h-8 w-8 text-blue-600 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
            <div className="text-3xl font-bold text-gray-800 font-mono">
              {formatTime(elapsedTime)}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">AI Analysis in Progress</h2>
          <p className="text-gray-600">
            Our advanced AI agents are analyzing your resume with precision
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Analysis Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${getProgressPercentage()}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Current Agent */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start space-x-4">
            <div className={`${currentAgent?.color} bg-white rounded-lg p-3 shadow-sm`}>
              {currentAgent?.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-800">{currentAgent?.agent}</h3>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
              <p className="text-gray-700">{currentAgent?.message}</p>
            </div>
          </div>
        </div>

        {/* Emotional Support Message */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentEmotional?.icon}</span>
            <p className={`${currentEmotional?.color} font-medium`}>{currentEmotional?.message}</p>
          </div>
        </div>

        {/* Agent Progress Indicators */}
        <div className="grid grid-cols-7 gap-2">
          {agentMessages.map((agent, index) => (
            <div
              key={agent.id}
              className={`h-2 rounded-full transition-all duration-500 ${
                index < agentIndex
                  ? 'bg-green-500'
                  : index === agentIndex
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Motivational Quote */}
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <p className="text-purple-700 italic">
            "Success is where preparation and opportunity meet. We're preparing your opportunity!"
          </p>
        </div>
      </div>
    </div>
  );
}

export default EnhancedAnalysisProgress;
