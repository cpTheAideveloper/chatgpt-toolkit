// node/demoapproutes/codeDocumenter.js
import express from "express";
import { generateChatResponse } from "../utils/openAiHelpers.js";
import { createTempFile } from "../utils/fileHelpers.js";
import fs from "fs";
import multer from "multer";
import { openai } from "../utils/openaiconfig.js";

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Process multiple code files in parallel
router.post("/analyze", upload.array("files", 5), async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files received" });
    }

    // Map each file to a promise that processes it
    const analysisPromises = files.map(async (file, index) => {
      try {
        // Create temporary file
        const tempFilePath = await createTempFile(file);
        
        // Read file content
        const fileContent = await fs.promises.readFile(tempFilePath, 'utf8');
        
        // Create message for AI
        const userMessage = {
          role: "user",
          content: [
            { 
              type: "input_text", 
              text: `Generate comprehensive documentation for this code file named "${file.originalname}". Include: 
                1. A clear explanation of what this file does
                2. Key functions/components and their purposes
                3. Dependencies and imports explained
                4. Any notable patterns or techniques used
                5. Organize the documentation with clear headings

                Here's the code:
                ${fileContent}`
            }
          ],
        };

        // Generate documentation using AI
        const result = await generateChatResponse({
          userMessage: userMessage,
          model: "gpt-4o",
        });

        // Clean up temp file
        await fs.promises.unlink(tempFilePath);

        return {
          id: index,
          filename: file.originalname,
          documentation: result,
          rawCode: fileContent
        };
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        return {
          id: index,
          filename: file.originalname,
          documentation: `Error generating documentation: ${error.message}`,
          error: true
        };
      }
    });

    // Wait for all files to be processed in parallel
    const results = await Promise.all(analysisPromises);
    
    // Respond with all results
    res.status(200).json({ results });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ error: "Error processing code files" });
  }
});

// Route to document a single file directly via OpenAI file API (alternative approach)
router.post("/document-file", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // Create a temporary file from the buffer
    const tempFilePath = await createTempFile(file);

    // Use the file path with createReadStream
    const uploadFile = await openai.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: "assistants",
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a code documentation expert. Create comprehensive documentation for the provided code file."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate documentation for this code file named "${file.originalname}". Include purpose, key functions/components, dependencies, and notable patterns.`
            },
            {
              type: "file_id",
              file_id: uploadFile.id
            }
          ]
        }
      ]
    });

    // Clean up the temporary file
    await fs.promises.unlink(tempFilePath);

    // Respond with the documentation
    res.status(200).json({ 
      filename: file.originalname,
      documentation: response.choices[0].message.content 
    });
  } catch (error) {
    console.error("Error in document-file:", error);
    res.status(500).json({ error: "Error processing the code file" });
  }
});

export default router;