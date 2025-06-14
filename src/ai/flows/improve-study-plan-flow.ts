
'use server';
/**
 * @fileOverview Flow for improving an existing daily study plan based on user feedback.
 *
 * - improveStudyPlan - A function that takes user feedback, an existing daily study plan, and the original combined (profile + daily) user input to refine and generate an improved version.
 * - ImproveStudyPlanInput - The input type for the improveStudyPlan function.
 * - ImproveStudyPlanOutput - The return type for the improveStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveStudyPlanInputSchema = z.object({
  existingStudyPlan: z
    .string()
    .describe('The existing daily study plan in a readable format.'),
  userFeedback: z
    .string()
    .describe(
      'Specific feedback from the user on how to improve the daily study plan.'
    ),
  originalUserInput: z
    .string()
    .describe(
      'The original combined (profile and daily) user input, as a JSON string, that was used to generate the existing study plan. This contains details like age, class, curriculum, school times, exam date, and the specific daily inputs (current date, homework, commitments for that day).'
    ),
});
export type ImproveStudyPlanInput = z.infer<typeof ImproveStudyPlanInputSchema>;

const ImproveStudyPlanOutputSchema = z.object({
  improvedStudyPlan: z
    .string()
    .describe('The improved daily study plan based on the user feedback and original context. It should be easily readable as plain text, with each scheduled item on a new line, using natural language and avoiding markdown or excessive brackets, and still ensure at least 8 hours of sleep.'),
});
export type ImproveStudyPlanOutput = z.infer<typeof ImproveStudyPlanOutputSchema>;

export async function improveStudyPlan(input: ImproveStudyPlanInput): Promise<ImproveStudyPlanOutput> {
  return improveStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveDailyStudyPlanPrompt', // Renamed for clarity
  input: {schema: ImproveStudyPlanInputSchema},
  output: {schema: ImproveStudyPlanOutputSchema},
  prompt: `You are an AI study plan assistant. A user has provided an existing *daily* study plan and feedback on how to improve it.
You also have the original user inputs (profile and daily details) that led to this plan.

Original User Input (Profile & Daily Details for the plan's date):
{{{originalUserInput}}}

Existing Daily Study Plan:
{{{existingStudyPlan}}}

User Feedback for Improvement:
{{{userFeedback}}}

Instructions for Improving the Daily Plan:
1.  Carefully consider the user's feedback and apply the requested changes to the "Existing Daily Study Plan".
2.  Refer to the "Original User Input" to ensure the improved plan still respects the student's profile (age, school times, curriculum, exam context) and the original daily context (the date this plan is for, original homework/commitments if not overridden by feedback).
3.  **Crucially, the improved plan MUST still ensure at least 8 hours of sleep.** Adjust schedules accordingly to maintain this requirement.
4.  The improved plan must remain a *daily* plan for the same date as the original.
5.  Ensure all core requirements of a good study plan are met: scheduled tasks (homework, curriculum study), breaks, school time, and at least 8 hours of sleep.
6.  If the feedback is vague, make reasonable adjustments. If it contradicts a fundamental constraint (like not enough time for sleep after applying feedback), try to find the best possible compromise or explicitly state in the plan if a requested change cannot be fully met without sacrificing sleep (though ideally, produce a usable plan that meets the sleep requirement).
7.  The output should be only the "Improved Study Plan", well-structured and clear. **It should follow a human-readable, line-by-line format: each entry with a time slot and a natural language description of the activity or subject. Avoid markdown list characters (like hyphens or asterisks at the start of lines), excessive brackets, or technical jargon.**

Generate the improved daily study plan now.
Improved Daily Study Plan:`,
});

const improveStudyPlanFlow = ai.defineFlow(
  {
    name: 'improveDailyStudyPlanFlow', // Renamed for clarity
    inputSchema: ImproveStudyPlanInputSchema,
    outputSchema: ImproveStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

