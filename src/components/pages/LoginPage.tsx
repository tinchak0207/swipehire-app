'use client';

import type { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup, type UserCredential } from 'firebase/auth';
import { CheckCircle, Chrome, Eye, FileVideo2, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface LoginPageProps {
  onLoginBypass: () => void;
  onGuestMode: () => void;
}

const HAS_SEEN_WELCOME_KEY = 'hasSeenSwipeHireWelcomeV2';

export function LoginPage({ onLoginBypass, onGuestMode }: LoginPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoadingGoogleSignIn, setIsLoadingGoogleSignIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogleSignIn(true);
    const provider = new GoogleAuthProvider();
    try {
      console.log('LoginPage: Attempting signInWithPopup...');
      const result: UserCredential = await signInWithPopup(auth, provider);
      console.log('LoginPage: signInWithPopup successful, user:', result.user);
      toast({
        title: 'Sign-In Successful!',
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
      });
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error(
        'Error during Google Sign-In (Popup):',
        firebaseError.code,
        firebaseError.message
      );
      let errorMessage = 'Failed to sign in with Google using popup.';
      let shouldBypass = true;

      if (firebaseError.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked by the browser. Please allow pop-ups for this site.';
      } else if (
        firebaseError.code === 'auth/cancelled-popup-request' ||
        firebaseError.code === 'auth/popup-closed-by-user'
      ) {
        errorMessage = 'Sign-in cancelled. The Google Sign-In window was closed.';
        shouldBypass = false;
        toast({
          title: 'Sign-In Cancelled or Popup Issue',
          description: errorMessage,
          variant: 'default',
        });
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        errorMessage = 'Sign-in method is not enabled. Please contact support.';
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google Sign-In. Check Firebase console.';
      }

      if (shouldBypass) {
        toast({
          title: 'Google Sign-In Failed (Popup)',
          description: `${errorMessage} Code: ${firebaseError.code}. For development, a bypass will be attempted.`,
          variant: 'destructive',
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
    router.push('/');
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/heroimage/office.jpg')" }}
    >
      <header className="z-20 w-full shrink-0 p-4 sm:p-6">
        <a
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center gap-2 text-white transition-opacity hover:opacity-80"
        >
          <FileVideo2 className="h-8 w-8" />
          <span className="font-bold text-2xl">SwipeHire</span>
        </a>
      </header>

      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-purple-900/60 via-indigo-800/40 to-transparent opacity-80" />

      <main className="relative z-10 flex flex-grow items-center justify-center">
        <Card
          className={cn(
            'mx-4 w-full max-w-md rounded-xl shadow-2xl',
            'border border-white/20 bg-white/10 text-white backdrop-blur-xl'
          )}
        >
          <CardHeader className="space-y-2 pt-8 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-yellow-300" />
            <CardTitle className="font-bold text-3xl text-white">
              <h1>Welcome to SwipeHire</h1>
            </CardTitle>
            <CardDescription className="pt-1 text-md text-slate-300">
              Sign in to leverage AI recruitment software, create video resumes, or swipe to find
              jobs and top talent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-6 sm:px-8">
            <div className="mb-4 space-y-2 text-left">
              <h3 className="flex items-center font-semibold text-lg text-slate-100">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                Join us to:
              </h3>
              <ul className="list-none space-y-1.5 pl-1 text-slate-300 text-sm">
                <li className="flex items-start">
                  <Sparkles className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-yellow-400" />{' '}
                  <span>Access powerful AI Profile Tools for video resumes.</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-yellow-400" />{' '}
                  <span>Discover personalized matches with our talent matching system.</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-yellow-400" />{' '}
                  <span>Engage in direct messaging on our privacy recruitment platform.</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              size="lg"
              className="w-full bg-white py-3 font-semibold text-lg text-slate-800 shadow-md transition-all duration-300 ease-in-out hover:bg-slate-200 hover:shadow-lg"
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
                    className="w-full border-slate-400 py-3 text-lg text-slate-300 transition-all duration-300 ease-in-out hover:border-slate-500 hover:bg-slate-700 hover:text-white"
                    aria-label="Continue as Guest"
                    disabled={isLoadingGoogleSignIn}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Continue as Guest
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-slate-700 bg-slate-800 text-white">
                  <p>Guest mode offers limited functionality. Sign in for the full experience.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <p className="pt-2 text-center text-slate-400 text-xs">
              More sign-in options like Email & LinkedIn coming soon!
            </p>
          </CardContent>
          <CardFooter className="px-6 pb-8 sm:px-8">
            <p className="flex w-full items-center justify-center text-center text-slate-400 text-xs">
              <ShieldCheck className="mr-1.5 h-4 w-4 text-green-400" /> By signing in, you agree to
              our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
