"use client";

import React from 'react';
import { SiteHeader } from '@/components/site-header';
import { ProfileForm } from '@/components/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Info } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <section className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <UserCircle className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2 font-headline text-primary">
            Your Study Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Keep this information updated to help Planr generate the most effective study plans for you.
          </p>
        </section>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Profile Details</CardTitle>
            <CardDescription>This information is used as the basis for generating your daily study plans. It's saved locally in your browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
             <div className="mt-6 flex items-center p-3 text-sm text-foreground bg-accent/30 border border-accent/50 rounded-md">
              <Info className="h-5 w-5 mr-2 text-accent-foreground flex-shrink-0" />
              <p>Changes saved here will be used for all future daily plan generations. Your data stays in your browser and is not sent anywhere until you request a plan.</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Planr. Manage your profile for smarter planning.
      </footer>
    </div>
  );
}
