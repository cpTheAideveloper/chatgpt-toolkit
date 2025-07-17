//GPT/gptcore/node/routes/fileProcesing.js
import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import { generateChatResponse } from "../utils/openAiHelpers.js";
import { createTempFile, extractTextFromPdf } from "../utils/fileHelpers.js"; // Import helpers
import fs from "fs";
import { openai } from "../utils/openaiconfig.js";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route to read Word documents
router.post("/readWordDocuments", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // Create the temporary file using the helper
    const tempFilePath = await createTempFile(file);

    // Extract text from the Word document
    const { value: extractedText } = await mammoth.extractRawText({
      path: tempFilePath,
    });

    // Clean up: delete the temporary file
    await fs.promises.unlink(tempFilePath);

    const userMessage = {
      role: "user",
      content: [
        { type: "input_text", text: userInput },
        { type: "input_text", text: `File content: ${extractedText}` },
      ],
    };

    const result = await generateChatResponse({
      userMessage: userMessage,
      model: "gpt-4o-mini",
    });

    // Respond with the extracted text
    res.status(200).json({ role: "assistant", content: result });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ error: "Error processing the Word document" });
  }
});

// Route to read PDF documents
router.post("/readPdf", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // Create the temporary file using the helper
    const tempFilePath = await createTempFile(file);

    // Extract the text from the PDF using the helper
    const extractedText = await extractTextFromPdf(tempFilePath);

    // Clean up: delete the temporary file
    await fs.promises.unlink(tempFilePath);

    const userMessage = {
      role: "user",
      content: [
        { type: "input_text", text: userInput },
        { type: "input_text", text: `File content: ${extractedText}` },
      ],
    };

    const result = await generateChatResponse({
      userMessage: userMessage,
      model: "gpt-4.1-nano",
    });

    // Respond with the result
    res.status(200).json({ role: "assistant", content: result });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Error processing the PDF file" });
  }
});

async function fileHanler(
  model = "gpt-4o-mini",
  message,
  instructions = "you are a helpful assistant",
  file
) {
  try {
    // Create a temporary file from the buffer
    const tempFilePath = await createTempFile(file);

    // Use the file path with createReadStream
    const uploadFile = await openai.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: "user_data",
    });

    console.log(`File uploaded to OpenAI with ID: ${uploadFile.id}`);

    const response = await openai.responses.create({
      model: model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              file_id: uploadFile.id,
            },
            {
              type: "input_text",
              text: message,
            },
          ],
        },
      ],
      instructions: instructions,
    });

    // Clean up the temporary file
    await fs.promises.unlink(tempFilePath);

    return response.output_text;
  } catch (error) {
    console.error("Error in fileHanler:", error);
    throw error;
  }
}

router.post("/newfilehandler", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;
    const systemInstructions =
      req.body.systemInstructions ||
      "You are a helpful assistant with access to web search. Provide accurate and up-to-date information based on search results.";
    const model = req.body.model || "gpt-4o";

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    const result = await fileHanler(model, userInput, systemInstructions, file);

    // Respond with the result
    res.status(200).json({ role: "assistant", content: result });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Error processing the PDF file" });
  }
});

export default router;

/**
 * fileProcessing.js
 *
 * 📦 Express routes for handling and analyzing uploaded files using OpenAI's APIs.
 *
 * 📂 Location:
 * //GPT/gptcore/node/routes/fileProcessing.js
 *
 * 📁 Supported File Types:
 * - Word documents (.doc, .docx)
 * - PDF files (.pdf)
 * - Any file passed to OpenAI for analysis via `fileHandler`
 *
 * 🧩 Dependencies:
 * - Express.js for route handling
 * - Multer for handling file uploads (memory storage)
 * - Mammoth for extracting raw text from Word documents
 * - pdf2json for extracting text from PDF files
 * - OpenAI API (chat + file-based analysis)
 *
 * --------------------------------------------------
 *
 * @route POST /readWordDocuments
 * @description Handles Word file upload, extracts text, and sends it to OpenAI for analysis.
 *
 * @param {FormData} file - Uploaded Word file (.doc or .docx)
 * @param {string} userInput - Additional user prompt
 * @returns {Object} JSON with OpenAI response
 *
 * --------------------------------------------------
 *
 * @route POST /readPdf
 * @description Handles PDF file upload, extracts text using `pdf2json`, and sends to OpenAI for analysis.
 *
 * @param {FormData} file - Uploaded PDF file
 * @param {string} userInput - Additional user prompt
 * @returns {Object} JSON with OpenAI response
 *
 * --------------------------------------------------
 *
 * @function fileHandler
 * @description Uploads a file to OpenAI’s file API and sends it with a prompt for deeper analysis.
 *
 * @param {string} model - OpenAI model (default: "gpt-4o-mini")
 * @param {string} message - User message prompt
 * @param {string} instructions - System-level instructions
 * @param {Object} file - Uploaded file object
 * @returns {Promise<string>} - AI-generated response text
 *
 * --------------------------------------------------
 *
 * @route POST /newfilehandler
 * @description Unified handler for any file type. Uploads file to OpenAI and performs contextual prompt-based analysis.
 *
 * @param {FormData} file - Uploaded file (any format OpenAI supports)
 * @param {string} userInput - User's question or message
 * @param {string} [systemInstructions] - Optional system prompt for behavior tuning
 * @param {string} [model] - OpenAI model to use (default: "gpt-4o")
 * @returns {Object} JSON with role and content from OpenAI
 */
