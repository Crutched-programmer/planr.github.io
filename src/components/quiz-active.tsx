'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, Lightbulb, Repeat, Timer, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { GenerateQuizOutput, QuizQuestion } from '@/ai/flows/generate-quiz-flow';
import { FadeIn } from '@/components/animation/fade-in';
import { Pressable } from '@/components/animation/pressable';

interface QuizActiveProps {
    quizData: GenerateQuizOutput;
    userAnswers: number[];
    isSubmitted: boolean;
    onAnswerSelect: (questionIndex: number, optionIndex: number) => void;
    onSubmit: (isAutoSubmit?: boolean) => void;
    onReset: () => void;
    timeLeft: {
        minutes: number;
        seconds: number;
        progress: number;
    };
}

export function QuizActive({ 
    quizData, 
    userAnswers, 
    isSubmitted, 
    onAnswerSelect, 
    onSubmit, 
    onReset, 
    timeLeft
}: QuizActiveProps) {

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

    return (
        <FadeIn>
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
                        <Pressable>
                            <Button onClick={onReset} variant="outline" size="sm">
                                <Repeat className="mr-2 h-4 w-4" />
                                New Quiz
                            </Button>
                        </Pressable>
                    )}
                </div>
                {!isSubmitted && (
                    <div className="pt-4">
                        <div className="flex justify-between items-center mb-1 text-sm font-medium">
                            <div className="flex items-center text-muted-foreground">
                                <Timer className="mr-2 h-5 w-5" />
                                <span>Time Left</span>
                            </div>
                            <span className="font-mono text-primary">{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
                        </div>
                        <Progress value={timeLeft.progress} className="w-full h-2" />
                    </div>
                )}
                {isSubmitted && (
                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <Card className="flex-1 bg-green-50 dark:bg-green-900/20 border-green-500">
                            <CardHeader>
                                <CardTitle className="text-xl text-green-700 dark:text-green-400">Score: {getScore()} / {quizData.totalMarks}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Pressable>
                            <Button onClick={onReset} variant="default" size="lg" className="flex-shrink-0">
                                <Repeat className="mr-2 h-4 w-4" />
                                Take a New Quiz
                            </Button>
                        </Pressable>
                    </div>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-8">
                    {quizData.questions.map((q, qIndex) => (
                    <FadeIn key={qIndex} delay={qIndex * 0.1}>
                        <div className="p-4 border rounded-lg bg-card-foreground/5">
                            <div className="flex justify-between items-start mb-4">
                                <p className="font-semibold">{qIndex + 1}. {q.questionText}</p>
                                <div className="flex items-center gap-2 text-sm ml-4">
                                <span className={`font-bold px-2 py-1 rounded-full text-xs ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{q.difficulty}</span>
                                <span className="font-semibold text-primary px-2 py-1 rounded-md bg-primary/10">{q.marks} Mark{q.marks > 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                            {q.options.map((option, oIndex) => (
                                <Pressable key={oIndex}>
                                    <div 
                                        className={`flex items-center space-x-3 p-3 border-2 rounded-md transition-all ${isSubmitted ? '' : 'cursor-pointer hover:border-primary'} ${getOptionStyling(q, qIndex, oIndex)}`}
                                        onClick={() => !isSubmitted && onAnswerSelect(qIndex, oIndex)}
                                    >
                                        <input 
                                            type="radio" 
                                            name={`q-${qIndex}`} 
                                            id={`q-${qIndex}-o-${oIndex}`}
                                            checked={userAnswers[qIndex] === oIndex}
                                            onChange={() => !isSubmitted && onAnswerSelect(qIndex, oIndex)}
                                            className="form-radio h-4 w-4 text-primary accent-primary focus:ring-primary"
                                            disabled={isSubmitted}
                                        />
                                        <Label htmlFor={`q-${qIndex}-o-${oIndex}`} className={`flex-1 ${isSubmitted ? '' : 'cursor-pointer'}`}>{option}</Label>
                                        {isSubmitted && userAnswers[qIndex] === oIndex && q.correctAnswerIndex !== oIndex && <X className="h-6 w-6 text-red-600 flex-shrink-0" />}
                                        {isSubmitted && oIndex === q.correctAnswerIndex && <Check className="h-6 w-6 text-green-600 flex-shrink-0" />}
                                    </div>
                                </Pressable>
                            ))}
                            </div>
                            {isSubmitted && (
                                <FadeIn delay={0.2}>
                                    <div className="mt-4 p-4 bg-accent/30 border border-accent/50 rounded-md text-sm">
                                        <p className="font-bold flex items-center mb-1 text-base"><Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />Explanation</p>
                                        <p className="text-muted-foreground">{q.explanation}</p>
                                    </div>
                                </FadeIn>
                            )}
                        </div>
                    </FadeIn>
                    ))}
                </div>

                {!isSubmitted && (
                    <Pressable>
                        <Button onClick={() => onSubmit(false)} className="mt-8 w-full" size="lg">
                            Submit Quiz
                        </Button>
                    </Pressable>
                )}
            </CardContent>
            </Card>
        </FadeIn>
    );
}
