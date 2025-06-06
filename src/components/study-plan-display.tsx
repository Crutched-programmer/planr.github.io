"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit3, MessageSquareWarning } from 'lucide-react';
import type { GenerateStudyPlanInput } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface StudyPlanDisplayProps {
  plan: string;
  originalInput: GenerateStudyPlanInput;
  onImprovePlan: (feedback: string, existingPlan: string, originalInputForExistingPlan: GenerateStudyPlanInput) => Promise<void>;
  isImproving: boolean;
  improvementError?: string | null;
}

export function StudyPlanDisplay({ plan, originalInput, onImprovePlan, isImproving, improvementError }: StudyPlanDisplayProps) {
  const [feedback, setFeedback] = useState('');

  const handleImproveSubmit = () => {
    if (!feedback.trim()) {
        // Optionally, show a message to enter feedback
        return;
    }
    onImprovePlan(feedback, plan, originalInput);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your Personalized Study Plan</CardTitle>
        <CardDescription>Review your AI-generated plan below. You can make adjustments using the feedback section.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-md bg-background shadow">
            <pre className="whitespace-pre-wrap text-sm font-body leading-relaxed">
                {plan}
            </pre>
        </div>

        <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold flex items-center font-headline">
                <Edit3 className="mr-2 h-5 w-5 text-primary" />
                Adjust Your Plan
            </h3>
            <p className="text-sm text-muted-foreground">
                Not quite right? Provide feedback on what you'd like to change, and we'll try to generate an improved version.
            </p>
            <Textarea
                placeholder="e.g., 'I need more time for Math on weekends', 'Can I have a longer break in the afternoon?', 'I prefer studying Chemistry in the morning.'"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
                disabled={isImproving}
            />
            {improvementError && (
                 <Alert variant="destructive">
                    <MessageSquareWarning className="h-4 w-4" />
                    <AlertTitle>Improvement Error</AlertTitle>
                    <AlertDescription>
                        {improvementError}
                    </AlertDescription>
                </Alert>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleImproveSubmit} disabled={isImproving || !feedback.trim()} className="w-full md:w-auto">
          {isImproving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Improving Plan...
            </>
          ) : (
            'Improve Plan'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
