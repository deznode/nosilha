/**
 * Gemini AI Service
 *
 * AI-powered story polishing and translation using Google's Gemini API.
 * Preserves authentic Cape Verdean voice while improving grammar and flow.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with the API key from environment variables
// NOTE: This file should only be used server-side (via server actions or API routes)
// to keep the API key secure. Never import this directly in client components.
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
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
 * Generate description and tags for a directory entry using AI.
 *
 * @param name - The name of the location
 * @param category - The category (Restaurant, Heritage, Nature, Culture)
 * @returns Object with generated description and tags, or null if unavailable
 */
export const generateDirectoryEntryContent = async (
  name: string,
  category: string
): Promise<{ description: string; tags: string[] } | null> => {
  const client = getGeminiClient();

  if (!client) {
    console.warn("Gemini API key not configured - AI assist unavailable");
    return null;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are helping document a cultural heritage directory for Brava Island, Cape Verde.

Generate a high-quality 2-3 sentence description and 5 relevant cultural tags for a ${category} in Brava, Cape Verde named "${name}".

The description should:
- Capture the authentic Cape Verdean atmosphere
- Be inviting and culturally respectful
- Mention relevant cultural elements when appropriate (e.g., morna music, Kriolu language, local cuisine)

The tags should be relevant for discovery and SEO, like: traditional, ocean-view, family-owned, live-music, historical, hidden-gem

Format your response exactly as:
DESCRIPTION: [your description here]
TAGS: [tag1, tag2, tag3, tag4, tag5]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const descMatch = text.match(/DESCRIPTION:\s*(.*)/i);
    const tagsMatch = text.match(/TAGS:\s*(.*)/i);

    if (!descMatch || !tagsMatch) {
      return null;
    }

    const tags = tagsMatch[1]
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    return {
      description: descMatch[1].trim(),
      tags,
    };
  } catch (error) {
    console.error("Gemini Directory Entry Error:", error);
    return null;
  }
};

/**
 * Story object for MDX archival conversion.
 */
export interface StoryForArchival {
  id: string;
  title: string;
  content: string;
  author: string;
  location?: string;
  storyType: string;
  publishDate: string;
}

/**
 * Generate MDX archival source from a story using AI.
 *
 * Converts a user-submitted story into a properly formatted MDX file with:
 * - YAML frontmatter (title, slug, author, date, language, location, storyType, sourceStoryId)
 * - Markdown body with cultural component injection for music references
 * - Preserved Cape Verdean cultural terms
 *
 * @param story - The story object to convert
 * @returns MDX string with frontmatter and body, or error message if generation fails
 */
export const generateMDXArchivalSource = async (
  story: StoryForArchival
): Promise<string> => {
  const client = getGeminiClient();

  if (!client) {
    console.warn("Gemini API key not configured - MDX generation unavailable");
    return `---
title: "${story.title}"
slug: "${story.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}"
author: "${story.author}"
date: "${story.publishDate}"
language: "PT"
location: "${story.location || "Brava, Cape Verde"}"
storyType: "${story.storyType}"
sourceStoryId: "${story.id}"
---

${story.content}`;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a cultural heritage archivist for "Nos Ilha" (Cape Verde), converting personal stories into structured MDX format for preservation.

Convert the following story into MDX format with YAML frontmatter and enhanced markdown body.

Story Details:
- Title: ${story.title}
- Author: ${story.author}
- Location: ${story.location || "Brava, Cape Verde"}
- Story Type: ${story.storyType}
- Publish Date: ${story.publishDate}
- Source Story ID: ${story.id}

Story Content:
${story.content}

Requirements:

1. Generate YAML frontmatter with these exact fields:
   - title: Keep the original title in quotes
   - slug: Create a URL-friendly version of the title (lowercase, hyphens, no special chars)
   - author: Use the original author name
   - date: Use the publish date (${story.publishDate})
   - language: "PT" (Portuguese) or "EN" (English) based on content language
   - location: "${story.location || "Brava, Cape Verde"}"
   - storyType: "${story.storyType}"
   - sourceStoryId: "${story.id}"

2. For the markdown body:
   - Preserve ALL Cape Verdean cultural terms exactly as written: morna, sodade, cachupa, grogue, batuku, funana, coladeira, morabeza
   - When music is mentioned (songs, artists, musical traditions), inject a custom component:
     <MusicReference title="Song Name" artist="Artist Name" />
   - Maintain paragraph structure and emotional tone
   - Keep the authentic voice and storytelling style
   - Do NOT add content that wasn't in the original story

3. Format exactly as:
---
title: "Title Here"
slug: "url-friendly-slug"
author: "Author Name"
date: "YYYY-MM-DD"
language: "PT"
location: "Location Here"
storyType: "Type Here"
sourceStoryId: "ID Here"
---

[Markdown body with preserved cultural terms and <MusicReference /> components where appropriate]

Return ONLY the MDX output, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || `Error: Failed to generate MDX content`;
  } catch (error) {
    console.error("Gemini MDX Generation Error:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error occurred during MDX generation"}`;
  }
};

/**
 * Check if Gemini API is available and configured.
 * NOTE: Only call this from server-side code (server actions, API routes).
 */
export const isGeminiAvailable = (): boolean => {
  return !!process.env.GEMINI_API_KEY;
};
