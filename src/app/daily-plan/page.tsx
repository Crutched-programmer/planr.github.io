import React from 'react';
import { SiteHeader } from '@/components/site-header';
import { CalendarDays } from 'lucide-react';
import { DailyPlanClientPage } from '@/components/daily-plan-client-page';

export default function DailyPlanPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <section className="mb-8 text-center">
           <div className="flex justify-center mb-4">
            <CalendarDays className="w-16 h-16 text-glow hard-glow" />
          </div>
          <h1 className="text-3xl font-bold mb-2 font-headline text-primary">
            Plan Your Day
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your tasks and commitments for today. We'll use your profile settings to generate an optimized daily study schedule.
          </p>
        </section>

        <DailyPlanClientPage />
        
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t glass bg-background/30">
        © {new Date().getFullYear()} Made with 💖 Planr. 
      </footer>
    </div>
  );
}
