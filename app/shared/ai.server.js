import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

// OpenAI provider (set OPENAI_API_KEY in .env)
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Anthropic provider (set ANTHROPIC_API_KEY in .env)
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model — change per feature as needed
export const defaultModel = openai("gpt-4o-mini");
