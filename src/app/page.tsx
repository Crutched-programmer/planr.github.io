"use client";

import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, UserCircle, CalendarDays, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-6 font-headline text-primary flex items-center justify-center">
            <Sparkles className="w-12 h-12 mr-4 text-accent" />
            Welcome to <span className="text-glow">Planr</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal AI study planner. Optimize your learning by creating balanced daily study schedules tailored to your needs.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <UserCircle className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="font-headline text-2xl">Set Up Your Profile</CardTitle>
              <CardDescription>
                Tell us about your study habits, school schedule, and long-term goals. This information helps us create better plans for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/profile">
                  Go to Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">Your profile data is saved locally in your browser.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CalendarDays className="w-10 h-10 text-primary mb-3" />
              <CardTitle className="font-headline text-2xl">Get Your Daily Plan</CardTitle>
              <CardDescription>
                Enter your homework and commitments for today. We'll generate a personalized study plan to keep you on track.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/daily-plan">
                  Create Daily Plan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
               <p className="text-xs text-muted-foreground mt-3">Make sure your profile is up-to-date for the best results!</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Made with 💖. Planr
      </footer>
    </div>
  );
}
