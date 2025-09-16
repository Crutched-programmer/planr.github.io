
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Lexend_Deca } from 'next/font/google';
import { DynamicPixelBlast } from '@/components/dynamic-pixel-blast';

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
        <DynamicPixelBlast 
            particleCount={5000}
            particleColors={['#dbffd9', '#a0c4ff', '#D0B8FF']}
            particleSpread={15}
            speed={0.05}
            particleBaseSize={2.5}
            sizeRandomness={0.2}
            cameraDistance={15}
        />
        <div className="relative z-10 flex flex-col min-h-screen">
            {children}
            <Toaster />
        </div>
      </body>
    </html>
  );
}
