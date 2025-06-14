
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized DAILY study plan.
 * It takes comprehensive user profile data (age, class, curriculum, school schedule, commute, hobbies, etc.)
 * and daily inputs (current date, topics covered in class, today's homework with deadlines, today's commitments)
 * to generate an optimal daily study plan focusing on post-school hours, with ample study time, hobby integration, and at least 8 hours of sleep.
 *
 * @interface GenerateStudyPlanInput - The combined input type for profile and daily data.
 * @interface GenerateStudyPlanOutput - The output type for the generated daily study plan.
 * @function generateStudyPlan - The main function to generate the daily study plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  hobbies: z.string().optional().describe("Student's hobbies and preferred time for them (e.g., 'Reading (1 hour), Piano (30 mins)')."),
  
  // Daily fields
  currentDate: z.string().describe('The specific date (YYYY-MM-DD) for which this daily plan is being generated.'),
  topicsCoveredToday: z.string().optional().describe("Main topics/chapters taught in class today (e.g., 'Math: Intro to Trigonometry, History: Chapter 7'). This can inform study session focus."),
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
  studyPlan: z.string().describe("The generated *daily* study plan for the specified 'currentDate'. It should be detailed, listing specific times, subjects/tasks from curriculum and homework (considering deadlines), hobbies, breaks, ensuring at least 8 hours of sleep, and allocating A LOT of time for general curriculum study. The plan should primarily detail the schedule *after school ends* until bedtime (and before school if earlyMorningStudy is true). The plan should be easily readable as plain text, with each scheduled item on a new line, using natural language and avoiding markdown or excessive brackets."),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const generateStudyPlanPrompt = ai.definePrompt({
  name: 'generateDailyStudyPlanPrompt', 
  input: {schema: GenerateStudyPlanInputSchema},
  output: {schema: GenerateStudyPlanOutputSchema},
  prompt: `You are an expert study plan generator. Your task is to create a detailed, effective, and personalized *daily* study plan for a student for *today, {{currentDate}}*.
The plan MUST include A LOT OF DEDICATED STUDY TIME for general curriculum subjects, IN ADDITION to any homework.
The plan MUST ensure AT LEAST 8 HOURS OF SLEEP.
The detailed scheduling of activities should PRIMARILY FOCUS on the period AFTER school ends until bedtime. If early morning study is preferred, schedule that too.

Student Profile:
  Age: {{{age}}}
  Class/Grade: {{{class}}}
  Curriculum/Subjects for General Study: {{{curriculum}}}
  School Day: Starts at {{{schoolStartTime}}} and ends at {{{schoolEndTime}}}.
  Commute Time: {{{commuteTime}}}
  Willing to study early in the morning (before school): {{{earlyMorningStudy}}}
  Next Major Exam Date: {{{examDate}}} (Keep this in mind for general subject prioritization).
  Hobbies & Leisure: {{{hobbies}}} (Try to include some time for these if possible and if time is specified).

Today's Details (for {{currentDate}}):
  Topics Covered in Class Today: {{{topicsCoveredToday}}} (Use this to inform study sessions if applicable, e.g., reviewing these topics).
  Commitments Today: {{{commitmentsToday}}}
  Homework to Complete Today (Subject, Task, Estimated Time, DEADLINE): {{{homeworkDetailsToday}}}

Instructions for Generating the Daily Plan for {{currentDate}}:
1.  The plan MUST be for a single day: {{currentDate}}.
2.  Acknowledge School & Commute: Note the block of time for school ({{{schoolStartTime}}} to {{{schoolEndTime}}}) and {{{commuteTime}}}. The detailed scheduling of activities in the output plan should primarily start *after* the school day (plus commute home) and continue until bedtime.
3.  Early Morning Study: If {{{earlyMorningStudy}}} is true, schedule a detailed study block (for homework or general curriculum) before school (and before commute, if applicable).
4.  Schedule Homework First, Considering Deadlines: Prioritize and schedule all specific tasks listed in "Homework to Complete Today" ({{{homeworkDetailsToday}}}). Ensure each task is explicitly mentioned with its subject, estimated time, and pay close attention to any mentioned DEADLINES to schedule them appropriately. This occurs in the post-school period or early morning if applicable.
5.  Incorporate Commitments: After scheduling homework, fit in any "Commitments Today" ({{{commitmentsToday}}}) into the post-school schedule.
6.  **Allocate A LOT OF DEDICATED STUDY TIME for General Curriculum Subjects:** This is CRITICALLY IMPORTANT and a PRIMARY GOAL. This study time is for general learning and revision of topics from {{{curriculum}}}, and is SEPARATE FROM and IN ADDITION TO any time spent on specific "Homework to Complete Today".
    *   **Focus:** Schedule these blocks mainly in the post-school period.
    *   **Content:** If "Topics Covered in Class Today" ({{{topicsCoveredToday}}}) are provided, prioritize reviewing or practicing these. Otherwise, focus on general curriculum subjects.
    *   **Prioritization for Curriculum:** Focus on subjects that are important for the "Next Major Exam Date" ({{{examDate}}}), or subjects that did NOT have specific homework assigned for today. Subjects with upcoming deadlines (from homework) might need less general study today if the homework covers them, to allow for other subjects.
    *   **Balance and Depth:** Aim for a balanced review but ensure enough depth. If homework is light, this means **EVEN MORE TIME** should be dedicated to general curriculum study. Create **SUBSTANTIAL, UNINTERRUPTED** study periods.
    *   If "homeworkDetailsToday" is empty, then the **ENTIRE FOCUS** of study blocks should be on "Curriculum/Subjects for General Study" and "Topics Covered in Class Today", and these blocks should be **EXTENSIVE AND NUMEROUS**.
7.  Integrate Hobbies: If "Hobbies & Leisure" ({{{hobbies}}}) are listed, try to allocate some reasonable time for them in the post-school schedule, ensuring it does not compromise essential study or sleep.
8.  Include Breaks and Meals: Integrate short breaks (e.g., 10-15 minutes) after study/homework blocks. Also include longer breaks for meals (e.g., breakfast, lunch, dinner) within the relevant parts of the day (e.g., dinner in the evening).
9.  **Ensure Sufficient Sleep: The plan MUST allow for at least 8 hours of sleep.** Calculate a realistic bedtime and wake-up time, considering school start time ({{{schoolStartTime}}}), commute time ({{{commuteTime}}}), and any early morning study preferences ({{{earlyMorningStudy}}}). Schedule sleep accordingly. This is a non-negotiable requirement.
10. Clear Structure: Present the plan chronologically. Each entry should clearly state the time slot (e.g., '7:00 AM - 7:30 AM'), followed by the activity or subject. **Use simple, natural language for descriptions. Avoid using markdown list characters (like hyphens or asterisks at the start of lines), excessive brackets, or overly technical jargon. The plan should be easily readable as plain text, with each scheduled item on a new line.**
11. Be Realistic but Rigorous: Avoid over-scheduling, but ensure the plan is challenging enough to be productive, especially with ample general study time and guaranteed sleep. The focus of detailed activities should be *outside* of {{{schoolStartTime}}} to {{{schoolEndTime}}} hours (unless it's early morning study).
12. Handling Missing Information:
    *   If "commitmentsToday" is not provided or empty, proceed without scheduling them.
    *   If "homeworkDetailsToday" is not provided or empty, focus all study time HEAVILY on "Curriculum/Subjects for General Study" and "Topics Covered in Class Today".
    *   If "commuteTime" is not provided or empty, assume no commute time.
    *   If "hobbies" are not provided, do not schedule time for them.
    *   If "topicsCoveredToday" are not provided, general curriculum study should focus on {{{curriculum}}} broadly.

Generate the detailed daily study plan now for {{currentDate}}. The plan MUST feature A LOT OF DEDICATED STUDY TIME for general curriculum subjects and review of topics covered today. The plan MUST also guarantee at least 8 hours of sleep. The detailed scheduling should focus on time outside of school hours.
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
