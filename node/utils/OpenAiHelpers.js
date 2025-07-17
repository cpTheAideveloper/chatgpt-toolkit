//GPT/gptcore/node/utils/openAiHelpers.js

import OpenAI from "openai/index.mjs";
import { config } from "dotenv";
config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const NO_TEMPERATURE_MODELS = ['o1', 'o1-mini', 'o3-mini', 'o1-pro', 'o3', 'o4-mini'];

/**
 * Generates a chat response using the OpenAI API.
 * Supports optional streaming and adaptive temperature control.
 */
export async function generateChatResponse({
  model = "gpt-4o-mini",
  instructions = "You are a helpful assistant.",
  messages = [],
  userMessage,
  temperature = 1,
  stream = false,
}) {
  try {
    if (!openai?.responses?.create) {
      throw new Error("OpenAI client or responses.create method is missing");
    }

    const input = userMessage ? [...messages, userMessage] : messages;

    const payload = {
      model,
      instructions,
      input,
    };

    if (stream) payload.stream = true;

    // Exclude temperature if the model doesn't support it
    if (!NO_TEMPERATURE_MODELS.includes(model)) {
      payload.temperature = temperature;
    } else {
      console.log(`Model ${model} doesn't support temperature — omitting it.`);
    }

    const response = await openai.responses.create(payload);

    return stream ? response : response.output_text;
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    throw error;
  }
}

/**
 * openAiHelpers.js
 *
 * This module encapsulates helper functions for communicating with the OpenAI API
 * from the Node.js backend. It streamlines the process of generating responses,
 * managing temperature support per model, and handling streaming versus non-streaming flows.
 *
 * Key Features:
 * - Unified function to call OpenAI chat completions (`generateChatResponse`)
 * - Detects and skips `temperature` for models that do not support it
 * - Automatically appends user message to conversation history
 * - Supports both regular and streaming response modes
 * - Environment-based configuration with secure API key access
 *
 * Exports:
 * - `openai`: Configured instance of the OpenAI client
 * - `generateChatResponse`: Function to fetch AI-generated responses
 *
 * Dependencies:
 * - `openai/index.mjs`: OpenAI SDK
 * - `dotenv`: Loads environment variables for secure API key handling
 *
 * Path: //GPT/gptcore/node/utils/openAiHelpers.js
 */
