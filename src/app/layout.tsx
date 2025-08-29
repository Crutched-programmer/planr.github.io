
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Lexend_Deca } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  variable: '--font-lexend-deca',
  weight: ['100', '300', '400', '700'],
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
      <body className={`${inter.variable} ${lexendDeca.variable} font-body antialiased min-h-screen flex flex-col text-foreground`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
