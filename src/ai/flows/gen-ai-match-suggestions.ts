'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized match suggestions.
 *
 * The flow takes user profile information as input and returns a list of match suggestions
 * based on the user's mother tongue, native district, caste, and partner preferences.
 *
 * - generateMatchSuggestions - The function that triggers the match suggestion flow.
 * - MatchSuggestionsInput - The input type for the generateMatchSuggestions function.
 * - MatchSuggestionsOutput - The output type for the generateMatchSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema
const MatchSuggestionsInputSchema = z.object({
  motherTongue: z.string().describe('The user mother tongue.'),
  nativeVillage: z.string().describe('The user native village.'),
  category: z.string().describe('The user category.'),
  caste: z.string().describe('The user caste.'),
  partnerPreferences: z.string().describe('The user partner preferences.'),
});
export type MatchSuggestionsInput = z.infer<typeof MatchSuggestionsInputSchema>;

// Define the output schema
const MatchSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of match suggestions.'),
});
export type MatchSuggestionsOutput = z.infer<typeof MatchSuggestionsOutputSchema>;

// Define the wrapper function
export async function generateMatchSuggestions(input: MatchSuggestionsInput): Promise<MatchSuggestionsOutput> {
  return matchSuggestionsFlow(input);
}

// Define the prompt
const matchSuggestionsPrompt = ai.definePrompt({
  name: 'matchSuggestionsPrompt',
  input: { schema: MatchSuggestionsInputSchema },
  output: { schema: MatchSuggestionsOutputSchema },
  prompt: `You are a matchmaking expert specializing in Chhattisgarh matrimony.

  Based on the following information, generate a list of potential match suggestions:

  Mother Tongue: {{{motherTongue}}}
  Native Village: {{{nativeVillage}}}
  Category: {{{category}}}
  Caste: {{{caste}}}
  Partner Preferences: {{{partnerPreferences}}}

  Return the suggestions as a list of names and brief descriptions.
  `,
});

// Define the flow
const matchSuggestionsFlow = ai.defineFlow(
  {
    name: 'matchSuggestionsFlow',
    inputSchema: MatchSuggestionsInputSchema,
    outputSchema: MatchSuggestionsOutputSchema,
  },
  async input => {
    const { output } = await matchSuggestionsPrompt(input);
    return output!;
  }
);
