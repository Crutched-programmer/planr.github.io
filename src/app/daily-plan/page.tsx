"use client";

import React, { useState, useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { DailyPlanForm } from '@/components/daily-plan-form';
import { StudyPlanDisplay } from '@/components/study-plan-display';
import { generateStudyPlan } from '@/ai/flows/generate-study-plan';
import { improveStudyPlan } from '@/ai/flows/improve-study-plan-flow';
import type { ProfileFormData, DailyInputsFormData, CombinedStudyPlanInput, GenerateStudyPlanInput as AIPlanInput } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, MessageSquareWarning, Loader2, Info, CalendarCheck2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const LOCAL_STORAGE_KEY_PROFILE = 'studyZenProfileData';

export default function DailyPlanPage() {
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [originalCombinedInputForPlan, setOriginalCombinedInputForPlan] = useState<CombinedStudyPlanInput | null>(null);
  
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isImprovingPlan, setIsImprovingPlan] = useState(false);
  
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [improvementError, setImprovementError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPlanDate, setCurrentPlanDate] = useState<string | undefined>(undefined);


  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        // Ensure dates are Date objects if they are stored as strings
        if (parsedProfile.examDate && typeof parsedProfile.examDate === 'string') {
          parsedProfile.examDate = parseISO(parsedProfile.examDate);
        }
        setProfileData(parsedProfile);
      }
    } catch (error) {
      console.error("Failed to load profile data from localStorage", error);
      toast({
        variant: "destructive",
        title: "Profile Load Error",
        description: "Could not load your profile. Please set it up.",
      });
    }
  }, [toast]);

  const handleGeneratePlan = async (dailyData: DailyInputsFormData) => {
    if (!profileData) {
      setGenerationError("Profile data is missing. Please set up your profile first.");
      toast({
        variant: "destructive",
        title: "Profile Missing",
        description: "Please complete your profile before generating a plan.",
      });
      return;
    }

    setIsLoadingPlan(true);
    setGenerationError(null);
    setCurrentPlan(null);
    setOriginalCombinedInputForPlan(null);
    setCurrentPlanDate(undefined);

    const combinedInput: CombinedStudyPlanInput = {
      ...profileData,
      age: Number(profileData.age), // Ensure age is number
      examDate: format(profileData.examDate, 'yyyy-MM-dd'), // Format Date to string for AI
      currentDate: format(dailyData.currentDate, 'yyyy-MM-dd'), // Format Date to string for AI
      commitmentsToday: dailyData.commitmentsToday || "No specific commitments listed for today.",
      homeworkDetailsToday: dailyData.homeworkDetailsToday || "No specific homework assignments listed for today.",
    };

    try {
      const result = await generateStudyPlan(combinedInput as AIPlanInput); // Cast to AIPlanInput
      if (result.studyPlan) {
        setCurrentPlan(result.studyPlan);
        setOriginalCombinedInputForPlan(combinedInput);
        setCurrentPlanDate(format(dailyData.currentDate, "PPP"));
        toast({
          title: "Daily Plan Generated!",
          description: `Your personalized study plan for ${format(dailyData.currentDate, "PPP")} is ready.`,
        });
      } else {
        throw new Error("The AI did not return a study plan.");
      }
    } catch (error) {
      console.error("Error generating daily study plan:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setGenerationError(errorMessage);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const handleImprovePlan = async (feedback: string, existingPlan: string, originalInput: CombinedStudyPlanInput) => {
    setIsImprovingPlan(true);
    setImprovementError(null);
    try {
      const result = await improveStudyPlan({
        existingStudyPlan: existingPlan,
        userFeedback: feedback,
        originalUserInput: JSON.stringify(originalInput),
      });
      if (result.improvedStudyPlan) {
        setCurrentPlan(result.improvedStudyPlan);
        toast({
          title: "Daily Plan Updated!",
          description: "Your plan has been successfully revised.",
        });
      } else {
        throw new Error("The AI did not return an improved study plan.");
      }
    } catch (error) {
      console.error("Error improving study plan:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setImprovementError(errorMessage);
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
    } finally {
      setIsImprovingPlan(false);
    }
  };
  
  if (!isMounted) {
     return ( // Basic loading state
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto my-10" />
          <p>Loading daily planner...</p>
        </main>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-xl text-center">
           <Card className="mt-10">
            <CardHeader>
                <Info className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle className="font-headline text-2xl">Profile Setup Needed</CardTitle>
                <CardDescription>
                Please set up your study profile first. This information is crucial for generating personalized daily plans.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg">
                    <Link href="/profile">Go to My Profile</Link>
                </Button>
            </CardContent>
           </Card>
        </main>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <section className="mb-8 text-center">
           <div className="flex justify-center mb-4">
            <CalendarCheck2 className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2 font-headline text-primary">
            Plan Your Day
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your tasks and commitments for today. We'll use your profile settings to generate an optimized daily study schedule.
          </p>
        </section>

        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Today's Details</CardTitle>
            <CardDescription>Fill in your commitments and homework for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyPlanForm onGeneratePlan={handleGeneratePlan} isLoading={isLoadingPlan} />
            {generationError && (
                 <Alert variant="destructive" className="mt-6">
                    <MessageSquareWarning className="h-4 w-4" />
                    <AlertTitle>Generation Error</AlertTitle>
                    <AlertDescription>
                        {generationError}
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>

        {isLoadingPlan && (
          <div className="flex justify-center items-center my-8 p-8 border rounded-lg shadow-sm bg-card">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Crafting your daily plan...</p>
          </div>
        )}
        
        {currentPlan && originalCombinedInputForPlan && !isLoadingPlan && (
          <StudyPlanDisplay
            plan={currentPlan}
            originalInput={originalCombinedInputForPlan}
            onImprovePlan={handleImprovePlan}
            isImproving={isImprovingPlan}
            improvementError={improvementError}
            planDate={currentPlanDate}
          />
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} StudyZen. Smart daily schedules for effective learning.
      </footer>
    </div>
  );
}
