'use server';
/**
 * @fileOverview Flow for improving an existing study plan based on user feedback.
 *
 * - improveStudyPlan - A function that takes user feedback and an existing study plan to refine and generate an improved version.
 * - ImproveStudyPlanInput - The input type for the improveStudyPlan function.
 * - ImproveStudyPlanOutput - The return type for the improveStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveStudyPlanInputSchema = z.object({
  existingStudyPlan: z
    .string()
    .describe('The existing study plan in a readable format.'),
  userFeedback: z
    .string()
    .describe(
      'Specific feedback from the user on how to improve the study plan.'
    ),
  originalUserInput: z
    .string()
    .describe(
      'The original input from the user that was used to generate the study plan.'
    ),
});
export type ImproveStudyPlanInput = z.infer<typeof ImproveStudyPlanInputSchema>;

const ImproveStudyPlanOutputSchema = z.object({
  improvedStudyPlan: z
    .string()
    .describe('The improved study plan based on the user feedback.'),
});
export type ImproveStudyPlanOutput = z.infer<typeof ImproveStudyPlanOutputSchema>;

export async function improveStudyPlan(input: ImproveStudyPlanInput): Promise<ImproveStudyPlanOutput> {
  return improveStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveStudyPlanPrompt',
  input: {schema: ImproveStudyPlanInputSchema},
  output: {schema: ImproveStudyPlanOutputSchema},
  prompt: `You are an AI study plan assistant. A user has provided an existing study plan and feedback on how to improve it. Use the existing study plan, the user feedback, and the original user input to generate an improved study plan.

Original User Input: {{{originalUserInput}}}

Existing Study Plan:
{{{existingStudyPlan}}}

User Feedback:
{{{userFeedback}}}

Improved Study Plan:`,
});

const improveStudyPlanFlow = ai.defineFlow(
  {
    name: 'improveStudyPlanFlow',
    inputSchema: ImproveStudyPlanInputSchema,
    outputSchema: ImproveStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
