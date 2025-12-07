"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PokemonSuggestion {
  name: string;
  reason: string;
}

function getRandomSeed(): string {
  const themes = [
    "underrated gems", "fan favorites", "competitive battlers", "unique designs",
    "interesting lore", "cute Pokemon", "intimidating Pokemon", "starters",
    "legendaries", "mythicals", "fossil Pokemon", "baby Pokemon", "eeveelutions",
    "dragon types", "ghost types", "fairy types", "steel types", "psychic types",
    "regional variants", "mega evolutions", "gigantamax forms", "paradox Pokemon",
    "gen 1 classics", "gen 2 favorites", "gen 3 gems", "gen 4 legends", "gen 5 unique",
    "gen 6 designs", "gen 7 Alolan", "gen 8 Galarian", "gen 9 Paldean"
  ];
  const randomThemes = themes.sort(() => Math.random() - 0.5).slice(0, 3);
  return randomThemes.join(", ");
}

function buildPrompt(context: string | undefined, timestamp: number, randomSeed: string): string {
  return context
    ? `You are a Pokemon expert with deep knowledge of all ${timestamp % 1000} Pokemon species. Based on the user's interest: "${context}", suggest 6 UNIQUE and DIVERSE Pokemon names they might want to search for.
       
       IMPORTANT RULES:
       - DO NOT suggest common/overused Pokemon like Pikachu, Charizard, Eevee, Mewtwo unless directly relevant
       - Include at least 2 lesser-known or underappreciated Pokemon
       - Mix different generations (Gen 1-9)
       - Mix different types and roles
       - Be creative and surprising with your choices
       - Focus on: ${randomSeed}
       
       Return ONLY a valid JSON array with objects containing "name" (the exact Pokemon name, lowercase) and "reason" (a brief 10-15 word explanation of why this Pokemon matches their interest).
       Example format: [{"name": "dragapult", "reason": "Ghost/Dragon type with unique design, launches baby Dreepy as missiles"}]
       Only include real Pokemon from the official games. Return nothing but the JSON array.`
    : `You are a Pokemon expert. Suggest 6 UNIQUE and SURPRISING Pokemon for someone to discover and review.
       
       Random seed for variety: ${timestamp}
       Focus on these themes: ${randomSeed}
       
       IMPORTANT RULES:
       - AVOID overused suggestions like Pikachu, Charizard, Gengar, Eevee, Mewtwo, Lucario, Greninja
       - Include at least 3 lesser-known or underappreciated Pokemon
       - Mix different generations (Gen 1-9) - include at least one from Gen 5-9
       - Mix different types (try to include at least 4 different types)
       - Be creative and introduce users to Pokemon they might not know
       - Each suggestion should feel fresh and interesting
       
       Return ONLY a valid JSON array with objects containing "name" (the exact Pokemon name, lowercase) and "reason" (a brief 10-15 word explanation of what makes this Pokemon interesting).
       Example format: [{"name": "falinks", "reason": "Unique Fighting-type that's actually six tiny soldiers marching together"}]
       Return nothing but the JSON array.`;
}

async function tryGemini(prompt: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 1.2,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      console.warn("Gemini rate limited (429), falling back to OpenAI...");
      return null;
    }
    throw error;
  }
}

async function tryOpenAI(prompt: string): Promise<string | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return null;
    }

    const message = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1.2,
    });

    return message.choices[0].message.content || null;
  } catch (error: any) {
    if (error?.status === 429 || error?.code === "insufficient_quota") {
      console.warn("OpenAI rate limited or insufficient quota");
      return null;
    }
    throw error;
  }
}

export async function getPokemonSuggestions(
  context?: string
): Promise<{ success: boolean; suggestions: PokemonSuggestion[]; error?: string }> {
  try {
    const randomSeed = getRandomSeed();
    const timestamp = Date.now();
    const prompt = buildPrompt(context, timestamp, randomSeed);

    let text: string | null = null;

    if (process.env.GEMINI_API_KEY) {
      text = await tryGemini(prompt);
    }

    if (!text && process.env.OPENAI_API_KEY) {
      text = await tryOpenAI(prompt);
    }

    if (!text) {
      return {
        success: false,
        suggestions: [],
        error: "All AI services unavailable or rate limited",
      };
    }

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
      suggestions: suggestions.slice(0, 6),
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
