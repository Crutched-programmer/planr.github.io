
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});


export const metadata: Metadata = {
  title: 'Planr - Your Personal AI Study Planner',
  description: 'Create personalized daily study plans with Planr, powered by AI. Balance your studies, commitments, and rest for optimal learning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${ptSans.variable} font-body antialiased min-h-screen flex flex-col text-foreground`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
