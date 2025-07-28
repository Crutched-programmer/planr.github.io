
"use client";

import React, { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, BrainCircuit, Lightbulb, X, Check, Repeat } from 'lucide-react';
import { generateQuiz, type GenerateQuizOutput, type QuizQuestion } from '@/ai/flows/generate-quiz-flow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

type AnswerStatus = 'correct' | 'incorrect' | 'unanswered';

export default function QuizPage() {
  const [topics, setTopics] = useState('');
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { toast } = useToast();

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
      const result = await generateQuiz({ topics, numQuestions: 5 });
      if (result && result.questions.length > 0) {
        setQuizData(result);
        setUserAnswers(new Array(result.questions.length).fill(-1));
        toast({
          title: "Quiz Generated!",
          description: "Your quiz is ready. Good luck!",
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

  const handleSubmitQuiz = () => {
     if (userAnswers.some(ans => ans === -1)) {
        toast({
            variant: "destructive",
            title: "Incomplete Quiz",
            description: "Please answer all questions before submitting.",
        });
        return;
    }
    setIsSubmitted(true);
  };

  const handleResetQuiz = () => {
    setQuizData(null);
    setTopics('');
    setUserAnswers([]);
    setIsSubmitted(false);
    setError(null);
  };
  
  const getOptionStyling = (question: QuizQuestion, questionIndex: number, optionIndex: number): string => {
    if (!isSubmitted) return 'border-border';

    const isCorrectAnswer = optionIndex === question.correctAnswerIndex;
    const isUserSelection = userAnswers[questionIndex] === optionIndex;

    if (isCorrectAnswer) return 'border-green-500 bg-green-100 dark:bg-green-900/30';
    if (isUserSelection && !isCorrectAnswer) return 'border-red-500 bg-red-100 dark:bg-red-900/30';

    return 'border-border';
  };
  
  const getScore = () => {
    if (!quizData) return 0;
    return quizData.questions.reduce((score, question, index) => {
        return score + (userAnswers[index] === question.correctAnswerIndex ? 1 : 0);
    }, 0);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <section className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <BrainCircuit className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2 font-headline text-primary">
            Test Your Knowledge
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter topics from your study plan to generate a quick quiz and reinforce your learning.
          </p>
        </section>

        {!quizData ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Create a Quiz</CardTitle>
              <CardDescription>Enter a few topics (comma-separated) to generate your quiz.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                <Button onClick={handleGenerateQuiz} disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : 'Generate Quiz'}
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
        ) : (
          <Card className="shadow-lg">
            <CardHeader className="border-b">
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-2xl mb-2">{quizData.quizTitle}</CardTitle>
                        <CardDescription>
                            {isSubmitted ? `You scored ${getScore()} out of ${quizData.questions.length}!` : "Select the best answer for each question."}
                        </CardDescription>
                    </div>
                    <Button onClick={handleResetQuiz} variant="outline" size="sm">
                        <Repeat className="mr-2 h-4 w-4" />
                        New Quiz
                    </Button>
                 </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {quizData.questions.map((q, qIndex) => (
                  <div key={qIndex}>
                    <p className="font-semibold mb-4">{qIndex + 1}. {q.questionText}</p>
                    <div className="space-y-3">
                      {q.options.map((option, oIndex) => (
                        <div 
                          key={oIndex} 
                          className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-all ${getOptionStyling(q, qIndex, oIndex)}`}
                          onClick={() => !isSubmitted && handleAnswerSelect(qIndex, oIndex)}
                        >
                          <input 
                            type="radio" 
                            name={`q-${qIndex}`} 
                            id={`q-${qIndex}-o-${oIndex}`}
                            checked={userAnswers[qIndex] === oIndex}
                            onChange={() => !isSubmitted && handleAnswerSelect(qIndex, oIndex)}
                            className="accent-primary"
                            disabled={isSubmitted}
                          />
                          <Label htmlFor={`q-${qIndex}-o-${oIndex}`} className="flex-1 cursor-pointer">{option}</Label>
                           {isSubmitted && userAnswers[qIndex] === oIndex && q.correctAnswerIndex !== oIndex && <X className="h-5 w-5 text-red-600" />}
                           {isSubmitted && oIndex === q.correctAnswerIndex && <Check className="h-5 w-5 text-green-600" />}
                        </div>
                      ))}
                    </div>
                    {isSubmitted && (
                       <div className="mt-4 p-3 bg-accent/30 border border-accent/50 rounded-md text-sm">
                           <p className="font-bold flex items-center"><Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />Explanation</p>
                           <p className="text-muted-foreground mt-1">{q.explanation}</p>
                       </div>
                    )}
                  </div>
                ))}
              </div>

               {!isSubmitted && (
                    <Button onClick={handleSubmitQuiz} className="mt-8 w-full">
                        Submit Quiz
                    </Button>
                )}
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Planr. Test your knowledge, one quiz at a time.
      </footer>
    </div>
  );
}
