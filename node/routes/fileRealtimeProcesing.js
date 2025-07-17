//GPT/gptcore/node/routes/fileRealtimeProcesing.js
import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import {
  generateChatResponse
} from "../utils/openAiHelpers.js";
import { createTempFile, extractTextFromPdf } from "../utils/fileHelpers.js"; // Import helpers
import fs from "fs";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });



router.post("/word", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;
    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // 1) Create temp file, parse Word doc
    const tempFilePath = await createTempFile(file);
    const { value: extractedText } = await mammoth.extractRawText({ path: tempFilePath });
    await fs.promises.unlink(tempFilePath);

    // 2) SSE headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    // 3) Build messages
    const message = {
      role: "user",
      content: [
        { type: "input_text", text: userInput },
        { type: "input_text", text: `File content: ${extractedText}` }
      ]
    };

    console.log("Starting Word doc stream:", userInput);

    // 4) Start streaming
    const stream = await generateChatResponse({
      model: "gpt-4.1-nano",
      messages: [message],
      stream: true
    });

    // 5) for-await-of events
    for await (const event of stream) {
      console.log("Event type:", event.type);

      switch (event.type) {
        case "response.created":
          console.log("Response started (Word doc)");
          res.write(""); 
          break;

        case "response.output_text.delta":
          if (event.delta) {
            let textChunk = "";
            if (typeof event.delta === "string") {
              textChunk = event.delta;
            } else if (event.delta.text) {
              textChunk = event.delta.text;
            }

            if (textChunk) {
              console.log("Sending chunk:", textChunk);
              res.write(textChunk);
              if (res.flush) res.flush();
            }
          }
          break;

        case "response.completed":
          console.log("Response completed (Word doc)");
          break;

        case "response.output_text.done":
          console.log("Full text for Word doc done:", event.text);
          break;

        case "error":
          console.error("Stream error for Word doc:", event.error);
          res.write("\n[Error during Word doc stream]");
          break;

        default:
          console.log("Unhandled event:", event.type);
      }
    }

    console.log("Finished streaming Word doc");
    res.end();
  } catch (err) {
    console.error("Error processing Word doc stream:", err);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Error streaming Word doc", 
        message: err.message 
      });
    } else {
      res.write(`\n[Error: ${err.message}]`);
      res.end();
    }
  }
});


/**
 * Streaming route for PDF documents.
 */
router.post("/pdf", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // 1) Generate a temporary file, parse the PDF text
    const tempFilePath = await createTempFile(file);
    const extractedText = await extractTextFromPdf(tempFilePath);
    await fs.promises.unlink(tempFilePath);

    // 2) Set up SSE-style headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    // 3) Build your messages or prompt
    const message = { 
      role: "user", 
      content: [
        { type: "input_text", text: userInput },
        { type: "input_text", text: `File content: ${extractedText}` }
      ]
    };

    // 4) Start streaming from OpenAI
    console.log("Starting PDF stream with user input:", userInput);
    const stream = await generateChatResponse({
      model: "gpt-4.1-nano", 
      messages: [message], 
      stream: true
    });

    // 5) Process each event in a for-await-of
    for await (const event of stream) {
      console.log("Received event type:", event.type);

      switch (event.type) {
        case "response.created":
          console.log("Response started");
          // Optionally send an initial chunk to "open" the connection
          res.write("");
          break;

        case "response.output_text.delta":
          // "delta" can be a plain string or an object with ".text"
          if (event.delta) {
            let textChunk = "";
            if (typeof event.delta === "string") {
              textChunk = event.delta;
            } else if (event.delta.text) {
              textChunk = event.delta.text;
            }

            if (textChunk) {
              console.log("Sending PDF text chunk:", textChunk);
              res.write(textChunk);

              // Force flush if possible
              if (res.flush) res.flush();
            }
          }
          break;

        case "response.completed":
          console.log("Stream completed");
          break;

        // Additional event types from logs
        case "response.output_text.done":
          console.log("Full text completed:", event.text);
          break;

        case "error":
          console.error("Stream error:", event.error);
          res.write("\n[Error during PDF generation]");
          break;

        default:
          // Possibly log or ignore
          console.log("Unhandled event type:", event.type, event);
      }
    }

    console.log("Finished streaming PDF response");
    res.end();
  } catch (error) {
    console.error("Error processing PDF stream:", error);
    if (!res.headersSent) {
      // Return JSON if no data was sent yet
      res.status(500).json({
        error: "Error processing PDF stream request",
        message: error.message
      });
    } else {
      // If already streaming, write an error chunk
      res.write(`\n[Error: ${error.message}]`);
      res.end();
    }
  }
});





export default router;


/**
 * fileRealtimeProcesing.js
 *
 * 📂 Location:
 * //GPT/gptcore/node/routes/fileRealtimeProcesing.js
 *
 * 📄 Purpose:
 * This Express router provides **real-time streaming** endpoints for analyzing files using OpenAI models.
 * It supports Word and PDF documents and streams partial responses back to the client as the model generates output.
 *
 * 🔁 Streaming Approach:
 * - Uses the OpenAI `stream: true` option to enable partial response delivery.
 * - SSE-style headers are set (`text/plain`, `Transfer-Encoding: chunked`, etc.).
 * - Each chunk of the response is written to the client with `res.write()`.
 * - Ends the stream gracefully with `res.end()`.
 *
 * 📦 Routes:
 * @route POST /file/word — Streams OpenAI responses for uploaded Word documents (.doc, .docx)
 * @route POST /file/pdf  — Streams OpenAI responses for uploaded PDF documents (.pdf)
 *
 * 🧩 Dependencies:
 * - `multer`: for handling file uploads in memory.
 * - `mammoth`: for extracting raw text from Word documents.
 * - `pdf2json`: via helper `extractTextFromPdf()` for extracting text from PDFs.
 * - `generateChatResponse()`: utility function that interfaces with OpenAI API.
 *
 * 🔐 Security Notes:
 * - Files are stored temporarily in `/tmp` via `createTempFile()` and then deleted after use.
 * - Input validation ensures files are present before processing.
 *
 * ⚙️ Key Features:
 * - Extracts file content before sending it to OpenAI.
 * - Merges file content with user input into a structured prompt.
 * - Handles different OpenAI event types: `created`, `delta`, `done`, `error`.
 * - Ensures error safety with fallback chunk write or `res.status(500)` fallback.
 *
 * 🧠 Prompt Strategy:
 * - Sends two message parts per request:
 *    1. `{ type: "input_text", text: userInput }`
 *    2. `{ type: "input_text", text: "File content: ..." }`
 *
 * 📡 Response Events:
 * - `response.created`: Marks the start of the stream.
 * - `response.output_text.delta`: Carries streaming tokens/chunks.
 * - `response.output_text.done`: Marks full completion of the streamed content.
 * - `response.completed`: Signals end of full response.
 * - `error`: Captures and writes stream-related issues.
 *
 * 📌 Notes:
 * - This router should be mounted under `/file` in your Express app.
 * - For optimal frontend use, the client should buffer chunks and update the UI in real-time.
 */

