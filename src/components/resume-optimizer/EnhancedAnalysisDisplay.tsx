'use client';

import { useEffect, useState } from 'react';

interface EnhancedAnalysisDisplayProps {
  isLoading: boolean;
  progress: number;
  message: string;
}

const agentMessages = [
  'AI Agent initializing analysis pipeline...',
  'Structure Analyzer examining resume format...',
  'Keyword Specialist extracting relevant terms...',
  'ATS Compatibility Expert checking parsing accuracy...',
  'Content Evaluator analyzing impact statements...',
  'Skills Matcher comparing with job requirements...',
  'Performance Analyzer calculating scores...',
  'Optimization Engine generating suggestions...',
  'Quality Assurance Agent finalizing results...',
];

const emotionalMessages = [
  { text: 'Our AI is working hard for you! ☕ Take a sip of coffee and relax', emoji: '☕' },
  { text: 'Great things take time! 🌟 Your perfect resume is being crafted', emoji: '🌟' },
  { text: 'Quality analysis in progress! 💎 Every detail matters', emoji: '💎' },
  { text: "Your career deserves the best! 💪 We're making it happen", emoji: '💪' },
  { text: 'Patience pays off! 🎯 Precision analysis takes time', emoji: '🎯' },
  { text: 'Deep learning in action! 🧠 AI is understanding your potential', emoji: '🧠' },
];

export function EnhancedAnalysisDisplay({ isLoading, progress }: EnhancedAnalysisDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentAgentMessage, setCurrentAgentMessage] = useState(agentMessages[0]);
  const [currentEmotional, setCurrentEmotional] = useState(emotionalMessages[0]);
  const [agentIndex, setAgentIndex] = useState(0);
  const [emotionalIndex, setEmotionalIndex] = useState(0);

  // Stopwatch timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Agent message rotation
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      timeout = setTimeout(
        () => {
          const nextIndex = (agentIndex + 1) % agentMessages.length;
          setAgentIndex(nextIndex);
          setCurrentAgentMessage(agentMessages[nextIndex]);
        },
        8000 + Math.random() * 4000
      ); // 8-12 seconds
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, agentIndex]);

  // Emotional message rotation
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      timeout = setTimeout(() => {
        const nextIndex = (emotionalIndex + 1) % emotionalMessages.length;
        setEmotionalIndex(nextIndex);
        setCurrentEmotional(emotionalMessages[nextIndex]);
      }, 15000); // 15 seconds
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, emotionalIndex]);

  // Reset when analysis stops
  useEffect(() => {
    if (!isLoading) {
      setAgentIndex(0);
      setEmotionalIndex(0);
      setCurrentAgentMessage(agentMessages[0]);
      setCurrentEmotional(emotionalMessages[0]);
    }
  }, [isLoading]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLoading) return null;

  return (
    <div className="mt-4 space-y-4">
      {/* Stopwatch Timer */}
      <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="relative">
          <svg
            className="h-6 w-6 text-blue-600 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
        </div>
        <div className="text-xl font-bold text-gray-800 font-mono">{formatTime(elapsedTime)}</div>
        <span className="text-sm text-gray-600">elapsed</span>
      </div>

      {/* AI Agent Message */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
        <div className="flex items-start space-x-3">
          <div className="text-indigo-600 bg-white rounded-lg p-2 shadow-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-gray-800 text-sm">AI Agent</h4>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
            <p className="text-gray-700 text-sm">{currentAgentMessage}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Analysis Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Emotional Support */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentEmotional?.emoji}</span>
          <p className="text-amber-700 font-medium text-sm">{currentEmotional?.text}</p>
        </div>
      </div>

      {/* Fun Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Processing {Math.floor(elapsedTime * 1.7 + 150)} data points/sec</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>{Math.floor(elapsedTime * 0.3 + 7)} AI models active</span>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
        <p className="text-purple-700 italic text-sm">
          "Success is where preparation and opportunity meet. We're preparing your opportunity!"
        </p>
      </div>
    </div>
  );
}

export default EnhancedAnalysisDisplay;
