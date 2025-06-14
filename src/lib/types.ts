import { z } from "zod";
import type { GenerateStudyPlanInput as AIInputType } from '@/ai/flows/generate-study-plan';

export const StudyPlanFormSchema = z.object({
  age: z.coerce.number().min(5, "Age must be at least 5").max(100, "Age must be realistic"),
  class: z.string().min(1, "Class/Grade is required").max(50, "Class/Grade is too long"),
  curriculum: z.string().min(1, "Curriculum is required").max(100, "Curriculum is too long"),
  examDate: z.date({ required_error: "Exam date is required." }),
  commitments: z.string().max(500, "Commitments description is too long").optional(),
  homeworkDetails: z.string().max(1000, "Homework details are too long. Please summarize.").optional(),
  schoolStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  schoolEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  earlyMorningStudy: z.boolean().default(false),
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

export type StudyPlanFormData = z.infer<typeof StudyPlanFormSchema>;

// This type is directly from the AI flow, useful for type consistency
export type GenerateStudyPlanInput = AIInputType;
