"use client";

import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { StudyPlanFormData, GenerateStudyPlanInput } from '@/lib/types';
import { StudyPlanFormSchema } from '@/lib/types';

interface StudyPlanFormProps {
  onGeneratePlan: (data: GenerateStudyPlanInput) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<StudyPlanFormData>;
}

const LOCAL_STORAGE_KEY = 'studyZenFormData';

export function StudyPlanForm({ onGeneratePlan, isLoading, initialData }: StudyPlanFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<StudyPlanFormData>({
    resolver: zodResolver(StudyPlanFormSchema),
    defaultValues: {
      age: undefined,
      class: '',
      curriculum: '',
      examDate: undefined,
      commitments: '',
      schoolStartTime: '08:00',
      schoolEndTime: '15:00',
      earlyMorningStudy: false,
      ...initialData,
    },
  });

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as Partial<StudyPlanFormData>;
        // Ensure date is properly reconstituted
        if (parsedData.examDate) {
          parsedData.examDate = new Date(parsedData.examDate);
        }
        form.reset(parsedData);
      }
    } catch (error) {
      console.error("Failed to load form data from localStorage", error);
    }
  }, [form]);

  useEffect(() => {
    if (!isMounted) return;
    const subscription = form.watch((value) => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
      } catch (error) {
        console.error("Failed to save form data to localStorage", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isMounted]);


  const onSubmit = (data: StudyPlanFormData) => {
    const aiInput: GenerateStudyPlanInput = {
      ...data,
      examDate: format(data.examDate, 'yyyy-MM-dd'),
      commitments: data.commitments || "No specific other commitments.", // Provide default if empty
    };
    onGeneratePlan(aiInput);
  };
  
  // Helper for time input to ensure HH:MM format always
  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>, fieldName: "schoolStartTime" | "schoolEndTime") => {
    let value = e.target.value;
    // Basic attempt to keep it as time format, you might want a more robust time picker
    if (value.length === 2 && !value.includes(':') && parseInt(value,10) <= 23) {
      value = value + ':';
    }
    if (value.length === 5) {
       const [hours, minutes] = value.split(':');
       if(parseInt(hours,10) > 23 || parseInt(minutes,10) > 59) {
        // Invalid time, don't update or show error
        return;
       }
    }
    form.setValue(fieldName, value);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 16" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class / Grade</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 10th Grade or Year 11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="curriculum"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Curriculum / Subjects</FormLabel>
              <FormControl>
                <Input placeholder="e.g., GCSE Maths, Physics, Chemistry or IB HL subjects" {...field} />
              </FormControl>
              <FormDescription>
                List main subjects or curriculum name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="examDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Nearest Exam Date</FormLabel>
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
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Disable past dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="schoolStartTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Start Time</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field} 
                    onChange={(e) => handleTimeChange(e, "schoolStartTime")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schoolEndTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School End Time</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field} 
                    onChange={(e) => handleTimeChange(e, "schoolEndTime")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="commitments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Commitments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Piano lessons Tuesdays 5-6 PM, Football practice Fridays 4-6 PM"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include times for regular commitments outside of school.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="earlyMorningStudy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Willing to wake up early for study?
                </FormLabel>
                <FormDescription>
                  Check this if you're open to study sessions before school.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex items-center p-3 text-sm text-foreground bg-accent/30 border border-accent/50 rounded-md">
          <Info className="h-5 w-5 mr-2 text-accent-foreground" />
          <p>Your data is saved locally in your browser for convenience. It is not sent anywhere until you generate a plan.</p>
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Plan...
            </>
          ) : (
            'Generate Study Plan'
          )}
        </Button>
      </form>
    </Form>
  );
}
