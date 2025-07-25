import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google'; // Example, if you want to use Inter

// If you are using PT Sans globally from globals.css, you might not need to load it here again.
// However, Next/font is the recommended way for performance.
// Let's assume PT Sans is set up in globals.css as per existing code and we use a variable for it.
// For this example, I'll define a font variable for PT Sans.
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans', // CSS variable for PT Sans
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
    <html lang="en" suppressHydrationWarning className={`${ptSans.variable}`}>
      <head>
        {/* Removed direct Google Fonts link, relying on next/font or existing globals.css setup */}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        {/* font-body should map to --font-pt-sans if set in tailwind.config.ts */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
