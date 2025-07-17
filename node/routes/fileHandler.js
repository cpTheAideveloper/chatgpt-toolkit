// Import necessary modules
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { createTempFile } from '../utils/fileHelpers.js'; // Import helper function
import {openai} from "../utils/openaiconfig.js"

// Setup router
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
  }
});



// Stream file handler route with integrated functions
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userInput = req.body.userInput;
   
    const instructions = req.body.systemInstructions || 
      "You are a helpful assistant. Analyze the file content and respond to the user's query.";
    const model = req.body.model || "gpt-4.1";


    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    console.log(`Processing file: ${file.originalname}, size: ${file.size} bytes`);
    console.log(`User input: ${userInput.substring(0, 50)}...`);

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
      // Create a temporary file from the buffer
      const tempFilePath = await createTempFile(file);
      
      // Upload the file to OpenAI
      const uploadFile = await openai.files.create({
        file: fs.createReadStream(tempFilePath),
        purpose: "user_data",
      });
      
      console.log(`File uploaded to OpenAI with ID: ${uploadFile.id}`);

      // Create message with file reference
     
      
      

      const stream = await openai.responses.create({
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
                text: userInput ,
              },
            ],
          },
        ],
        instructions: instructions,
        stream: true,
      });
      
      // Start streaming response using the file ID
      // const stream = await streamFileHelper({
      //   model,
      //   instructions: systemInstructions,
      //   messages: completeMessages,
      //   temperature,
      //   stream: true,
      //   file_id: uploadFile.id,
      // });

      // Add a flag to check if any content was sent
      let contentSent = false;

      // Handle stream events based on their type
      for await (const event of stream) {
        console.log("Received event type:", event.type);
        
        switch (event.type) {
          case "response.created":
            console.log("Response started");
            // Send a small initial chunk to establish the connection
            res.write("");
            break;
            
          case "response.output_text.delta":
            // Handle both cases where delta might be a string directly or an object with text property
            if (event.delta) {
              let textChunk = '';
              
              if (typeof event.delta === 'string') {
                // Case where delta is the text string directly
                textChunk = event.delta;
              } else if (event.delta.text) {
                // Case where delta is an object with text property
                textChunk = event.delta.text;
              }
              
              if (textChunk) {
                console.log(`Sending text chunk: "${textChunk.substring(0, 20)}..."`);
                res.write(textChunk);
                contentSent = true;
                
                // Ensure the chunk is sent immediately
                if (res.flush) {
                  res.flush();
                }
              }
            } else {
              console.log("Received delta event but no delta content found:", event);
            }
            break;
          
          // Handle plain text deltas (for backward compatibility)
          case "text_delta":
            if (event.text) {
              console.log(`Sending text chunk: "${event.text.substring(0, 20)}..."`);
              res.write(event.text);
              contentSent = true;
              
              if (res.flush) {
                res.flush();
              }
            }
            break;
            
          case "response.completed":
            console.log("Response completed");
            break;
            
          // Add handlers for additional events
          case "response.output_item.added":
            console.log("Response item added");
            break;
            
          case "response.content_part.added":
            console.log("Content part added");
            break;
            
          case "response.output_text.done":
            // When text is complete, we can get the full text from this event
            if (event.text) {
              console.log("Text completed:", event.text.substring(0, 50) + "...");
            }
            break;
            
          case "response.content_part.done":
            console.log("Content part done");
            break;
            
          case "response.output_item.done":
            console.log("Output item done");
            break;
            
          case "error":
            console.error("Stream error:", event.error);
            res.write("\n[Error during generation]");
            break;
            
          default:
            // Log any other event types we receive for debugging
            console.log("Unhandled event type:", event.type, event);
        }
      }
      
      console.log("Stream processing completed");
      
      // Clean up the temporary file
      try {
        await fs.promises.unlink(tempFilePath);
        console.log(`Temporary file ${tempFilePath} deleted`);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
      
      res.end();
    } catch (innerError) {
      console.error("Error in file processing:", innerError);
      res.write(`\n[Error: ${innerError.message}]`);
      res.end();
    }
  } catch (error) {
    console.error("Error processing file stream:", error);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Error processing request", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.write(`\n[Error: ${error.message}]`);
      res.end();
    }
  }
});

// Internal helper function for file streaming




// Export the router
export default router;