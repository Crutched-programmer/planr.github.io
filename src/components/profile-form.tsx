"use client";

import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Info, Save } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import type { ProfileFormData } from '@/lib/types';
import { ProfileDataSchema } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY_PROFILE = 'studyZenProfileData';

export function ProfileForm() {
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileDataSchema),
    defaultValues: {
      age: undefined, // Will be handled by input type="number" correctly
      class: '',
      curriculum: '',
      examDate: undefined,
      schoolStartTime: '08:00',
      schoolEndTime: '15:00',
      earlyMorningStudy: false,
    },
  });

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as Partial<ProfileFormData>;
        if (parsedData.examDate && typeof parsedData.examDate === 'string') {
          parsedData.examDate = parseISO(parsedData.examDate); // Ensure date is object
        }
        // Ensure age is number or undefined for the form
        if (parsedData.age !== undefined && parsedData.age !== null && parsedData.age !== '') {
            parsedData.age = Number(parsedData.age);
        } else {
            parsedData.age = undefined; // Or provide a default number if required by schema for empty like 0
        }
        form.reset(parsedData);
      }
    } catch (error) {
      console.error("Failed to load profile data from localStorage", error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Could not load saved profile data.",
      });
    }
  }, [form, toast]); // Added toast to dependency array

  const onSubmit = (data: ProfileFormData) => {
    try {
      // Format date to string before saving, if it's a Date object
      const dataToSave = {
        ...data,
        examDate: data.examDate ? format(data.examDate, 'yyyy-MM-dd') : undefined,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(dataToSave));
      toast({
        title: "Profile Saved!",
        description: "Your profile information has been updated locally.",
      });
    } catch (error) {
      console.error("Failed to save profile data to localStorage", error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Could not save your profile data.",
      });
    }
  };
  
  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>, fieldName: "schoolStartTime" | "schoolEndTime") => {
    form.setValue(fieldName, e.target.value);
  };

  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 16" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                    value={field.value === undefined ? '' : field.value}
                  />
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
              <FormLabel>Curriculum / Main Subjects</FormLabel>
              <FormControl>
                <Input placeholder="e.g., GCSE Maths, Physics, Chemistry" {...field} />
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
              <FormLabel>Next Major Exam Date (Approx.)</FormLabel>
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
                    // disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>This helps prioritize subjects over the long term.</FormDescription>
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
          name="earlyMorningStudy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
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
        
        <Button type="submit" className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Profile
        </Button>
      </form>
    </Form>
  );
}
