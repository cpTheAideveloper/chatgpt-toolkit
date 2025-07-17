//GPT/gptcore/node/utils/openAiHelpers.js
import OpenAI from "openai/index.mjs";
import { config } from "dotenv";
config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

