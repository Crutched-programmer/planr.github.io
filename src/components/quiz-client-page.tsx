
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lightbulb, X, Check, Repeat, Timer, Info } from 'lucide-react';
import { generateQuiz, type GenerateQuizOutput, type QuizQuestion } from '@/ai/flows/generate-quiz-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Slider } from '@/components/ui/slider';
import type { ProfileFormData } from '@/lib/types';
import { parseISO } from 'date-fns';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

const LOCAL_STORAGE_KEY_PROFILE = 'planrProfileData';

function QuizClientPageComponent() {
  const [topics, setTopics] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [timerMinutes, setTimerMinutes] = useState(10);

  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        if (parsedProfile.examDate && typeof parsedProfile.examDate === 'string') {
          parsedProfile.examDate = parseISO(parsedProfile.examDate);
        }
        setProfileData(parsedProfile);
      }
    } catch (error) {
      console.error("Failed to load profile data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (quizData && !isSubmitted) {
      const quizDurationSeconds = timerMinutes * 60;
      setTimeLeft(quizDurationSeconds);

      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            toast({
              title: "Time's Up!",
              description: "Your quiz has been submitted automatically.",
            });
            handleSubmitQuiz(true); // Auto-submit
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizData, isSubmitted]);


  const handleGenerateQuiz = async () => {
    if (!topics.trim()) {
      setError("Please enter some topics to be quizzed on.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setUserAnswers([]);
    setIsSubmitted(false);

    try {
      const result = await generateQuiz({ 
          topics, 
          numQuestions,
          curriculum: profileData?.curriculum || "General Knowledge"
      });
      if (result && result.questions.length > 0) {
        setQuizData(result);
        setUserAnswers(new Array(result.questions.length).fill(-1));
        toast({
          title: "Quiz Generated!",
          description: "Your quiz is ready. The timer has started. Good luck!",
        });
      } else {
        throw new Error("The AI did not return a valid quiz.");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Quiz Generation Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = optionIndex;
      return newAnswers;
    });
  };

  const handleSubmitQuiz = (isAutoSubmit = false) => {
     if (!isAutoSubmit && userAnswers.some(ans => ans === -1)) {
        toast({
            variant: "destructive",
            title: "Incomplete Quiz",
            description: "Please answer all questions before submitting.",
        });
        return;
    }
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleResetQuiz = () => {
    setQuizData(null);
    setTopics('');
    setUserAnswers([]);
    setIsSubmitted(false);
    setError(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(0);
  };
  
  const getOptionStyling = (question: QuizQuestion, questionIndex: number, optionIndex: number): string => {
    if (!isSubmitted) return 'border-border';

    const isCorrectAnswer = optionIndex === question.correctAnswerIndex;
    const isUserSelection = userAnswers[questionIndex] === optionIndex;

    if (isCorrectAnswer) return 'border-green-500 bg-green-100 dark:bg-green-900/30 font-bold';
    if (isUserSelection && !isCorrectAnswer) return 'border-red-500 bg-red-100 dark:bg-red-900/30 line-through';

    return 'border-border';
  };
  
  const getScore = () => {
    if (!quizData) return 0;
    return quizData.questions.reduce((score, question, index) => {
        return score + (userAnswers[index] === question.correctAnswerIndex ? question.marks : 0);
    }, 0);
  };
  
  if (!isMounted) {
     return (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto my-10" />
          <p>Loading quiz master...</p>
        </div>
    );
  }

  const renderQuizSetup = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Create a Quiz</CardTitle>
        <CardDescription>Set your topics and quiz options. We'll use your profile curriculum to tailor questions.</CardDescription>
      </CardHeader>
      <CardContent>
        {!profileData ? (
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Set Your Profile for Better Quizzes!</AlertTitle>
                <AlertDescription>
                   We recommend <Link href="/profile" className="font-bold underline hover:text-primary">setting your curriculum</Link> in your profile to get questions tailored to your level.
                </AlertDescription>
            </Alert>
        ) : (
            <Alert variant="default" className="bg-accent/30 border-accent/50">
                <Info className="h-4 w-4" />
                <AlertTitle>Using Profile Curriculum</AlertTitle>
                <AlertDescription>
                   Quiz questions will be tailored for: <span className="font-bold">{profileData.curriculum}</span>. You can change this in your <Link href="/profile" className="font-bold underline hover:text-primary">profile</Link>.
                </AlertDescription>
            </Alert>
        )}
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="topics-input">Topics</Label>
            <Input 
              id="topics-input"
              placeholder="e.g., Photosynthesis, European Renaissance, Algebra"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
              <Label htmlFor="num-questions-slider">Number of Questions: <span className="text-primary font-bold">{numQuestions}</span></Label>
              <Slider 
                id="num-questions-slider"
                min={5}
                max={20}
                step={1}
                value={[numQuestions]}
                onValueChange={(val) => setNumQuestions(val[0])}
                disabled={isLoading}
              />
          </div>

           <div className="space-y-3">
              <Label htmlFor="timer-slider">Timer (Minutes): <span className="text-primary font-bold">{timerMinutes}</span></Label>
              <Slider 
                id="timer-slider"
                min={5}
                max={30}
                step={5}
                value={[timerMinutes]}
                onValueChange={(val) => setTimerMinutes(val[0])}
                disabled={isLoading}
              />
          </div>

          <Button onClick={handleGenerateQuiz} disabled={isLoading} className="w-full md:w-auto" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : 'Start Quiz'}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderQuizActive = () => {
    if (!quizData) return null;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeProgress = (timeLeft / (timerMinutes * 60)) * 100;

    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl mb-2">{quizData.quizTitle}</CardTitle>
              <CardDescription>
                {isSubmitted ? `You scored ${getScore()} out of ${quizData.totalMarks}!` : "Select the best answer for each question."}
              </CardDescription>
            </div>
            {!isSubmitted && (
                 <Button onClick={handleResetQuiz} variant="outline" size="sm">
                    <Repeat className="mr-2 h-4 w-4" />
                    New Quiz
                </Button>
            )}
          </div>
          {!isSubmitted && (
             <div className="pt-4">
                <div className="flex justify-between items-center mb-1 text-sm font-medium">
                    <div className="flex items-center text-muted-foreground">
                        <Timer className="mr-2 h-5 w-5" />
                        <span>Time Left</span>
                    </div>
                    <span className="font-mono text-primary">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
                <Progress value={timeProgress} className="w-full h-2" />
             </div>
          )}
           {isSubmitted && (
             <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Card className="flex-1 bg-green-50 dark:bg-green-900/20 border-green-500">
                    <CardHeader>
                        <CardTitle className="text-xl text-green-700 dark:text-green-400">Score: {getScore()} / {quizData.totalMarks}</CardTitle>
                    </CardHeader>
                </Card>
                <Button onClick={handleResetQuiz} variant="default" size="lg" className="flex-shrink-0">
                    <Repeat className="mr-2 h-4 w-4" />
                    Take a New Quiz
                </Button>
            </div>
           )}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            {quizData.questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 border rounded-lg bg-card-foreground/5">
                 <div className="flex justify-between items-start mb-4">
                    <p className="font-semibold">{qIndex + 1}. {q.questionText}</p>
                    <div className="flex items-center gap-2 text-sm ml-4">
                      <span className={`font-bold px-2 py-1 rounded-full text-xs ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{q.difficulty}</span>
                      <span className="font-semibold text-primary px-2 py-1 rounded-md bg-primary/10">{q.marks} Mark{q.marks > 1 ? 's' : ''}</span>
                    </div>
                 </div>
                <div className="space-y-3">
                  {q.options.map((option, oIndex) => (
                    <div 
                      key={oIndex} 
                      className={`flex items-center space-x-3 p-3 border-2 rounded-md transition-all ${isSubmitted ? '' : 'cursor-pointer hover:border-primary'} ${getOptionStyling(q, qIndex, oIndex)}`}
                      onClick={() => !isSubmitted && handleAnswerSelect(qIndex, oIndex)}
                    >
                      <input 
                        type="radio" 
                        name={`q-${qIndex}`} 
                        id={`q-${qIndex}-o-${oIndex}`}
                        checked={userAnswers[qIndex] === oIndex}
                        onChange={() => !isSubmitted && handleAnswerSelect(qIndex, oIndex)}
                        className="form-radio h-4 w-4 text-primary accent-primary focus:ring-primary"
                        disabled={isSubmitted}
                      />
                      <Label htmlFor={`q-${qIndex}-o-${oIndex}`} className={`flex-1 ${isSubmitted ? '' : 'cursor-pointer'}`}>{option}</Label>
                       {isSubmitted && userAnswers[qIndex] === oIndex && q.correctAnswerIndex !== oIndex && <X className="h-6 w-6 text-red-600 flex-shrink-0" />}
                       {isSubmitted && oIndex === q.correctAnswerIndex && <Check className="h-6 w-6 text-green-600 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
                {isSubmitted && (
                   <div className="mt-4 p-4 bg-accent/30 border border-accent/50 rounded-md text-sm">
                       <p className="font-bold flex items-center mb-1 text-base"><Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />Explanation</p>
                       <p className="text-muted-foreground">{q.explanation}</p>
                   </div>
                )}
              </div>
            ))}
          </div>

           {!isSubmitted && (
                <Button onClick={() => handleSubmitQuiz(false)} className="mt-8 w-full" size="lg">
                    Submit Quiz
                </Button>
            )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {!quizData ? renderQuizSetup() : renderQuizActive()}
    </>
  );
}


export const QuizClientPage = React.memo(QuizClientPageComponent);
