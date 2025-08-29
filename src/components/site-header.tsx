
import { GraduationCap, UserCircle, CalendarDays, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';

function SiteHeaderComponent() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 glass">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-2 sm:mr-6 flex items-center space-x-2 text-primary text-glow">
          <GraduationCap className="h-6 w-6 icon-glow hard-glow" />
          <span className="font-bold hidden sm:inline-block font-headline text-glow hard-glow">
            Planr
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-1 sm:space-x-2 lg:space-x-4">
          <Button variant="ghost" asChild className="px-2 sm:px-4">
            <Link href="/profile" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <UserCircle className="mr-0 sm:mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="px-2 sm:px-4">
            <Link href="/daily-plan" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <CalendarDays className="mr-0 sm:mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Daily Plan</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="px-2 sm:px-4">
            <Link href="/quiz" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <BrainCircuit className="mr-0 sm:mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Quiz</span>
            </Link>
          </Button>
        </nav>

        <div className="flex items-center">
            {/* ThemeSwitcher removed */}
        </div>
      </div>
    </header>
  );
}

export const SiteHeader = React.memo(SiteHeaderComponent);
