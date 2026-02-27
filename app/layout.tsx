'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata = {
  title: 'Blog Portal',
  description: 'Create beautiful blog posts with a minimalist glassmorphism aesthetic',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Create beautiful blog posts with a minimalist glassmorphism aesthetic" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${
          geist.variable
        } ${
          geistMono.variable
        } bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen antialiased text-slate-100`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="blog-theme"
        >
          <div className="relative min-h-screen overflow-x-hidden">
            {/* Animated background gradients */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-slate-700/10 to-transparent rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
