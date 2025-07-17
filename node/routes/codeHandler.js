//GPT/gptcore/node/routes/codeHandler.js

import express from "express";
import { generateChatResponse } from "../utils/openAiHelpers.js";

const router = express.Router();

// GET route for streaming code with artifact markers using query-based message history
router.get("/", async (req, res) => {
  try {
    const messagesParam = req.query.message;
    let messages;
    
    try {
      messages = JSON.parse(messagesParam);
    } catch (error) {
      throw new Error("Invalid message format");
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });

    const instructions = `You are a helpful AI assistant capable of generating detailed responses including code snippets and other artifacts.
    
    IMPORTANT INSTRUCTION ABOUT CODE FORMATTING:
    Whenever you need to write code:
    1. First, send the marker "[CODE_START:language]"
    2. Write your code without markdown backticks
    3. End with "[CODE_END]"
    
    Always use these markers and provide detailed explanations.`;

    const completeMessages = [...messages.messages];

    const stream = await generateChatResponse({
      model: "gpt-4o",
      messages: completeMessages,
      stream: true,
      instructions,
    });

    let contentSent = false;

    for await (const event of stream) {
      console.log("Received event type:", event.type);

      let content = null;

      if (event.type === "response.output_text.delta") {
        content = typeof event.delta === "string" ? event.delta : event.delta?.text;
      }

      if (event.type === "error") {
        console.error("Stream error:", event.error);
        res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
      }

      if (content) {
        contentSent = true;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
        if (res.flush) res.flush();
      }
    }

    if (!contentSent) console.warn("No content was sent during the stream");

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Error in streaming:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error processing stream request", message: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error occurred", message: error.message })}\n\n`);
      res.end();
    }
  }
});

// POST route for real-time code generation with system instruction injection
router.post("/", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    const history = req.body.history || [];
    const instructions = req.body.instructions || "";
    const model = req.body.model || "gpt-4o";
    const temperature = req.body.temperature || 0.7;
    const message = { role: "user", content: userInput };

    res.writeHead(200, {
      "Content-Type": "text/event-stream", 
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });

    const artifactInstructions = `You are a helpful AI assistant capable of generating detailed responses including code snippets and other artifacts.
    
    IMPORTANT INSTRUCTION ABOUT CODE FORMATTING:
    Whenever you need to write code:
    1. First, send the marker "[CODE_START:language]"
    2. Write your code without markdown backticks
    3. End with "[CODE_END]"
    
    Always use these markers and provide detailed explanations.`;

    const combinedInstructions = instructions 
      ? `${instructions}\n\n${artifactInstructions}` 
      : artifactInstructions;

    const completeMessages = [...history, message];

    const stream = await generateChatResponse({
      model,
      messages: completeMessages,
      stream: true,
      instructions: combinedInstructions,
      temperature
    });

    let contentSent = false;

    for await (const event of stream) {
      console.log("Received event type:", event.type);

      let content = null;

      if (event.type === "response.output_text.delta") {
        content = typeof event.delta === "string" ? event.delta : event.delta?.text;
      } else if (event.type === "text_delta") {
        content = event.text;
      } else if (event.type === "error") {
        console.error("Stream error:", event.error);
        res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
      }

      if (content) {
        contentSent = true;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
        if (res.flush) res.flush();
      }
    }

    if (!contentSent) console.warn("No content was sent during the stream");

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Error in streaming:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error processing stream request", message: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error occurred", message: error.message })}\n\n`);
      res.end();
    }
  }
});

export default router;

/**
 * codeHandler.js
 * 
 * This Express router provides streaming endpoints for AI-powered code generation,
 * integrated with custom artifact markers ([CODE_START:language] and [CODE_END]).
 * It supports both GET and POST requests using Server-Sent Events (SSE) to enable
 * real-time communication with the frontend.
 * 
 * Key Features:
 * - Real-time AI response streaming using OpenAI's Assistants API
 * - Custom system instructions to enforce code formatting rules
 * - Support for both query-based (GET) and body-based (POST) usage
 * - Graceful error handling with detailed logs
 * - Flushable chunked delivery compatible with front-end renderers
 * 
 * Endpoints:
 * - GET `/code`: Streams response from `messages` query parameter
 * - POST `/code`: Streams response from JSON body input (`userInput`, `history`, etc.)
 * 
 * Dependencies:
 * - `express` for route handling
 * - `openAiHelpers.js` for generating assistant responses
 * 
 * Path: //GPT/gptcore/node/routes/codeHandler.js
 */
