'use client';

import AOS from 'aos';
import { signOut } from 'firebase/auth';
import { ArrowRight, Bot, Clock, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react'; // Added useState
import { useEffect, useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { auth } from '../../lib/firebase';
import 'aos/dist/aos.css';

export default function AiHrAssistantPage() {
  const { fullBackendUser, mongoDbUserId, preferences } = useUserPreferences();
  const currentUser = fullBackendUser; // Use fullBackendUser as currentUser
  const router = useRouter();

  // State for chat animation
  const [typedApplicantMessage, setTypedApplicantMessage] = useState('');
  const [isTypingApplicant, setIsTypingApplicant] = useState(false);
  const [showAiAnalyzing, setShowAiAnalyzing] = useState(false);
  const [typedAiReply, setTypedAiReply] = useState('');
  const [isTypingAiReply, setIsTypingAiReply] = useState(false);

  const fullApplicantMessage = "Hello, I'm interested in the Frontend Developer position...";
  const fullAiReply =
    "Hello Applicant! Thank you for your interest. Based on your skills, we think you're a good fit. Would you be available for an interview next Tuesday or Wednesday?";

  const typeMessage = async (
    message: string,
    setTextState: React.Dispatch<React.SetStateAction<string>>,
    setIsTypingState: React.Dispatch<React.SetStateAction<boolean>>,
    speed = 30 // Adjusted speed
  ) => {
    setIsTypingState(true);
    setTextState('');
    for (let i = 0; i < message.length; i++) {
      setTextState((prev) => prev + message.charAt(i));
      await new Promise((resolve) => setTimeout(resolve, speed));
    }
    setIsTypingState(false);
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });

    // Chat animation logic
    const animateChat = async () => {
      // Reset states for potential re-trigger (though AOS once:true should prevent it for the card itself)
      setTypedApplicantMessage('');
      setIsTypingApplicant(false);
      setShowAiAnalyzing(false);
      setTypedAiReply('');
      setIsTypingAiReply(false);

      // Wait a brief moment for AOS card animation to settle if desired
      await new Promise((resolve) => setTimeout(resolve, 300));

      await typeMessage(fullApplicantMessage, setTypedApplicantMessage, setIsTypingApplicant);
      await new Promise((resolve) => setTimeout(resolve, 700)); // Pause after applicant message

      setShowAiAnalyzing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // AI "thinking" time

      setShowAiAnalyzing(false); // Hide "analyzing" right before AI types
      await typeMessage(fullAiReply, setTypedAiReply, setIsTypingAiReply);
    };

    // This logic ensures animation runs after AOS initialization and card is likely visible.
    // A more robust way would use IntersectionObserver on the card itself.
    // For now, relying on AOS reveal and a slight delay.
    const cardElement = document.querySelector('[data-aos="fade-left"]');
    if (cardElement) {
      // Simple check if AOS might have made it visible, then animate.
      // This is a basic way to sequence after AOS.
      setTimeout(
        () => {
          if (typeof window !== 'undefined' && (cardElement as HTMLElement).dataset['aosId']) {
            // Check if AOS processed it
            animateChat();
          }
        },
        Number.parseFloat((cardElement as HTMLElement).dataset['aosDelay'] || '0') + 200
      ); // Delay by AOS delay + buffer
    } else {
      // Fallback if AOS selector fails, run after a fixed delay
      setTimeout(() => {
        if (typeof window !== 'undefined') animateChat();
      }, 500);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeMessage]); // Empty dependency array: runs once on mount after initial render.

  if (preferences.isLoading && !currentUser && !mongoDbUserId) {
    return (
      <div className="ai-hr-deep-purple-gradient flex min-h-screen flex-col items-center justify-center text-white">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (currentUser && (preferences.isLoading || !mongoDbUserId || !fullBackendUser)) {
    return (
      <div className="ai-hr-deep-purple-gradient flex min-h-screen flex-col text-white">
        <AppHeader
          isAuthenticated={false}
          isGuestMode={true}
          onLoginRequest={() => router.push('/')}
          onLogout={() => {
            /* No-op or actual logout if needed */
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

  const isAuthenticated = !!currentUser && !!mongoDbUserId;
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
  const isGuestMode = !currentUser && !mongoDbUserId;

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
            <div className="relative z-10 space-y-6 md:space-y-8" data-aos="fade-right">
              <div className="mb-4 inline-flex items-center rounded-full bg-purple-600 px-4 py-1.5 font-medium text-sm text-white shadow-md">
                <Bot className="mr-2 h-5 w-5" />
                AI HR Assistant
              </div>
              <h1 className="font-extrabold font-heading text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl">
                AI-Powered Bulk Replies
              </h1>
              <p className="text-base text-slate-300 leading-relaxed sm:text-lg md:text-xl">
                Let AI simultaneously reply to a massive volume of candidate resumes. It can
                incorporate screening tags and past communication records, ensuring each reply is
                accurate and personalized.
              </p>
              <ul className="space-y-3 text-left text-md text-slate-200">
                <li className="flex items-start">
                  <Sparkles className="mt-1 mr-3 h-6 w-6 shrink-0 text-yellow-400" />
                  <span>
                    <span className="font-semibold">Intelligent Personalization:</span> Tailors
                    replies based on candidate profiles and job requirements.
                  </span>
                </li>
                <li className="flex items-start">
                  <Clock className="mt-1 mr-3 h-6 w-6 shrink-0 text-blue-400" />
                  <span>
                    <span className="font-semibold">Time Saving:</span> Drastically reduces manual
                    reply efforts for recruiters.
                  </span>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="mt-1 mr-3 h-6 w-6 shrink-0 text-green-400" />
                  <span>
                    <span className="font-semibold">Guaranteed Reply Within 72 Hours:</span> Helps
                    maintain high company reputation scores.
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

            <div className="space-y-6" data-aos="fade-left" data-aos-delay="200">
              <Card className="border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="mb-4 flex items-center gap-3">
                      <Bot className="h-5 w-5 animate-spin text-purple-400" />
                      <span className="font-medium text-white">AI Assistant working...</span>
                    </div>

                    <div className="min-h-[180px] space-y-3">
                      {' '}
                      {/* Added min-height to prevent layout shifts */}
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
                  <div className="font-bold text-2xl text-white">&lt;24h</div>
                  <div className="text-purple-200 text-sm">Guaranteed Reply</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Ensure typing cursor animation is defined in globals.css or here */}
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
        // animate-fadeInPage is already in globals.css, if not, define:
        // @keyframes fadeInPage { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        // .animate-fadeInPage { animation: fadeInPage 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
