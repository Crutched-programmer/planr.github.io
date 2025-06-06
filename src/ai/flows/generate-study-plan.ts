'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized study plan based on user inputs.
 *
 * The flow takes in user data such as age, class, curriculum, exam date, commitments, school schedule, and sleep preferences,
 * and generates an optimal study plan with study blocks, short breaks, commitment blocks, and at least 8 hours of sleep.
 *
 * @interface GenerateStudyPlanInput - The input type for the generateStudyPlan function.
 * @interface GenerateStudyPlanOutput - The output type for the generateStudyPlan function.
 * @function generateStudyPlan - The main function to generate the study plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyPlanInputSchema = z.object({
  age: z.number().describe('The age of the student.'),
  class: z.string().describe('The current class or grade of the student.'),
  curriculum: z.string().describe('The curriculum or syllabus the student is following.'),
  examDate: z.string().describe('The date of the upcoming exam.'),
  commitments: z
    .string()
    .describe(
      'A description of other commitments the student has, and the time slots they take up.'
    ),
  schoolStartTime: z.string().describe('The time school starts, in HH:MM format.'),
  schoolEndTime: z.string().describe('The time school ends, in HH:MM format.'),
  earlyMorningStudy: z
    .boolean()
    .describe('Whether the student is willing to wake up early to study.'),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe('The generated study plan. Include specific times, and specific subjects to study at each time.'),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const generateStudyPlanPrompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: {schema: GenerateStudyPlanInputSchema},
  output: {schema: GenerateStudyPlanOutputSchema},
  prompt: `You are an expert study plan generator.

  Based on the following information, generate a personalized study plan for the student. The study plan should include study blocks, short breaks, commitment blocks, and at least 8 hours of sleep from the prescribed wake up time.

  Age: {{{age}}}
  Class: {{{class}}}
  Curriculum: {{{curriculum}}}
  Exam Date: {{{examDate}}}
  Commitments: {{{commitments}}}
  School Start Time: {{{schoolStartTime}}}
  School End Time: {{{schoolEndTime}}}
  Willing to wake up early to study: {{{earlyMorningStudy}}}

  Ensure the study plan is realistic and takes into account the student's commitments and preferences. Specify times and subjects to study at each time.
  `,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await generateStudyPlanPrompt(input);
    return output!;
  }
);
