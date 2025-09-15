import React from 'react';
import { SiteHeader } from '@/components/site-header';
import { BrainCircuit } from 'lucide-react';
import { QuizClientPage } from '@/components/quiz-client-page';

export default function QuizPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <section className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <BrainCircuit className="w-16 h-16 text-glow hard-glow" />
          </div>
          <h1 className="text-3xl font-bold mb-2 font-headline text-primary">
            Test Your Knowledge
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate a custom quiz to reinforce your learning.
          </p>
        </section>

        <QuizClientPage />
        
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t glass bg-background/30">
        © {new Date().getFullYear()} Made with 💖 Planr. 
      </footer>
    </div>
  );
}
