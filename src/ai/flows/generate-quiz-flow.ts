
'use server';
/**
 * @fileOverview A Genkit flow for generating a multiple-choice quiz based on a given set of topics and a student's curriculum.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).describe('An array of 4-5 strings representing the possible answers.'),
  correctAnswerIndex: z.number().describe('The 0-based index of the correct answer in the options array.'),
  explanation: z.string().describe('A brief explanation of why the correct answer is right.'),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).describe("The difficulty level of the question."),
  marks: z.number().int().min(1).max(10).describe("The number of marks this question is worth, based on its difficulty."),
});

const GenerateQuizInputSchema = z.object({
  topics: z.string().describe("A string of comma-separated topics to be quizzed on (e.g., 'Trigonometry, Photosynthesis, The American Revolution')."),
  numQuestions: z.number().min(1).max(20).default(5).describe('The number of questions to generate for the quiz.'),
  curriculum: z.string().optional().describe("The student's curriculum or class level (e.g., 'GCSE Physics', '10th Grade US History'). This provides context for the question difficulty."),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().describe('A suitable title for the generated quiz.'),
  questions: z.array(QuestionSchema).describe('An array of generated quiz questions.'),
  totalMarks: z.number().describe("The sum of the marks for all questions in the quiz."),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
export type QuizQuestion = z.infer<typeof QuestionSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  const result = await generateQuizFlow(input);
  // Calculate total marks and add it to the result
  const totalMarks = result.questions.reduce((sum, q) => sum + q.marks, 0);
  return {
    ...result,
    totalMarks,
  };
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator and quiz creator. Your task is to generate a multiple-choice quiz based on the provided topics and curriculum.

Topics: {{{topics}}}
Number of Questions: {{{numQuestions}}}
Curriculum Context: {{{curriculum}}}

Instructions:
1.  Create a quiz with exactly {{{numQuestions}}} questions.
2.  The questions should be relevant to the provided topics.
3.  The difficulty of the questions should be appropriate for the student's curriculum context: {{{curriculum}}}.
4.  Generate a mix of question difficulties (Easy, Medium, Hard).
5.  Assign marks for each question based on its difficulty (e.g., Easy: 1-2 marks, Medium: 3-5 marks, Hard: 6-10 marks).
6.  Each question must have 4 to 5 plausible options.
7.  For each question, clearly identify the correct answer by its index.
8.  Provide a brief and clear explanation for why the correct answer is correct.
9.  Generate a suitable and engaging title for the quiz.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
