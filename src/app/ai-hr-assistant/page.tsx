
"use client";

import React, { useEffect, useState } from 'react'; // Added useState
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, ArrowRight, Sparkles, Clock, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { cn } from '@/lib/utils';

export default function AiHrAssistantPage() {
  const { currentUser, fullBackendUser, mongoDbUserId, preferences } = useUserPreferences();
  const router = useRouter();

  // State for chat animation
  const [typedApplicantMessage, setTypedApplicantMessage] = useState("");
  const [isTypingApplicant, setIsTypingApplicant] = useState(false);
  const [showAiAnalyzing, setShowAiAnalyzing] = useState(false);
  const [typedAiReply, setTypedAiReply] = useState("");
  const [isTypingAiReply, setIsTypingAiReply] = useState(false);

  const fullApplicantMessage = "Hello, I'm interested in the Frontend Developer position...";
  const fullAiReply = "Hello Applicant! Thank you for your interest. Based on your skills, we think you're a good fit. Would you be available for an interview next Tuesday or Wednesday?";

  const typeMessage = async (
    message: string,
    setTextState: React.Dispatch<React.SetStateAction<string>>,
    setIsTypingState: React.Dispatch<React.SetStateAction<boolean>>,
    speed: number = 30 // Adjusted speed
  ) => {
    setIsTypingState(true);
    setTextState(""); 
    for (let i = 0; i < message.length; i++) {
      setTextState(prev => prev + message.charAt(i));
      await new Promise(resolve => setTimeout(resolve, speed));
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
      setTypedApplicantMessage("");
      setIsTypingApplicant(false);
      setShowAiAnalyzing(false);
      setTypedAiReply("");
      setIsTypingAiReply(false);

      // Wait a brief moment for AOS card animation to settle if desired
      await new Promise(resolve => setTimeout(resolve, 300)); 

      await typeMessage(fullApplicantMessage, setTypedApplicantMessage, setIsTypingApplicant);
      await new Promise(resolve => setTimeout(resolve, 700)); // Pause after applicant message

      setShowAiAnalyzing(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // AI "thinking" time
      
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
        setTimeout(() => {
             if (typeof window !== 'undefined' && (cardElement as HTMLElement).dataset.aosId) { // Check if AOS processed it
                animateChat();
            }
        }, parseFloat((cardElement as HTMLElement).dataset.aosDelay || '0') + 200); // Delay by AOS delay + buffer
    } else {
        // Fallback if AOS selector fails, run after a fixed delay
        setTimeout(() => {
             if (typeof window !== 'undefined') animateChat();
        }, 500);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array: runs once on mount after initial render.


  if (preferences.isLoading && !currentUser && !mongoDbUserId) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center ai-hr-deep-purple-gradient text-white">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (currentUser && (preferences.isLoading || !mongoDbUserId || !fullBackendUser)) {
    return (
      <div className="flex flex-col min-h-screen ai-hr-deep-purple-gradient text-white">
        <AppHeader
          isAuthenticated={false} 
          isGuestMode={true}    
          onLoginRequest={() => router.push('/')}
          onLogout={() => { /* No-op or actual logout if needed */ }}
          searchTerm=""
          onSearchTermChange={() => {}}
          userName={null}
          userPhotoURL={null}
        />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p className="mt-4 text-slate-300">Loading your AI HR Assistant session...</p>
        </main>
      </div>
    );
  }

  const isAuthenticated = !!currentUser && !!mongoDbUserId;
  const userName = fullBackendUser?.name || currentUser?.displayName || null;
  let userPhotoURL = currentUser?.photoURL || null;
  if (fullBackendUser?.profileAvatarUrl) {
    if (fullBackendUser.profileAvatarUrl.startsWith('/uploads/')) {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';
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
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
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
      <main className="flex-grow flex flex-col items-center justify-center ai-hr-deep-purple-gradient text-white p-4 sm:p-8 overflow-hidden pt-20 md:pt-24 animate-fadeInPage">
        <div className="container mx-auto max-w-6xl text-center lg:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:space-y-8 relative z-10" data-aos="fade-right">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-purple-600 text-white mb-4 shadow-md">
                <Bot className="h-5 w-5 mr-2" />
                AI HR Assistant
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight font-heading">
                AI-Powered Bulk Replies
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed">
                Let AI simultaneously reply to a massive volume of candidate resumes. It can incorporate screening tags and past communication records, ensuring each reply is accurate and personalized.
              </p>
              <ul className="space-y-3 text-left text-slate-200 text-md">
                <li className="flex items-start">
                  <Sparkles className="h-6 w-6 mr-3 text-yellow-400 shrink-0 mt-1" />
                  <span><span className="font-semibold">Intelligent Personalization:</span> Tailors replies based on candidate profiles and job requirements.</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-6 w-6 mr-3 text-blue-400 shrink-0 mt-1" />
                  <span><span className="font-semibold">Time Saving:</span> Drastically reduces manual reply efforts for recruiters.</span>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="h-6 w-6 mr-3 text-green-400 shrink-0 mt-1" />
                  <span><span className="font-semibold">Guaranteed Reply Within 72 Hours:</span> Helps maintain high company reputation scores.</span>
                </li>
              </ul>
              <Link href="/ai-hr-payment" passHref className="block mt-8"> {/* Increased margin here */}
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white w-full sm:w-auto text-lg px-10 py-3 subtle-button-hover shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 transition-all duration-300"
                >
                  Try Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-6" data-aos="fade-left" data-aos-delay="200">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium">AI Assistant working...</span>
                    </div>
                    
                    <div className="space-y-3 min-h-[180px]"> {/* Added min-height to prevent layout shifts */}
                      {typedApplicantMessage && (
                        <div className="bg-white/20 rounded-lg p-3 ml-8 shadow-md animate-fadeInPage">
                          <p className="text-white text-sm">
                            {typedApplicantMessage}
                            {isTypingApplicant && <span className="typing-cursor"></span>}
                          </p>
                          <span className="text-purple-200 text-xs">Applicant - Just now</span>
                        </div>
                      )}
                      
                      {showAiAnalyzing && (
                        <div className="flex items-center gap-2 text-purple-300 my-2 animate-fadeInPage">
                          <Bot className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is analyzing and generating a reply...</span>
                        </div>
                      )}
                      
                      {typedAiReply && (
                        <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-lg p-3 mr-8 border border-purple-400/40 shadow-md animate-fadeInPage">
                          <p className="text-white text-sm">
                            {typedAiReply}
                            {isTypingAiReply && <span className="typing-cursor"></span>}
                          </p>
                          <span className="text-pink-200 text-xs">AI Assistant - Just now</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 text-center shadow-xl">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-purple-200 text-sm">Reply Accuracy</div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 text-center shadow-xl">
                  <div className="text-2xl font-bold text-white">2s</div>
                  <div className="text-purple-200 text-sm">Avg. Gen. Time</div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 text-center shadow-xl">
                  <div className="text-2xl font-bold text-white">&lt;24h</div>
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

