import { GraduationCap, UserCircle, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block font-headline">
            StudyZen
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-2 lg:space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/profile" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <UserCircle className="mr-1 h-4 w-4" />
              My Profile
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/daily-plan" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <CalendarDays className="mr-1 h-4 w-4" />
              Daily Plan
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
