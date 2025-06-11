
"use client"; // Make RootLayout a client component to use hooks

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';

// Added imports for UserPreferencesProvider and auth
import React, { useState, useEffect } from 'react'; // Added React and hooks
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth"; // Import User type
import { onAuthStateChanged } from "firebase/auth";


const geistSans = GeistSans;
const geistMono = GeistMono;

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentUserForProvider, setCurrentUserForProvider] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserForProvider(user);
      setAuthLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>SwipeHire: AI Video Resumes, Talent Matching & Recruitment Platform</title>
        <meta name="description" content="Revolutionize your job search or hiring process with SwipeHire. Create AI-powered video resumes, find remote job opportunities, and connect with top talent using our innovative swipe-to-find jobs and AI recruitment software." />
        <meta name="keywords" content="AI Resume, Video Resume, Swipe to Find Jobs, Privacy Recruitment Platform, Remote Job Opportunities, AI Recruitment Software, Video Interview Tool, Talent Matching System, Unbiased Recruitment, Efficient Recruitment, SwipeHire" />
        <meta name="trustpilot-one-time-domain-verification-id" content="e5d7bcf9-aeda-4aa9-9def-923a0bf35fa1"/>
        
        {/* Favicon Links */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://launchgns.com" />
        <link rel="dns-prefetch" href="https://launchgns.com" />

        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        <link rel="preconnect" href="https://firebase.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebase.googleapis.com" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Montserrat font is loaded via next/font, so preconnects for it are handled. Other googleapis might be needed by Firebase/GTM. */}
        
        <Script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="afterInteractive"
          async
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} font-sans antialiased`}>
        <UserPreferencesProvider currentUser={currentUserForProvider}>
          {children}
        </UserPreferencesProvider>
        <Toaster />
      </body>
    </html>
  );
}
