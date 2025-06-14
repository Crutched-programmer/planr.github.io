import { z } from "zod";
// Ensure this path is correct if GenerateStudyPlanInput from AI flow is different
// For now, we define the combined type here for clarity and use in forms.

// Schema for data that is relatively constant
export const ProfileDataSchema = z.object({
  age: z.coerce.number().min(5, "Age must be at least 5").max(100, "Age must be realistic"),
  class: z.string().min(1, "Class/Grade is required").max(50, "Class/Grade is too long"),
  curriculum: z.string().min(1, "Curriculum is required").max(100, "Curriculum is too long"),
  examDate: z.date({ required_error: "Approximate or next major exam date is required." }),
  schoolStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  schoolEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  earlyMorningStudy: z.boolean().default(false),
  // commuteTime: z.string().optional().describe("e.g., 30 minutes each way"), // Example: if needed later
}).refine(data => {
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
  commitmentsToday: z.string().max(500, "Today's commitments description is too long").optional(),
  homeworkDetailsToday: z.string().max(1000, "Today's homework details are too long. Please summarize.").optional(),
});
export type DailyInputsFormData = z.infer<typeof DailyInputsSchema>;


// Combined type that will be sent to the AI generateStudyPlan flow
// This aligns with the updated GenerateStudyPlanInputSchema in the AI flow
export const CombinedStudyPlanInputSchema = ProfileDataSchema.extend({
  currentDate: z.string().describe("The date for which the plan is being generated, YYYY-MM-DD."), // String for AI
  examDate: z.string().describe("The date of the upcoming major exam, YYYY-MM-DD."), // String for AI
  commitmentsToday: z.string().optional().describe("Commitments for today."),
  homeworkDetailsToday: z.string().optional().describe("Homework for today."),
});
export type CombinedStudyPlanInput = z.infer<typeof CombinedStudyPlanInputSchema>;

// Type for the AI Flow itself, matching src/ai/flows/generate-study-plan.ts
// This is what the AI flow `generateStudyPlan` function expects.
export type GenerateStudyPlanInput = CombinedStudyPlanInput;
