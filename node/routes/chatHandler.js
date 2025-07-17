//GPT/gptcore/node/routes/chatHandler.js

import express from "express";
import { generateChatResponse } from "../utils/openAiHelpers.js";

const router = express.Router();

// Basic chat completion endpoint (non-streaming)
router.post("/", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    const messages = req.body.messages || [];
    const instructions = req.body.instructions || "You are a helpful assistant.";
    const model = req.body.model || "gpt-4o-mini";
    const temperature = req.body.temperature || 0.7;

    const userMessage = { role: "user", content: userInput };
    const result = await generateChatResponse({
      userMessage,
      messages,
      model,
      instructions,
      temperature,
    });

    res.status(200).json({ role: "assistant", content: result });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});

// Streaming chat completion endpoint
router.post("/stream", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    const messages = req.body.messages || [];
    const instructions = req.body.instructions || "You are a helpful assistant.";
    const model = req.body.model || "gpt-4o-mini";
    const temperature = req.body.temperature || 0.7;

    const userMessage = { role: "user", content: userInput };
    const stream = await generateChatResponse({
      userMessage,
      messages,
      model,
      instructions,
      temperature,
      stream: true,
    });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    console.log("Starting stream request with input:", userInput);
    let contentSent = false;

    for await (const event of stream) {
      console.log("Received event type:", event.type);

      switch (event.type) {
        case "response.created":
          res.write(""); // Keep connection alive
          break;

        case "response.output_text.delta":
          if (event.delta) {
            let textChunk = typeof event.delta === "string"
              ? event.delta
              : event.delta.text || "";

            if (textChunk) {
              res.write(textChunk);
              contentSent = true;
              res.flush?.();
            }
          }
          break;

        case "text_delta":
          if (event.text) {
            res.write(event.text);
            contentSent = true;
            res.flush?.();
          }
          break;

        case "response.completed":
          console.log("Response completed");
          break;

        case "response.output_item.added":
        case "response.content_part.added":
        case "response.content_part.done":
        case "response.output_item.done":
        case "response.output_text.done":
          console.log(`Event: ${event.type}`, event.text || "");
          break;

        case "error":
          console.error("Stream error:", event.error);
          res.write("\n[Error during generation]");
          break;

        default:
          console.log("Unhandled event type:", event.type, event);
      }
    }

    console.log("Stream processing completed");
    res.end();
  } catch (error) {
    console.error("Error processing stream:", error);
    res.status(500).json({
      error: "Error processing request",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export default router;

/**
 * chatHandler.js
 *
 * This Express router handles AI chat completion requests via OpenAI.
 * It provides both standard and streaming response modes for a conversational assistant.
 * The streaming endpoint handles real-time chunked data transfer to simulate "live typing."
 *
 * Key Endpoints:
 * - POST `/`: Handles a complete response to a user prompt (non-streaming)
 * - POST `/stream`: Streams the assistant's response back in real time
 *
 * Streaming Features:
 * - Supports various OpenAI stream events (e.g., `response.output_text.delta`)
 * - Handles both raw text chunks and structured JSON deltas
 * - Flushes output as it is received for immediate client display
 * - Logs every event for debugging purposes
 *
 * Request Body Parameters:
 * - `userInput` (string): User's input message
 * - `messages` (array): Prior conversation history
 * - `instructions` (string): Optional system prompt for the AI
 * - `model` (string): OpenAI model ID (e.g., `gpt-4o-mini`)
 * - `temperature` (number): Controls randomness of output (if supported)
 *
 * Dependencies:
 * - `express` for route handling
 * - `openAiHelpers.js` for request abstraction
 *
 * Path: //GPT/gptcore/node/routes/chatHandler.js
 */
