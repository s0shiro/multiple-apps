"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface PokemonSuggestion {
  name: string;
  reason: string;
}

export async function getPokemonSuggestions(
  context?: string
): Promise<{ success: boolean; suggestions: PokemonSuggestion[]; error?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      suggestions: [],
      error: "AI service not configured",
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = context
      ? `You are a Pokemon expert. Based on the user's interest: "${context}", suggest 5 Pokemon names they might want to search for. 
         Return ONLY a valid JSON array with objects containing "name" (the exact Pokemon name, lowercase) and "reason" (a brief 10-15 word explanation of why this Pokemon matches their interest).
         Example format: [{"name": "pikachu", "reason": "Electric type mascot, beloved for its cute appearance and powerful thunderbolt"}]
         Only include real Pokemon from the official games. Return nothing but the JSON array.`
      : `You are a Pokemon expert. Suggest 5 random interesting Pokemon for someone to discover and review.
         Return ONLY a valid JSON array with objects containing "name" (the exact Pokemon name, lowercase) and "reason" (a brief 10-15 word explanation of what makes this Pokemon interesting).
         Example format: [{"name": "gengar", "reason": "Ghost/Poison type with mischievous personality and powerful shadow abilities"}]
         Include a mix of popular and lesser-known Pokemon from different generations. Return nothing but the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return {
        success: false,
        suggestions: [],
        error: "Failed to parse AI response",
      };
    }

    const suggestions: PokemonSuggestion[] = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      suggestions: suggestions.slice(0, 5), // Ensure max 5 suggestions
    };
  } catch (error) {
    console.error("AI suggestion error:", error);
    return {
      success: false,
      suggestions: [],
      error: "Failed to get AI suggestions",
    };
  }
}
