import { z } from "zod";

// Base schema for profile form fields, without refinement
const ProfileFormFieldsSchema = z.object({
  age: z.coerce.number().min(5, "Age must be at least 5").max(100, "Age must be realistic").optional().nullable(),
  className: z.string().min(1, "Class/Grade is required").max(50, "Class/Grade is too long"),
  curriculum: z.string().min(1, "Curriculum is required").max(100, "Curriculum is too long"),
  examDate: z.date({ required_error: "Approximate or next major exam date is required." }),
  schoolStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  schoolEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  earlyMorningStudy: z.boolean().default(false),
  commuteTime: z.string().max(100, "Commute time description is too long (e.g., 30 mins each way)").optional().describe('Estimated daily round-trip commute time (e.g., "30 minutes each way" or "1 hour total").'),
  hobbies: z.string().max(200, "Hobbies description is too long. e.g., 'Reading (1 hour), Piano (30 mins)'").optional().describe("List your hobbies and preferred time for them, e.g., 'Basketball practice 2 hours, Painting 1 hour'"),
});

// Schema for data that is relatively constant, with refinement
// This is used by the ProfileForm
export const ProfileDataSchema = ProfileFormFieldsSchema.refine(data => {
  if (data.schoolStartTime && data.schoolEndTime) {
    const [startHour, startMinute] = data.schoolStartTime.split(':').map(Number);
    const [endHour, endMinute] = data.schoolEndTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    return endTime > startTime;
  }
  return true;
}, {
  message: "School end time must be after start time.",
  path: ["schoolEndTime"],
});
export type ProfileFormData = z.infer<typeof ProfileDataSchema>;


// Schema for data that changes daily
export const DailyInputsSchema = z.object({
  currentDate: z.date({ required_error: "Date for the plan is required."}),
  isLeaveDay: z.boolean().default(false).describe("A flag to indicate if the current date is a leave day (no school)."),
  topicsCoveredToday: z.string().max(500, "Summary of topics covered in class is too long.").optional().describe("Briefly, what main topics/chapters were taught in your classes today? e.g., 'Math: Intro to Trigonometry, History: Chapter 7 - The Revolution'"),
  commitmentsToday: z.string().max(500, "Today's commitments description is too long").optional(),
  homeworkDetailsToday: z.string().max(1000, "Today's homework details are too long. Please be concise but include subject, task, estimated time, and deadline for each.").optional(),
});
export type DailyInputsFormData = z.infer<typeof DailyInputsSchema>;


// Combined type that will be sent to the AI generateStudyPlan flow
export const CombinedStudyPlanInputSchema = ProfileFormFieldsSchema.extend({
  // Override examDate to be a string for the AI
  examDate: z.string().describe("The date of the upcoming major exam, YYYY-MM-DD."),
  // Add daily fields
  currentDate: z.string().describe("The date for which the plan is being generated, YYYY-MM-DD."),
  isLeaveDay: z.boolean().describe("A flag to indicate if the current date is a leave day (like a weekend or holiday), meaning no school."),
  topicsCoveredToday: z.string().optional().describe("Briefly, what main topics/chapters were taught in your classes today? e.g., 'Math: Intro to Trigonometry, History: Chapter 7 - The Revolution'"),
  commitmentsToday: z.string().optional().describe("Commitments for today, including time slots (e.g., 'Guitar lesson 4-5 PM')."),
  homeworkDetailsToday: z.string().optional().describe("Homework for today: subject, task, estimated time, AND DEADLINE (e.g., 'Math: Algebra Ch3 (1hr, Due EOD), History: Essay outline (1.5hr, Due tomorrow)')."),
}).refine(data => { // Re-apply the refinement as schoolStartTime and schoolEndTime are part of this schema
  if (data.schoolStartTime && data.schoolEndTime) {
    const [startHour, startMinute] = data.schoolStartTime.split(':').map(Number);
    const [endHour, endMinute] = data.schoolEndTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    return endTime > startTime;
  }
  return true;
}, {
  message: "School end time must be after start time.",
  path: ["schoolEndTime"],
});
export type CombinedStudyPlanInput = z.infer<typeof CombinedStudyPlanInputSchema>;

// Type for the AI Flow itself, matching src/ai/flows/generate-study-plan.ts
// This is what the AI flow `generateStudyPlan` function expects.
export type GenerateStudyPlanInput = CombinedStudyPlanInput;
