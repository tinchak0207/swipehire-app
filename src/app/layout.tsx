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

// Removed metadata export as this is a client component
// export const metadata: Metadata = {
//   title: 'SwipeHire',
//   description: 'AI-Powered Video Resumes and Tinder-Style Recruitment',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for currentUser, moved from HomePage
  const [currentUserForProvider, setCurrentUserForProvider] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // To handle initial auth check

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserForProvider(user);
      setAuthLoading(false); // Auth check complete
    });
    return () => unsubscribe();
  }, []);

  // Optional: Display a loading state or null until auth check is complete
  // This avoids rendering children that might depend on auth status prematurely.
  // However, UserPreferencesProvider itself handles a loading state for preferences.
  // For now, we'll pass currentUserForProvider directly.
  // if (authLoading) {
  //   return <body>Loading authentication...</body>; // Or a more sophisticated loader
  // }

  return (
    <html lang="en">
      <head>
        {/* You can add static meta tags directly here if needed, or manage dynamically */}
        <title>SwipeHire</title>
        <meta name="description" content="AI-Powered Video Resumes and Tinder-Style Recruitment" />
        <meta name="trustpilot-one-time-domain-verification-id" content="e5d7bcf9-aeda-4aa9-9def-923a0bf35fa1"/>
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
