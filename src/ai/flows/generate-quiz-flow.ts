
'use server';
/**
 * @fileOverview A Genkit flow for generating a multiple-choice quiz based on a given set of topics.
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
});

const GenerateQuizInputSchema = z.object({
  topics: z.string().describe("A string of comma-separated topics to be quizzed on (e.g., 'Trigonometry, Photosynthesis, The American Revolution')."),
  numQuestions: z.number().min(1).max(20).default(5).describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().describe('A suitable title for the generated quiz.'),
  questions: z.array(QuestionSchema).describe('An array of generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
export type QuizQuestion = z.infer<typeof QuestionSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator and quiz creator. Your task is to generate a multiple-choice quiz based on the provided topics.

Topics: {{{topics}}}
Number of Questions: {{{numQuestions}}}

Instructions:
1.  Create a quiz with exactly {{{numQuestions}}} questions.
2.  The questions should be relevant to the provided topics.
3.  Each question must have 4 to 5 plausible options.
4.  For each question, clearly identify the correct answer by its index.
5.  Provide a brief and clear explanation for why the correct answer is correct.
6.  Generate a suitable and engaging title for the quiz.
7.  The difficulty should be appropriate for a high school or early college level student.
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
