
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Sparkles, CheckCircle, ShieldCheck, Chrome, Loader2, FileVideo2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, type UserCredential, type FirebaseError } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation'; // Import useRouter

interface LoginPageProps {
  onLoginBypass: () => void;
  onGuestMode: () => void;
}

// Key used to track if the welcome page has been seen. Must match src/app/page.tsx
const HAS_SEEN_WELCOME_KEY = 'hasSeenSwipeHireWelcomeV2';

export function LoginPage({ onLoginBypass, onGuestMode }: LoginPageProps) {
  const { toast } = useToast();
  const router = useRouter(); // Initialize router
  const [isLoadingGoogleSignIn, setIsLoadingGoogleSignIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogleSignIn(true);
    const provider = new GoogleAuthProvider();
    try {
      console.log("LoginPage: Attempting signInWithPopup...");
      const result: UserCredential = await signInWithPopup(auth, provider);
      console.log("LoginPage: signInWithPopup successful, user:", result.user);
      toast({
        title: "Sign-In Successful!",
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
      });
      // No explicit redirect here; onAuthStateChanged in page.tsx will handle it.
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Error during Google Sign-In (Popup):", firebaseError.code, firebaseError.message);
      let errorMessage = "Failed to sign in with Google using popup.";
      let shouldBypass = true;

      if (firebaseError.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked by the browser. Please allow pop-ups for this site.";
      } else if (firebaseError.code === 'auth/cancelled-popup-request' || firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled. The Google Sign-In window was closed.";
        shouldBypass = false;
        toast({
          title: "Sign-In Cancelled or Popup Issue",
          description: errorMessage,
          variant: "default",
        });
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        errorMessage = "Sign-in method is not enabled. Please contact support.";
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Google Sign-In. Check Firebase console.";
      }


      if (shouldBypass) {
        toast({
          title: "Google Sign-In Failed (Popup)",
          description: `${errorMessage} Code: ${firebaseError.code}. For development, a bypass will be attempted.`,
          variant: "destructive",
          duration: 7000,
        });
        setTimeout(() => {
          onLoginBypass();
        }, 2000);
      }
    } finally {
      setIsLoadingGoogleSignIn(false);
    }
  };

  const handleLogoClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HAS_SEEN_WELCOME_KEY);
    }
    router.push('/'); // Navigate to root, AppContent will re-evaluate
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/heroimage/office.jpg')" }}
    >
      <header className="w-full p-4 sm:p-6 z-20 shrink-0">
        {/* Updated Link to use onClick handler */}
        <a onClick={handleLogoClick} className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity cursor-pointer">
          <FileVideo2 className="h-8 w-8" />
          <span className="text-2xl font-bold">SwipeHire</span>
        </a>
      </header>

      {/* Overlay div 1 (darker bottom gradient) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent z-0"></div>
      {/* Overlay div 2 (colored side gradient) */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-indigo-800/40 to-transparent opacity-80 z-0"></div>
      
      <main className="flex flex-grow items-center justify-center relative z-10">
        <Card className={cn(
          "w-full max-w-md shadow-2xl rounded-xl mx-4", 
          "bg-white/10 backdrop-blur-xl border border-white/20 text-white" 
        )}>
          <CardHeader className="text-center space-y-2 pt-8">
            <Sparkles className="mx-auto h-12 w-12 text-yellow-300" />
            <CardTitle className="text-3xl font-bold animate-text-glow text-white">Welcome to SwipeHire</CardTitle>
            <CardDescription className="text-md text-slate-300 pt-1">
              Sign in to discover your next opportunity or top talent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6 px-6 sm:px-8">
            <div className="text-left space-y-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" /> 
                Join us to:
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-300 list-none pl-1">
                <li className="flex items-start"><Sparkles className="h-4 w-4 text-yellow-400 mr-2 shrink-0 mt-0.5" /> <span>Access powerful AI Profile Tools.</span></li>
                <li className="flex items-start"><Sparkles className="h-4 w-4 text-yellow-400 mr-2 shrink-0 mt-0.5" /> <span>Discover personalized matches.</span></li>
                <li className="flex items-start"><Sparkles className="h-4 w-4 text-yellow-400 mr-2 shrink-0 mt-0.5" /> <span>Engage in direct messaging.</span></li>
              </ul>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              size="lg"
              className="w-full text-lg py-3 bg-white text-slate-800 hover:bg-slate-200 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg font-semibold"
              aria-label="Sign in with Google"
              disabled={isLoadingGoogleSignIn}
            >
              {isLoadingGoogleSignIn ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Chrome className="mr-2 h-5 w-5 text-red-500" />
              )}
              Sign in with Google
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onGuestMode}
                    variant="outline"
                    size="lg"
                    className="w-full text-lg py-3 border-slate-400 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all duration-300 ease-in-out"
                    aria-label="Continue as Guest"
                    disabled={isLoadingGoogleSignIn}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Continue as Guest
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-white border-slate-700">
                  <p>Guest mode offers limited functionality. Sign in for the full experience.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <p className="text-center text-xs text-slate-400 pt-2">
              More sign-in options like Email & LinkedIn coming soon!
            </p>

          </CardContent>
          <CardFooter className="pb-8 px-6 sm:px-8">
              <p className="text-center text-xs text-slate-400 w-full flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 mr-1.5 text-green-400" /> By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
