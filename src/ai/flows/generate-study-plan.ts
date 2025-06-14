
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized DAILY study plan.
 * It takes comprehensive user profile data (age, class, curriculum, school schedule, commute, etc.)
 * and daily inputs (current date, today's homework, today's commitments)
 * to generate an optimal daily study plan.
 *
 * @interface GenerateStudyPlanInput - The combined input type for profile and daily data.
 * @interface GenerateStudyPlanOutput - The output type for the generated daily study plan.
 * @function generateStudyPlan - The main function to generate the daily study plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// This schema now combines profile and daily inputs.
const GenerateStudyPlanInputSchema = z.object({
  // Profile fields
  age: z.number().describe('The age of the student.'),
  class: z.string().describe('The current class or grade of the student.'),
  curriculum: z.string().describe('The curriculum or syllabus the student is following (e.g., subjects like Math, Science, History). This is for general study.'),
  schoolStartTime: z.string().describe('The time school starts, in HH:MM format (e.g., 08:00).'),
  schoolEndTime: z.string().describe('The time school ends, in HH:MM format (e.g., 15:00).'),
  commuteTime: z.string().optional().describe('Estimated daily round-trip commute time (e.g., "30 minutes each way" or "1 hour total"). This time should be factored in before school and after school.'),
  earlyMorningStudy: z.boolean().describe('Whether the student is willing to wake up early to study before school.'),
  examDate: z.string().describe('The date of the student\'s next major exam (YYYY-MM-DD). This provides context for study priorities.'),
  
  // Daily fields
  currentDate: z.string().describe('The specific date (YYYY-MM-DD) for which this daily plan is being generated.'),
  commitmentsToday: z
    .string()
    .optional()
    .describe(
      "A description of fixed commitments the student has *for today* (the 'currentDate'), and the time slots they take up. e.g., 'Guitar lesson 4-5 PM, Dinner with family 7-8 PM'"
    ),
  homeworkDetailsToday: z
    .string()
    .optional()
    .describe('Details about specific homework assignments to be completed *today* (the \'currentDate\'), including subject, specific tasks, and estimated time for each. e.g., "Math: Complete Algebra Chapter 3 exercises (1 hour), History: Research and write outline for Chapter 5 essay (1.5 hours)"'),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe("The generated *daily* study plan for the specified 'currentDate'. It should be detailed, listing specific times, subjects/tasks from curriculum and homework, breaks, and ensuring at least 8 hours of sleep. It should be structured clearly, perhaps chronologically or by time blocks."),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const generateStudyPlanPrompt = ai.definePrompt({
  name: 'generateDailyStudyPlanPrompt', 
  input: {schema: GenerateStudyPlanInputSchema},
  output: {schema: GenerateStudyPlanOutputSchema},
  prompt: `You are an expert study plan generator. Your task is to create a detailed and personalized *daily* study plan for a student for *today, {{currentDate}}*.

Student Profile:
  Age: {{{age}}}
  Class/Grade: {{{class}}}
  Curriculum/Subjects for General Study: {{{curriculum}}}
  School Day: Starts at {{{schoolStartTime}}} and ends at {{{schoolEndTime}}}.
  Commute Time: {{{commuteTime}}}
  Willing to study early in the morning (before school): {{{earlyMorningStudy}}}
  Next Major Exam Date: {{{examDate}}} (Keep this in mind for general subject prioritization).

Today's Details (for {{currentDate}}):
  Commitments Today: {{{commitmentsToday}}}
  Homework to Complete Today (Subject, Task, Estimated Time): {{{homeworkDetailsToday}}}

Instructions for Generating the Daily Plan for {{currentDate}}:
1.  The plan MUST be for a single day: {{currentDate}}.
2.  Factor in School and Commute: Calculate total school duration. Block out time for {{{commuteTime}}} (if provided) before school starts and after school ends.
3.  Schedule Homework First: Prioritize and schedule all specific tasks listed in "Homework to Complete Today" ({{{homeworkDetailsToday}}}). Ensure each task is explicitly mentioned with its subject and estimated time, allocating dedicated time slots.
4.  Incorporate Commitments: After scheduling homework, fit in any "Commitments Today" ({{{commitmentsToday}}}) into the schedule.
5.  **Allocate Dedicated Study Time for Curriculum Subjects:** After homework and commitments are scheduled, use any remaining available time to create focused study blocks for subjects listed in the student's general "Curriculum/Subjects for General Study" ({{{curriculum}}}).
    *   **Purpose:** These study blocks are for general learning, revision of topics, pre-reading, or deeper understanding, distinct from completing specific homework tasks.
    *   **Prioritization:** Focus on subjects that are important for the "Next Major Exam Date" ({{{examDate}}}), or subjects that did NOT have specific homework assigned for today under "Homework to Complete Today".
    *   **Balance:** Aim for a balanced review of curriculum subjects. If a subject had extensive homework today, a shorter general study block (or none) for that specific subject might be appropriate for {{currentDate}}, allowing focus on other curriculum areas.
    *   If "homeworkDetailsToday" is empty or not provided, then the primary focus of study blocks should be on these "Curriculum/Subjects for General Study".
6.  Early Morning Study: If {{{earlyMorningStudy}}} is true, consider scheduling a study block (either for homework or general curriculum study) before school (and before commute, if applicable).
7.  Include Breaks and Meals: Integrate short breaks (e.g., 10-15 minutes) after study or homework blocks. Also include longer breaks for meals (e.g., breakfast, lunch, dinner).
8.  Ensure Sufficient Sleep: The plan must allow for at least 8 hours of sleep. Calculate a realistic bedtime and wake-up time, considering school start, commute, and any early morning study preferences.
9.  Clear Structure: Present the plan chronologically with specific time slots (e.g., "7:00 AM - 7:30 AM: Breakfast", "3:30 PM - 4:30 PM: Math Homework - Algebra Ch3", "5:00 PM - 6:00 PM: Study Physics - Chapter 4 Review").
10. Be Realistic: Avoid over-scheduling. The plan should be achievable and sustainable for a single day.
11. Handling Missing Information:
    *   If "commitmentsToday" is not provided or empty, proceed without scheduling fixed commitments.
    *   If "homeworkDetailsToday" is not provided or empty, state "No specific homework listed for today." in your reasoning (if you expose it) and focus all study time on the "Curriculum/Subjects for General Study".
    *   If "commuteTime" is not provided or empty, assume no commute time.

Generate the detailed daily study plan now for {{currentDate}}.
`,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateDailyStudyPlanFlow', 
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await generateStudyPlanPrompt(input);
    return output!;
  }
);

