
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized DAILY study plan.
 * It takes comprehensive user profile data (age, class, curriculum, school schedule, commute, etc.)
 * and daily inputs (current date, today's homework with deadlines, today's commitments)
 * to generate an optimal daily study plan with ample study time and at least 8 hours of sleep.
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
    .describe('Details about specific homework assignments to be completed *today* (the \'currentDate\'), including subject, specific tasks, estimated time for each, AND THEIR DEADLINES. e.g., "Math: Complete Algebra Chapter 3 exercises (1 hour, Due EOD), History: Research and write outline for Chapter 5 essay (1.5 hours, Due Tomorrow Morning)"'),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe("The generated *daily* study plan for the specified 'currentDate'. It should be detailed, listing specific times, subjects/tasks from curriculum and homework (considering deadlines), breaks, ensuring at least 8 hours of sleep, and allocating A LOT of time for general curriculum study. The plan should be easily readable as plain text, with each scheduled item on a new line, using natural language and avoiding markdown or excessive brackets."),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const generateStudyPlanPrompt = ai.definePrompt({
  name: 'generateDailyStudyPlanPrompt', 
  input: {schema: GenerateStudyPlanInputSchema},
  output: {schema: GenerateStudyPlanOutputSchema},
  prompt: `You are an expert study plan generator. Your task is to create a detailed, effective, and personalized *daily* study plan for a student for *today, {{currentDate}}*. It is CRUCIAL that this plan includes A LOT OF DEDICATED STUDY TIME for general curriculum subjects, in addition to any homework, AND ENSURES AT LEAST 8 HOURS OF SLEEP.

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
  Homework to Complete Today (Subject, Task, Estimated Time, DEADLINE): {{{homeworkDetailsToday}}}

Instructions for Generating the Daily Plan for {{currentDate}}:
1.  The plan MUST be for a single day: {{currentDate}}.
2.  Factor in School and Commute: Calculate total school duration. Block out time for {{{commuteTime}}} (if provided) before school starts and after school ends.
3.  Schedule Homework First, Considering Deadlines: Prioritize and schedule all specific tasks listed in "Homework to Complete Today" ({{{homeworkDetailsToday}}}). Ensure each task is explicitly mentioned with its subject, estimated time, and pay close attention to any mentioned DEADLINES to schedule them appropriately.
4.  Incorporate Commitments: After scheduling homework, fit in any "Commitments Today" ({{{commitmentsToday}}}) into the schedule.
5.  **Allocate A LOT OF Dedicated Study Time for Curriculum Subjects:** This is extremely important. After homework and commitments are scheduled, use any remaining available time to create significant, focused study blocks for subjects listed in the student's general "Curriculum/Subjects for General Study" ({{{curriculum}}}).
    *   **Purpose:** These study blocks are for general learning, revision of topics, pre-reading, or deeper understanding, distinct from completing specific homework tasks.
    *   **Prioritization:** Focus on subjects that are important for the "Next Major Exam Date" ({{{examDate}}}), or subjects that did NOT have specific homework assigned for today under "Homework to Complete Today". Subjects with upcoming deadlines (from homework) might need less general study today if the homework covers them, to allow for other subjects.
    *   **Balance and Depth:** Aim for a balanced review of curriculum subjects but ensure enough depth for meaningful study. If homework is light for the day, this means MORE time should be dedicated to general curriculum study. Do not just fill small gaps; create substantial study periods.
    *   If "homeworkDetailsToday" is empty or not provided, then the primary focus of study blocks should be on these "Curriculum/Subjects for General Study", and these blocks should be extensive.
6.  Early Morning Study: If {{{earlyMorningStudy}}} is true, consider scheduling a study block (either for homework or general curriculum study) before school (and before commute, if applicable).
7.  Include Breaks and Meals: Integrate short breaks (e.g., 10-15 minutes) after study or homework blocks. Also include longer breaks for meals (e.g., breakfast, lunch, dinner).
8.  **Ensure Sufficient Sleep: The plan MUST allow for at least 8 hours of sleep.** Calculate a realistic bedtime and wake-up time, considering school start time ({{{schoolStartTime}}}), commute time ({{{commuteTime}}}), and any early morning study preferences ({{{earlyMorningStudy}}}). Schedule sleep accordingly.
9.  Clear Structure: Present the plan chronologically. Each entry should clearly state the time slot (e.g., '7:00 AM - 7:30 AM'), followed by the activity or subject (e.g., 'Breakfast', 'Math Homework: Algebra Ch3, Due EOD', 'STUDY: Physics - Chapter 4 Review'). **Use simple, natural language for descriptions. Avoid using markdown list characters (like hyphens or asterisks at the start of lines), excessive brackets, or overly technical jargon. The plan should be easily readable as plain text, with each scheduled item on a new line.**
10. Be Realistic but Rigorous: Avoid over-scheduling, but ensure the plan is challenging enough to be productive, especially with ample general study time and guaranteed sleep.
11. Handling Missing Information:
    *   If "commitmentsToday" is not provided or empty, proceed without scheduling fixed commitments.
    *   If "homeworkDetailsToday" is not provided or empty, state "No specific homework listed for today." in your reasoning (if you expose it) and focus all study time HEAVILY on the "Curriculum/Subjects for General Study".
    *   If "commuteTime" is not provided or empty, assume no commute time.

Generate the detailed daily study plan now for {{currentDate}}, ensuring it has a strong emphasis on general curriculum study time AND guarantees at least 8 hours of sleep.
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

