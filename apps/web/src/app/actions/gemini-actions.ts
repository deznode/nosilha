"use server";

/**
 * Gemini AI Server Actions
 *
 * Server-side wrappers for Gemini AI functions to keep API key secure.
 * These actions are called from client components but execute on the server,
 * ensuring the GEMINI_API_KEY is never exposed to the browser.
 */

import {
  polishStoryContent,
  translateContent,
  generateStoryPrompts,
  generateDirectoryEntryContent,
  isGeminiAvailable,
} from "@/lib/gemini";

/**
 * Check if Gemini API is available (API key configured).
 * @returns Promise<boolean> - true if Gemini is configured
 */
export async function checkGeminiAvailableAction(): Promise<boolean> {
  return isGeminiAvailable();
}

/**
 * Polish story content for grammar and flow while preserving voice.
 * @param content - The user-submitted story content
 * @returns Promise<string> - Polished content or original if API unavailable
 */
export async function polishStoryAction(content: string): Promise<string> {
  return polishStoryContent(content);
}

/**
 * Translate content between Portuguese and English.
 * @param content - The text to translate
 * @param targetLang - Target language ('PT' or 'EN')
 * @returns Promise<string> - Translated content
 */
export async function translateStoryAction(
  content: string,
  targetLang: "PT" | "EN"
): Promise<string> {
  return translateContent(content, targetLang);
}

/**
 * Generate story prompts based on template type.
 * @param templateType - The type of story template
 * @param existingContent - Any existing content to build upon
 * @returns Promise<string[]> - Suggested prompts or content starters
 */
export async function generatePromptsAction(
  templateType: string,
  existingContent?: string
): Promise<string[]> {
  return generateStoryPrompts(templateType, existingContent);
}

/**
 * Generate description and tags for a directory entry using AI.
 * @param name - The name of the location
 * @param category - The category (Restaurant, Landmark, Nature, Culture)
 * @returns Promise with generated description and tags, or null if unavailable
 */
export async function generateDirectoryContentAction(
  name: string,
  category: string
): Promise<{ description: string; tags: string[] } | null> {
  return generateDirectoryEntryContent(name, category);
}
