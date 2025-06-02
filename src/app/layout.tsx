import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Montserrat } from 'next/font/google'; // Import Montserrat
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = GeistSans;
const geistMono = GeistMono;

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'], // Include weights you plan to use
  variable: '--font-montserrat', // CSS variable for Montserrat
});

export const metadata: Metadata = {
  title: 'SwipeHire',
  description: 'AI-Powered Video Resumes and Tinder-Style Recruitment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
