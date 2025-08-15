
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Info, BookOpenCheck, ListChecks, Brain } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { DailyInputsFormData } from '@/lib/types';
import { DailyInputsSchema } from '@/lib/types';

interface DailyPlanFormProps {
  onGeneratePlan: (data: DailyInputsFormData) => Promise<void>;
  isLoading: boolean;
}

const LOCAL_STORAGE_KEY_DAILY = 'planrDailyInputs';


function DailyPlanFormComponent({ onGeneratePlan, isLoading }: DailyPlanFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<DailyInputsFormData>({
    resolver: zodResolver(DailyInputsSchema),
    defaultValues: {
      currentDate: new Date(), 
      topicsCoveredToday: '',
      commitmentsToday: '',
      homeworkDetailsToday: '',
    },
  });

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY_DAILY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as Partial<DailyInputsFormData>;
        if (parsedData.currentDate && typeof parsedData.currentDate === 'string') {
          parsedData.currentDate = new Date(parsedData.currentDate);
        } else if (!parsedData.currentDate) {
          parsedData.currentDate = new Date(); 
        }
        form.reset(parsedData);
      }
    } catch (error) {
      console.error("Failed to load daily inputs from localStorage", error);
    }
  }, [form]);

  useEffect(() => {
    if (!isMounted) return;
    const subscription = form.watch((value) => {
      try {
        
        const dataToSave = {
            ...value,
            currentDate: value.currentDate ? value.currentDate.toISOString() : new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY_DAILY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to save daily inputs to localStorage", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isMounted]);


  const onSubmit = (data: DailyInputsFormData) => {
    onGeneratePlan(data);
  };
  
  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => ( // Increased for new field
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
          </div>
        ))}
        <div className="h-12 bg-muted rounded w-1/3 animate-pulse"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="currentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date for Plan</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Select the date you want to plan for.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topicsCoveredToday"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                What were the key topics covered in class?
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Math: Introduction to Trigonometry, History: Chapter 7 discussion on The Revolution, Science: Lab on Photosynthesis."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Briefly note main concepts or chapters taught today. 
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="homeworkDetailsToday"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <BookOpenCheck className="mr-2 h-5 w-5 text-primary" />
                Homework for Today
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Math: Algebra worksheet Ch3 (1 hour, Due EOD). History: Read Chapter 5 & answer Qs (1.5 hours, Due Tomorrow Morning)."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List specific homework tasks for today: subject, task, estimated time, and its deadline.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commitmentsToday"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary" />
                Other Commitments for Today
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Doctor's appointment 2-3 PM, Piano practice 5-6 PM"
                  className="resize-none min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include times for any fixed appointments or activities today.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center p-3 text-sm text-foreground bg-accent/30 border border-accent/50 rounded-md">
          <Info className="h-5 w-5 mr-2 text-accent-foreground flex-shrink-0" />
          <p>Today's inputs are saved locally. The AI will combine this with your profile to generate the plan.</p>
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Timetable on the way ...
            </>
          ) : (
            'Generate My Timetable!'
          )}
        </Button>
      </form>
    </Form>
  );
}

export const DailyPlanForm = React.memo(DailyPlanFormComponent);
