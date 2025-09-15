import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyBGR1kLdVqz_n8cOz5oW7fwBp_1i8N5C-A"})],
  model: 'googleai/gemini-2.0-flash',
});
