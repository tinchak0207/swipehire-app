'use client';

import AOS from 'aos';
import 'aos/dist/aos.css';
import { signOut } from 'firebase/auth';
import { ArrowRight, Bot, Clock, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { auth } from '../../lib/firebase';

// --- Helper Components ---

function PageLoader() {
  return (
    <div className="ai-hr-deep-purple-gradient flex min-h-screen flex-col items-center justify-center text-white">
      <Loader2 className="h-12 w-12 animate-spin" />
    </div>
  );
}

function SessionLoader() {
  const router = useRouter();
  return (
    <div className="ai-hr-deep-purple-gradient flex min-h-screen flex-col text-white">
      <AppHeader
        isAuthenticated={false}
        isGuestMode={true}
        onLoginRequest={() => router.push('/')}
        onLogout={() => {
          /* No-op */
        }}
        searchTerm=""
        onSearchTermChange={() => {}}
        userName={null}
        userPhotoURL={null}
      />
      <main className="flex flex-grow flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="mt-4 text-slate-300">Loading your AI HR Assistant session...</p>
      </main>
    </div>
  );
}

function HeroContent() {
  return (
    <div className="relative z-10 space-y-6 md:space-y-8" data-aos="fade-right">
      <div className="mb-4 inline-flex items-center rounded-full bg-purple-600 px-4 py-1.5 font-medium text-sm text-white shadow-md">
        <Bot className="mr-2 h-5 w-5" />
        AI HR Assistant
      </div>
      <h1 className="font-extrabold font-heading text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl">
        AI-Powered Bulk Replies
      </h1>
      <p className="text-base text-slate-300 leading-relaxed sm:text-lg md:text-xl">
        Let AI simultaneously reply to a massive volume of candidate resumes. It can incorporate
        screening tags and past communication records, ensuring each reply is accurate and
        personalized.
      </p>
      <ul className="space-y-3 text-left text-md text-slate-200">
        <li className="flex items-start">
          <Sparkles className="mt-1 mr-3 h-6 w-6 shrink-0 text-yellow-400" />
          <span>
            <span className="font-semibold">Intelligent Personalization:</span> Tailors replies
            based on candidate profiles and job requirements.
          </span>
        </li>
        <li className="flex items-start">
          <Clock className="mt-1 mr-3 h-6 w-6 shrink-0 text-blue-400" />
          <span>
            <span className="font-semibold">Time Saving:</span> Drastically reduces manual reply
            efforts for recruiters.
          </span>
        </li>
        <li className="flex items-start">
          <MessageSquare className="mt-1 mr-3 h-6 w-6 shrink-0 text-green-400" />
          <span>
            <span className="font-semibold">Guaranteed Reply Within 72 Hours:</span> Helps maintain
            high company reputation scores.
          </span>
        </li>
      </ul>
      <Link href="/ai-hr-payment" passHref className="mt-8 block">
        <Button
          size="lg"
          className="subtle-button-hover w-full transform bg-gradient-to-r from-pink-500 to-orange-400 px-10 py-3 font-semibold text-lg text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-orange-500 hover:shadow-xl sm:w-auto"
        >
          Try Now <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}

function ChatAnimationCard({
  typedApplicantMessage,
  isTypingApplicant,
  showAiAnalyzing,
  typedAiReply,
  isTypingAiReply,
}: {
  typedApplicantMessage: string;
  isTypingApplicant: boolean;
  showAiAnalyzing: boolean;
  typedAiReply: string;
  isTypingAiReply: boolean;
}) {
  return (
    <div className="space-y-6" data-aos="fade-left" data-aos-delay="200">
      <Card className="border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="mb-4 flex items-center gap-3">
              <Bot className="h-5 w-5 animate-spin text-purple-400" />
              <span className="font-medium text-white">AI Assistant working...</span>
            </div>
            <div className="min-h-[180px] space-y-3">
              {typedApplicantMessage && (
                <div className="ml-8 animate-fadeInPage rounded-lg bg-white/20 p-3 shadow-md">
                  <p className="text-sm text-white">
                    {typedApplicantMessage}
                    {isTypingApplicant && <span className="typing-cursor" />}
                  </p>
                  <span className="text-purple-200 text-xs">Applicant - Just now</span>
                </div>
              )}
              {showAiAnalyzing && (
                <div className="my-2 flex animate-fadeInPage items-center gap-2 text-purple-300">
                  <Bot className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is analyzing and generating a reply...</span>
                </div>
              )}
              {typedAiReply && (
                <div className="mr-8 animate-fadeInPage rounded-lg border border-purple-400/40 bg-gradient-to-r from-purple-500/30 to-pink-500/30 p-3 shadow-md">
                  <p className="text-sm text-white">
                    {typedAiReply}
                    {isTypingAiReply && <span className="typing-cursor" />}
                  </p>
                  <span className="text-pink-200 text-xs">AI Assistant - Just now</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-white/20 bg-white/10 p-4 text-center shadow-xl backdrop-blur-md">
          <div className="font-bold text-2xl text-white">98%</div>
          <div className="text-purple-200 text-sm">Reply Accuracy</div>
        </Card>
        <Card className="border-white/20 bg-white/10 p-4 text-center shadow-xl backdrop-blur-md">
          <div className="font-bold text-2xl text-white">2s</div>
          <div className="text-purple-200 text-sm">Avg. Gen. Time</div>
        </Card>
        <Card className="border-white/20 bg-white/10 p-4 text-center shadow-xl backdrop-blur-md">
          <div className="font-bold text-2xl text-white">{'<24h'}</div>
          <div className="text-purple-200 text-sm">Guaranteed Reply</div>
        </Card>
      </div>
    </div>
  );
}

// --- Custom Hook for Animation ---

function useChatAnimation(fullApplicantMessage: string, fullAiReply: string) {
  const [typedApplicantMessage, setTypedApplicantMessage] = useState('');
  const [isTypingApplicant, setIsTypingApplicant] = useState(false);
  const [showAiAnalyzing, setShowAiAnalyzing] = useState(false);
  const [typedAiReply, setTypedAiReply] = useState('');
  const [isTypingAiReply, setIsTypingAiReply] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const typeMessage = useCallback(
    async (
      message: string,
      setTextState: Dispatch<SetStateAction<string>>,
      setIsTypingState: Dispatch<SetStateAction<boolean>>,
      speed = 30
    ): Promise<void> => {
      return new Promise((resolve) => {
        setIsTypingState(true);
        setTextState('');
        let index = 0;

        const typeNextChar = () => {
          if (index < message.length) {
            setTextState((prev) => prev + message.charAt(index));
            index++;
            setTimeout(typeNextChar, speed);
          } else {
            setIsTypingState(false);
            resolve();
          }
        };

        typeNextChar();
      });
    },
    []
  );

  const resetAnimation = useCallback(() => {
    setTypedApplicantMessage('');
    setIsTypingApplicant(false);
    setShowAiAnalyzing(false);
    setTypedAiReply('');
    setIsTypingAiReply(false);
    setAnimationStarted(false);
  }, []);

  const startAnimation = useCallback(async () => {
    if (animationStarted) return;

    setAnimationStarted(true);
    resetAnimation();

    try {
      // Wait for initial render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Type applicant message
      await typeMessage(fullApplicantMessage, setTypedApplicantMessage, setIsTypingApplicant);

      // Show AI analyzing
      await new Promise((resolve) => setTimeout(resolve, 700));
      setShowAiAnalyzing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowAiAnalyzing(false);

      // Type AI reply
      await typeMessage(fullAiReply, setTypedAiReply, setIsTypingAiReply);
    } catch (error) {
      console.error('Animation error:', error);
      // Fallback - show final state immediately
      setTypedApplicantMessage(fullApplicantMessage);
      setTypedAiReply(fullAiReply);
      setIsTypingApplicant(false);
      setIsTypingAiReply(false);
      setShowAiAnalyzing(false);
    }
  }, [animationStarted, typeMessage, fullApplicantMessage, fullAiReply, resetAnimation]);

  useEffect(() => {
    // Initialize AOS
    AOS.init({ duration: 800, once: true, offset: 50 });

    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    // Start animation after component mount
    animationRef.current = setTimeout(() => {
      startAnimation();
    }, 1000);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [startAnimation]);

  return {
    typedApplicantMessage,
    isTypingApplicant,
    showAiAnalyzing,
    typedAiReply,
    isTypingAiReply,
    resetAnimation,
  };
}

// --- Main Page Component ---

export default function AiHrAssistantPage() {
  const { fullBackendUser, mongoDbUserId, preferences } = useUserPreferences();
  const router = useRouter();

  const fullApplicantMessage =
    ".Hello, I'm interested in the Frontend Developer position. I have 3 years of experience in React and TypeScript. When would be a good time to discuss this opportunity?";
  const fullAiReply =
    ".Hello! Thank you for your interest in our Frontend Developer position. Your React and TypeScript experience looks great for this role. We'd love to schedule an interview with you. Are you available next Tuesday or Wednesday afternoon?";

  const animationState = useChatAnimation(fullApplicantMessage, fullAiReply);

  if (preferences.isLoading && !fullBackendUser && !mongoDbUserId) {
    return <PageLoader />;
  }

  if (fullBackendUser && (preferences.isLoading || !mongoDbUserId || !fullBackendUser)) {
    return <SessionLoader />;
  }

  const isAuthenticated = !!fullBackendUser && !!mongoDbUserId;
  const userName = fullBackendUser?.name || null;
  let userPhotoURL: string | null = null;
  if (fullBackendUser?.profileAvatarUrl) {
    if (fullBackendUser.profileAvatarUrl.startsWith('/uploads/')) {
      const CUSTOM_BACKEND_URL =
        process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';
      userPhotoURL = `${CUSTOM_BACKEND_URL}${fullBackendUser.profileAvatarUrl}`;
    } else {
      userPhotoURL = fullBackendUser.profileAvatarUrl;
    }
  }
  const isGuestMode = !fullBackendUser && !mongoDbUserId;

  const handleLoginRequest = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

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
      <main className="ai-hr-deep-purple-gradient flex flex-grow animate-fadeInPage flex-col items-center justify-center overflow-hidden p-4 pt-20 text-white sm:p-8 md:pt-24">
        <div className="container mx-auto max-w-6xl text-center lg:text-left">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <HeroContent />
            <ChatAnimationCard {...animationState} />
          </div>
        </div>
      </main>
      <style jsx global>{`
        .typing-cursor::after {
          content: '|';
          animation: blink 0.7s infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
