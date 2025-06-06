"use client";

import React, { useState, useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { StudyPlanForm } from '@/components/study-plan-form';
import { StudyPlanDisplay } from '@/components/study-plan-display';
import { generateStudyPlan } from '@/ai/flows/generate-study-plan';
import { improveStudyPlan } from '@/ai/flows/improve-study-plan-flow';
import type { GenerateStudyPlanInput } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, MessageSquareWarning } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [originalFormInputForPlan, setOriginalFormInputForPlan] = useState<GenerateStudyPlanInput | null>(null);
  
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isImprovingPlan, setIsImprovingPlan] = useState(false);
  
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [improvementError, setImprovementError] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGeneratePlan = async (data: GenerateStudyPlanInput) => {
    setIsLoadingPlan(true);
    setGenerationError(null);
    setCurrentPlan(null); // Clear previous plan
    setOriginalFormInputForPlan(null);
    try {
      const result = await generateStudyPlan(data);
      if (result.studyPlan) {
        setCurrentPlan(result.studyPlan);
        setOriginalFormInputForPlan(data);
        toast({
          title: "Study Plan Generated!",
          description: "Your personalized study plan is ready.",
        });
      } else {
        throw new Error("The AI did not return a study plan.");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while generating the plan.";
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

  const handleImprovePlan = async (feedback: string, existingPlan: string, originalInput: GenerateStudyPlanInput) => {
    setIsImprovingPlan(true);
    setImprovementError(null);
    try {
      const result = await improveStudyPlan({
        existingStudyPlan: existingPlan,
        userFeedback: feedback,
        originalUserInput: JSON.stringify(originalInput), // Pass the original form input as a string
      });
      if (result.improvedStudyPlan) {
        setCurrentPlan(result.improvedStudyPlan);
        // Keep originalFormInputForPlan as is, because the improvement is based on it
        toast({
          title: "Study Plan Updated!",
          description: "Your plan has been successfully revised.",
        });
      } else {
        throw new Error("The AI did not return an improved study plan.");
      }
    } catch (error) {
      console.error("Error improving study plan:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while improving the plan.";
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
    // Render a loading skeleton or null during SSR/hydration mismatch phase
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
           <div className="space-y-4">
            <div className="h-10 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="space-y-8 mt-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                  <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
                </div>
              ))}
              <div className="h-12 bg-muted rounded w-1/3 animate-pulse"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 font-headline text-primary flex items-center justify-center">
            <Sparkles className="w-10 h-10 mr-3 text-accent" />
            Welcome to StudyZen
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us a bit about yourself and your studies, and our AI will craft a personalized study plan to help you ace your exams while maintaining a healthy balance.
          </p>
        </section>

        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Create Your Study Plan</CardTitle>
            <CardDescription>Fill in the details below to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudyPlanForm onGeneratePlan={handleGeneratePlan} isLoading={isLoadingPlan} />
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
            <p className="ml-4 text-lg text-muted-foreground">Generating your awesome plan...</p>
          </div>
        )}
        
        {currentPlan && originalFormInputForPlan && !isLoadingPlan && (
          <StudyPlanDisplay
            plan={currentPlan}
            originalInput={originalFormInputForPlan}
            onImprovePlan={handleImprovePlan}
            isImproving={isImprovingPlan}
            improvementError={improvementError}
          />
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} StudyZen. AI-powered planning for focused learning.
      </footer>
    </div>
  );
}
