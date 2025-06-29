import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthWrapper } from '@/components/AuthWrapper';
import QueryProvider from '@/components/QueryProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SwipeHire',
  description: 'Revolutionizing the hiring process',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>
        <QueryProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
