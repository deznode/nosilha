/**
 * Gemini AI Service
 *
 * AI-powered story polishing and translation using Google's Gemini API.
 * Preserves authentic Cape Verdean voice while improving grammar and flow.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with the API key from environment variables
const getGeminiClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Polish story content for grammar and flow while preserving voice.
 *
 * @param content - The user-submitted story content
 * @returns Polished content or original if API unavailable
 */
export const polishStoryContent = async (content: string): Promise<string> => {
  const client = getGeminiClient();

  if (!client) {
    console.warn("Gemini API key not configured - returning original content");
    return content;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a helpful editor for a cultural heritage platform called "Nos Ilha" (Cape Verde).
Please polish the following user-submitted story for grammar and flow while preserving:
- The authentic voice and personal perspective
- Nostalgic emotion (sodade)
- Cultural terms in Kriolu or Portuguese (like 'morna', 'cachupa', 'grogue', 'batuku')
- Regional expressions and idioms
- The storyteller's unique style

Make minimal changes - only fix clear errors and improve readability. Do not add content or change the meaning.

Original Text:
${content}

Return only the polished text, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || content;
  } catch (error) {
    console.error("Gemini Polish Error:", error);
    return content;
  }
};

/**
 * Translate content between Portuguese and English.
 *
 * @param content - The text to translate
 * @param targetLang - Target language ('PT' or 'EN')
 * @returns Translated content
 */
export const translateContent = async (
  content: string,
  targetLang: "PT" | "EN"
): Promise<string> => {
  const client = getGeminiClient();

  if (!client) {
    console.warn("Gemini API key not configured - translation unavailable");
    return content;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const targetLanguage = targetLang === "PT" ? "Portuguese" : "English";

    const prompt = `Translate the following cultural text to ${targetLanguage}.
Maintain the emotional tone and keep specific Cape Verdean cultural terms in their original Kriolu form when applicable.
Cultural terms to preserve include: morna, sodade, cachupa, grogue, batuku, funana, coladeira, morabeza.

Text:
${content}

Return only the translated text, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || content;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return content;
  }
};

/**
 * Generate story prompts based on template type.
 *
 * @param templateType - The type of story template
 * @param existingContent - Any existing content to build upon
 * @returns Suggested prompts or content starters
 */
export const generateStoryPrompts = async (
  templateType: string,
  existingContent?: string
): Promise<string[]> => {
  const client = getGeminiClient();

  if (!client) {
    return [];
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are helping someone write a personal story about Brava Island, Cape Verde for a cultural heritage platform.
The story type is: ${templateType}
${existingContent ? `They have already written: "${existingContent.substring(0, 200)}..."` : ""}

Generate 3 thoughtful follow-up questions or prompts to help them continue their story.
These should be personal and emotional, encouraging them to share specific memories.

Return each prompt on a new line, numbered 1-3.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the numbered prompts
    const prompts = text
      .split("\n")
      .filter((line) => /^\d\./.test(line.trim()))
      .map((line) => line.replace(/^\d\.\s*/, "").trim());

    return prompts;
  } catch (error) {
    console.error("Gemini Prompts Error:", error);
    return [];
  }
};

/**
 * Check if Gemini API is available and configured.
 */
export const isGeminiAvailable = (): boolean => {
  return !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
};
